import { Instance } from "mobx-state-tree";
import { Parameter, Stack } from "@aws-sdk/client-cloudformation";

import { getOutputValue, OperationContext } from "./utils";
import { ProvisionStack, param } from "./ProvisionStack";

export const TWO_AZ_REGIONS = ["us-west-1"];

export const ProvisionVpcStack = ProvisionStack.named("ProvisionVpcStack")
  .props({
    type: "ProvisionVpcStack",
  })

  .views((self) => ({
    get stackTitle(): string {
      return "VPC stack";
    },

    get suggestedTime(): string {
      return `3 minutes or more`;
    },

    get estimatedResourceCount(): number {
      // This is just an estimate of the total number of resources that the stack is going to create.
      // It is used to help with the progress percentage calculation. It does ont have to be exact.
      return 21;
    },
  }))

  .actions((self) => ({
    buildStackName(context: OperationContext): string {
      return context.vpcStackName;
    },

    buildParams(context: OperationContext): Parameter[] {
      if (TWO_AZ_REGIONS.includes(context.region)) {
        return [param("InstallationId", context.id), param("ThirdAZ", "Disable")];
      } else {
        return [param("InstallationId", context.id)];
      }
    },

    buildTemplateURL(context: OperationContext): string {
      const region = context.region;
      const bucketName = context.assetBucket;

      return `https://${bucketName}.s3.${region}.amazonaws.com/cf/vpc.yaml`;
    },

    processOutput(context: OperationContext, stack: Stack) {
      context.setSnsTopicArn(getOutputValue(stack, "SNSAlarmTopic"));
    },
  }));

export interface IProvisionBucketsStack extends Instance<typeof ProvisionVpcStack> {}
