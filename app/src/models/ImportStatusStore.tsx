import includes from "lodash/includes";
import split from "lodash/split";
import last from "lodash/last";
import chunkIt from "lodash/chunk";
import first from "lodash/first";
import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";
import { ExecutionStatus, HistoryEvent } from "@aws-sdk/client-sfn";
import { types, Instance, getParent } from "mobx-state-tree";
import { values } from "mobx";
import { useEffect } from "react";

import { useInstallation } from "AppContext";
import { s3GetJson } from "api/s3-get-json";
import { describeSFN } from "api/describe-sfn";
import { getExecutionFailureInfo, getSFNHistory, isExecutionFailureEvent } from "api/get-sfn-history";
import { s3ListObjects, S3Object } from "api/list-s3-objects";
import { getLatestSFN } from "api/get-lastest-sfn";
import { delay, niceByte, niceNumber } from "helpers/utils";

import { BaseStore, isStoreError, isStoreLoading, isStoreNew, isStoreReady, isStoreReLoading } from "./BaseStore";
import { ICredentials } from "./helpers/Credentials";
import { IInstallation } from "./Installation";

const isSuccessStatus = (status: ExecutionStatus) => {
  // For all statuses, see https://docs.aws.amazon.com/step-functions/latest/apireference/API_DescribeExecution.html

  // We consider any of these statuses as a success
  const successStatuses = ["SUCCEEDED"];
  return includes(successStatuses, status);
};

const isFailureStatus = (status: ExecutionStatus) => {
  // For all statuses, see https://docs.aws.amazon.com/step-functions/latest/apireference/API_DescribeExecution.html

  // We consider any of these statuses as a failure
  const failureStatuses = ["FAILED", "ABORTED", "TIMED_OUT"];
  return includes(failureStatuses, status);
};

export enum ObjectImportStatusCode {
  Not_Started = "NOT_STARTED",
  Preparing = "PREPARING",
  In_Progress = "IN_PROGRESS",
  Importing = "IMPORTING",
  Successful = "SUCCESSFUL",
}

interface ObjectStatusInput {
  name: string;
  label?: string;
  status?: ObjectImportStatusCode;
  rowCount?: number;
  columnCount?: number;
  importSeconds?: number;
  bytesWritten?: number;
}

interface RemoteObject {
  status: ObjectImportStatusCode;
  metadata?: {
    rowCount: number;
    columnCount: number;
    importSeconds: number;
    bytesWritten: number;
  };
}

/**
 * Represents a Salesforce object import status
 */
const ObjectImportStatus = types
  .model("ObjectImportStatus", {
    name: "",
    label: "",
    status: types.optional(
      types.enumeration<ObjectImportStatusCode>("ObjectImportStatusCode", Object.values(ObjectImportStatusCode)),
      ObjectImportStatusCode.Not_Started
    ),
    rowCount: 0,
    columnCount: 0,
    importSeconds: 0,
    bytesWritten: 0,
    stale: false,
  })

  .actions((self) => ({
    setObjectStatus({ name, label, status, rowCount, columnCount, importSeconds, bytesWritten }: ObjectStatusInput) {
      self.name = name;
      if (label) self.label = label;
      if (status) self.status = status;
      if (rowCount) self.rowCount = rowCount;
      if (columnCount) self.columnCount = columnCount;
      if (importSeconds) self.importSeconds = importSeconds;
      if (bytesWritten) self.bytesWritten = bytesWritten;
    },

    setStale(flag: boolean) {
      self.stale = flag;
      if (flag) self.status = ObjectImportStatusCode.Not_Started;
    },
  }))

  .views((self) => ({
    get isNotStarted(): boolean {
      return self.status === ObjectImportStatusCode.Not_Started;
    },

    get isPreparing(): boolean {
      return self.status === ObjectImportStatusCode.Preparing;
    },

    get isInProgress(): boolean {
      return self.status === ObjectImportStatusCode.In_Progress;
    },

    get isImporting(): boolean {
      return self.status === ObjectImportStatusCode.Importing;
    },

    get isSuccessful(): boolean {
      return self.status === ObjectImportStatusCode.Successful;
    },

    get warning(): boolean {
      return self.rowCount < 0;
    },
  }))

  .views((self) => ({
    get statsAvailable(): boolean {
      // Tells us if any of the stats such as (rowCount, et) are available.
      return self.isSuccessful;
    },
  }))

  .views((self) => ({
    get rowCountDisplay(): string {
      if (!self.statsAvailable) return "N/A";

      return niceNumber(self.rowCount);
    },

    get columnCountDisplay(): string {
      if (!self.statsAvailable) return "N/A";

      return niceNumber(self.columnCount);
    },

    get importSecondsDisplay(): string {
      if (!self.statsAvailable) return "N/A";

      return `${Math.round(self.importSeconds)} sec`;
    },

    get bytesWrittenDisplay(): string {
      if (!self.statsAvailable) return "N/A";

      return niceByte(self.bytesWritten);
    },
  }));

export interface IObjectImportStatus extends Instance<typeof ObjectImportStatus> {}

export enum LoadingStage {
  GettingSchemas = "GETTING_SCHEMAS",
  MonitoringProgress = "MONITORING_PROGRESS",
}

/**
 * Represents the model for the status of importing salesforce objects. This includes each object import status.
 */
export const ImportStatusStore = BaseStore.named("ImportStatusStore")
  .props({
    objects: types.map(ObjectImportStatus),
    startTime: 0, // The start time of the execution (epoch milliseconds)
    loadingStage: types.maybe(types.enumeration<LoadingStage>("LoadingStage", Object.values(LoadingStage))),
    _errorDetail: "", // Expected to be in markdown https://commonmark.org/help/
  })

  .views((self) => ({
    get empty() {
      return self.objects.size === 0;
    },

    get credentials(): ICredentials {
      const parent: IInstallation = getParent(self);
      return parent.credentials;
    },

    get region(): string {
      const parent: IInstallation = getParent(self);
      return parent.region;
    },

    get importWorkflowArn(): string {
      const parent: IInstallation = getParent(self);
      return parent.importWorkflowArn;
    },

    get metadataBucket(): string {
      const parent: IInstallation = getParent(self);
      return parent.metadataBucket;
    },

    get stateMachineArn(): string {
      const parent: IInstallation = getParent(self);
      return parent.importWorkflowArn;
    },

    get isGettingSchemas() {
      return self.loadingStage === LoadingStage.GettingSchemas && (isStoreLoading(self) || isStoreReLoading(self));
    },

    get isMonitoringProgress() {
      return self.loadingStage === LoadingStage.MonitoringProgress && (isStoreLoading(self) || isStoreReLoading(self));
    },

    get errorDetail() {
      return self._errorDetail;
    },

    get listObjects(): IObjectImportStatus[] {
      const result: readonly unknown[] = values(self.objects);
      return sortBy(result as IObjectImportStatus[], ["label", "name"]);
    },

    get objectsCount(): number {
      return self.objects.size;
    },

    get processPercentage(): number {
      const size = self.objects.size;
      let count = 0;

      self.objects.forEach((object) => {
        switch (object.status) {
          case ObjectImportStatusCode.Preparing:
            count += 0.25;
            break;
          case ObjectImportStatusCode.In_Progress:
            count += 0.5;
            break;
          case ObjectImportStatusCode.Importing:
            count += 0.75;
            break;
          case ObjectImportStatusCode.Successful:
            count += 1;
        }
      });

      if (size === 0) return 0; // Avoid division by zero
      return (count / size) * 100;
    },
  }))

  .views((self) => ({
    get isSuccess(): boolean {
      return isStoreReady(self) && !isStoreError(self) && isEmpty(self.errorDetail);
    },

    get totalRecords(): number {
      return self.listObjects.reduce<number>((result, item) => result + Math.max((item as IObjectImportStatus).rowCount, 0), 0);
    },

    get totalFields(): number {
      return self.listObjects.reduce<number>((result, item) => result + Math.max((item as IObjectImportStatus).columnCount, 0), 0);
    },

    get totalBytes(): number {
      return self.listObjects.reduce<number>((result, item) => result + Math.max((item as IObjectImportStatus).bytesWritten, 0), 0);
    },

    get totalTime(): number {
      return self.listObjects.reduce<number>((result, item) => result + Math.max((item as IObjectImportStatus).importSeconds, 0), 0);
    },
  }))

  .views((self) => ({
    get totalRecordsDisplay(): string {
      return niceNumber(self.totalRecords);
    },

    get totalFieldsDisplay(): string {
      return niceNumber(self.totalFields);
    },

    get totalBytesDisplay(): string {
      return niceByte(self.totalBytes);
    },

    get totalTimeDisplay(): string {
      return `${Math.round(self.totalTime)} sec`;
    },
  }))

  .actions((self) => ({
    setObject(rawObject: ObjectStatusInput) {
      if (self.objects.has(rawObject.name)) {
        self.objects.get(rawObject.name)?.setObjectStatus(rawObject);
      } else {
        self.objects.set(rawObject.name, rawObject);
      }

      return self.objects.get(rawObject.name);
    },

    setLoadingStage(stage: LoadingStage) {
      self.loadingStage = stage;
    },

    clearLoadingStage() {
      self.loadingStage = undefined;
    },

    setStartTime(time: number) {
      self.startTime = time;
    },
  }))

  .actions((self) => ({
    buildStateMachineUrl(): string {
      const region = self.region;
      const stateMachineArn = self.importWorkflowArn;

      return `https://${region}.console.aws.amazon.com/states/home?region=${region}#/statemachines/view/${encodeURIComponent(stateMachineArn)}`;
    },

    buildExecutionUrl(executionArn: string): string {
      const region = self.region;

      return `https://${region}.console.aws.amazon.com/states/home?region=${region}#/executions/details/${encodeURIComponent(executionArn)}`;
    },
  }))

  .actions((self) => ({
    async describeWorkflow(executionArn: string): Promise<ExecutionStatus> {
      const accessKey = self.credentials.accessKey;
      const secretKey = self.credentials.secretKey;
      const region = self.region;
      const workflowArn = self.importWorkflowArn;

      try {
        const info = await describeSFN({ accessKey, secretKey, region, executionArn });
        return info.status as ExecutionStatus;
      } catch (error) {
        self.runInAction(() => {
          // This is in markdown
          self._errorDetail = `We attempted to check the status of the execution of the state machine by calling the Step Functions DescribeExecution API.
          However, we got the following error:
### ${error}

### Information
* State machine execution ARN: ${executionArn}
* State machine ARN: ${workflowArn}

### Links
* [AWS Step Functions execution page](${self.buildExecutionUrl(executionArn)})
* [AWS Step Functions state machine page](${self.buildStateMachineUrl()})
* [Step Functions DescribeExecution API documentation](https://docs.aws.amazon.com/step-functions/latest/apireference/API_DescribeExecution.html)
          `;
        });
        throw error;
      }
    },

    async handleSFNFailure(executionArn: string, status: ExecutionStatus) {
      // In this method we display an informative error detail that provides enough context around the failure.
      // To do this, we will list all the execution history events and look for the overall execution event that had an error.
      // Since getting the history events is not critical, we will capture any errors from calling GetExecutionHistory
      // and not propagate them or have them affecting the overall status of the operation.

      let executionEvent: HistoryEvent;
      const accessKey = self.credentials.accessKey;
      const secretKey = self.credentials.secretKey;
      const region = self.region;
      const workflowArn = self.importWorkflowArn;

      try {
        const events = await getSFNHistory({ accessKey, secretKey, region, executionArn });
        // We find the execution event that failed
        for (const event of events) {
          if (isExecutionFailureEvent(event)) {
            // We found the event
            executionEvent = event;
            break;
          }
        }
      } catch (error) {
        // Since getting the stack events is not critical, we will capture any errors from calling the describe stack events
        // call and not propagate them or have them affect the overall status of the operation.
        console.log(error);
      }

      self.runInAction(() => {
        // This is in markdown
        self._errorDetail = `The step function workflow failed with the following status:
### ${status}`;

        if (executionEvent) {
          const info = getExecutionFailureInfo(executionEvent);
          self._errorDetail = `${self._errorDetail}
### Execution Failure
* Cause: ${info.cause}
         `;
        }

        self._errorDetail = `${self._errorDetail}
### Information
* State machine execution ARN: ${executionArn}
* State machine ARN: ${workflowArn}
        
### Links
* [AWS Step Functions execution page](${self.buildExecutionUrl(executionArn)})
* [AWS Step Functions state machine page](${self.buildStateMachineUrl()})        
          `;
      });
      throw new Error(status);
    },

    async loadSchemas() {
      // We need to detect all the objects that we are expecting to import, this is done by looking at the schema files in S3
      const accessKey = self.credentials.accessKey;
      const secretKey = self.credentials.secretKey;
      const region = self.region;
      const bucketName = self.metadataBucket;
      const worker = async (s3Object: S3Object) => {
        const json = (await s3GetJson({ accessKey, secretKey, region, bucketName, objectKey: s3Object.key })) as { name: string; label: string };
        self.setObject({ name: json.name, label: json.label ?? json.name });
      };

      const objects = await s3ListObjects({ accessKey, secretKey, region, bucketName, prefix: `schemas/` });
      const chunks = chunkIt(objects, 5); // chunks them 5 at a time
      while (!isEmpty(chunks)) {
        const chunk = chunks.shift() ?? [];
        // Create a list of worker promises and wait on all of them
        await Promise.all(chunk.map((object) => worker(object)));
      }
    },

    async pullProgress(executionArn: string) {
      // We pull that latest status of any object that has not reached the successful stage
      const accessKey = self.credentials.accessKey;
      const secretKey = self.credentials.secretKey;
      const region = self.region;
      const runId = last(split(executionArn, ":"));
      const bucketName = self.metadataBucket;
      const worker = async (s3Object: S3Object) => {
        // An example of an S3 object key is
        // sf-metadata-u1puzajv0crm/state/runs/aaaaa-8d51-4dd3-bbf7-a81ee93cdc9a/Account.status.json
        // So, can split on "/" and take the last element which is "Account.status.json" and then
        // split on "." and take the first element which give us "Account"
        const name = first(split(last(split(s3Object.key, "/")), ".")) ?? ""; // Yes, we can regex but this is also okay, see explanation above
        try {
          const existing = self.objects.get(name);
          if (existing?.isSuccessful) return;

          const json = (await s3GetJson({ accessKey, secretKey, region, bucketName, objectKey: s3Object.key })) as RemoteObject;
          const object = self.setObject({
            name,
            status: json.status,
            rowCount: json.metadata?.rowCount,
            columnCount: json.metadata?.columnCount,
            importSeconds: json.metadata?.importSeconds,
            bytesWritten: json.metadata?.bytesWritten,
          });

          object?.setStale(false);
        } catch (error) {
          // NOTE: it is important that we don't propagate this error, we don't want status reporting to halt deployment
          console.error(error);
        }
      };

      const objects = await s3ListObjects({ accessKey, secretKey, region, bucketName, prefix: `state/runs/${runId}/` });
      const chunks = chunkIt(objects, 5); // chunks them 5 at a time
      while (!isEmpty(chunks)) {
        const chunk = chunks.shift() ?? [];
        // Create a list of worker promises and wait on all of them
        await Promise.all(chunk.map((object) => worker(object)));
      }
    },

    async getLatestExecution() {
      const accessKey = self.credentials.accessKey;
      const secretKey = self.credentials.secretKey;
      const region = self.region;
      const stateMachineArn = self.stateMachineArn;

      return getLatestSFN({ accessKey, secretKey, region, stateMachineArn });
    },

    markStale() {
      self.objects.forEach((object) => {
        object.setStale(true);
      });
    },

    removeStale() {
      self.objects.forEach((object) => {
        if (object.stale) self.objects.delete(object.name); // It is safe to delete from a map while iterating
      });
    },
  }))

  .actions((self) => {
    const superAfterCreate = self.afterCreate;
    const superReset = self.reset;
    return {
      afterCreate() {
        superAfterCreate();
        self._errorDetail = "";
        self.loadingStage = undefined;
      },

      reset() {
        superReset();
        self._errorDetail = "";
        self.objects.clear();
        self.loadingStage = undefined;
      },

      async doLoad({ executionArn, startTime }: { executionArn?: string; startTime?: number } = {}) {
        self.loadingStage = LoadingStage.GettingSchemas;
        self._errorDetail = "";
        self.startTime = startTime ? startTime : self.startTime;
        self.markStale();

        if (!executionArn) {
          const latestExecution = await self.getLatestExecution();
          if (!latestExecution || !latestExecution.executionArn) {
            // If we don't have any, then there is nothing else to do
            self.setStartTime(0);
            self.clearLoadingStage();
            return;
          }
          self.setStartTime(latestExecution.startDate?.getTime() ?? 0);
          executionArn = latestExecution.executionArn;
        }

        // Load the schemas
        await self.loadSchemas();

        let status: ExecutionStatus;
        const shouldStop = (status: ExecutionStatus) => isFailureStatus(status) || isSuccessStatus(status);
        self.setLoadingStage(LoadingStage.MonitoringProgress);

        do {
          status = await self.describeWorkflow(executionArn);
          await delay(10);
          await self.pullProgress(executionArn);
        } while (!shouldStop(status));

        self.clearLoadingStage();
        if (isSuccessStatus(status)) {
          self.removeStale();
          return; // We are done with the success scenario
        }

        // We hit an SFN failure
        await self.handleSFNFailure(executionArn, status);
      },
    };
  });

// see https://mobx-state-tree.js.org/tips/typescript
export interface IImportStatusStore extends Instance<typeof ImportStatusStore> {}

export function useImportStatusStore() {
  const installation = useInstallation();
  const store = installation.importStatusStore;

  useEffect(() => {
    // TODO - add a check for time and if it has been more than 10 minutes, then load the store
    if (!isStoreNew(store)) return;
    store.load();
  }, [store]);

  return { isError: isStoreError(store), store };
}
