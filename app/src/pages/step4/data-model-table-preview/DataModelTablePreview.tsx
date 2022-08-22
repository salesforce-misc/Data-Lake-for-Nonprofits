import React from "react";
import { Badge, Table, TableCaption, Thead, Tr, Th, Tbody, Tfoot } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { niceNumber } from "helpers/utils";
import { useMetadataStore } from "models/MetadataStore";

import { ObjectRow } from "./ObjectRow";

interface IDataModelTablePreview {
  colorScheme: string;
  showCaption?: boolean;
}

export const DataModelTablePreview = observer(({ colorScheme, showCaption = true }: IDataModelTablePreview) => {
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
