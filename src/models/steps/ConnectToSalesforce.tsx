import { types } from "mobx-state-tree";

import { BaseStep, YesNoAnswer } from "./BaseStep";

/**
 * A step model for the step where we ask the user to connect to Salesforce and create the appflow connection
 */
export const ConnectToSalesforce = BaseStep.named("ConnectToSalesforce")
  .props({
    createdConnection: types.optional(types.enumeration<YesNoAnswer>("YesNoAnswer", Object.values(YesNoAnswer)), YesNoAnswer.MissingAnswer),
  })
  .actions((self) => {
    return {
      setCreatedConnection(answer: YesNoAnswer) {
        self.createdConnection = answer;
      },
    };
  });
