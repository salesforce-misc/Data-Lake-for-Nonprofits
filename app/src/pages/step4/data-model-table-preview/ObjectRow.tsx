import React from "react";
import { Box, Text, HStack, Badge, Tr, Td, Collapse, Tag } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { niceNumber } from "helpers/utils";
import { ISFObject } from "models/helpers/SFObject";

interface IObjectRow {
  object: ISFObject;
  colorScheme: string;
}

export const ObjectRow = observer(({ object, colorScheme }: IObjectRow) => {
  const [expanded, setExpanded] = React.useState(false);
  const hasExcludedFields = object.excludedFieldsCount > 0;

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
        <Td isNumeric>
          {niceNumber(object.selectedFieldsCount)}/{niceNumber(object.fieldsCount)}
        </Td>
      </Tr>

      {expanded && (
        <Tr>
          <Td colSpan={2} pb={8}>
            <Collapse in={expanded} animateOpacity>
              <Box p={4} borderRadius="md" borderWidth="1px" borderColor={`${colorScheme}.100`}>
                <Text align="center" fontSize="sm" color={`${colorScheme}.700`} mt="-5px" mb={4}>
                  Included Fields
                  <Badge colorScheme={colorScheme} borderRadius="full" ml={2} fontSize="xs" fontWeight="bold">
                    {niceNumber(object.selectedFieldsCount)}
                  </Badge>
                </Text>
                {object.selectedFields.map((field) => (
                  <Tag key={`${field.label}-${field.name}`} colorScheme={`${colorScheme}`} bg={`${colorScheme}.75`} mr={2} mb={2}>
                    {field.label} &nbsp;
                    <Text fontSize="0.6rem" display="inline-block">
                      {field.name}
                    </Text>
                  </Tag>
                ))}
                {hasExcludedFields && (
                  <>
                    <Text align="center" fontSize="sm" color={`${colorScheme}.700`} mt={4} mb={4}>
                      Excluded Fields
                      <Badge colorScheme={colorScheme} borderRadius="full" ml={2} fontSize="xs" fontWeight="bold">
                        {niceNumber(object.excludedFieldsCount)}
                      </Badge>
                    </Text>
                    {object.excludedFields.map((field) => (
                      <Tag key={`${field.label}-${field.name}`} colorScheme={`${colorScheme}`} bg={`${colorScheme}.75`} mr={2} mb={2}>
                        {field.label} &nbsp;
                        <Text fontSize="0.6rem" display="inline-block">
                          {field.name}
                        </Text>
                      </Tag>
                    ))}
                  </>
                )}
              </Box>
            </Collapse>
          </Td>
        </Tr>
      )}
    </>
  );
});
