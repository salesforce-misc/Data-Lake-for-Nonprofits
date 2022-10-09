import { getParent } from "mobx-state-tree";

import { IInstallation } from "models/Installation";
import { getSecretValue } from "api/get-secret";

import { BaseStep } from "./BaseStep";

/**
 * A model to pull secret value from Secrets Manager
 */
export const GetDatabaseSecrets = BaseStep.named("GetDatabaseSecrets").actions((self) => {
  return {
    async getSecretValue(accessKey: string, secretKey: string, region: string, secretArn: string) {
      const { host, username, password } = await getSecretValue({ accessKey, secretKey, region, secretArn });
      const parent = getParent<IInstallation>(self);

      self.runInAction(() => {
        parent.setDbHost(host);
        parent.setDbUsername(username);
        parent.setDbPassword(password);
      });
    },
  };
});
