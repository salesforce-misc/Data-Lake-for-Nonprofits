import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";
import split from "lodash/split";
import startsWith from "lodash/startsWith";
import last from "lodash/last";
import { StackStatus } from "@aws-sdk/client-cloudformation";
import { types, Instance } from "mobx-state-tree";
import { values } from "mobx";

import { validateCredentials } from "api/validate-credentials";
import { listStacks } from "api/list-stacks";
import { describeStack } from "api/describe-stack";
import { s3GetJson } from "api/s3-get-json";
import { awsRegions } from "data/aws-regions";

import { BaseStore, isStoreError, isStoreLoading, isStoreReady, isStoreReLoading } from "models/BaseStore";
import { Credentials, ICredentials } from "models/helpers/Credentials";
import { BucketsStackNamePrefix } from "models/Installation";
import { getOutputValue, getParamValue } from "models/operations/utils";
import { DetectedInstallation, IDetectedInstallation } from "models/helpers/DetectedInstallation";
interface IDetectionInfo {
  id: string;
  installationJson?: IInstallationJson;
  region: string;
  webUrlOrigin: string;
  reachable: boolean;
  error?: string;
}

export interface IInstallationJson {
  id: string;
  startDate?: Date;
  startedBy?: string;
  accountId?: string;
  region?: string;
  appFlowConnectionName?: string;
}

/**
 * Represents the model for the detected installation
 */
export const DetectedInstallationStore = BaseStore.named("DetectedInstallationStore")
  .props({
    installations: types.map(DetectedInstallation),
    credentials: types.optional(Credentials, {}),
  })

  .views((self) => ({
    get empty() {
      return self.installations.size === 0;
    },

    get list(): IDetectedInstallation[] {
      return sortBy(values<unknown>(self.installations), ["region", "startDate"]) as IDetectedInstallation[];
    },
  }))

  .actions((self) => ({
    setCredentials(credentials: ICredentials): ICredentials {
      self.credentials = credentials;

      return self.credentials;
    },

    async getInstallationsForRegion({ region }: { region: string }): Promise<IDetectionInfo[]> {
      const accessKey = self.credentials.accessKey;
      const secretKey = self.credentials.secretKey;

      const stackSummaries = await listStacks({ accessKey, secretKey, region, statusArray: [StackStatus.CREATE_COMPLETE] });

      const result: IDetectionInfo[] = [];

      // - We find all the buckets stacks and get the metadata bucket names
      // - Then, we get the installation json stored in the bucket
      for (const stackSummary of stackSummaries) {
        if (!startsWith(stackSummary.StackName, BucketsStackNamePrefix)) continue;

        const stack = await describeStack({ accessKey, secretKey, region, stackName: stackSummary.StackId! });
        if (!stack) continue;

        const bucketName = getOutputValue(stack, "MetadataBucket");
        const webUrlOrigin = getParamValue(stack, "WebURLOrigin");
        if (isEmpty(bucketName) || isEmpty(webUrlOrigin)) continue;

        // The installation id is the last segment of the metadata bucket name.
        // Example: metadata bucket name = 'sf-metadata-1913745vxm77', installation id = '1913745vxm77'
        const installationId = last(split(bucketName, "-"))!;

        // We try to get the installation json file for each bucket, as long as the webUrlOrigin matches the browser one
        if (webUrlOrigin === window.location.origin) {
          try {
            const json = await s3GetJson({ accessKey, secretKey, region, bucketName, objectKey: "state/installation.json" });
            result.push({ id: installationId, region, installationJson: json as IInstallationJson, reachable: true, webUrlOrigin });
          } catch (error) {
            // Uncomment the next line if you want to show disabled data lake selection
            // result.push({ id: installationId, region, webUrlOrigin, reachable: false, error: `${error}` });
            // console.error(error);
          }
        } else {
          // Uncomment the next line if you want to show disabled data lake selection
          // result.push({ id: installationId, region, webUrlOrigin, reachable: false, error: "Not the same origin" });
        }
      }

      return result;
    },
  }))

  .actions((self) => ({
    async getInstallations(): Promise<IDetectionInfo[]> {
      const result: IDetectionInfo[] = [];

      const regionNames = awsRegions.map((item) => item.name);

      for (const region of regionNames) {
        const installations = await self.getInstallationsForRegion({ region });
        result.push(...installations);
      }

      return result;
    },
  }))

  .actions((self) => {
    const superReset = self.reset;
    return {
      reset() {
        superReset();
        self.installations.clear();
        self.credentials.reset();
      },

      async doLoad() {
        // This gets the installation information in all supported regions
        const detectionInfos = await self.getInstallations();
        self.runInAction(() => {
          detectionInfos.forEach((info) => {
            self.installations.set(info.id, info);
          });
        });
      },

      async connectToAws(accessKey: string, secretKey: string) {
        const region = awsRegions[0].name; // Since IAM is global, using the first region we have in the list is okay
        const { accountId, userArn, userName } = await validateCredentials({ accessKey, secretKey, region });

        self.runInAction(() => {
          const credentials = Credentials.create({ accessKey, secretKey, accountId, userArn, userName });
          self.setCredentials(credentials);
        });
      },
    };
  });

// see https://mobx-state-tree.js.org/tips/typescript
export interface IDetectedInstallationStore extends Instance<typeof DetectedInstallationStore> {}

// Create an instance of this store
const store = DetectedInstallationStore.create({});

export function useDetectedInstallationStore() {
  return {
    isError: isStoreError(store),
    isReady: isStoreReady(store),
    isLoading: isStoreLoading(store),
    isReloading: isStoreReLoading(store),
    store,
  };
}
