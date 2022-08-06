import React from "react";
import { Box, Button } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useDetectedInstallationStore } from "models/useDetectedInstallationStore";
import { useColorScheme } from "models/useColorScheme";
import { RetryErrorPanel } from "components/RetryErrorPanel";

interface IErrorPanel {
  onCancel: () => void;
}

export const ErrorPanel = observer(({ onCancel }: IErrorPanel) => {
  const { isError, store } = useDetectedInstallationStore();
  const { colorScheme } = useColorScheme();

  if (!isError) return null;
  const message = `Something went wrong '${store.errorMessage}'. This might be an intermittent problem. Wait for a few minutes and try again.`;

  return (
    <>
      <RetryErrorPanel errorMessage={message} errorDetail="" onRetry={() => store.load()} />
      <Box textAlign="right" w="full" mt={6} mb={0}>
        <Button colorScheme={colorScheme} size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </>
  );
});
