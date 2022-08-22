import React from "react";
import { observer } from "mobx-react";
import { Box, HStack, Td, Text, Tr } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";

import { ISFObject } from "models/helpers/SFObject";
import { niceNumber } from "helpers/utils";

import { FieldsPanel } from "./FieldsPanel";

export const ObjectRow = observer(({ object }: { object: ISFObject }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <>
      <Tr cursor="pointer" onClick={() => setExpanded((previous) => !previous)}>
        <Td>
          <HStack alignItems="flex-start">
            <ChevronRightIcon transition="transform 0.2s" transform={expanded ? "rotate(90deg)" : "rotate(0deg)"} />
            <Box>
              {object.label} &nbsp;
              <Text fontSize="xs" display="inline-block">
                ( {object.name} )
              </Text>
            </Box>
          </HStack>
        </Td>
        <Td isNumeric>{niceNumber(object.selectedFieldsCount)}</Td>
      </Tr>
      {expanded && (
        <Tr>
          <Td colSpan={2} pb={8}>
            <FieldsPanel object={object} />
          </Td>
        </Tr>
      )}
    </>
  );
});
