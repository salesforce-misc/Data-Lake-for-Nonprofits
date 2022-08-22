import React from "react";
import { Box, Text, Icon, Flex } from "@chakra-ui/react";
import { BsCircle, BsCheckCircleFill } from "react-icons/bs";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { IField } from "models/helpers/Field";

export const SelectableField = observer(({ field }: { field: IField }) => {
  const { tone } = useColorScheme();
  const handleClick = () => field.toggleExclude();
  const getProps = () => {
    const common = {
      borderRadius: "md",
      p: 2,
      pl: 0,
      cursor: "pointer",
      color: tone(700),
      fontSize: "xs",
      borderWidth: "1px",
    };

    if (!field.canExclude) return { ...common, cursor: "default", color: "gray.400", bg: "gray.75", borderColor: "gray.200" };
    if (field.excluded) return { ...common, borderColor: tone(200), onClick: handleClick };
    return { ...common, borderColor: tone(200), bg: tone(75), onClick: handleClick };
  };

  const iconColor = field.canExclude ? tone(field.excluded ? "gray.75" : tone(500)) : "gray.300";

  return (
    <Flex {...getProps()}>
      {(!field.excluded || !field.canExclude) && <Icon as={BsCheckCircleFill} color={iconColor} fontSize="large" ml={3} mr={2.5} mt={1} />}
      {field.excluded && <Icon as={BsCircle} color={tone(500)} fontSize="large" ml={3} mr={2.5} mt={1} />}
      <Box flex="1">
        <Flex>
          <Text flex="1" fontWeight="bold">
            {field.label}
          </Text>
          <Text fontSize="0.6rem" color={field.canExclude ? tone(300) : "gray.400"}>
            {field.type}
          </Text>
        </Flex>
        <Text fontSize="0.6rem" mt={-1} wordBreak="break-all">
          {field.name}
        </Text>
      </Box>
    </Flex>
  );
});
