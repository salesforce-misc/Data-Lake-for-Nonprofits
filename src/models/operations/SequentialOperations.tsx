import last from "lodash/last";
import { Instance } from "mobx-state-tree";
import { OperationContext } from "./utils";

import { IOperation, Operation, OperationStatus } from "./Operation";
import { mstOperationsType } from "./utils";

/**
 * A model that represents sequential operations.
 */
export const SequentialOperations = Operation.named("SequentialOperations")
  .props({
    operations: mstOperationsType,
  })

  .views((self) => ({
    get status(): OperationStatus {
      let notStartedCount = 0;
      let successCount = 0;
      for (const operation of self.operations) {
        if (operation.status === OperationStatus.InProgress) return OperationStatus.InProgress;
        if (operation.status === OperationStatus.Failure) return OperationStatus.Failure;
        if (operation.status === OperationStatus.NotStarted) notStartedCount += 1;
        if (operation.status === OperationStatus.Success) successCount += 1;
      }

      if (notStartedCount === self.operations.length) return OperationStatus.NotStarted;
      if (successCount === self.operations.length) return OperationStatus.Success;
      return OperationStatus.InProgress;
    },
  }))

  .views((self) => ({
    get empty() {
      return self.operations.length === 0;
    },

    get errorDetail(): string {
      // Find an operation with error and return it
      for (const operation of self.operations) {
        if (operation.status === OperationStatus.Failure) return operation.errorDetail;
      }

      return "";
    },

    get processingTime() {
      let time = 0;
      for (const operation of self.operations) {
        time += operation.processingTime;
      }

      return time;
    },
  }))

  .views((self) => ({
    get progressPercentage(): number {
      if (self.empty) return 0;
      const count = self.operations.length;
      let total = 0;
      for (const operation of self.operations) {
        total = total + operation.progressPercentage;
      }
      return (total / (count * 100)) * 100;
    },

    get currentOperation(): IOperation | undefined {
      for (const operation of self.operations) {
        if (operation.isSuccess) continue;
        return operation;
      }
      return last(self.operations);
    },
  }))

  .actions((self) => {
    let runningPromise: Promise<void> | undefined;

    return {
      doRun(context: OperationContext): Promise<void> {
        if (runningPromise) return runningPromise;
        if (self.isSuccess) return Promise.resolve();

        runningPromise = new Promise(async (resolve) => {
          for (const operation of self.operations) {
            if (operation.isSuccess) continue;
            await operation.run(context);
            // TODO send the context state to S3, by calling context.saveRemotely()
            if (operation.isFailure) {
              break;
            }
          }
          runningPromise = undefined;
          resolve();
        });

        return runningPromise;
      },

      add(operation: IOperation) {
        // if (!self.isNotStarted) throw new Error("You can not add operations once the sequential operations are running");
        self.operations.push(operation);
      },
    };
  });

// see https://mobx-state-tree.js.org/tips/typescript
export interface ISequentialOperations extends Instance<typeof SequentialOperations> {}
