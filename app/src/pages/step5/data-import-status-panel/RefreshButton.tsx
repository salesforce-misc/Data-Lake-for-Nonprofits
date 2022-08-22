import React from "react";
import { observer } from "mobx-react";
import { IconButton } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";

import { useImportStatusStore } from "models/ImportStatusStore";
import { isStoreLoading, isStoreReLoading } from "models/BaseStore";

export const RefreshButton = observer(({ colorScheme }: { colorScheme: string }) => {
  const { isError, store } = useImportStatusStore();
  if (store.isGettingSchemas && isStoreLoading(store)) return null;
  if (isError) return null;

  return (
    <IconButton
      colorScheme={colorScheme}
      variant="outline"
      size="xs"
      aria-label="Check again"
      onClick={() => store.load()}
      icon={<RepeatIcon />}
      isLoading={isStoreLoading(store) || isStoreReLoading(store)}
      _focus={{ boxShadow: "none" }}
    />
  );
});
