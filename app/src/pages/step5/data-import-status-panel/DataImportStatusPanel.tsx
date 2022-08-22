import React from "react";
import { observer } from "mobx-react";
import { Heading, HStack, Text } from "@chakra-ui/react";

import { useColorScheme } from "models/useColorScheme";

import { CountBadge } from "./CountBadge";
import { StartTime } from "./StartTime";
import { RefreshButton } from "./RefreshButton";
import { ErrorPanel } from "./ErrorPanel";
import { ProgressPanel } from "./ProgressPanel";
import { SummaryPanel } from "./SummaryPanel";

export const DataImportStatusPanel = observer(() => {
  const { tone, colorScheme } = useColorScheme();

  return (
    <>
      <HStack justifyContent="space-between" pb={3}>
        <Heading size="md" color={tone(600)} letterSpacing="-1px">
          Latest Data Import
          <CountBadge colorScheme={colorScheme} />
        </Heading>
        <HStack>
          <Text fontSize="sm" color={tone(700)}>
            <StartTime />
          </Text>
          <RefreshButton colorScheme={colorScheme} />
        </HStack>
      </HStack>
      <ErrorPanel />
      <ProgressPanel colorScheme={colorScheme} />
      <SummaryPanel colorScheme={colorScheme} />
    </>
  );
});
