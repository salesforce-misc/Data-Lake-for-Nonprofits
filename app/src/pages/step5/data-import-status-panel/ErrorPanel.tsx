import React from "react";
import { observer } from "mobx-react";

import { useImportStatusStore } from "models/ImportStatusStore";
import { RetryErrorPanel } from "components/RetryErrorPanel";

export const ErrorPanel = observer(() => {
  const { isError, store } = useImportStatusStore();

  if (!isError) return null;
  const errorDetail = store.errorDetail;
  const message =
    "Oops, things did not go smoothly, we are unable to get the latest data import status. This might be an intermittent problem. Wait for a few minutes and try again.";

  return <RetryErrorPanel errorMessage={message} errorDetail={errorDetail} onRetry={() => store.load()} />;
});
