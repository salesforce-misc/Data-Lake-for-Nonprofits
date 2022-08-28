import React from "react";
import isEmpty from "lodash/isEmpty";
import { Box, Flex, IconButton, InputGroup, Input, InputRightElement } from "@chakra-ui/react";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { PaginationButtons } from "components/PaginationButtons";
import { useColorScheme } from "models/useColorScheme";
import { useFieldsTable } from "models/useFieldsTable";
import { ISFObject } from "models/helpers/SFObject";

import { FieldsViewOptionsPanel } from "./FieldsViewOptionsPanel";
import { EmptyMessage } from "./EmptyMessage";
import { FieldsGrid } from "./FieldsGrid";
import { ImmutableFieldsGrid } from "./ImmutableFieldsGrid";

interface IFieldsTable {
  object: ISFObject;
}

export const FieldsTable = observer(({ object }: IFieldsTable) => {
  const { tone, colorScheme } = useColorScheme();
  const { fields, viewOption, setViewOption, totalPages, currentPage, setCurrentPage, searchText, setSearchText, totalMatches } = useFieldsTable({
    object,
  });

  const handleTextChange: React.ChangeEventHandler<HTMLInputElement> = (event) => setSearchText(event.target.value);

  return (
    <Box p={3} borderRadius="md" borderWidth="1px" borderColor={tone(100)}>
      <FieldsViewOptionsPanel object={object} viewOption={viewOption} setViewOption={setViewOption} />

      {(totalPages > 1 || !isEmpty(searchText)) && (
        <Box position="relative" mb={8}>
          <Flex mb={0}>
            <InputGroup size="sm">
              <Input type="text" placeholder="Search" borderRadius="md" value={searchText} onChange={handleTextChange} />
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
                />
              </InputRightElement>
            </InputGroup>
            <PaginationButtons totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </Flex>

          {!isEmpty(searchText) && (
            <Box p={0} m={0} fontSize="0.6rem" position="absolute" bottom="-20px" left="10px">
              Found <b>{totalMatches}</b> matches
            </Box>
          )}
        </Box>
      )}
      <EmptyMessage object={object} fields={fields} viewOption={viewOption} searchText={searchText} />
      <FieldsGrid fields={fields} />
      <ImmutableFieldsGrid object={object} viewOption={viewOption} />
    </Box>
  );
});
