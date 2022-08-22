import React from "react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { RetryErrorPanel } from "components/RetryErrorPanel";
import { useUsersStore } from "models/useUsersStore";

export const ErrorPanel = observer(() => {
  const installation = useInstallation();
  const { isError, store } = useUsersStore(installation);

  if (!isError) return null;

  const message =
    "Something went wrong and we are unable to connect to your AWS account to get the list of users. This might be an intermittent problem. Wait for a few minutes and try again.";

  return <RetryErrorPanel errorMessage={message} errorDetail="" onRetry={() => store.load(installation)} />;
});
