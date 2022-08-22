import React from "react";
import { observer } from "mobx-react";
import { Tag } from "@chakra-ui/react";

import { useImportStatusStore } from "models/ImportStatusStore";
import { isStoreLoading } from "models/BaseStore";

export const CountBadge = observer(({ colorScheme }: { colorScheme: string }) => {
  const { isError, store } = useImportStatusStore();
  if (store.isGettingSchemas && isStoreLoading(store)) return null;
  if (isError) return null;
  if (store.empty) return null;

  return (
    <Tag size="sm" variant="solid" colorScheme={colorScheme} ml={3} mt={0.5} fontWeight="bold">
      {store.objectsCount}
    </Tag>
  );
});
