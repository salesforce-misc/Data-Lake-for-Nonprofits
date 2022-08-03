// Deprecated
import React from "react";
import { Box, Grid, GridItem, Text, Tag, Image } from "@chakra-ui/react";
import programFilesDriverInstalledWindows from "../images/programfiles-driver-installed.png";
import documentsAthenaPropertiesWindows from "../images/documents-athena-properties-windows.png";
import { observer } from "mobx-react";

import { useColorScheme } from "../../models/useColorScheme";
import { ATHENA_JAR_NAME } from "./SetupInstructions";

export const SetupInstructionsWindows = observer(() => {
  const { tone } = useColorScheme();
  return (
    <>
      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              4
            </Tag>
          </GridItem>
          <GridItem colSpan={4} fontWeight="bold" color={tone(600)}>
            Copy to the Library folder
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            You'll need to copy the downloaded "{ATHENA_JAR_NAME}" file to{" "}
            <Text fontWeight="bold" display="inline">
              C:\Program Files\Tableau\Drivers
            </Text>
            . The folders "Tableau" and "Drivers" may not be there already, if not create them. It should look like the following once completed:
            <Image p={5} src={programFilesDriverInstalledWindows} />
          </GridItem>
        </Grid>
      </Box>
      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              5
            </Tag>
          </GridItem>
          <GridItem colSpan={4} fontWeight="bold" color={tone(600)}>
            Copy athena.properties File
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            You'll need to copy the downloaded "athena.properties" file into a subfolder within your Documents folder at{" "}
            <Text fontWeight="bold" display="inline">
              Documents/My Tableau Repository/Datasources
            </Text>
            . You'll want to create these 2 folders if they do not already exist, "My Tableau Repository" and underneath it, "Datasources". Be sure
            the spaces are included and spelled correctly! It should look like the following once completed:
            <Image p={5} src={documentsAthenaPropertiesWindows} />
          </GridItem>
        </Grid>
      </Box>
    </>
  );
});
