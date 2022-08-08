import React from "react";
import { Box, Heading, Text, Alert, AlertDescription, AlertTitle, Badge } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { DataModelDescription } from "pages/step3/DataModelDescription";
import { ObjectsTable } from "components/objects-table/ObjectsTable";
import { niceNumber } from "helpers/utils";
import { useMetadataStore } from "models/MetadataStore";
import { useColorScheme } from "models/useColorScheme";

export const DataModelPanel = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const { isReady, store } = useMetadataStore();

  const hasMissingObjects = store.missingObjects.length > 0;

  return (
    (!isReady && null) || (
      <Box p={0} mb={6} pt={15} color={tone(800)}>
        <Heading size="md" pt="0px" pb="20px" color={tone(600)} letterSpacing="-1px">
          Salesforce NPSP data model
        </Heading>

        {hasMissingObjects && (
          <Box p={6} bg={tone(75)} borderRadius="md" mb={4} mt={0}>
            <DataModelDescription />
          </Box>
        )}

        {!store.empty && (
          <>
            <Alert status="info" colorScheme={colorScheme} bg={tone(75)} mt={0} borderRadius="md" p={6}>
              <Box>
                <AlertTitle color={tone(600)} mb={2}>
                  Objects to import
                  <Badge colorScheme={colorScheme} borderRadius="full" ml={2} fontSize="md" fontWeight="bold" pl={2} pr={2}>
                    {niceNumber(store.selectedObjects.length)}
                  </Badge>
                </AlertTitle>
                <AlertDescription fontSize="md">
                  If needed, you can include or exclude <b>objects</b> by clicking on the object name.
                  <Text mt={3}>
                    You can also exclude <b>fields</b> by clicking on the 'Customize Fields' button.
                  </Text>
                </AlertDescription>
              </Box>
            </Alert>
            <ObjectsTable />
          </>
        )}
      </Box>
    )
  );
});
