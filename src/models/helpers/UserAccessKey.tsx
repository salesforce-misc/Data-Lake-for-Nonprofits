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
export const UserAccessKey = types
  .model("UserAccessKey", {
    id: "",
    secret: "",
    createDate: types.Date,
    status: types.enumeration<TAccessKeyStatus>("AccessKeyStatus", Object.values(TAccessKeyStatus)),
    stale: false,
  })

  .actions((self) => ({
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
  }))

  .views((self) => ({
    get isActive(): boolean {
      return self.status === TAccessKeyStatus.Active;
    },
  }));

export interface IUserAccessKey extends Instance<typeof UserAccessKey> {}
