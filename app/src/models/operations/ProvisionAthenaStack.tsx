import { Instance } from "mobx-state-tree";
import { Parameter, Stack } from "@aws-sdk/client-cloudformation";

import { getOutputValue, OperationContext } from "./utils";
import { ProvisionStack, param } from "./ProvisionStack";

export const ProvisionAthenaStack = ProvisionStack.named("ProvisionAthenaStack")
  .props({
    type: "ProvisionAthenaStack",
  })

  .views((self) => ({
    get stackTitle(): string {
      return "Athena stack";
    },

    get suggestedTime(): string {
      return `2 minutes or more`;
    },

    get estimatedResourceCount(): number {
      // This is just an estimate of the total number of resources that the stack is going to create.
      // It is used to help with the progress percentage calculation. It does ont have to be exact.
      return 11;
    },
  }))

  .actions((self) => ({
    buildStackName(context: OperationContext): string {
      return context.athenaStackName;
    },

    buildParams(context: OperationContext): Parameter[] {
      return [
        param("InstallationId", context.id),
        param("ParentBucketStack", context.bucketsStackName),
        param("ParentVPCStack", context.vpcStackName),
        param("ParentDataStack", context.datastoreStackName),
      ];
    },

    buildTemplateURL(context: OperationContext): string {
      const region = context.region;
      const bucketName = context.assetBucket;

      return `https://${bucketName}.s3.${region}.amazonaws.com/cf/athena.yaml`;
    },

    processOutput(context: OperationContext, stack: Stack) {
      context.setAthenaDataCatalog(getOutputValue(stack, "AthenaDataCatalog"));
      context.setAthenaPrimaryWorkGroup(getOutputValue(stack, "AthenaPrimaryWorkGroup"));
      context.setAthenaOutput(getOutputValue(stack, "AthenaOutput"));
      context.setAthenaManagedPolicy(getOutputValue(stack, "QueryAthenaManagedPolicy"));
    },
  }));

export interface IProvisionAthenaStack extends Instance<typeof ProvisionAthenaStack> {}
