import { types } from "mobx-state-tree";
import { Stack } from "@aws-sdk/client-cloudformation";

import { IAppStore } from "models/AppStore";
import { IMetadataStore } from "models/MetadataStore";
import { IImportStatusStore } from "models/ImportStatusStore";
import { ICredentials } from "models/helpers/Credentials";

import { ProvisionBucketsStack } from "./ProvisionBucketsStack";
import { ProvisionVpcStack } from "./ProvisionVpcStack";
import { Operation } from "./Operation";
import { ProvisionDatastoreStack } from "./ProvisionDatastoreStack";
import { ProvisionAthenaStack } from "./ProvisionAthenaStack";
import { ProvisionStepFnStack } from "./ProvisionStepFnStack";
import { UploadSchema } from "./UploadSchema";
import { StartImport } from "./StartImport";
import { PutDashboard } from "./PutDashboard";

export interface OperationContext {
  credentials: ICredentials;
  appStore: IAppStore;
  region: string;
  id: string;
  appFlowConnectionName: string;
  bucketsStackName: string;
  vpcStackName: string;
  datastoreStackName: string;
  athenaStackName: string;
  stepFnStackName: string;
  metadataStore: IMetadataStore;
  cronExpression: string;
  assetBucket: string;
  metadataBucket: string;
  metadataBucketKmsKeyId: string;
  importWorkflowArn: string;
  importWorkflowName: string;
  importStatusStore: IImportStatusStore;
  athenaPrimaryWorkGroup: string;
  clusterName: string;
  importDataBucketName: string;
  importAlarmArns: string[];
  athenaDataBucketName: string;
  snsTopicArn: string;

  setAssetBucket: (name: string) => void;
  setMetadataBucket: (name: string) => void;
  setMetadataBucketKmsKeyId: (keyId: string) => void;
  setImportWorkflowArn: (arn: string) => void;
  setImportWorkflowName: (name: string) => void;
  setAthenaDataCatalog: (name: string) => void;
  setAthenaPrimaryWorkGroup: (name: string) => void;
  setAthenaOutput: (name: string) => void;
  setAthenaManagedPolicy: (name: string) => void;
  setClusterName: (name: string) => void;
  setImportDataBucketName: (name: string) => void;
  addImportAlarmArn: (arn: string) => void;
  setAthenaDataBucketName: (name: string) => void;
  setSnsTopicArn: (arn: string) => void;
}

const typeDispatcher = (snapshot: { type?: string }) => {
  if (snapshot.type === "ProvisionBucketsStack") return ProvisionBucketsStack;
  if (snapshot.type === "ProvisionVpcStack") return ProvisionVpcStack;
  if (snapshot.type === "ProvisionDatastoreStack") return ProvisionDatastoreStack;
  if (snapshot.type === "ProvisionAthenaStack") return ProvisionAthenaStack;
  if (snapshot.type === "ProvisionStepFnStack") return ProvisionStepFnStack;
  if (snapshot.type === "UploadSchema") return UploadSchema;
  if (snapshot.type === "StartImport") return StartImport;
  if (snapshot.type === "PutDashboard") return PutDashboard;

  return Operation;
};

export const mstOperationsType = types.array(
  types.union(
    { dispatcher: typeDispatcher },
    ProvisionBucketsStack,
    ProvisionVpcStack,
    ProvisionDatastoreStack,
    ProvisionAthenaStack,
    ProvisionStepFnStack,
    UploadSchema,
    StartImport,
    PutDashboard
  )
);

export const getOutputValue = (stack: Stack, paramKey: string): string => {
  const outputs = stack.Outputs ?? [];
  for (const output of outputs) {
    if (output.OutputKey === paramKey) return output.OutputValue ?? "";
  }

  return "";
};

export const getParamValue = (stack: Stack, paramKey: string): string => {
  const params = stack.Parameters ?? [];
  for (const param of params) {
    if (param.ParameterKey === paramKey) return param.ParameterValue ?? "";
  }

  return "";
};
