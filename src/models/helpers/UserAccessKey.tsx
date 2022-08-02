import { types, Instance } from "mobx-state-tree";

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

/**
 * Represents a user access key (id + secret)
 */
export const UserAccessKey = types
  .model("UserAccessKey", {
    id: "",
    secret: "",
    createDate: types.Date,
    status: types.enumeration<AccessKeyStatus>("AccessKeyStatus", Object.values(AccessKeyStatus)),
    stale: false,
  })

  .actions((self) => ({
    setAccessKey(rawAccessKey: RawAccessKey) {
      self.createDate = rawAccessKey.createDate;
      self.status = rawAccessKey.status;
      if (rawAccessKey.secret) self.secret = rawAccessKey.secret;
      self.stale = false;
    },

    setStatus(status: AccessKeyStatus) {
      self.status = status;
    },

    markStale() {
      self.stale = true;
    },
  }))

  .views((self) => ({
    get isActive(): boolean {
      return self.status === AccessKeyStatus.Active;
    },
  }));

export interface IUserAccessKey extends Instance<typeof UserAccessKey> {}
