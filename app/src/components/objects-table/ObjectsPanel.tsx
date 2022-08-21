import React from "react";
import isEmpty from "lodash/isEmpty";
import { Box, Flex, IconButton, Input, InputGroup, InputRightElement, Table, Tbody, Thead, Th, Tr } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { SmallCloseIcon } from "@chakra-ui/icons";

import { useMetadataStore } from "models/MetadataStore";
import { useColorScheme } from "models/useColorScheme";
import { useObjectsTable } from "models/useObjectsTable";
import { PaginationButtons } from "components/PaginationButtons";

import { ObjectsViewOptionsPanel } from "./ObjectsViewOptionsPanel";
import { EmptyMessage } from "./EmptyMessage";
import { ObjectRow } from "./ObjectRow";

export const ObjectsPanel = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const { store } = useMetadataStore();
  const [isProcessing, setProcessing] = React.useState(false);
  const { objects, viewOption, setViewOption, totalPages, currentPage, setCurrentPage, searchText, setSearchText, totalMatches } = useObjectsTable({
    store,
    pageSize: 25,
  });
  const handleTextChange: React.ChangeEventHandler<HTMLInputElement> = (event) => setSearchText(event.target.value);

  return (
    <Box mt={6} mb={4}>
      <ObjectsViewOptionsPanel viewOption={viewOption} setViewOption={setViewOption} isProcessing={isProcessing} />
      {(totalPages > 1 || !isEmpty(searchText)) && (
        <Box position="relative" mb={8}>
          <Flex mb={0}>
            <InputGroup size="sm">
              <Input type="text" placeholder="Search" borderRadius="md" value={searchText} onChange={handleTextChange} isDisabled={isProcessing} />
              <InputRightElement>
                <IconButton
                  onClick={() => setSearchText("")}
                  size="sm"
                  variant="ghost"
                  color="purple.200"
                  colorScheme={colorScheme}
                  aria-label="Clear search text"
                  _active={{ bg: "none", color: tone(900) }}
                  _hover={{ bg: "none", color: tone(500) }}
                  _focus={{ boxShadow: "none" }}
                  icon={<SmallCloseIcon fontSize="lg" />}
                  isDisabled={isProcessing}
                />
              </InputRightElement>
            </InputGroup>
            <PaginationButtons totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} isProcessing={isProcessing} />
          </Flex>
          <Box p={0} m={0} fontSize="0.6rem" position="absolute" bottom="-20px" left="10px">
            {!isEmpty(searchText) && (
              <>
                Found <b>{totalMatches}</b> matches
              </>
            )}
          </Box>
        </Box>
      )}

      <EmptyMessage objects={objects} viewOption={viewOption} searchText={searchText} />

      {objects.length > 0 && (
        <>
          <Table variant="simple" colorScheme={colorScheme} size="sm" mb={6}>
            <Thead>
              <Tr>
                <Th pl={10}>Objects</Th>
                <Th w="100px" textAlign="right">
                  Fields
                </Th>
                <Th w="170px" isNumeric />
              </Tr>
            </Thead>
            <Tbody>
              {objects.map((object) => (
                <ObjectRow key={`${object.label}-${object.name}`} object={object} isProcessing={isProcessing} setProcessing={setProcessing} />
              ))}
            </Tbody>
          </Table>
          <Flex mb={0} direction="row-reverse">
            <PaginationButtons totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} isProcessing={isProcessing} />
          </Flex>
        </>
      )}
    </Box>
  );
});
