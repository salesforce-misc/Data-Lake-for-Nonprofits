import React from "react";
import { Badge } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { useMetadataStore } from "models/MetadataStore";

export const CountBadge = observer(() => {
  const { tone } = useColorScheme();
  const { isError, isReady, store } = useMetadataStore();

  if (isError || !isReady) return null;

  return (
    <Badge ml={3} p={1} pl={2} pr={2} bg={tone(100)} fontSize="small" borderRadius="full" color={tone(700)} fontWeight="bold">
      {store.selectedObjects.length}
    </Badge>
  );
});
