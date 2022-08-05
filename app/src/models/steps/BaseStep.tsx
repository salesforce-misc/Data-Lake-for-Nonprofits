import { types, Instance } from "mobx-state-tree";

/**
 * Represents a high level common set of statuses for any step model. Each step model might have sub-statuses, but they
 * are not captured by this enum, intentionally.
 */
export enum StepStatus {
  NotStarted = "NOT_STARTED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
}

/**
 * Represents the status of a yes/no question
 */
export enum YesNoAnswer {
  MissingAnswer = "MissingAnswer",
  Yes = "YES",
  No = "No",
}

/**
 * A base step model is the base class for all step models. It defines the common props/methods of a step.
 */
export const BaseStep = types
  .model({
    status: types.optional(types.enumeration<StepStatus>("StepStatus", Object.values(StepStatus)), StepStatus.NotStarted),
  })
  .actions(() => ({
    // We need this, see https://github.com/mobxjs/mobx-state-tree/issues/915
    runInAction(fn: () => void) {
      return fn();
    },
  }))
  .actions((self) => {
    return {
      markStarted() {
        if (self.status === StepStatus.NotStarted) {
          self.status = StepStatus.InProgress;
        }
      },

      markCompleted() {
        self.status = StepStatus.Completed;
      },

      setStatus(status: StepStatus) {
        self.status = status;
      },
    };
  });

// see https://mobx-state-tree.js.org/tips/typescript
export interface IBaseStep extends Instance<typeof BaseStep> {}
