import React from "react";
import { Box, Button } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useDetectedInstallationStore } from "models/useDetectedInstallationStore";
import { useColorScheme } from "models/useColorScheme";

interface IEmptyMessage {
  onCancel: () => void;
}

export const EmptyMessage = observer(({ onCancel }: IEmptyMessage) => {
  const { tone, colorScheme } = useColorScheme();
  const { store, isError, isLoading, isReloading, isReady } = useDetectedInstallationStore();
  if (isError || isLoading || isReloading || !isReady) return null;
  if (!store.empty) return null;

  return (
    <>
      <Box bg={tone(100)} textAlign="center" p={4} fontSize="sm" color={tone(600)} borderRadius="md">
        No data lakes detected in AWS account # {store.credentials.accountId}
      </Box>
      <Box textAlign="right" w="full" mt={6} mb={0}>
        <Button colorScheme={colorScheme} size="sm" variant="outline" onClick={onCancel}>
          Ok
        </Button>
      </Box>
    </>
  );
});
