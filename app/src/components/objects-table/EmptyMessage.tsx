import React from "react";
import isEmpty from "lodash/isEmpty";
import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { ObjectsViewOptions } from "models/useObjectsTable";
import { ISFObject } from "models/helpers/SFObject";

interface IEmptyMessage {
  viewOption: ObjectsViewOptions;
  objects: ISFObject[];
  searchText: string;
}

export const EmptyMessage = observer(({ viewOption, objects, searchText }: IEmptyMessage) => {
  const { tone } = useColorScheme();

  if (objects.length > 0) return null;
  let content = "No objects are found";

  if (!isEmpty(searchText)) content = "No matches are found";
  else {
    switch (viewOption) {
      case ObjectsViewOptions.All:
        content = "No objects are found";
        break;
      case ObjectsViewOptions.Only_Included:
        content = "No included objects are found";
        break;
      case ObjectsViewOptions.Only_Excluded:
        content = "No excluded objects are found";
    }
  }

  return (
    <Box bg={tone(100)} textAlign="center" p={4} fontSize="xs" color={tone(600)} borderRadius="md">
      {content}
    </Box>
  );
});
