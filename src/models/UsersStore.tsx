import chunkIt from "lodash/chunk";
import isEmpty from "lodash/isEmpty";
import sortBy from "lodash/sortBy";

import { types, Instance } from "mobx-state-tree";
import { values } from "mobx";
import { useEffect } from "react";
import { User as IAMUser } from "@aws-sdk/client-iam";

import { delay } from "helpers/utils";
import { listUsers } from "api/list-users";
import { listAccessKeys } from "api/list-access-keys";
import { listUserPolicies } from "api/list-user-policies";
import { createUser } from "api/create-user";
import { attachUserPolicy } from "api/attach-user-policy";
import { createAccessKey } from "api/create-access-key";
import { deleteUser } from "api/delete-user";
import { deactivateAccessKey } from "api/deactivate-access-key";
import { activateAccessKey } from "api/activate-access-key";
import { deleteAccessKey } from "api/delete-access-key";
import { BaseStore, isStoreError, isStoreLoading, isStoreNew, isStoreReady, isStoreReLoading } from "models/BaseStore";
import { IInstallation } from "models/Installation";

import { IUserAccessKey } from "models/helpers/UserAccessKey";
import { IUser, User } from "models/helpers/User";

export enum AccessKeyStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

interface RawUser {
  id: string;
  name: string;
  arn: string;
  createDate: Date;
  policies: string[];
  hasAthenaManagedPolicy: boolean;
}

export enum UserAccessStatus {
  No_Active_Keys = "NOT_ACTIVE_KEYS",
  No_Keys = "NO_KEYS",
  No_POLICY = "NO_POLICY", // When the user does not have the athena managed policy nor the admin policy
  Valid = "VALID",
}

/**
 * Represents the users store.
 */
export const UsersStore = BaseStore.named("UsersStore")
  .props({
    users: types.map(User),
  })

  .views((self) => ({
    get empty() {
      return isEmpty(self.users);
    },

    get listUsers(): IUser[] {
      const result: readonly unknown[] = values(self.users);
      return sortBy(result as IUser[], ["name"]);
    },
  }))

  .actions((self) => ({
    markStale() {
      self.users.forEach((user) => {
        user.markStale();
      });
    },

    removeStale() {
      self.users.forEach((user) => {
        if (user.stale) {
          self.users.delete(user.id); // It is safe to delete from a map while iterating
        } else user.removeStale(); // This removes any stale access keys
      });
    },
  }))

  .actions((self) => {
    const superReset = self.reset;
    return {
      reset() {
        superReset();
        self.users.clear();
      },
    };
  })

  .actions((self) => ({
    setUser(rawUser: RawUser) {
      if (self.users.has(rawUser.id)) {
        self.users.get(rawUser.id)?.setUser(rawUser);
      } else {
        self.users.set(rawUser.id, rawUser);
      }

      return self.users.get(rawUser.id) as IUser;
    },

    buildPathPrefix(installation: IInstallation) {
      return `/ezdl/${installation.id}/`; // This is how we distinguish from other users who are not created by this app
    },
  }))

  .actions((self) => ({
    async doLoad(installation: IInstallation) {
      self.markStale();
      const accessKey = installation.credentials.accessKey;
      const secretKey = installation.credentials.secretKey;
      const region = installation.region;
      const pathPrefix = self.buildPathPrefix(installation);

      const users = await listUsers({ accessKey, secretKey, region, pathPrefix });
      const worker = async (iamUser: IAMUser) => {
        if (!iamUser.UserId || !iamUser.UserName || !iamUser.Arn || !iamUser.CreateDate) {
          console.log(`${iamUser} does not have the necessary fields. This is not expected. Ignoring this user`);
          return;
        }
        const accessKeys = await listAccessKeys({ accessKey, secretKey, region, userName: iamUser.UserName });
        const attachedPoliciesObjects = await listUserPolicies({ accessKey, secretKey, region, userName: iamUser.UserName });
        const attachedPoliciesArns = attachedPoliciesObjects.map((policy) => policy.PolicyArn as string);

        const user = self.setUser({
          id: iamUser.UserId,
          name: iamUser.UserName,
          arn: iamUser.Arn,
          createDate: iamUser.CreateDate,
          policies: attachedPoliciesArns,
          hasAthenaManagedPolicy: attachedPoliciesArns.includes(installation.athenaManagedPolicy),
        });

        accessKeys.forEach((accessKey) => {
          if (!accessKey.AccessKeyId || !accessKey.CreateDate || !accessKey.Status) {
            console.log(`${accessKey} does not have the necessary fields. This is not expected. Ignoring this access key`);
            return;
          }

          user.setAccessKey({
            id: accessKey.AccessKeyId,
            createDate: accessKey.CreateDate,
            status: accessKey.Status === "Active" ? AccessKeyStatus.Active : AccessKeyStatus.Inactive,
          });
        });
      };

      const chunks = chunkIt(users, 5); // chunks them 5 at a time
      while (!isEmpty(chunks)) {
        const chunk = chunks.shift() ?? [];
        // Create a list of worker promises and wait on all of them
        await Promise.all(chunk.map((object) => worker(object)));
      }
      self.removeStale();
    },

    async createAthenaUser(userName: string, installation: IInstallation): Promise<IUser> {
      // Logic:
      // 1 - Create the user
      // 2 - Attach the athena managed policy
      // 3 - Create access key

      const accessKey = installation.credentials.accessKey;
      const secretKey = installation.credentials.secretKey;
      const region = installation.region;
      const pathPrefix = self.buildPathPrefix(installation);
      const athenaManagedPolicy = installation.athenaManagedPolicy;

      const iamUser = await createUser({ accessKey, secretKey, region, pathPrefix, userName });
      if (!iamUser.UserId || !iamUser.UserName || !iamUser.Arn || !iamUser.CreateDate) {
        // The only reason to have this logic here is because the loose typing of the AWS SDK :(
        throw new Error(`The creation of the user was successful, but yet, some of the required fields are not returned.`);
      }
      await delay(2); // Give IAM a chance to propagate the user
      await attachUserPolicy({ accessKey, secretKey, region, policyArn: athenaManagedPolicy, userName });
      const newAccessKey = await createAccessKey({ accessKey, secretKey, region, userName });

      const user = self.setUser({
        id: iamUser.UserId,
        name: iamUser.UserName,
        arn: iamUser.Arn,
        createDate: iamUser.CreateDate,
        policies: [athenaManagedPolicy],
        hasAthenaManagedPolicy: true,
      });

      if (!newAccessKey.AccessKeyId || !newAccessKey.CreateDate || !newAccessKey.Status) {
        // The only reason to have this logic here is because the loose typing of the AWS SDK :(
        throw new Error(`The creation of the access key was successful, but yet, some of the required fields are not returned.`);
      }

      user.setAccessKey({
        id: newAccessKey.AccessKeyId,
        createDate: newAccessKey.CreateDate,
        status: newAccessKey.Status === "Active" ? AccessKeyStatus.Active : AccessKeyStatus.Inactive,
        secret: newAccessKey.SecretAccessKey,
      });

      return user;
    },

    async deleteUser(userName: string, installation: IInstallation): Promise<void> {
      const accessKey = installation.credentials.accessKey;
      const secretKey = installation.credentials.secretKey;
      const region = installation.region;

      await deleteUser({ accessKey, secretKey, region, userName });
      self.runInAction(() => {
        self.users.forEach((user) => {
          if (user.name === userName) self.users.delete(user.id); // It is safe to delete from a map while iterating
        });
      });
    },

    async attachAthenaPolicy(user: IUser, installation: IInstallation): Promise<void> {
      if (!self.users.has(user.id)) throw new Error(`User "${user.name}" not found`);
      const existingUser = self.users.get(user.id) as IUser;

      const accessKey = installation.credentials.accessKey;
      const secretKey = installation.credentials.secretKey;
      const region = installation.region;
      const athenaManagedPolicy = installation.athenaManagedPolicy;

      await attachUserPolicy({ accessKey, secretKey, region, policyArn: athenaManagedPolicy, userName: existingUser.name });

      self.runInAction(() => {
        existingUser.policies.push(athenaManagedPolicy);
        existingUser.hasAthenaManagedPolicy = true;
      });
    },

    async updateAccessKeyStatus(user: IUser, accessKey: IUserAccessKey, status: AccessKeyStatus, installation: IInstallation): Promise<void> {
      if (!self.users.has(user.id)) throw new Error(`User "${user.name}" not found`);
      const existingUser = self.users.get(user.id) as IUser;
      if (!existingUser.accessKeys.has(accessKey.id)) throw new Error(`Access key "${accessKey.id}" not found`);
      const existingAccessKey = existingUser.accessKeys.get(accessKey.id) as IUserAccessKey;

      const adminAccessKey = installation.credentials.accessKey;
      const adminSecretKey = installation.credentials.secretKey;
      const region = installation.region;

      if (status === AccessKeyStatus.Inactive) {
        await deactivateAccessKey({
          accessKey: adminAccessKey,
          secretKey: adminSecretKey,
          region,
          userName: user.name,
          accessKeyId: existingAccessKey.id,
        });
        existingAccessKey.setStatus(AccessKeyStatus.Inactive);
      } else {
        await activateAccessKey({
          accessKey: adminAccessKey,
          secretKey: adminSecretKey,
          region,
          userName: user.name,
          accessKeyId: existingAccessKey.id,
        });
        existingAccessKey.setStatus(AccessKeyStatus.Active);
      }
    },

    async deleteAccessKey(user: IUser, accessKey: IUserAccessKey, installation: IInstallation): Promise<void> {
      if (!self.users.has(user.id)) throw new Error(`User "${user.name}" not found`);
      const existingUser = self.users.get(user.id) as IUser;
      if (!existingUser.accessKeys.has(accessKey.id)) throw new Error(`Access key "${accessKey.id}" not found`);
      const existingAccessKey = existingUser.accessKeys.get(accessKey.id) as IUserAccessKey;

      const adminAccessKey = installation.credentials.accessKey;
      const adminSecretKey = installation.credentials.secretKey;
      const region = installation.region;

      await deleteAccessKey({
        accessKey: adminAccessKey,
        secretKey: adminSecretKey,
        region,
        userName: user.name,
        accessKeyId: existingAccessKey.id,
      });

      self.runInAction(() => {
        existingUser.accessKeys.delete(existingAccessKey.id);
      });
    },

    async createAccessKey(user: IUser, installation: IInstallation): Promise<IUserAccessKey> {
      if (!self.users.has(user.id)) throw new Error(`User "${user.name}" not found`);
      const existingUser = self.users.get(user.id) as IUser;

      const adminAccessKey = installation.credentials.accessKey;
      const adminSecretKey = installation.credentials.secretKey;
      const region = installation.region;

      const newAccessKey = await createAccessKey({ accessKey: adminAccessKey, secretKey: adminSecretKey, region, userName: existingUser.name });

      if (!newAccessKey.AccessKeyId || !newAccessKey.CreateDate || !newAccessKey.Status) {
        // The only reason to have this logic here is because the loose typing of the AWS SDK :(
        throw new Error(`The creation of the access key was successful, but yet, some of the required fields are not returned.`);
      }

      existingUser.setAccessKey({
        id: newAccessKey.AccessKeyId,
        createDate: newAccessKey.CreateDate,
        status: newAccessKey.Status === "Active" ? AccessKeyStatus.Active : AccessKeyStatus.Inactive,
        secret: newAccessKey.SecretAccessKey,
      });

      return existingUser.accessKeys.get(newAccessKey.AccessKeyId) as IUserAccessKey;
    },
  }));

// see https://mobx-state-tree.js.org/tips/typescript
export interface IUsersStore extends Instance<typeof UsersStore> {}

// We keep a map to hold the usersStore per installation id
const usersStoreMap = new Map<string, IUsersStore>();

export const getUsersStore = (installationId: string): IUsersStore => {
  if (usersStoreMap.has(installationId)) return usersStoreMap.get(installationId) as IUsersStore;

  const store = UsersStore.create();
  usersStoreMap.set(installationId, store);

  return store;
};

export function useUsersStore(installation: IInstallation) {
  const store = getUsersStore(installation.id);

  useEffect(() => {
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
