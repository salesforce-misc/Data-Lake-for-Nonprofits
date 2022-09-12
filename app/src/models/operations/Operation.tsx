import isEmpty from "lodash/isEmpty";
import { types, Instance } from "mobx-state-tree";
import { genId } from "helpers/id-gen";

import { OperationContext } from "./utils";

export enum OperationStatus {
  NotStarted = "NOT_STARTED",
  InProgress = "IN_PROGRESS",
  Success = "SUCCESS",
  Failure = "FAILURE",
}

const RUN_ID = genId();

/**
 * A model that represents an async command that needs to report its progress and that needs to
 * provide error information with suggestions.
 */
export const Operation = types
  .model("Operation", {
    _status: types.optional(types.enumeration<OperationStatus>("OperationStatus", Object.values(OperationStatus)), OperationStatus.NotStarted),
    _progressPercentage: 0,
    _progressMessage: "",
    _errorDetail: "", // Expected to be in markdown https://commonmark.org/help/
    _processingTime: 0, // Total processing time in seconds
    intervalPeriod: 1000, // in milliseconds
  })

  .actions(() => ({
    // We need this, see https://github.com/mobxjs/mobx-state-tree/issues/915
    runInAction(fn: () => void) {
      return fn();
    },
  }))

  .actions((self) => ({
    async doRun(context: OperationContext): Promise<void> {
      throw new Error("Method 'doRun' must be implemented by sub models");
    },

    async doPreRun(context: OperationContext): Promise<void> {
      // Sub models can choose to override this
    },

    setProgressPercentage(value: number) {
      self._progressPercentage = value;
      if (value > 100) self._progressPercentage = 100;
      if (value < 0) self._progressPercentage = 0;
    },

    setProgressMessage(message: string) {
      self._progressMessage = message;
    },

    setStatus(status: OperationStatus) {
      self._status = status;
    },

    incrementProcessingTime(seconds: number) {
      self._processingTime += seconds;
    },
  }))

  .actions((self) => ({
    async intervalTick() {
      // We are not after very accurate processing time, just enough to get an overall idea
      self.incrementProcessingTime(self.intervalPeriod / 1000);
    },
  }))

  .actions((self) => {
    let intervalId = 0;

    return {
      startInterval() {
        if (intervalId !== 0) return; // there is one running
        const id = window.setInterval(async () => {
          try {
            await self.intervalTick();
          } catch (err) {
            /* ignore */
            console.error(err);
          }
        }, self.intervalPeriod);
        intervalId = id;
      },

      stopInterval: () => {
        const id = intervalId;
        if (id !== 0) {
          clearInterval(id);
          intervalId = 0;
        }
      },
    };
  })

  .views((self) => ({
    get status() {
      return self._status;
    },

    get notStartedMessage(): string {
      // NOTE - sub models should override this
      return `Task`;
    },

    get inProgressMessage(): string {
      // NOTE - sub models should override this
      return `Working on the task`;
    },

    get successMessage(): string {
      // NOTE - sub models should override this
      return `Successfully finished the task`;
    },

    get failureMessage(): string {
      // NOTE - sub models should override this
      return `Could not perform the task`;
    },

    get runId(): string {
      return RUN_ID;
    },
  }))

  .views((self) => ({
    get isInProgress() {
      return self.status === OperationStatus.InProgress;
    },

    get isNotStarted() {
      return self.status === OperationStatus.NotStarted;
    },

    get isSuccess() {
      return self.status === OperationStatus.Success;
    },

    get isFailure() {
      return self.status === OperationStatus.Failure;
    },

    get progressPercentage() {
      let value = self._progressPercentage;
      // Relax a bit on precision
      if (value > Math.floor(value) + 0.99) value = Math.floor(value) + 1;
      return value > 100 ? 100 : value;
    },

    get progressMessage() {
      if (isEmpty(self._progressMessage)) return self.notStartedMessage;
      return self._progressMessage;
    },

    get processingTime() {
      return self._processingTime;
    },

    get errorDetail() {
      return self._errorDetail;
    },
  }))

  .actions((self) => {
    let runningPromise: Promise<void> | undefined;

    return {
      async run(context: OperationContext): Promise<void> {
        if (runningPromise) return runningPromise;
        if (self.isSuccess) {
          return Promise.resolve();
        }

        self.doPreRun(context);

        let resolved = false;
        self.setStatus(OperationStatus.InProgress);
        self.setProgressMessage(self.inProgressMessage);
        self.setProgressPercentage(0);
        self._errorDetail = "";
        self.startInterval();

        const promise: Promise<void> = new Promise(async (resolve) => {
          try {
            await self.doRun(context);

            self.setProgressPercentage(100);
            self.setStatus(OperationStatus.Success);
            self.setProgressMessage(self.successMessage);
          } catch (err) {
            self.setStatus(OperationStatus.Failure);
            self.setProgressMessage(self.failureMessage);
            console.error(err);
            // We always resolve in an operation because its error status is captured already and we don't want uncaught rejections to be propagated
          }

          runningPromise = undefined;
          resolved = true;

          self.stopInterval();
          resolve();
        });

        if (resolved) return Promise.resolve();
        else runningPromise = promise;

        return promise;
      },

      incrementPercentage(value: number) {
        self.setProgressPercentage(self._progressPercentage + value);
      },
    };
  });

// see https://mobx-state-tree.js.org/tips/typescript
export interface IOperation extends Instance<typeof Operation> {}
