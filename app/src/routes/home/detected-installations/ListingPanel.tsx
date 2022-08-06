import isEmpty from "lodash/isEmpty";
import { Box, Button } from "@chakra-ui/react";
import React from "react";
import { observer } from "mobx-react";

import { useDetectedInstallationStore } from "models/DetectedInstallationsStore";
import { useColorScheme } from "models/useColorScheme";

import { Row } from "./Row";

interface IListingPanel {
  onCancel: () => void;
  onResume: (id: string) => void;
}

export const ListingPanel = observer(({ onCancel, onResume }: IListingPanel) => {
  const { isError, isLoading, isReady, store } = useDetectedInstallationStore();
  const { colorScheme } = useColorScheme();
  const [selected, setSelected] = React.useState("");

  if (isLoading || isError || !isReady) return null;
  if (store.empty) return null;

  return (
    <>
      {store.list.map((item) => (
        <Row key={item.id} item={item} selected={item.id === selected} onSelected={setSelected} />
      ))}

      <Box textAlign="right" w="full" mt={6} mb={0}>
        <Button colorScheme={colorScheme} size="sm" variant="outline" mr={6} onClick={onCancel}>
          Cancel
        </Button>
        <Button colorScheme={colorScheme} size="sm" onClick={() => onResume(selected)} disabled={isEmpty(selected)}>
          Resume
        </Button>
      </Box>
    </>
  );
});
