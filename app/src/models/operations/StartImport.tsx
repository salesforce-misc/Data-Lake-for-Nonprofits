import isEmpty from "lodash/isEmpty";
import { Instance } from "mobx-state-tree";

import { startSFN } from "../../api/start-sfn";
import { Operation } from "./Operation";
import { OperationContext } from "./utils";
import { delay } from "../../helpers/utils";
import { isStoreReady, isStoreError } from "../BaseStore";

export const StartImport = Operation.named("StartImport")
  .props({
    type: "StartImport",
    executionArn: "", // state machine execution arn
    startTime: 0, // The start time of the execution (epoch milliseconds)
    totalObjectsCount: 0, // Number of object types to import
  })

  .views((self) => ({
    get notStartedMessage(): string {
      return `Import Salesforce objects. This might take 15 minutes to a few hours.`;
    },

    get inProgressMessage(): string {
      if (self.totalObjectsCount === 0) return `Importing Salesforce objects. This might take 15 minutes to a few hours.`;
      return `Importing Salesforce objects (${self.totalObjectsCount} objects)`;
    },

    get successMessage(): string {
      return `Successfully imported ${self.totalObjectsCount} Salesforce objects`;
    },

    get failureMessage(): string {
      return `Could not import Salesforce objects`;
    },
  }))

  .actions((self) => ({
    setTotalObjectsCount(num: number) {
      self.totalObjectsCount = num;
    },

    setExecutionArn(arn: string) {
      self.executionArn = arn;
    },

    setStartTime(time: number) {
      self.startTime = time;
    },

    buildStateMachineUrl(context: OperationContext): string {
      const region = context.region;
      const stateMachineArn = context.importWorkflowArn;

      return `https://${region}.console.aws.amazon.com/states/home?region=${region}#/statemachines/view/${encodeURIComponent(stateMachineArn)}`;
    },
  }))

  .actions((self) => ({
    async startWorkflow(context: OperationContext): Promise<void> {
      if (!isEmpty(self.executionArn)) return; // Already triggered, no need to start a new one

      const accessKey = context.credentials.accessKey;
      const secretKey = context.credentials.secretKey;
      const region = context.region;
      const workflowArn = context.importWorkflowArn;

      try {
        const { executionArn, startTime } = await startSFN({ accessKey, secretKey, region, stateMachineArn: workflowArn });
        self.setExecutionArn(executionArn);
        self.setStartTime(startTime);
      } catch (error) {
        self.runInAction(() => {
          // This is in markdown
          self._errorDetail = `We attempted to start the execution of the state machine by calling the Step Functions StartExecution API.
          However, we got the following error:
### ${error}

### Information
* State machine ARN: ${workflowArn}

### Links
* [AWS Step Functions state machine page](${self.buildStateMachineUrl(context)})
* [Step Functions StartExecution API documentation](https://docs.aws.amazon.com/step-functions/latest/apireference/API_StartExecution.html)
          `;
        });
        throw error;
      }
    },

    // Calculates the progress and returns true if operation is still in progress otherwise false is returned
    async updateProgress(context: OperationContext): Promise<boolean> {
      const statusStore = context.importStatusStore;
      const hasError = isStoreError(statusStore);
      const loading = !isStoreReady(statusStore);

      self.setTotalObjectsCount(statusStore.objectsCount);
      self.setProgressPercentage(10 + (statusStore.processPercentage / 100) * 90);
      self.setProgressMessage(self.inProgressMessage);

      if (hasError) {
        self.runInAction(() => {
          self._errorDetail = statusStore._errorDetail || `${statusStore.errorMessage}`;
        });

        throw new Error("Error while importing");
      }

      return loading && !hasError;
    },
  }))

  .actions((self) => ({
    doPreRun(context: OperationContext) {
      // We check if there was an error from a previous run and if so, we clear the executionArn
      if (!isEmpty(self._errorDetail)) {
        self.executionArn = "";
      }
    },

    async doRun(context: OperationContext): Promise<void> {
      const statusStore = context.importStatusStore;

      self.setProgressPercentage(10);
      await self.startWorkflow(context);

      await delay(10); // Give SFN a chance to start
      
      // Trigger the status store loading
      statusStore.load({ executionArn: self.executionArn, startTime: self.startTime });

      let shouldContinue = true;
      do {
        await delay(5);
        shouldContinue = await self.updateProgress(context);
      } while (shouldContinue);
    },
  }));

export interface IStartImport extends Instance<typeof StartImport> {}
