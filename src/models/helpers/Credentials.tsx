import { isEmpty } from "lodash";
import { types, Instance } from "mobx-state-tree";

/**
 * A model that represents the credentials after they are being validated
 */
export const Credentials = types
  .model("Credentials", {
    accessKey: "",
    secretKey: "",
    accountId: "",
    userArn: "",
    userName: types.maybe(types.string), // If root, then username will be undefined
  })
  .actions(() => ({
    // We need this, see https://github.com/mobxjs/mobx-state-tree/issues/915
    runInAction(fn: () => void) {
      return fn();
    },
  }))

  .actions((self) => {
    return {
      reset(): void {
        self.accessKey = "";
        self.secretKey = "";
        self.accountId = "";
        self.userArn = "";
        self.userName = undefined;
      }
    }
  })

  .views((self) => {
    return {
      get isRoot() {
        return self.userArn === `arn:aws:iam::${self.accountId}:root`
      },

      get empty() {
        return isEmpty(self.accessKey) || isEmpty(self.secretKey);
      }
    }
  })

// see https://mobx-state-tree.js.org/tips/typescript
export interface ICredentials extends Instance<typeof Credentials> {}
