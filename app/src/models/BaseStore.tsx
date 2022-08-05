import isNil from "lodash/isNil";
import { types, Instance } from "mobx-state-tree";

export enum IStoreLoadingState {
  Initial = "INITIAL",
  Loading = "LOADING",
  Ready = "READY",
  Reloading = "RELOADING",
}

/**
 * A four-state model that has the following states:
 *  +---------+                   +-----------+
 *  | initial |            +----> |   ready   |
 *  +---------+            |      +-----------+
 *                         |
 *      + ^                |         + ^
 *      | |                |         | | success
 * load | | error          |    load | | or error
 *      v +                |         v +
 *                         |
 *  +---------+            |      +-----------+
 *  | loading +------------+      | reloading |
 *  +---------+   success         +-----------+
 *
 * loadingState: <initial|loading|ready|reloading>
 * loadingError: <error object> if there is an error otherwise <undefined>
 */
export const BaseStore = types
  .model("BaseStore", {
    loadingState: types.optional(
      types.enumeration<IStoreLoadingState>("StoreLoadingState", Object.values(IStoreLoadingState)),
      IStoreLoadingState.Initial
    ),
    loadingError: types.maybe(types.frozen()),
    loadingPercentage: 0,
  })

  .actions(() => ({
    // We need this, see https://github.com/mobxjs/mobx-state-tree/issues/915
    runInAction(fn: () => void) {
      return fn();
    },
  }))

  .actions((self) => ({
    afterCreate(): void {
      // The purpose is to ensure that when a store snapshot is rehydrated that it is reset
      // to 'initial' but only if it was loading or had an error
      const loading = self.loadingState === IStoreLoadingState.Loading;
      const reLoading = self.loadingState === IStoreLoadingState.Reloading;
      const hasError = !isNil(self.loadingError);

      if (loading || reLoading || hasError) {
        self.loadingState = IStoreLoadingState.Initial;
        self.loadingError = undefined;
        self.loadingPercentage = 0;
      }
    },

    doLoad<T>(_args?: T): Promise<void> {
      throw new Error("Method 'doLoad' must be implemented by sub models");
    },
  }))

  .actions((self) => {
    let loadingPromise: Promise<void> | undefined;

    return {
      load<T>(args?: T): Promise<void> {
        if (loadingPromise) return loadingPromise;

        self.loadingError = undefined;
        if (self.loadingState === IStoreLoadingState.Ready) self.loadingState = IStoreLoadingState.Reloading;
        else if (self.loadingState !== IStoreLoadingState.Reloading) self.loadingState = IStoreLoadingState.Loading;
        self.loadingPercentage = 0;
        loadingPromise = new Promise(async (resolve, reject) => {
          try {
            await self.doLoad(args);
            self.runInAction(() => {
              self.loadingState = IStoreLoadingState.Ready;
              self.loadingPercentage = 100;
              loadingPromise = undefined;
            });

            resolve();
          } catch (err) {
            self.runInAction(() => {
              self.loadingState = self.loadingState === IStoreLoadingState.Loading ? IStoreLoadingState.Initial : IStoreLoadingState.Ready;
              self.loadingError = err;
              loadingPromise = undefined;
            });
            console.error(err);
            resolve(); // We always resolve in a store because its error status is captured already
          }
        });

        return loadingPromise;
      },

      setLoadingPercentage(value: number) {
        self.loadingPercentage = value;
        if (value > 100) self.loadingPercentage = 100;
        if (value < 0) self.loadingPercentage = 0;
      },
    };
  })
  .actions((self) => ({
    incrementLoadingPercentage(value: number) {
      self.setLoadingPercentage(self.loadingPercentage + value);
    },

    reset() {
      self.loadingError = undefined;
      self.loadingState = IStoreLoadingState.Initial;
      self.loadingPercentage = 0;
    },
  }))

  .views((self) => ({
    get empty() {
      // sub models should override this
      return true;
    },

    get errorMessage() {
      return self.loadingError ? self.loadingError.message || "unknown error" : "";
    },
  }));

// see https://mobx-state-tree.js.org/tips/typescript
export interface IBaseStore extends Instance<typeof BaseStore> {}

export const isStoreReady = (store: IBaseStore) =>
  store.loadingState === IStoreLoadingState.Ready || store.loadingState === IStoreLoadingState.Reloading;
export const isStoreEmpty = (store: IBaseStore) => isStoreReady(store) && store.empty;
export const isStoreLoading = (store: IBaseStore) => store.loadingState === IStoreLoadingState.Loading;
export const isStoreReLoading = (store: IBaseStore) => store.loadingState === IStoreLoadingState.Reloading;
export const isStoreNew = (store: IBaseStore) => store.loadingState === IStoreLoadingState.Initial;
export const isStoreError = (store: IBaseStore) => !isNil(store.loadingError);
