import { useEffect } from "react";
import isEmpty from "lodash/isEmpty";
import { types, Instance, getParent } from "mobx-state-tree";

import { useInstallation } from "AppContext";
import { listAppflowConnections } from "api/list-appflow-connections";

import { BaseStore, isStoreNew, isStoreError, isStoreReady, isStoreLoading, isStoreReLoading } from "./BaseStore";
import { ICredentials } from "./helpers/Credentials";
import { IInstallation } from "./Installation";

/**
 * Represents the store for the AppFlow Salesforce connection names
 */
export const ConnectionsStore = BaseStore.named("ConnectionsStore")
  .props({
    connectionNames: types.array(types.string),
  })

  .views((self) => ({
    get empty() {
      return isEmpty(self.connectionNames);
    },

    get credentials(): ICredentials {
      const parent: IInstallation = getParent(self);
      return parent.credentials;
    },

    get region(): string {
      const parent: IInstallation = getParent(self);
      return parent.region;
    },
  }))

  .actions((self) => {
    const superReset = self.reset;
    return {
      reset() {
        superReset();
        self.connectionNames.clear();
      },

      async doLoad() {
        const accessKey = self.credentials.accessKey;
        const secretKey = self.credentials.secretKey;
        const region = self.region;

        const rawConnectionNames = await listAppflowConnections({ accessKey, secretKey, region });
        self.runInAction(() => {
          self.connectionNames.replace(rawConnectionNames);
        });
      },
    };
  });

// see https://mobx-state-tree.js.org/tips/typescript
export interface IConnectionsStore extends Instance<typeof ConnectionsStore> {}

export function useConnectionsStore() {
  const installation = useInstallation();
  const store = installation.connectionsStore;

  useEffect(() => {
    if (!isStoreNew(store)) return;
    store.load();
  }, [store]);

  return {
    isError: isStoreError(store),
    isReady: isStoreReady(store),
    isLoading: isStoreLoading(store),
    isReloading: isStoreReLoading(store),
    store,
  };
}
