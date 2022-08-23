import React from "react";
import { Box, Alert, AlertDescription } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";

export const DoNotCloseMessagePanel = observer(() => {
  const installation = useInstallation();
  const deployment = installation.deploymentOperations;

  if (!deployment.isInProgress) {
    return null;
  }

  return (
    <Box my={5} px={3}>
      <Alert status="warning" borderRadius="lg" fontSize="sm" color="orange.700">
        <AlertDescription>Don't close the browser tab, otherwise the provisioning will pause before it's fully completed.</AlertDescription>
      </Alert>
    </Box>
  );
});
