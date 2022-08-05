import { FC, useState } from "react";
import { observer } from "mobx-react";
import {
  Box,
  Heading,
  HStack,
  IconButton,
  Progress,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { ChevronRightIcon, RepeatIcon } from "@chakra-ui/icons";

import { IObjectImportStatus, useImportStatusStore } from "../../models/ImportStatusStore";
import { niceNumber } from "../../helpers/utils";
import { RetryErrorPanel } from "../../components/RetryErrorPanel";
import { TimeAgo } from "../../components/TimeAgo";
import { isStoreLoading, isStoreReLoading } from "../../models/BaseStore";
import { useColorScheme } from "../../models/useColorScheme";

export const DataImportStatusPanel: FC = observer(() => {
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

const CountBadge: FC<{ colorScheme: string }> = observer(({ colorScheme }) => {
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

const RefreshButton: FC<{ colorScheme: string }> = observer(({ colorScheme }) => {
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

const StartTime: FC = observer(() => {
  const { store } = useImportStatusStore();
  if (store.isGettingSchemas) return null;
  if (store.startTime === 0) return null;

  return <TimeAgo time={store.startTime} />;
});

const SummaryPanel: FC<{ colorScheme: string }> = observer(({ colorScheme }) => {
  const { isError, store } = useImportStatusStore();
  const [expanded, setExpanded] = useState(false);
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

const ObjectsPanel: FC<{ colorScheme: string }> = observer(({ colorScheme }) => {
  const { store } = useImportStatusStore();
  const empty = store.empty;

  if (empty) return null;
  if (store.isGettingSchemas && isStoreLoading(store)) return null;

  return (
    <Table variant="simple" mt={3} colorScheme={colorScheme} size="sm" mb={6}>
      <Thead>
        <Tr>
          <Th pl={0}>Type</Th>
          <Th isNumeric>Records</Th>
          <Th isNumeric>Fields</Th>
          <Th isNumeric>Size</Th>
          <Th isNumeric>Time</Th>
        </Tr>
      </Thead>
      <Tbody>
        {store.listObjects.map((item, index) => (
          <ObjectRow key={item.name} object={item} colorScheme={colorScheme} index={index} />
        ))}
      </Tbody>
      <Tfoot>
        <Tr>
          <Th></Th>
          <Th isNumeric>{store.totalRecordsDisplay}</Th>
          <Th isNumeric>{store.totalFieldsDisplay}</Th>
          <Th isNumeric>{store.totalBytesDisplay}</Th>
          <Th isNumeric>{store.totalTimeDisplay}</Th>
        </Tr>
      </Tfoot>
    </Table>
  );
});

const ObjectRow: FC<{ object: IObjectImportStatus; colorScheme: string; index: number }> = observer(({ object, colorScheme, index }) => {
  const warn = object.warning;
  return (
    <>
      <Tr bg={warn ? "orange.50" : ""}>
        <Td pl={0}>
          {object.label}
          <Box fontSize="xx-small" p={0} mt="0px">
            {object.name}
          </Box>
        </Td>
        <Td isNumeric fontSize="sm">
          {object.rowCountDisplay}
        </Td>
        <Td isNumeric fontSize="sm">
          {object.columnCountDisplay}
        </Td>
        <Td isNumeric fontSize="sm">
          {object.bytesWrittenDisplay}
        </Td>
        <Td isNumeric fontSize="sm">
          {object.importSecondsDisplay}
        </Td>
      </Tr>
    </>
  );
});

const ProgressPanel: FC<{ colorScheme: string }> = observer(({ colorScheme }) => {
  const { isError, store } = useImportStatusStore();

  if (isError) return null;
  if (!isStoreLoading(store) && !isStoreReLoading(store)) return null;

  return <Progress size="sm" isIndeterminate colorScheme={colorScheme} bg={`${colorScheme}.100`} borderRadius="lg" mb={3} />;
});

const ErrorPanel: FC = observer(() => {
  const { isError, store } = useImportStatusStore();

  if (!isError) return null;
  const errorDetail = store.errorDetail;
  const message =
    "Oops, things did not go smoothly, we are unable to get the latest data import status. This might be an intermittent problem. Wait for a few minutes and try again.";

  return <RetryErrorPanel errorMessage={message} errorDetail={errorDetail} onRetry={() => store.load()} />;
});
