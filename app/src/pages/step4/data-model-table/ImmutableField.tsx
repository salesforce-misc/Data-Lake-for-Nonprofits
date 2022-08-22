import React from "react";
import { Box, Text, Icon, Flex } from "@chakra-ui/react";
import { BsCheckCircleFill } from "react-icons/bs";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { IField } from "models/helpers/Field";

export const ImmutableField = observer(({ field }: { field: IField }) => {
  const { tone } = useColorScheme();

  const props = {
    borderRadius: "md",
    p: 2,
    pl: 0,
    cursor: "default",
    fontSize: "xs",
    borderWidth: "1px",
    color: tone(500),
    bg: tone(25),
    borderColor: tone(200),
  };

  return (
    <Flex {...props}>
      <Icon as={BsCheckCircleFill} color={tone(500)} fontSize="large" ml={3} mr={2.5} mt={1} />
      <Box flex="1">
        <Flex>
          <Text flex="1" fontWeight="bold">
            {field.label}
          </Text>
          <Text fontSize="0.6rem" color={tone(400)}>
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
