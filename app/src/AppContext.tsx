import React, { createContext, useContext } from "react";
import isEmpty from "lodash/isEmpty";
import throttle from "lodash/throttle";

import { AppStore, IAppStore } from "./models/AppStore";
import { IInstallation } from "./models/Installation";
import { isLocalDev, websiteUrlOrigin, assetWebsiteUrl, secretKey } from "./helpers/settings";
import { onSnapshot } from "mobx-state-tree";

// Create an instance of the root store (a.k.a appStore)
const appStore = AppStore.create({});

// Store state to local storage
const storeLocally = throttle(() => appStore.saveLocal(), 5000);

// Store state in S3 when applicable
const storeRemotely = throttle(() => appStore.saveRemote(), 30000);

// The initialization function for the root store
export function initializeStore() {
  if (!isEmpty(secretKey)) console.warn("Access key is bundled!");

  if (isLocalDev) {
    console.log(`isLocalDev '${isLocalDev}'`);
    console.log(`websiteUrlOrigin '${websiteUrlOrigin}'`);
    console.log(`assetWebsiteUrl '${assetWebsiteUrl}'`);

    if (window.location.host !== "localhost:3000") {
      console.warn("You should run the app on localhost!");

      throw new Error("App should run on localhost for development mode!");
    }
  }

  appStore.loadLocal();
  onSnapshot(appStore, (snapshot) => {
    storeLocally();
    storeRemotely();
  });
}

// Create the store context
export const StoreContext = createContext<IAppStore | undefined>(undefined);

// Create the store provider component
export const StoreProvider: React.FunctionComponent = ({ children }) => {
  return <StoreContext.Provider value={appStore}>{children}</StoreContext.Provider>;
};

// useStore hook
export function useStore(): IAppStore {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error("useStore() must be used within a StoreProvider");
  }

  return store;
}

// useInstallation hook
export function useInstallation(): IInstallation {
  const store = useStore();
  const installation = store.installation;

  if (!installation) {
    throw new Error("An installation instance was not created yet");
  }

  return installation;
}
