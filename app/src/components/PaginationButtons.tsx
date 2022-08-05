// Deprecated
import React from "react";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";

interface IPaginationButtons {
  totalPages: number;
  currentPage: number;
  isProcessing?: boolean;
  setCurrentPage: (page: number) => void;
}

export const PaginationButtons = observer(({ totalPages, currentPage, setCurrentPage, isProcessing = false }: IPaginationButtons) => {
  const { tone, colorScheme } = useColorScheme();

  if (totalPages <= 1) return <Box mr={1} w="210px" mt={1} />;

  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;
  const color = isProcessing ? tone(300) : tone(800);

  return (
    <Flex fontSize="xs" justifyContent="flex-end" mr={1} w="210px" mt={1}>
      {(hasPrevious && (
        <IconButton
          _focus={{ boxShadow: "none" }}
          aria-label="previous page"
          size="xs"
          variant="ghost"
          colorScheme={colorScheme}
          icon={<ChevronLeftIcon fontSize="xl" />}
          onClick={() => setCurrentPage(currentPage - 1)}
          pb={1}
          isDisabled={isProcessing}
        />
      )) || <Box w="24px" h="24px" />}

      <Text color={color}>
        Page {currentPage} of {totalPages}
      </Text>

      {(hasNext && (
        <IconButton
          _focus={{ boxShadow: "none" }}
          aria-label="next page"
          size="xs"
          variant="ghost"
          colorScheme={colorScheme}
          icon={<ChevronRightIcon fontSize="xl" />}
          onClick={() => setCurrentPage(currentPage + 1)}
          pb={1}
          isDisabled={isProcessing}
        />
      )) || <Box w="24px" h="24px" />}
    </Flex>
  );
});
