import { getParent, types } from "mobx-state-tree";
import isEmpty from "lodash/isEmpty";

import { CredentialsValidationErrorCode, CredentialsValidationException, validateCredentials } from "api/validate-credentials";
import { IInstallation } from "models/Installation";
import { IAppStore } from "models/AppStore";

import { BaseStep, YesNoAnswer } from "./BaseStep";

/**
 * A step model for the step where we ask the user to connect to AWS
 */
export const ConnectToAWS = BaseStep.named("ConnectToAWS")
  .props({
    needsAssistance: types.optional(types.enumeration<YesNoAnswer>("YesNoAnswer", Object.values(YesNoAnswer)), YesNoAnswer.MissingAnswer),
  })
  .actions((self) => {
    return {
      setNeedsAssistance(answer: YesNoAnswer) {
        self.needsAssistance = answer;
      },

      async connectToAws(accessKey: string, secretKey: string, region: string) {
        const { accountId, userArn, userName } = await validateCredentials({ accessKey, secretKey, region });
        const parent = getParent<IInstallation>(self);

        self.runInAction(() => {
          if (!isEmpty(parent.accountId) && parent.accountId !== accountId)
            throw new CredentialsValidationException(CredentialsValidationErrorCode.AccountMismatch);
          parent.setAccountId(accountId);
          parent.setRegion(region);

          const appStore = getParent<IAppStore>(parent);
          const credentials = appStore.setCredentials(accessKey, secretKey, accountId, userArn, userName);
          parent.setStartedBy(credentials.isRoot ? "root" : userName);
        });
      },
    };
  });
