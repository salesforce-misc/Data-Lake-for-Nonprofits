import React from "react";
import { observer } from "mobx-react";
import { Progress } from "@chakra-ui/react";

import { useImportStatusStore } from "models/ImportStatusStore";
import { isStoreLoading, isStoreReLoading } from "models/BaseStore";

export const ProgressPanel = observer(({ colorScheme }: { colorScheme: string }) => {
  const { isError, store } = useImportStatusStore();

  if (isError) return null;
  if (!isStoreLoading(store) && !isStoreReLoading(store)) return null;

  return <Progress size="sm" isIndeterminate colorScheme={colorScheme} bg={`${colorScheme}.100`} borderRadius="lg" mb={3} />;
});
