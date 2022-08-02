import isEmpty from "lodash/isEmpty";
import { types, Instance, getSnapshot } from "mobx-state-tree";

import { IInstallation, Installation, isCompleted } from "./Installation";
import { Credentials, ICredentials } from "./helpers/Credentials";
import { storage } from "../helpers/utils";
import { s3PutJson } from "../api/s3-put-json";
import { IDetectedInstallation } from "./DetectedInstallationsStore";
// import { installationData } from "../data/installation-data";

/**
 * The root store for the whole application
 */
export const AppStore = types
  .model("AppStore", {
    installation: types.maybe(Installation),
    credentials: types.optional(Credentials, {}),
  })

  .views((self) => ({
    get completedStep1() {
      if (!self.installation) return false;
      return isCompleted(self.installation.connectToAwsStep);
    },
  }))

  .actions(() => ({
    // We need this, see https://github.com/mobxjs/mobx-state-tree/issues/915
    runInAction(fn: () => void) {
      return fn();
    },
  }))

  .actions((self) => {
    return {
      setCredentials(accessKey: string, secretKey: string, accountId: string, userArn: string, userName?: string): ICredentials {
        const credentials = Credentials.create({ accessKey, secretKey, accountId, userArn, userName });
        self.credentials = credentials;

        return self.credentials;
      },

      newInstallation(): IInstallation {
        // The logic:
        // - Create a new instance of Installation
        // - Replace any existing installation instance with the newly created one
        self.installation = Installation.create({});
        self.credentials.reset();
        storage.setItem("installation", "{}");

        return self.installation;
      },

      setInstallation(installation: IInstallation | undefined) {
        self.installation = installation;
      },

      // Load the state of the installation model from local storage. NOTE: we don't store credentials in local storage
      loadLocal() {
        const installationStr = storage.getItem("installation");
        if (installationStr) {
          try {
            const installationJson = JSON.parse(installationStr);
            // const installationJson = installationData;

            // TODO - future, check the version of the installation
            self.installation = Installation.create(installationJson);

            // If we didn't complete step1, then start over, no need to continue with existing installation
            if (!self.completedStep1) {
              self.installation = Installation.create({});
            }
          } catch (error) {
            console.error(error);
            // if we can't parse the content, then we will do a new installation
            self.installation = Installation.create({});
          }
        }
        self.credentials.reset();
      },

      // Save the state of the installation model from local storage. NOTE: we don't store credentials in local storage
      saveLocal() {
        const installationJson = getSnapshot(self.installation as IInstallation);
        const installationStr = JSON.stringify(installationJson);
        storage.setItem("installation", installationStr);
      },

      async saveRemote() {
        // Save the state of the installation model to S3. NOTE: we don't store credentials in S3
        // We don't store anything if we don't have the credentials and the metadata bucket.
        // In addition, if there is any failure when we do the S3 put, we don't need to bother the user with this
        // since storing the state in S3 is not critical at all.

        const installation = self.installation;

        if (!installation) return;
        if (self.credentials.empty) return;
        if (isEmpty(installation.metadataBucket) || isEmpty(installation.metadataBucketKmsKeyId)) return;

        try {
          const accessKey = self.credentials.accessKey;
          const secretKey = self.credentials.secretKey;
          const region = installation.region;

          await s3PutJson({
            accessKey,
            secretKey,
            region,
            bucketName: installation.metadataBucket,
            kmsKeyId: installation.metadataBucketKmsKeyId,
            objectKey: `state/installation.json`,
            jsonContent: JSON.stringify(getSnapshot(installation)),
          });
        } catch (error) {
          console.error(error);
        }
      },
    };
  })

  .actions((self) => ({
    useDetectedInstallation(installation: IDetectedInstallation, credentials: ICredentials) {
      self.setCredentials(credentials.accessKey, credentials.secretKey, credentials.accountId, credentials.userArn, credentials.userName);
      self.installation = Installation.create(installation.installationJson);
    },
  }));

// see https://mobx-state-tree.js.org/tips/typescript
export interface IAppStore extends Instance<typeof AppStore> {}
