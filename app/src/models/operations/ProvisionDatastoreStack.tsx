import { Instance } from "mobx-state-tree";
import { Parameter, Stack } from "@aws-sdk/client-cloudformation";

import { getOutputValue, OperationContext } from "./utils";
import { ProvisionStack, param } from "./ProvisionStack";

export const ProvisionDatastoreStack = ProvisionStack.named("ProvisionDatastoreStack")
  .props({
    type: "ProvisionDatastoreStack",
  })

  .views((self) => ({
    get stackTitle(): string {
      return "Datastore stack";
    },

    get suggestedTime(): string {
      return `14 minutes or more`;
    },

    get estimatedResourceCount(): number {
      // This is just an estimate of the total number of resources that the stack is going to create.
      // It is used to help with the progress percentage calculation. It does ont have to be exact.
      return 13;
    },
  }))

  .actions((self) => ({
    buildStackName(context: OperationContext): string {
      return context.datastoreStackName;
    },

    buildParams(context: OperationContext): Parameter[] {
      return [
        param("InstallationId", context.id),
        param("ParentVPCStack", context.vpcStackName),
        param("ParentBucketStack", context.bucketsStackName),
      ];
    },

    buildTemplateURL(context: OperationContext): string {
      const region = context.region;
      const bucketName = context.assetBucket;

      return `https://${bucketName}.s3.${region}.amazonaws.com/cf/datastore.yaml`;
    },

    processOutput(context: OperationContext, stack: Stack) {
      context.setDBName(getOutputValue(stack, "DBName"));
    },
  }));

export interface IProvisionDatastoreStack extends Instance<typeof ProvisionDatastoreStack> {}
