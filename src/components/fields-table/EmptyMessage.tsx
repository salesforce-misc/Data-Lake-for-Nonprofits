import React from "react";
import isEmpty from "lodash/isEmpty";
import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { FieldsViewOptions } from "models/useFieldsTable";
import { ISFObject } from "models/helpers/SFObject";
import { IField } from "models/helpers/Field";

interface IEmptyMessage {
  object: ISFObject;
  viewOption: FieldsViewOptions;
  fields: IField[];
  searchText: string;
}

export const EmptyMessage = observer(({ object, viewOption, fields, searchText }: IEmptyMessage) => {
  const { tone } = useColorScheme();

  if (fields.length > 0) return null;

  let content = "No fields are found";
  let size = 0;

  if (!isEmpty(searchText)) content = "No matches are found";
  else {
    switch (viewOption) {
      case FieldsViewOptions.All:
        size = object.immutableFields.length;
        if (size > 0) {
          content = `There are ${size} included fields. They are mandatory.`;
        } else {
          content = "No fields are found";
        }
        break;
      case FieldsViewOptions.Only_Included:
        size = object.immutableFields.length;
        if (size > 0) {
          content = `There are ${size} included fields. They are mandatory.`;
        } else {
          content = "No included fields are found";
        }
        break;
      case FieldsViewOptions.Only_Excluded:
        content = "No excluded fields are found";
    }
  }

  return (
    <Box bg={tone(100)} textAlign="center" p={4} fontSize="xs" color={tone(600)} borderRadius="md">
      {content}
    </Box>
  );
});
