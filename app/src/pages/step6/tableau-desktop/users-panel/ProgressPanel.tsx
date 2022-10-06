import React from "react";
import { Progress } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { useUsersStore } from "models/useUsersStore";

export const ProgressPanel = observer(() => {
  const installation = useInstallation();
  const { isError, isLoading, isReloading } = useUsersStore(installation);
  const { tone, colorScheme } = useColorScheme();

  if (isError) return null;
  if (!isLoading && !isReloading) return null;

  return <Progress size="sm" isIndeterminate colorScheme={colorScheme} bg={tone(100)} borderRadius="lg" mb={4} mt={0} />;
});
