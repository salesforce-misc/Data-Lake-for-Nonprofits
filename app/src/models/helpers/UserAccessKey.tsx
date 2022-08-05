import { types, Instance } from "mobx-state-tree";

export enum TAccessKeyStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

export interface IRawAccessKey {
  id: string;
  createDate: Date;
  status: TAccessKeyStatus;
  secret?: string;
}

/**
 * Represents a user access key (id + secret)
 */

const userAccessKeyProps = {
  id: "",
  secret: "",
  createDate: types.Date,
  status: types.enumeration<TAccessKeyStatus>("AccessKeyStatus", Object.values(TAccessKeyStatus)),
  stale: false,
};

const userAccessKeyActions = (self) => ({
  setAccessKey(rawAccessKey: IRawAccessKey) {
    self.createDate = rawAccessKey.createDate;
    self.status = rawAccessKey.status;
    if (rawAccessKey.secret) self.secret = rawAccessKey.secret;
    self.stale = false;
  },

  setStatus(status: TAccessKeyStatus) {
    self.status = status;
  },

  markStale() {
    self.stale = true;
  },
});

const userAccessKeyViews = (self) => ({
  get isActive(): boolean {
    return self.status === TAccessKeyStatus.Active;
  },
});

export const UserAccessKey = types.model("UserAccessKey", userAccessKeyProps).actions(userAccessKeyActions).views(userAccessKeyViews);

export interface IUserAccessKey extends Instance<typeof UserAccessKey> {}
