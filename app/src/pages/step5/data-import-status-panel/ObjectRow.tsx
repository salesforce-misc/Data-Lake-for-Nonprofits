import React from "react";
import { observer } from "mobx-react";
import { Box, Td, Tr } from "@chakra-ui/react";

import { IObjectImportStatus } from "models/ImportStatusStore";

interface IObjectRow {
  object: IObjectImportStatus;
  colorScheme: string;
  index: number;
}

export const ObjectRow = observer(({ object, colorScheme, index }: IObjectRow) => {
  const warn = object.warning;
  return (
    <>
      <Tr bg={warn ? "orange.50" : ""}>
        <Td pl={0}>
          {object.label}
          <Box fontSize="xx-small" p={0} mt="0px">
            {object.name}
          </Box>
        </Td>
        <Td isNumeric fontSize="sm">
          {object.rowCountDisplay}
        </Td>
        <Td isNumeric fontSize="sm">
          {object.columnCountDisplay}
        </Td>
        <Td isNumeric fontSize="sm">
          {object.bytesWrittenDisplay}
        </Td>
        <Td isNumeric fontSize="sm">
          {object.importSecondsDisplay}
        </Td>
      </Tr>
    </>
  );
});
