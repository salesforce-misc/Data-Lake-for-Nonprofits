import some from "lodash/some";
import every from "lodash/every";

import { types, Instance } from "mobx-state-tree";

import { TAccessKeyStatus, IUserAccessKey, IRawAccessKey, UserAccessKey } from "models/helpers/UserAccessKey";

export interface IRawUser {
  id: string;
  name: string;
  arn: string;
  createDate: Date;
  policies: string[];
  hasAthenaManagedPolicy: boolean;
}

export enum TUserAccessStatus {
  No_Active_Keys = "NOT_ACTIVE_KEYS",
  No_Keys = "NO_KEYS",
  No_POLICY = "NO_POLICY", // When the user does not have the athena managed policy nor the admin policy
  Valid = "VALID",
}

/**
 * Represents an IAM user
 */

const userProps = {
  id: "",
  name: "",
  arn: "",
  createDate: types.maybe(types.Date),
  accessKeys: types.map(UserAccessKey),
  policies: types.array(types.string),
  hasAthenaManagedPolicy: false,
  stale: false,
};

const userActions = (self: any) => ({
  setUser(rawUser: IRawUser) {
    self.id = rawUser.id;
    self.name = rawUser.name;
    self.arn = rawUser.arn;
    self.createDate = rawUser.createDate;
    self.policies.replace(rawUser.policies);
    self.hasAthenaManagedPolicy = rawUser.hasAthenaManagedPolicy;
    self.stale = false;
  },

  setAccessKey(rawAccessKey: IRawAccessKey) {
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
});

const userViews = (self: any) => ({
  get hasAdminPolicy(): boolean {
    return some(self.policies, "arn:aws:iam::aws:policy/AdministratorAccess");
  },

  get listAccessKeys(): readonly IUserAccessKey[] {
    const result: IUserAccessKey[] = [];
    self.accessKeys.forEach((key) => result.push(key));

    return result;
  },
  get accessStatus(): TUserAccessStatus {
    if (!self.hasAdminPolicy && !self.hasAthenaManagedPolicy) return TUserAccessStatus.No_POLICY;
    if (self.accessKeys.size === 0) return TUserAccessStatus.No_Keys;
    if (every(self.listAccessKeys, ["status", TAccessKeyStatus.Inactive])) return TUserAccessStatus.No_Active_Keys;
    return TUserAccessStatus.Valid;
  },
  get hasAccess(): boolean {
    return self.accessStatus === TUserAccessStatus.Valid;
  },
});

export const User = types.model("User", userProps).actions(userActions).views(userViews);

export interface IUser extends Instance<typeof User> {}
