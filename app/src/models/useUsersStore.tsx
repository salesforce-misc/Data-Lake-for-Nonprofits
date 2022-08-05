import React from "react";

import { isStoreError, isStoreLoading, isStoreNew, isStoreReady, isStoreReLoading } from "models/BaseStore";
import { IInstallation } from "models/Installation";
import { getUsersStore } from "models/getUsersStore";

export function useUsersStore(installation: IInstallation) {
  const store = getUsersStore(installation.id);

  React.useEffect(() => {
    if (!isStoreNew(store)) return;
    store.load(installation);
  }, [store, installation]);

  return {
    isError: isStoreError(store),
    isReady: isStoreReady(store),
    isLoading: isStoreLoading(store),
    isReloading: isStoreReLoading(store),
    store,
  };
}
