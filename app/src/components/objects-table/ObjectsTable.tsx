import React from "react";
import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useMetadataStore } from "models/MetadataStore";

import { ObjectsPanel } from "./ObjectsPanel";

export const ObjectsTable = observer(() => {
  const { store } = useMetadataStore();

  if (store.empty) return null;

  return (
    <Box mt={6} p={0} mb={6}>
      <ObjectsPanel />
    </Box>
  );
});
