import React from "react";
import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { DataImportStatusPanel } from "components/DataImportStatusPanel";

export const ImportStatusPanel = observer(() => {
  const installation = useInstallation();

  return (
    (!installation.deploymentOperations.isSuccess && null) || (
      <Box borderRadius="lg" boxShadow="base" bg="green.25" mt={6} p={7} pb={6}>
        <DataImportStatusPanel />
      </Box>
    )
  );
});
