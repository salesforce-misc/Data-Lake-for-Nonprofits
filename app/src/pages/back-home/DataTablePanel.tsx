import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { useMetadataStore } from "models/MetadataStore";

import { DataModelTablePreview } from "pages/step4/data-model-table-preview/DataModelTablePreview";

import { CountBadge } from "./CountBadge";
import { DataTableStatusInfo } from "./DataTableStatusInfo";

export const DataTablePanel = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const { store, isReady } = useMetadataStore();
  const selectedObjectsCount = store.selectedObjects.length;
  const isEmptyModel = selectedObjectsCount === 0;

  return (
    <>
      <Heading size="md" pt="0px" pb="0px" color={tone(600)} letterSpacing="-1px">
        Objects <CountBadge />
      </Heading>
      {isEmptyModel && isReady && (
        <Box bg={tone(100)} textAlign="center" p={4} mt={6} mb={4} fontSize="sm" color={tone(600)} borderRadius="md">
          No objects
        </Box>
      )}
      <DataTableStatusInfo />
      <DataModelTablePreview colorScheme={colorScheme} showCaption={false} />
    </>
  );
});
