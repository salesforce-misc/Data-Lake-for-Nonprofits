import chunkIt from "lodash/chunk";
import filter from "lodash/filter";
import has from "lodash/has";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import sortBy from "lodash/sortBy";

import { types, Instance, getParent } from "mobx-state-tree";
import { values } from "mobx";
import { useEffect } from "react";

import { useInstallation } from "AppContext";
import { BaseStore, isStoreError, isStoreNew, isStoreReady } from "models/BaseStore";
import { ICredentials } from "models/helpers/Credentials";
import { IInstallation, isCompleted } from "models/Installation";
import { IRawSalesforceObject, listSalesforceObjects } from "api/list-salesforce-objects";
import { listSalesforceFields } from "api/list-salesforce-fields";
import { defaultObjectsMap, defaultObjects } from "data/default-npsp-objects";
import { s3ListObjects, S3Object } from "api/list-s3-objects";
import { s3GetJson } from "api/s3-get-json";
import { delay } from "helpers/utils";
import { ISFObject, SFObject } from "models/helpers/SFObject";

export interface IMissingObject {
  name: string;
  label: string;
}

// This represents the field parts of the json that we store in S3, under
// s3://sf-metadata-<installation id>/schemas/<object name>.<installation id>.schema.json
export interface IFieldSchema {
  type: string;
  label: string;
}
// This represents the object part of the json that we store in S3, under
// s3://sf-metadata-<installation id>/schemas/<object name>.<installation id>.schema.json
export interface IObjectSchema {
  name: string;
  label: string;
  exclude: { [key: string]: IFieldSchema };
  properties: { [key: string]: IFieldSchema };
}

/**
 * Represents the model for the salesforce objects metadata. This includes the objects and their fields.
 */
export const MetadataStore = BaseStore.named("MetadataStore")
  .props({
    objects: types.map(SFObject),
  })

  .views((self) => ({
    get empty() {
      return isEmpty(self.objects);
    },

    get credentials(): ICredentials {
      const parent: IInstallation = getParent(self);
      return parent.credentials;
    },

    get appflowConnectionName(): string {
      const parent: IInstallation = getParent(self);
      return parent.appFlowConnectionName;
    },

    get region(): string {
      const parent: IInstallation = getParent(self);
      return parent.region;
    },

    get missingObjects(): IMissingObject[] {
      const list = [];
      for (const defaultObject of defaultObjects) {
        if (!self.objects.has(defaultObject.name)) {
          // @ts-ignore
          list.push(defaultObject);
        }
      }

      return list;
    },

    get selectedObjects(): ISFObject[] {
      const result: unknown[] = filter(values(self.objects), ["selected", true]);
      return sortBy(result as ISFObject[], [(obj) => !obj.isDefault, "label", "name"]);
    },

    get excludedObjects(): ISFObject[] {
      const result: unknown[] = filter(values(self.objects), ["selected", false]);
      return sortBy(result as ISFObject[], [(obj) => !obj.isDefault, "label", "name"]);
    },

    get listAll(): ISFObject[] {
      // We return all the objects but have the default object sorted first
      return sortBy(values<unknown>(self.objects), [(obj) => !obj.isDefault, "label", "name"]) as ISFObject[];
    },

    get defaultCount(): number {
      return defaultObjects.length;
    },
  }))

  .views((self) => ({
    get selectedFieldsCount(): number {
      const objects = self.selectedObjects;
      return objects.reduce<number>((result, item) => result + (item as ISFObject).selectedFieldsCount, 0);
    },

    get fieldsCount(): number {
      // Returns the count of all fields (regardless if they are selected or not) with the exception of the compound fields
      const objects: readonly unknown[] = values(self.objects);
      return objects.reduce<number>((result, item) => result + (item as ISFObject).fieldsCount, 0);
    },

    get maxLimit(): number {
      return 50;
    },

    get isPostDeployment(): boolean {
      const parent: IInstallation = getParent(self);

      return isCompleted(parent.deploymentStep);
    },

    get metadataBucket(): string {
      const parent: IInstallation = getParent(self);
      return parent.metadataBucket;
    },
  }))

  .actions((self) => ({
    markStale() {
      self.objects.forEach((object) => {
        object.markStale();
      });
    },

    removeStale() {
      self.objects.forEach((object) => {
        if (object.stale) {
          self.objects.delete(object.name); // It is safe to delete from a map while iterating
        }
      });
    },

    setObject(rawObject: IRawSalesforceObject): ISFObject {
      if (self.objects.has(rawObject.name)) {
        self.objects.get(rawObject.name)?.setObject(rawObject);
      } else {
        self.objects.set(rawObject.name, rawObject);
      }

      return self.objects.get(rawObject.name)!;
    },
  }))

  .actions((self) => ({
    async loadJsonSchemas() {
      // This method loads the schema json files from S3. These schema json files are only available after an initial deployment.
      const accessKey = self.credentials.accessKey;
      const secretKey = self.credentials.secretKey;
      const region = self.region;
      const bucketName = self.metadataBucket;

      const objects = await s3ListObjects({ accessKey, secretKey, region, bucketName, prefix: `schemas/` });
      const chunks = chunkIt(objects, 5); // chunks them 5 at a time

      const worker = async (s3Object: S3Object) => {
        const json = (await s3GetJson({ accessKey, secretKey, region, bucketName, objectKey: s3Object.key })) as IObjectSchema;
        const object = self.setObject({ name: json.name, label: json.label ?? json.name });

        object.setSelected(true);

        // Deal with excluded fields first
        Object.keys(json.exclude || {}).forEach((name) => {
          const item = json.exclude[name];
          object.setField({ name, label: item.label, type: item.type, excluded: true });
        });

        // Then deal with included fields
        Object.keys(json.properties || {}).forEach((name) => {
          const item = json.properties[name];
          object.setField({ name, label: item.label, type: item.type, excluded: false });
        });

        object.setFieldsLoaded(true);

        self.incrementLoadingPercentage((1 / objects.length) * (100 - 10));
      };

      while (!isEmpty(chunks)) {
        const chunk = chunks.shift() ?? [];
        // Create a list of worker promises and wait on all of them
        await Promise.all(chunk.map((object) => worker(object)));
      }
    },
  }))

  .actions((self) => {
    const superReset = self.reset;
    return {
      reset() {
        superReset();
        self.objects.clear();
      },

      async doLoad() {
        // Summary of the logic:
        // - Get the list of all objects (if we haven't done so)
        // - If we are loading the store pre deployment, then:
        //   - Get the intersection of all objects and the default objects
        //     - Find the objects that don't have their fields loaded yet
        //       - Create chunks of these objects and get their fields
        // - Otherwise, if we are loading the store post deployment, then:
        //   - Get all the json objects from S3

        const accessKey = self.credentials.accessKey;
        const secretKey = self.credentials.secretKey;
        const region = self.region;
        const connectionName = self.appflowConnectionName;

        self.setLoadingPercentage(5); // To give the user a sense of progress

        // Get the list of all objects
        if (self.empty || self.isPostDeployment) {
          self.markStale();

          const rawObjects = await listSalesforceObjects({ accessKey, secretKey, region, connectionName });
          self.runInAction(() => {
            // Create SFObject models from the raw objects and mark the them selected if they are default
            for (const rawObject of rawObjects) {
              const object = self.setObject(rawObject);
              // We can make the assumption that an object is selected if it is part of the default NPSP package on an initial load,
              // but only if a deployment was not done yet
              if (!self.isPostDeployment) {
                object.setSelected(has(defaultObjectsMap, rawObject.name));
              }
            }
          });
        }

        self.setLoadingPercentage(10); // For completing the query of all objects

        if (self.isPostDeployment) {
          await self.loadJsonSchemas();
        } else {
          // For the selected objects, we need to find the ones where the fields are not loaded
          const selected: ISFObject[] = filter(self.selectedObjects, ["fieldsLoaded", false]);
          const errors: { name: string; error: Error }[] = []; // an array of errors that we keep while collecting the fields for all the selected objects
          const loadFields = async (object: ISFObject) => {
            try {
              const fields = await listSalesforceFields({ accessKey, secretKey, region, connectionName, objectName: object.name });
              object.setFields(fields);
              object.setFieldsLoaded(true);
              await delay(1); // Introduce a 1 second delay
            } catch (error) {
              // We don't want to fail the promise at this stage, instead we want all the getFields functions to
              // finish first, that is way we keep a record of all the errors instead of throwing the error right away.
              // We could have used promise.allSettled() but what we have here is simpler.
              errors.push({ name: object.name, error: error as Error });
              console.error(error);
            }
            self.incrementLoadingPercentage((1 / selected.length) * (100 - 10));
          };

          const chunks = chunkIt(selected, 5); // chunks them 5 at a time
          while (!isEmpty(chunks)) {
            const chunk = chunks.shift() ?? [];
            // Create a list of loadFields promises and wait on all of them
            await Promise.all(chunk.map((object) => loadFields(object)));
          }

          if (errors.length > 0) {
            throw new Error(`Problem loading fields for objects [${map(errors, "name")}]`);
          }
        }

        self.removeStale();
      },

      async selectObject(object: ISFObject) {
        if (object.fieldsLoaded) {
          object.setSelected(true);
          return;
        }

        const accessKey = self.credentials.accessKey;
        const secretKey = self.credentials.secretKey;
        const region = self.region;
        const connectionName = self.appflowConnectionName;

        const fields = await listSalesforceFields({ accessKey, secretKey, region, connectionName, objectName: object.name });
        object.setFields(fields);
        object.setFieldsLoaded(true);
        object.setSelected(true);
      },
    };
  });

// see https://mobx-state-tree.js.org/tips/typescript
export interface IMetadataStore extends Instance<typeof MetadataStore> {}

export function useMetadataStore() {
  const installation = useInstallation();
  const store = installation.metadataStore;

  useEffect(() => {
    if (!isStoreNew(store)) return;
    store.load();
  }, [store]);

  return { isError: isStoreError(store), isReady: isStoreReady(store), store };
}
