import React from "react";
import { observer } from "mobx-react";
import { Box, Stat, StatGroup, StatLabel, StatNumber } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";

import { useImportStatusStore } from "models/ImportStatusStore";
import { isStoreLoading } from "models/BaseStore";
import { useColorScheme } from "models/useColorScheme";
import { niceNumber } from "helpers/utils";

import { ObjectsPanel } from "./ObjectsPanel";

export const SummaryPanel = observer(({ colorScheme }: { colorScheme: string }) => {
  const { isError, store } = useImportStatusStore();
  const [expanded, setExpanded] = React.useState(false);
  const { tone } = useColorScheme();

  if (isError) return null;

  const busy = store.isGettingSchemas && isStoreLoading(store);
  const display = (value: string) => {
    if (busy) return "N/A";
    return value;
  };

  return (
    <>
      <StatGroup p={3} textAlign="center" mb={2} bg={`${colorScheme}.75`} borderRadius="lg">
        <Stat size="sm" colorScheme={colorScheme} ml={-5}>
          <StatLabel>Objects</StatLabel>
          <StatNumber>{display(niceNumber(store.objectsCount))}</StatNumber>
        </Stat>

        <Stat size="sm" colorScheme={colorScheme}>
          <StatLabel>Records</StatLabel>
          <StatNumber>{display(store.totalRecordsDisplay)}</StatNumber>
        </Stat>

        <Stat size="sm" colorScheme={colorScheme}>
          <StatLabel>Fields</StatLabel>
          <StatNumber>{display(store.totalFieldsDisplay)}</StatNumber>
        </Stat>

        <Stat size="sm" colorScheme={colorScheme}>
          <StatLabel>Size</StatLabel>
          <StatNumber>{display(store.totalBytesDisplay)}</StatNumber>
        </Stat>

        <Stat size="sm" colorScheme={colorScheme}>
          <StatLabel>Time</StatLabel>
          <StatNumber>{display(store.totalTimeDisplay)}</StatNumber>
        </Stat>
      </StatGroup>
      {!busy && (
        <Box>
          <Box
            cursor="pointer"
            onClick={() => setExpanded((previous) => !previous)}
            fontSize="small"
            fontWeight="normal"
            color={tone(700)}
            mb={expanded ? 8 : 0}
          >
            <ChevronRightIcon transition="transform 0.2s" transform={expanded ? "rotate(90deg)" : "rotate(0deg)"} />
            see more
          </Box>
          {expanded && <ObjectsPanel colorScheme={colorScheme} />}
        </Box>
      )}
    </>
  );
});
