import chunkIt from "lodash/chunk";
import { Instance } from "mobx-state-tree";

import { s3PutJson } from "../../api/s3-put-json";
import { ISFObject } from "../MetadataStore";
import { Operation } from "./Operation";
import { OperationContext } from "./utils";

export const UploadSchema = Operation.named("UploadSchema")
  .props({
    type: "UploadSchema",
  })

  .views((self) => ({
    get notStartedMessage(): string {
      return `Upload data model schema. This might take a few seconds.`;
    },

    get inProgressMessage(): string {
      return `Uploading data model schema. This might take a few seconds.`;
    },

    get successMessage(): string {
      return `Successfully uploaded the data model schema`;
    },

    get failureMessage(): string {
      return `Could not upload the data model schema`;
    },
  }))

  .actions((self) => ({
    async doRun(context: OperationContext): Promise<void> {
      const installationId = context.id;
      const accessKey = context.credentials.accessKey;
      const secretKey = context.credentials.secretKey;
      const region = context.region;
      const bucketName = context.metadataBucket;
      const kmsKeyId = context.metadataBucketKmsKeyId;

      const metadataStore = context.metadataStore;
      const selectedObjects = metadataStore.selectedObjects;
      const upload = async (object: ISFObject) => {
        await s3PutJson({
          accessKey,
          secretKey,
          region,
          bucketName,
          objectKey: `schemas/${object.name}.${installationId}.schema.json`,
          kmsKeyId,
          jsonContent: JSON.stringify({ exclude: object.excluded, label: object.label, name: object.name }),
        });

        // self.incrementPercentage() here is called after each object file is uploaded. So if we have 5 objects 
        // to upload then after uploading an object we made 1/5th of the total progress.
        self.incrementPercentage((1 / selectedObjects.length) * 100);
      };

      try {
        const chunks = chunkIt(selectedObjects, 10); // chunks them 10 at a time
        while (chunks.length > 0) {
          const chunk = chunks.shift() ?? [];
          // Create a list of upload promises and wait on all of them
          await Promise.all(chunk.map((object) => upload(object)));
        }
      } catch (error) {
        self.runInAction(() => {
          // This is in markdown
          self._errorDetail = `We attempted to upload the schema files by calling S3 Put Object API.
          However, we got the following error:
### ${error}

### Information
* Bucket name: ${bucketName}
* Bucket KMS key id: ${kmsKeyId}
          `;
        });
        throw error;
      }
    },
  }));

export interface IUploadSchema extends Instance<typeof UploadSchema> {}
