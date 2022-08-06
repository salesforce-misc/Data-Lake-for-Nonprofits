import React from "react";
import { Badge } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useDetectedInstallationStore } from "models/DetectedInstallationsStore";
import { useColorScheme } from "models/useColorScheme";

export const CountBadge = observer(() => {
  const { tone } = useColorScheme();
  const { isReady, store } = useDetectedInstallationStore();

  if (!isReady || store.empty) return null;

  return (
    <Badge ml={3} p={1} pl={2} pr={2} bg={tone(100)} fontSize="small" borderRadius="full" color={tone(700)} fontWeight="bold">
      {store.installations.size}
    </Badge>
  );
});
