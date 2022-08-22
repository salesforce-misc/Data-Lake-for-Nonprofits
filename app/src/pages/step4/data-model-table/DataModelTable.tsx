import React from "react";
import { Table, Thead, Tr, Th, Tbody, Tfoot } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { niceNumber } from "helpers/utils";
import { useMetadataStore } from "models/MetadataStore";
import { useColorScheme } from "models/useColorScheme";

import { ObjectRow } from "./ObjectRow";

export const DataModelTable = observer(() => {
  const { colorScheme } = useColorScheme();
  const { store } = useMetadataStore();
  const selectedObjectsCount = store.selectedObjects.length;
  const isEmptyModel = selectedObjectsCount === 0;
  const selectedFieldsCount = store.selectedFieldsCount;

  return (
    <>
      {!isEmptyModel && (
        <Table variant="simple" mt={4} colorScheme={colorScheme}>
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th isNumeric># Fields</Th>
            </Tr>
          </Thead>
          <Tbody>
            {store.selectedObjects.map((item) => (
              <ObjectRow key={`${item.label}-${item.name}`} object={item} />
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
