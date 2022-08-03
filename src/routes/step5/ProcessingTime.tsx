import { observer } from "mobx-react";

import { humanProcessingTime } from "helpers/utils";
import { IOperation } from "models/operations/Operation";

interface IProcessingTime {
  operation: IOperation;
}

export const ProcessingTime = observer(({ operation }: IProcessingTime) => {
  return <>{humanProcessingTime(operation.processingTime)}</>;
});
