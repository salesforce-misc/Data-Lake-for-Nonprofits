import includes from "lodash/includes";
import filter from "lodash/filter";
import reverse from "lodash/reverse";
import isEmpty from "lodash/isEmpty";
import startsWith from "lodash/startsWith";
import { Instance, types } from "mobx-state-tree";
import {
  AlreadyExistsException,
  CloudFormationServiceException,
  Parameter,
  ResourceStatus,
  Stack,
  StackEvent,
  StackStatus,
} from "@aws-sdk/client-cloudformation";

import { createStack } from "api/create-stack";
import { describeStack } from "api/describe-stack";
import { describeStackResources } from "api/describe-stack-resources";
import { describeStackEvents } from "api/describe-stack-events";
import { updateStack } from "api/update-stack";
import { enableTerminationProtection } from "api/enable-termination-protection";
import { delay } from "helpers/utils";

import { Operation } from "./Operation";
import { OperationContext } from "./utils";

export enum ProvisionMethod {
  Create = "CREATE",
  Update = "UPDATE",
}

// Convenience function
export const param = (key: string, value: string) => ({ ParameterKey: key, ParameterValue: value });

const isFailureStatus = (status: StackStatus) => {
  // For all statuses of a stack, see https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_Stack.html

  // We consider any of these statuses as a failure
  const failureStatuses = [
    StackStatus.CREATE_FAILED,
    StackStatus.ROLLBACK_FAILED,
    StackStatus.ROLLBACK_COMPLETE,
    StackStatus.DELETE_FAILED,
    StackStatus.UPDATE_FAILED,
    StackStatus.UPDATE_ROLLBACK_COMPLETE,
    StackStatus.UPDATE_ROLLBACK_FAILED,
    StackStatus.IMPORT_ROLLBACK_COMPLETE,
    StackStatus.IMPORT_ROLLBACK_FAILED,
  ];

  return includes(failureStatuses, status);
};

const isSuccessStatus = (status: StackStatus) => {
  // For all statuses of a stack, see https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_Stack.html

  // We consider any of these statuses as a success
  const successStatuses = [StackStatus.CREATE_COMPLETE, StackStatus.DELETE_COMPLETE, StackStatus.UPDATE_COMPLETE, StackStatus.IMPORT_COMPLETE];

  return includes(successStatuses, status);
};

const isResourceCompleted = (status: ResourceStatus) => {
  // For all statuses of a resource, see https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_StackResource.html

  // A resource is considered completed if it is finished regardless if it succeeded or failed
  const completedStatuses = [
    ResourceStatus.CREATE_COMPLETE,
    ResourceStatus.CREATE_FAILED,
    ResourceStatus.ROLLBACK_COMPLETE,
    ResourceStatus.ROLLBACK_FAILED,
    ResourceStatus.DELETE_FAILED,
    ResourceStatus.DELETE_COMPLETE,
    ResourceStatus.DELETE_SKIPPED,
    ResourceStatus.UPDATE_COMPLETE,
    ResourceStatus.UPDATE_FAILED,
    ResourceStatus.UPDATE_ROLLBACK_COMPLETE,
    ResourceStatus.UPDATE_ROLLBACK_FAILED,
    ResourceStatus.IMPORT_COMPLETE,
    ResourceStatus.IMPORT_FAILED,
    ResourceStatus.IMPORT_ROLLBACK_COMPLETE,
    ResourceStatus.IMPORT_ROLLBACK_FAILED,
  ];

  return includes(completedStatuses, status);
};

const isResourceFailure = (status: ResourceStatus) => {
  // For all statuses of a resource, see https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_StackResource.html

  const statuses = [ResourceStatus.CREATE_FAILED, ResourceStatus.DELETE_FAILED, ResourceStatus.UPDATE_FAILED, ResourceStatus.IMPORT_FAILED];

  return includes(statuses, status);
};

export const ProvisionStack = Operation.named("ProvisionStack")
  .props({
    method: types.optional(types.enumeration<ProvisionMethod>("ProvisionMethod", Object.values(ProvisionMethod)), ProvisionMethod.Create),
    stackId: "",
  })

  .views((self) => ({
    get isUpdate(): boolean {
      return self.method === ProvisionMethod.Update;
    },

    get isCreate(): boolean {
      return self.method === ProvisionMethod.Create;
    },
  }))

  .views((self) => ({
    get stackTitle(): string {
      // NOTE - sub models should override this
      return "stack";
    },

    get suggestedTime(): string {
      // NOTE - sub models can override this
      return `a few minutes`;
    },

    get isUpdate(): boolean {
      return self.method === ProvisionMethod.Update;
    },

    get isCreate(): boolean {
      return self.method === ProvisionMethod.Create;
    },
  }))

  .views((self) => ({
    get notStartedMessage(): string {
      // NOTE - sub models can override this
      const action = self.isCreate ? "Provision" : "Update";
      return `${action} the ${self.stackTitle}. This might take ${self.suggestedTime}.`;
    },

    get inProgressMessage(): string {
      // NOTE - sub models can override this
      const action = self.isCreate ? "Provisioning" : "Updating";
      return `${action} the ${self.stackTitle}. This might take ${self.suggestedTime}.`;
    },

    get successMessage(): string {
      // NOTE - sub models can override this
      const action = self.isCreate ? "provisioned" : "updated";
      return `Successfully ${action} the ${self.stackTitle}`;
    },

    get failureMessage(): string {
      // NOTE - sub models can override this
      const action = self.isCreate ? "provision" : "update";
      return `Could not ${action} the ${self.stackTitle}`;
    },

    get estimatedResourceCount(): number {
      // This is just an estimate of the total number of resources that the stack is going to create.
      // It is used to help with the progress percentage calculation. It does ont have to be exact.

      // NOTE - sub models should override this
      return 10;
    },
  }))

  .actions((self) => ({
    buildStackName(context: OperationContext): string {
      // NOTE - sub models should override this
      return `sforg-stack-${context.id}`;
    },

    buildParams(context: OperationContext): Parameter[] {
      // NOTE - sub models should override this
      return [];
    },

    buildTemplateBody(context: OperationContext): string | undefined {
      // NOTE - sub models should override this
      return undefined;
    },

    buildTemplateURL(context: OperationContext): string | undefined {
      // NOTE - sub models should override this
      return undefined;
    },

    processOutput(context: OperationContext, stack: Stack) {
      // NOTE - sub models should override this
      console.log(stack.Outputs);
    },

    buildStackUrl(context: OperationContext): string {
      const region = context.region;
      const stackId = self.stackId;

      return `https://${region}.console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/events?filteringStatus=active&filteringText=&viewNested=true&hideStacks=false&stackId=${encodeURIComponent(
        stackId
      )}`;
    },

    setStackId(stackId: string) {
      self.stackId = stackId;
    },
  }))

  .actions((self) => ({
    async createStack(context: OperationContext): Promise<string> {
      const accessKey = context.credentials.accessKey;
      const secretKey = context.credentials.secretKey;
      const region = context.region;
      const stackName = self.buildStackName(context);
      const parameters = self.buildParams(context);
      const templateBody = self.buildTemplateBody(context);
      const templateURL = self.buildTemplateURL(context);

      try {
        const stackId = await createStack({
          accessKey,
          secretKey,
          region,
          stackName,
          requestToken: self.runId,
          parameters,
          templateBody,
          templateURL,
        });

        await enableTerminationProtection({ accessKey, secretKey, region, stackName });

        return stackId;
      } catch (error) {
        // In the case where the stack was already created but we didn't get the stack ID. This can happen if the user refreshes the page but a stack ID
        // was never recorded.
        if (error instanceof AlreadyExistsException && error.message === `Stack [${stackName}] already exists`) {
          console.log("Stack exception, already exists:", error);
          const stack = await describeStack({ accessKey, secretKey, region, stackName });
          const stackId = stack?.StackId;
          if (stackId) {
            return stackId;
          }
        }
        self.runInAction(() => {
          // This is in markdown
          self._errorDetail = `We attempted to create the ${self.stackTitle} by calling the CloudFormation CreateStack API.
          However, we got the following error:
### ${error}

### Information
* Stack name: ${self.buildStackName(context)}

### Suggestions
* Check that the AWS account did not reach the soft limit for the number of CloudFormation stacks

### Links
* [CloudFormation CreateStack API documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_CreateStack.html)
          `;
        });
        throw error;
      }
    },

    async updateStack(context: OperationContext): Promise<void> {
      const accessKey = context.credentials.accessKey;
      const secretKey = context.credentials.secretKey;
      const region = context.region;
      const stackName = self.buildStackName(context);
      const parameters = self.buildParams(context);
      const templateBody = self.buildTemplateBody(context);
      const templateURL = self.buildTemplateURL(context);

      try {
        await updateStack({ accessKey, secretKey, region, stackName, parameters, templateBody, templateURL });
      } catch (error) {
        // We need to handle the case where cloudFormation will throw an exception if there were no updates to the stack, in this case, we should report a success
        if (error instanceof CloudFormationServiceException) {
          // Doing an error message comparison like this is not a great approach. However, it is a good enough approach for now because it helps us avoid creating
          // a lot of additional code that deals with creating change sets and comparing change sets.
          if (error.name === "ValidationError" && startsWith(error.message, "No updates are to be performed")) {
            console.log(error);
            return;
          }
        }

        // All other exceptions are handled as follows:
        self.runInAction(() => {
          // This is in markdown
          self._errorDetail = `We attempted to update the ${self.stackTitle} by calling the CloudFormation UpdateStack API.
          However, we got the following error:
### ${error}

### Information
* Stack name: ${self.buildStackName(context)}
* Stack id : ${self.stackId}

### Links
* [AWS Console CloudFormation stack page](${self.buildStackUrl(context)})
* [CloudFormation UpdateStack API documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_UpdateStack.html)
          `;
        });
        throw error;
      }
    },

    async describeStack(context: OperationContext): Promise<Stack> {
      const accessKey = context.credentials.accessKey;
      const secretKey = context.credentials.secretKey;
      const region = context.region;
      const stackId = self.stackId;
      const stackName = self.buildStackName(context);

      try {
        const stack = await describeStack({
          accessKey,
          secretKey,
          region,
          stackName: isEmpty(stackId) ? stackName : stackId,
        });

        if (!stack) throw new Error("Stack not found");
        return stack;
      } catch (error) {
        self.runInAction(() => {
          // This is in markdown
          self._errorDetail = `We attempted to check the status of the ${self.stackTitle} by calling the CloudFormation DescribeStacks API.
          However, we got the following error:
### ${error}

### Information
* Stack name: ${self.buildStackName(context)}
* Stack id : ${self.stackId}

### Suggestions
* It is possible that this is an intermittent problem due to eventual consistency. Try again later.

### Links
* [AWS Console CloudFormation stack page](${self.buildStackUrl(context)})
* [CloudFormation DescribeStacks API documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_DescribeStacks.html)
          `;
        });
        throw error;
      }
    },

    async updateProgress(context: OperationContext) {
      // We will update the progress percentage based on the number of resources that are completed
      try {
        const accessKey = context.credentials.accessKey;
        const secretKey = context.credentials.secretKey;
        const region = context.region;
        const stackId = self.stackId;

        let resources = await describeStackResources({ accessKey, secretKey, region, stackName: stackId });
        let total = Math.max(resources.length, self.estimatedResourceCount);
        let completed = filter(resources, (resource) => isResourceCompleted(resource.ResourceStatus as ResourceStatus));
        if (total > 0) {
          // 10 is here because we already reported 10% progress and we max at 90% because, progress percentage is never accurate
          self.setProgressPercentage(Math.min((completed.length / total) * (100 - 10) + 10, 90));
        }
      } catch (error) {
        // Updating progress is not critical, if we have a problem getting the resources, we don't throw an exception.
        console.error(error);
        return;
      }
    },

    async handleFailure(context: OperationContext, status: StackStatus, statusReason: string) {
      // In this method we display an informative error detail that provides enough context around the
      // stack failure. To do that, we will list all the stack events and look for the first event that had an error.
      // Since getting the stack events is not critical, we will capture any errors from calling the describe stack events
      // call and not propagate them or have them affecting the overall status of the operation.

      let stackEvent: StackEvent;

      try {
        const accessKey = context.credentials.accessKey;
        const secretKey = context.credentials.secretKey;
        const region = context.region;
        const stackId = self.stackId;
        const events = await describeStackEvents({ accessKey, secretKey, region, stackName: stackId });
        // We find the first event that failed after reversing the events. We need to reverse the events because
        // describe stack events return them in reverse chronological order
        for (const event of reverse(events)) {
          if (isResourceFailure(event.ResourceStatus as ResourceStatus)) {
            // We found the event
            stackEvent = event;
            break;
          }
        }
      } catch (error) {
        // Since getting the stack events is not critical, we will capture any errors from calling the describe stack events
        // call and not propagate them or have them affect the overall status of the operation.
        console.log(error);
      }

      self.runInAction(() => {
        const action = self.isCreate ? "provisioning" : "updating";
        // This is in markdown
        self._errorDetail = `The ${action} of the ${self.stackTitle} failed with the following error:
### ${statusReason}`;

        if (stackEvent) {
          const resourceStatus = stackEvent.ResourceStatus as ResourceStatus;
          const resourceStatusReason = stackEvent.ResourceStatusReason;
          const logicalId = stackEvent.LogicalResourceId;
          self._errorDetail = `${self._errorDetail}
### Failed Resource
* Resource logical name: ${logicalId}
* Resource status: ${resourceStatus}
* Resource status reason: **${resourceStatusReason}**
         `;
        }

        self._errorDetail = `${self._errorDetail}
### Information
* Stack name: ${self.buildStackName(context)}
* Stack id : ${self.stackId}

### Suggestions
* Go to the [stack page](${self.buildStackUrl(context)}) and examine the events information

### Links
* [AWS Console CloudFormation stack page](${self.buildStackUrl(context)})
          `;
      });
      throw new Error(statusReason);
    },
  }))

  .actions((self) => ({
    async doRun(context: OperationContext): Promise<void> {
      self.setProgressPercentage(1);

      if (self.isCreate) {
        const stackId = await self.createStack(context);
        self.setStackId(stackId);
      } else {
        const stack = await self.describeStack(context);
        self.setStackId(stack.StackId ?? "");
        await self.updateStack(context);
      }

      self.setProgressPercentage(10);

      let status = StackStatus.CREATE_IN_PROGRESS;
      let statusReason = "Unknown";
      let stack: Stack;

      do {
        self.setProgressMessage(self.inProgressMessage);
        await delay(10);
        stack = await self.describeStack(context);
        status = stack.StackStatus as StackStatus;
        statusReason = stack.StackStatusReason ?? statusReason;

        await self.updateProgress(context);
      } while (!isFailureStatus(status) && !isSuccessStatus(status));

      if (isSuccessStatus(status)) {
        self.processOutput(context, stack);
        self.setProgressPercentage(100);
        return; // We are done with the success scenario
      }

      // We hit a failure
      await self.handleFailure(context, status, statusReason);
    },
  }));

export interface IProvisionStack extends Instance<typeof ProvisionStack> {}
