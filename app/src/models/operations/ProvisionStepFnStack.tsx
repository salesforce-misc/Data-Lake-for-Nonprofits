import { Instance } from "mobx-state-tree";
import { Parameter, Stack } from "@aws-sdk/client-cloudformation";

import { getOutputValue, OperationContext } from "./utils";
import { ProvisionStack, param } from "./ProvisionStack";

export const ProvisionStepFnStack = ProvisionStack.named("ProvisionStepFnStack")
  .props({
    type: "ProvisionStepFnStack",
    enableCron: false,
  })

  .views((self) => ({
    get stackTitle(): string {
      return "Step Functions stack";
    },

    get suggestedTime(): string {
      return self.isCreate ? `7 minutes or more` : "4 minutes or more";
    },

    get estimatedResourceCount(): number {
      // This is just an estimate of the total number of resources that the stack is going to create.
      // It is used to help with the progress percentage calculation. It does ont have to be exact.
      return 19;
    },
  }))

  .actions((self) => ({
    buildStackName(context: OperationContext): string {
      return context.stepFnStackName;
    },

    buildParams(context: OperationContext): Parameter[] {
      const params = [
        param("InstallationId", context.id),
        param("ParentBucketStack", context.bucketsStackName),
        param("ParentVPCStack", context.vpcStackName),
        param("ParentDataStack", context.datastoreStackName),
        param("ConnectionName", context.appFlowConnectionName),
      ];

      const enableCron = self.enableCron ? "true" : "false";
      if (self.isCreate) {
        // When we first create the stack, we don't want event bridge schedule to be active
        params.push(param("ImportWorkflowCronEnabled", enableCron));
      } else {
        params.push(param("ImportWorkflowCronEnabled", enableCron));
        params.push(param("ImportWorkflowCron", `cron(${context.cronExpression})`));
      }

      return params;
    },

    buildTemplateURL(context: OperationContext): string {
      const region = context.region;
      const bucketName = context.assetBucket;

      return `https://${bucketName}.s3.${region}.amazonaws.com/cf/step_function.yaml`;
    },

    processOutput(context: OperationContext, stack: Stack) {
      context.setImportDataBucketName(getOutputValue(stack, "ImportDataBucketName"));
      context.setImportWorkflowArn(getOutputValue(stack, "ImportWorkflow"));
      context.setImportWorkflowName(getOutputValue(stack, "ImportWorkflowName"));
      context.addImportAlarmArn(getOutputValue(stack, "ImportFailedAlarm"));
      context.addImportAlarmArn(getOutputValue(stack, "ImportAbortedAlarm"));
      context.addImportAlarmArn(getOutputValue(stack, "ImportThrottledAlarm"));
      context.addImportAlarmArn(getOutputValue(stack, "ImportTimedOutAlarm"));
    },
  }));

export interface IProvisionStepFnStack extends Instance<typeof ProvisionStepFnStack> {}
