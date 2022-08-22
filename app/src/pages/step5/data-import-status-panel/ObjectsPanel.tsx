import React from "react";
import { observer } from "mobx-react";
import { Table, Tbody, Tfoot, Th, Thead, Tr } from "@chakra-ui/react";

import { useImportStatusStore } from "models/ImportStatusStore";
import { isStoreLoading } from "models/BaseStore";

import { ObjectRow } from "./ObjectRow";

export const ObjectsPanel = observer(({ colorScheme }: { colorScheme: string }) => {
  const { store } = useImportStatusStore();
  const empty = store.empty;

  if (empty) return null;
  if (store.isGettingSchemas && isStoreLoading(store)) return null;

  return (
    <Table variant="simple" mt={3} colorScheme={colorScheme} size="sm" mb={6}>
      <Thead>
        <Tr>
          <Th pl={0}>Type</Th>
          <Th isNumeric>Records</Th>
          <Th isNumeric>Fields</Th>
          <Th isNumeric>Size</Th>
          <Th isNumeric>Time</Th>
        </Tr>
      </Thead>
      <Tbody>
        {store.listObjects.map((item, index) => (
          <ObjectRow key={item.name} object={item} colorScheme={colorScheme} index={index} />
        ))}
      </Tbody>
      <Tfoot>
        <Tr>
          <Th></Th>
          <Th isNumeric>{store.totalRecordsDisplay}</Th>
          <Th isNumeric>{store.totalFieldsDisplay}</Th>
          <Th isNumeric>{store.totalBytesDisplay}</Th>
          <Th isNumeric>{store.totalTimeDisplay}</Th>
        </Tr>
      </Tfoot>
    </Table>
  );
});
