import isEmpty from "lodash/isEmpty";
import uniq from "lodash/uniq";
import { types, Instance, getParent } from "mobx-state-tree";

import { genId } from "../helpers/id-gen";
import { MetadataStore } from "./MetadataStore";
import { ConnectionsStore } from "./ConnectionsStore";
import { ConnectToAWS } from "./steps/ConnectToAWS";
import { ConnectToSalesforce } from "./steps/ConnectToSalesforce";
import { ImportOptionsStep } from "./steps/ImportOptionsStep";
import { ICredentials } from "./Credentials";
import { IAppStore } from "./AppStore";
import { SequentialOperations } from "./operations/SequentialOperations";
import { BaseStep, IBaseStep, StepStatus } from "./steps/BaseStep";
import { OperationContext } from "./operations/utils";
import { ProvisionBucketsStack } from "./operations/ProvisionBucketsStack";
import { ProvisionVpcStack } from "./operations/ProvisionVpcStack";
import { ProvisionDatastoreStack } from "./operations/ProvisionDatastoreStack";
import { ProvisionAthenaStack } from "./operations/ProvisionAthenaStack";
import { ProvisionStepFnStack } from "./operations/ProvisionStepFnStack";
import { UploadSchema } from "./operations/UploadSchema";
import { StartImport } from "./operations/StartImport";
import { ProvisionMethod } from "./operations/ProvisionStack";
import { ImportStatusStore } from "./ImportStatusStore";
import { PutDashboard } from "./operations/PutDashboard";

export const isCompleted = (step: IBaseStep) => step.status === StepStatus.Completed;
export const BucketsStackNamePrefix = "sforg-buckets-";

/**
 * A model that represents the current installation process
 */
export const Installation = types
  .model("Installation", {
    v: "1", // this is to help detect changes to the shape of the installation model (after going to prod)
    id: types.optional(types.string, () => genId()),
    startDate: types.optional(types.Date, () => new Date()),
    startedBy: types.maybe(types.string),
    accountId: types.maybe(types.string),
    region: "us-east-2",
    appFlowConnectionName: "",
    assetBucket: "",
    metadataBucket: "",
    metadataBucketKmsKeyId: "",
    importWorkflowArn: "", // Step functions state machine ARN
    importWorkflowName: "", // Step functions state machine name
    athenaDataCatalog: "",
    athenaPrimaryWorkGroup: "",
    athenaOutput: "",
    athenaManagedPolicy: "",
    clusterName: "",
    importDataBucketName: "",
    athenaDataBucketName: "",
    importAlarmArns: types.array(types.string),
    snsTopicArn: '',

    connectToAwsStep: types.optional(ConnectToAWS, {}),
    connectToSalesforceStep: types.optional(ConnectToSalesforce, {}),
    importOptionsStep: types.optional(ImportOptionsStep, {}),
    reviewStep: types.optional(BaseStep, {}),
    deploymentStep: types.optional(BaseStep, {}),
    createUsersStep: types.optional(BaseStep, {}),

    metadataStore: types.optional(MetadataStore, {}),
    connectionsStore: types.optional(ConnectionsStore, {}),
    deploymentOperations: types.optional(SequentialOperations, {}),
    importStatusStore: types.optional(ImportStatusStore, {}),
  })
  .actions(() => ({
    // We need this, see https://github.com/mobxjs/mobx-state-tree/issues/915
    runInAction(fn: any) {
      return fn();
    },
  }))
  .actions((self) => {
    const addOperations = () => {
      if (self.deploymentOperations.empty && self.deploymentOperations.isNotStarted) {
        const provisionBucketsStack = ProvisionBucketsStack.create({});
        const provisionVpcStack = ProvisionVpcStack.create({});
        const provisionDatastoreStack = ProvisionDatastoreStack.create({});
        const provisionAthenaStack = ProvisionAthenaStack.create({});
        const provisionStepFnStack = ProvisionStepFnStack.create({});
        const uploadSchema = UploadSchema.create({});
        const startImport = StartImport.create({});
        const updateStepFnStack = ProvisionStepFnStack.create({ method: ProvisionMethod.Update, enableCron: true });
        const putDashboard = PutDashboard.create({});

        self.deploymentOperations.add(provisionBucketsStack);
        self.deploymentOperations.add(provisionVpcStack);
        self.deploymentOperations.add(provisionDatastoreStack);
        self.deploymentOperations.add(provisionAthenaStack);
        self.deploymentOperations.add(provisionStepFnStack);
        self.deploymentOperations.add(uploadSchema);
        self.deploymentOperations.add(startImport);
        self.deploymentOperations.add(updateStepFnStack);
        self.deploymentOperations.add(putDashboard);
      }
    };

    return {
      setAccountId(accountId: string | undefined) {
        // TODO
        // - an account id can only be changed if step 5 hasn't started
        const previousValue = self.accountId;
        self.accountId = accountId;

        if (isEmpty(previousValue) || accountId === previousValue) return;
        // - if an account id can be changed, then we need to reset step 2, 3 and 4
        self.metadataStore.reset();
      },

      setRegion(region: string) {
        // TODO
        // - a region can only be changed if step 5 hasn't started
        const previousValue = self.region;
        self.region = region;
        if (isEmpty(previousValue) || region === previousValue) return;

        // - if a region can be changed, then we need to reset step 2, 3 and 4
        self.metadataStore.reset();
        self.connectionsStore.reset();
      },

      setStartedBy(userName: string | undefined) {
        self.startedBy = userName;
      },

      setAppFlowConnectionName(name: string) {
        // TODO
        // - a connection name can only be changed if step 5 hasn't started
        const previousValue = self.appFlowConnectionName;
        self.appFlowConnectionName = name;
        if (isEmpty(previousValue) || name === previousValue) return;

        // - if a connection name can be changed, then we need to reset step 3 and 4
        self.metadataStore.reset();
      },

      setAssetBucket(name: string) {
        self.assetBucket = name;
      },

      setMetadataBucket(name: string) {
        self.metadataBucket = name;
      },

      setMetadataBucketKmsKeyId(keyId: string) {
        self.metadataBucketKmsKeyId = keyId;
      },

      setImportWorkflowArn(arn: string) {
        self.importWorkflowArn = arn;
      },

      setImportWorkflowName(name: string) {
        self.importWorkflowName = name;
      },

      setAthenaDataCatalog(name: string) {
        self.athenaDataCatalog = name;
      },

      setAthenaPrimaryWorkGroup(name: string) {
        self.athenaPrimaryWorkGroup = name;
      },

      setAthenaOutput(name: string) {
        self.athenaOutput = name;
      },

      setAthenaManagedPolicy(name: string) {
        self.athenaManagedPolicy = name;
      },

      setClusterName(name: string) {
        self.clusterName = name;
      },

      setImportDataBucketName(name: string) {
        self.importDataBucketName = name;
      },

      setAthenaDataBucketName(name: string) {
        self.athenaDataBucketName = name;
      },

      addImportAlarmArn(arn: string) {
        if (arn) {
          self.importAlarmArns.replace(uniq([arn, ...self.importAlarmArns]));
        }
      },

      setSnsTopicArn(arn: string) {
        self.snsTopicArn = arn;
      },

      triggerDeployment() {
        addOperations();
        // This is a hack for now, keystone might be a better alternative
        // see https://mobx-keystone.js.org/
        const context = self as unknown;
        self.deploymentOperations.run(context as OperationContext);
      },
    };
  })

  .views((self) => ({
    get credentials(): ICredentials {
      const parent: IAppStore = getParent(self);
      return parent.credentials;
    },

    get bucketsStackName() {
      return `${BucketsStackNamePrefix}${self.id}`;
    },

    get vpcStackName() {
      return `sforg-vpc-${self.id}`;
    },

    get datastoreStackName() {
      return `sforg-datastore-${self.id}`;
    },

    get athenaStackName() {
      return `sforg-athena-${self.id}`;
    },

    get stepFnStackName() {
      return `sforg-stepfn-${self.id}`;
    },

    get appStore(): IAppStore {
      return getParent(self);
    },

    get cronExpression(): string {
      return self.importOptionsStep.cronExpression;
    },

    get athenaServer(): string {
      return `athena.${self.region}.amazonaws.com`;
    },

    get athenaServerPort(): string {
      return "443";
    },

    get nextStepNumber(): number {
      if (!isCompleted(self.connectToAwsStep)) return 1;
      if (!isCompleted(self.connectToSalesforceStep)) return 2;
      if (!isCompleted(self.importOptionsStep)) return 3;
      if (!isCompleted(self.reviewStep)) return 4;
      if (!isCompleted(self.deploymentStep)) return 5;

      return 6;
    },

    get isPostDeployment(): boolean {
      return isCompleted(self.deploymentStep);
    }
  }));

// see https://mobx-state-tree.js.org/tips/typescript
export interface IInstallation extends Instance<typeof Installation> {}
