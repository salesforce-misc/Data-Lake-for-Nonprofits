import { FC } from "react";
import { Box, Text, UnorderedList, ListItem } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { niceNumber } from "../../helpers/utils";
import { useMetadataStore } from "../../models/MetadataStore";

export const DataModelDescription: FC = observer(() => {
  const { store } = useMetadataStore();
  const missingObjects = store.missingObjects;
  const missingCount = missingObjects.length;
  const defaultCount = store.defaultCount;
  const diffCount = defaultCount - missingCount;
  const hasMissingObjects = missingObjects.length > 0;
  let content = <>The Nonprofit Success Pack (NPSP) data model has {niceNumber(defaultCount)} object types.</>;

  if (hasMissingObjects && diffCount === 0) {
    content = <>{content} &nbsp; However, your Salesforce organization has none of these object types.</>;
  } else if (hasMissingObjects) {
    content = (
      <>
        &nbsp; Your Salesforce organization only has {niceNumber(diffCount)} out of the {niceNumber(defaultCount)} objects types.
        <br />
        <Box mt={2}>
          The missing object types are:
          <UnorderedList mt={3} mb={3}>
            {missingObjects.map((obj) => (
              <ListItem key={obj.name}>
                {obj.label}
                <Text ml={2} fontSize="xs" display="inline-block">
                  ( {obj.name} )
                </Text>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      </>
    );
  }

  return content;
});
