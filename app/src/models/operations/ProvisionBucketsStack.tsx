import { Instance } from "mobx-state-tree";
import { Parameter, Stack } from "@aws-sdk/client-cloudformation";

import { yaml } from "data/cf/buckets.yaml";
import { websiteUrlOrigin, assetWebsiteUrl } from "helpers/settings";

import { ProvisionStack, param } from "./ProvisionStack";
import { OperationContext, getOutputValue } from "./utils";

export const ProvisionBucketsStack = ProvisionStack.named("ProvisionBucketsStack")
  .props({
    type: "ProvisionBucketsStack",
  })

  .views((self) => ({
    get stackTitle(): string {
      return "S3 buckets stack";
    },

    get suggestedTime(): string {
      return `4 minutes or more`;
    },

    get estimatedResourceCount(): number {
      // This is just an estimate of the total number of resources that the stack is going to create.
      // It is used to help with the progress percentage calculation. It does ont have to be exact.
      return 16;
    },
  }))

  .actions((self) => ({
    buildStackName(context: OperationContext): string {
      return context.bucketsStackName;
    },

    buildParams(context: OperationContext): Parameter[] {
      return [param("InstallationId", context.id), param("WebURLOrigin", websiteUrlOrigin), param("AssetWebsiteURL", assetWebsiteUrl)];
    },

    buildTemplateBody(context: OperationContext): string {
      return yaml;
    },

    processOutput(context: OperationContext, stack: Stack) {
      context.setAthenaDataBucketName(getOutputValue(stack, "AthenaDataBucket"));
      context.setAssetBucket(getOutputValue(stack, "AssetsBucket"));
      context.setMetadataBucket(getOutputValue(stack, "MetadataBucket"));
      context.setMetadataBucketKmsKeyId(getOutputValue(stack, "MetadataBucketKey"));
    },
  }));

export interface IProvisionBucketsStack extends Instance<typeof ProvisionBucketsStack> {}
