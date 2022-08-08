import React from "react";
import { Progress, Text } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useDetectedInstallationStore } from "models/useDetectedInstallationStore";
import { useColorScheme } from "models/useColorScheme";

export const ProgressPanel = observer(() => {
  const { isError, isLoading, isReloading } = useDetectedInstallationStore();
  const { tone, colorScheme } = useColorScheme();

  if (isError) return null;
  if (!isLoading && !isReloading) return null;

  return (
    <>
      <Progress size="sm" isIndeterminate colorScheme={colorScheme} bg={tone(100)} borderRadius="lg" mb={1} />
      <Text display="block" textAlign="center" color={tone(800)} fontSize="sm" mb={6}>
        Processing
      </Text>
    </>
  );
});
