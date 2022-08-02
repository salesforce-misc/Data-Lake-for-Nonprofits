import some from "lodash/some";
import every from "lodash/every";

import { types, Instance } from "mobx-state-tree";

import { IUserAccessKey, UserAccessKey } from "models/helpers/UserAccessKey";

export enum AccessKeyStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

interface RawAccessKey {
  id: string;
  createDate: Date;
  status: AccessKeyStatus;
  secret?: string;
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
 * Represents an IAM user
 */
export const User = types
  .model("User", {
    id: "",
    name: "",
    arn: "",
    createDate: types.maybe(types.Date),
    accessKeys: types.map(UserAccessKey),
    policies: types.array(types.string),
    hasAthenaManagedPolicy: false,
    stale: false,
  })

  .actions((self) => ({
    setUser(rawUser: RawUser) {
      self.id = rawUser.id;
      self.name = rawUser.name;
      self.arn = rawUser.arn;
      self.createDate = rawUser.createDate;
      self.policies.replace(rawUser.policies);
      self.hasAthenaManagedPolicy = rawUser.hasAthenaManagedPolicy;
      self.stale = false;
    },

    setAccessKey(rawAccessKey: RawAccessKey) {
      if (self.accessKeys.has(rawAccessKey.id)) {
        self.accessKeys.get(rawAccessKey.id)?.setAccessKey(rawAccessKey);
      } else {
        self.accessKeys.set(rawAccessKey.id, rawAccessKey);
      }

      return self.accessKeys.get(rawAccessKey.id);
    },

    markStale() {
      self.stale = true;
      self.accessKeys.forEach((key) => key.markStale());
    },

    removeStale() {
      self.accessKeys.forEach((accessKey) => {
        if (accessKey.stale) self.accessKeys.delete(accessKey.id); // It is safe to delete from a map while iterating
      });
    },
  }))

  .views((self) => ({
    get hasAdminPolicy(): boolean {
      return some(self.policies, "arn:aws:iam::aws:policy/AdministratorAccess");
    },

    get listAccessKeys(): readonly IUserAccessKey[] {
      const result: IUserAccessKey[] = [];
      self.accessKeys.forEach((key) => result.push(key));

      return result;
    },
  }))

  .views((self) => ({
    get accessStatus(): UserAccessStatus {
      if (!self.hasAdminPolicy && !self.hasAthenaManagedPolicy) return UserAccessStatus.No_POLICY;
      if (self.accessKeys.size === 0) return UserAccessStatus.No_Keys;
      if (every(self.listAccessKeys, ["status", AccessKeyStatus.Inactive])) return UserAccessStatus.No_Active_Keys;
      return UserAccessStatus.Valid;
    },
  }))

  .views((self) => ({
    get hasAccess(): boolean {
      return self.accessStatus === UserAccessStatus.Valid;
    },
  }));

export interface IUser extends Instance<typeof User> {}
