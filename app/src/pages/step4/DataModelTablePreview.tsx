import { FC, useState } from "react";
import { Box, Text, HStack, Badge, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Collapse, Tag, Tfoot } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { niceNumber } from "helpers/utils";
import { useMetadataStore } from "models/MetadataStore";
import { ISFObject } from "models/helpers/SFObject";

export const DataModelTablePreview: FC<{ colorScheme: string; showCaption?: boolean }> = observer(({ colorScheme, showCaption = true }) => {
  const { store } = useMetadataStore();
  const selectedObjectsCount = store.selectedObjects.length;
  const isEmptyModel = selectedObjectsCount === 0;
  const selectedFieldsCount = store.selectedFieldsCount;

  return (
    <>
      {!isEmptyModel && (
        <Table variant="simple" mt={showCaption ? 0 : 8} colorScheme={colorScheme}>
          {showCaption && (
            <TableCaption placement="top">
              Object types to import
              <Badge colorScheme={colorScheme} borderRadius="full" ml={2} fontSize="xs" fontWeight="bold">
                {selectedObjectsCount}
              </Badge>
            </TableCaption>
          )}
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th isNumeric># Fields</Th>
            </Tr>
          </Thead>
          <Tbody>
            {store.selectedObjects.map((item) => (
              <ObjectRow key={`${item.label}-${item.name}`} object={item} colorScheme={colorScheme} />
            ))}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th></Th>
              <Th isNumeric>{niceNumber(selectedFieldsCount)}</Th>
            </Tr>
          </Tfoot>
        </Table>
      )}
    </>
  );
});

const ObjectRow: FC<{ object: ISFObject; colorScheme: string }> = observer(({ object, colorScheme }) => {
  const [expanded, setExpanded] = useState(false);
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
