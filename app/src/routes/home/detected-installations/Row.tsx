import React from "react";
import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { BsCheckCircleFill, BsCircle } from "react-icons/bs";

import { awsRegionsMap } from "data/aws-regions";
import { useColorScheme } from "models/useColorScheme";
import { IDetectedInstallation } from "models/helpers/DetectedInstallation";
import { TimeAgo } from "components/TimeAgo";

interface IRow {
  item: IDetectedInstallation;
  selected: boolean;
  onSelected: (id: string) => void;
}

export const Row = observer(({ item, selected, onSelected }: IRow) => {
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
