import React from "react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { RetryErrorPanel } from "components/RetryErrorPanel";

export const DeploymentError = observer(() => {
  const installation = useInstallation();
  const deployment = installation.deploymentOperations;
  const errorDetail = deployment.errorDetail;
  const message =
    "Oops, things did not go smoothly, we are unable to provision the data lake. This might be an intermittent problem. Wait for a few minutes  and try again.";

  if (!deployment.isFailure) return null;

  return <RetryErrorPanel errorMessage={message} errorDetail={errorDetail} onRetry={() => installation.triggerDeployment()} />;
});
