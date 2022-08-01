import isEmpty from "lodash/isEmpty";
import { Badge, Box, Button, Flex, Heading, Icon, Progress, Text } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { FC, useState } from "react";
import { BsCheckCircleFill, BsCircle } from "react-icons/bs";

import { useDetectedInstallationStore, IDetectedInstallation } from "../models/DetectedInstallationsStore";
import { useColorScheme } from "../models/useColorScheme";
import { RetryErrorPanel } from "./RetryErrorPanel";
import { awsRegionsMap } from "../data/aws-regions";
import { TimeAgo } from "./TimeAgo";

export const DetectedInstallationSelections: FC<{ onCancel: () => void; onResume: (installation: IDetectedInstallation) => void }> = observer(
  ({ onCancel, onResume }) => {
    const { tone } = useColorScheme();
    const { store } = useDetectedInstallationStore();

    const handleCancel = () => {
      store.credentials.reset();
      store.reset();
      onCancel();
    };

    const handleResume = (id: string) => {
      onResume(store.installations.get(id)!);
    };

    return (
      <Box>
        <Heading size="md" pt="0px" pb={4} color={tone(600)} letterSpacing="-1px">
          Available data lakes <CountBadge />
        </Heading>
        <ProgressPanel />
        <ErrorPanel onCancel={handleCancel} />
        <EmptyMessage onCancel={handleCancel} />
        <ListingPanel onCancel={handleCancel} onResume={handleResume} />
      </Box>
    );
  }
);

const CountBadge: FC = observer(() => {
  const { tone } = useColorScheme();
  const { isReady, store } = useDetectedInstallationStore();
  if (!isReady || store.empty) return null;

  return (
    <Badge ml={3} p={1} pl={2} pr={2} bg={tone(100)} fontSize="small" borderRadius="full" color={tone(700)} fontWeight="bold">
      {store.installations.size}
    </Badge>
  );
});

const ListingPanel: FC<{ onCancel: () => void; onResume: (id: string) => void }> = observer(({ onCancel, onResume }) => {
  const { isError, isLoading, isReady, store } = useDetectedInstallationStore();
  const { colorScheme } = useColorScheme();
  const [selected, setSelected] = useState("");

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

const Row: FC<{ item: IDetectedInstallation; selected: boolean; onSelected: (id: string) => void }> = observer(({ item, selected, onSelected }) => {
  const { tone } = useColorScheme();
  let props: any;

  const getRegionLabel = (name: string) => awsRegionsMap[name].label || name;

  if (selected) props = { color: tone(700), borderColor: tone(600), bg: tone(75) };
  else if (item.reachable) props = { cursor: "pointer", borderColor: tone(300), color: tone(600), onClick: () => onSelected(item.id) };
  else props = { color: "gray.300", cursor: "not-allowed", borderColor: "gray.300" };

  return (
    <Flex borderWidth={1} borderColor={tone(100)} borderRadius="md" p={3} mt={4} {...props}>
      {selected && <Icon as={BsCheckCircleFill} color={tone(700)} fontSize="large" ml={3} mr={2.5} mt={1} />}
      {!selected && <Icon as={BsCircle} color={!item.reachable ? "gray.300" : tone(500)} fontSize="large" ml={3} mr={2.5} mt={1} />}
      <Box flex={1} fontSize="sm">
        <Flex justifyContent="space-between">
          <Text fontWeight="semibold">Data Lake - {item.id}</Text>
          <Text fontSize="xs">{getRegionLabel(item.region)}</Text>
        </Flex>
        {item.reachable && (
          <>
            <Box fontSize="xs">
              <TimeAgo time={item.startDate} />
              <Text display="inline-block" ml={2} mr={2}>
                &#8226;
              </Text>
              by {item.startedBy}
            </Box>
            <Box fontSize="xs">Connection name: {item.appFlowConnectionName}</Box>
          </>
        )}
        {!item.reachable && <Box fontSize="xs">Initiated from {item.webUrlOrigin}</Box>}
      </Box>
    </Flex>
  );
});

const ProgressPanel: FC = observer(() => {
  const { isError, isLoading, isReloading } = useDetectedInstallationStore();
  const { tone, colorScheme } = useColorScheme();

  if (isError) return null;
  if (!isLoading && !isReloading) return null;

  return (
    <>
      <Progress size="sm" isIndeterminate colorScheme={colorScheme} bg={tone(100)} borderRadius="lg" mb={1} />
      <Text display="block" textAlign="center" color={tone(800)} fontSize="sm" mb={6}>
        Processing
      </Text>
    </>
  );
});

const ErrorPanel: FC<{ onCancel: () => void }> = observer(({ onCancel }) => {
  const { isError, store } = useDetectedInstallationStore();
  const { colorScheme } = useColorScheme();

  if (!isError) return null;
  const message = `Something went wrong '${store.errorMessage}'. This might be an intermittent problem. Wait for a few minutes and try again.`;

  return (
    <>
      <RetryErrorPanel errorMessage={message} errorDetail="" onRetry={() => store.load()} />
      <Box textAlign="right" w="full" mt={6} mb={0}>
        <Button colorScheme={colorScheme} size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </>
  );
});

const EmptyMessage: FC<{ onCancel: () => void }> = observer(({ onCancel }) => {
  const { tone, colorScheme } = useColorScheme();
  const { store, isError, isLoading, isReloading, isReady } = useDetectedInstallationStore();
  if (isError || isLoading || isReloading || !isReady) return null;
  if (!store.empty) return null;

  return (
    <>
      <Box bg={tone(100)} textAlign="center" p={4} fontSize="sm" color={tone(600)} borderRadius="md">
        No data lakes detected in AWS account # {store.credentials.accountId}
      </Box>
      <Box textAlign="right" w="full" mt={6} mb={0}>
        <Button colorScheme={colorScheme} size="sm" variant="outline" onClick={onCancel}>
          Ok
        </Button>
      </Box>
    </>
  );
});
