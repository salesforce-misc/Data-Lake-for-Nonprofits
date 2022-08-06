import { isStoreError, isStoreLoading, isStoreReady, isStoreReLoading } from "models/BaseStore";

import { DetectedInstallationStore } from "./DetectedInstallationsStore";

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
