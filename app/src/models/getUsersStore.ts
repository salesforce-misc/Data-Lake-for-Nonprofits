import { IUsersStore, UsersStore } from "models/UsersStore";

// We keep a map to hold the usersStore per installation id
const usersStoreMap = new Map<string, IUsersStore>();

export const getUsersStore = (installationId: string): IUsersStore => {
  if (usersStoreMap.has(installationId)) return usersStoreMap.get(installationId) as IUsersStore;

  const store = UsersStore.create();
  usersStoreMap.set(installationId, store);

  return store;
};
