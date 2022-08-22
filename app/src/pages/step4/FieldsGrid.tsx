import React from "react";
import { SimpleGrid } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { IField } from "models/helpers/Field";

import { SelectableField } from "./SelectableField";

export const FieldsGrid = observer(({ fields }: { fields: IField[] }) => {
  if (fields.length < 1) return null;
  return (
    <SimpleGrid minChildWidth="200px" spacing="15px" mt={6}>
      {fields.map((field) => (
        <SelectableField key={field.name} field={field} />
      ))}
    </SimpleGrid>
  );
});
