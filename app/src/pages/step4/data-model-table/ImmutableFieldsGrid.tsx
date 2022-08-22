import React from "react";
import { Box, SimpleGrid, Divider, Alert, AlertDescription } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { FieldsViewOptions } from "models/useFieldsTable";
import { ISFObject } from "models/helpers/SFObject";

import { ImmutableField } from "./ImmutableField";

interface IImmutableFieldsGrid {
  object: ISFObject;
  viewOption: FieldsViewOptions;
}

export const ImmutableFieldsGrid = observer(({ object, viewOption }: IImmutableFieldsGrid) => {
  const { tone, colorScheme } = useColorScheme();
  const immutableFields = object.immutableFields;

  if (viewOption === FieldsViewOptions.Only_Excluded) return null;
  if (immutableFields.length < 1) return null;

  return (
    <Box pt={6}>
      <Divider borderColor={tone(400)} />
      <Alert status="info" colorScheme={colorScheme} bg={tone(50)} mt={4} borderRadius="md" fontSize="small" color={tone(700)}>
        <AlertDescription>
          The following <b>{immutableFields.length}</b> fields can not be excluded. They will always be imported.
        </AlertDescription>
      </Alert>

      <SimpleGrid minChildWidth="200px" spacing="20px" mt={4}>
        {immutableFields.map((field) => (
          <ImmutableField key={field.name} field={field} />
        ))}
      </SimpleGrid>
    </Box>
  );
});
