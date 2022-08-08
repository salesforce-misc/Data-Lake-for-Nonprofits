import React from "react";
import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";

import { OperationProgressPanel } from "pages/step5/OperationProgressPanel";

export const ProgressPanel = observer(() => {
  const installation = useInstallation();
  const deployment = installation.deploymentOperations;

  return (
    <Box p={3} pb={4}>
      {deployment.operations.map((operation, index) => (
        <OperationProgressPanel key={index} operation={operation} />
      ))}
      <Box mt="60px">
        <OperationProgressPanel operation={deployment} message="Overall Progress" />
      </Box>
    </Box>
  );
});
