// Deprecated
import React from "react";
import { Box, Grid, GridItem, Text, Tag, Image, Link } from "@chakra-ui/react";
import { observer } from "mobx-react";

import programFilesDriverInstalledWindows from "images/programfiles-driver-installed.png";
import documentsAthenaPropertiesWindows from "images/documents-athena-properties-windows.png";
import tableauConnect from "images/tableau-connect.png";

import { useColorScheme } from "models/useColorScheme";
import { ATHENA_JAR_NAME } from "./SetupInstructions";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export const SetupInstructionsWindows = observer(() => {
  const { tone } = useColorScheme();
  return (
    <>
      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              1
            </Tag>
          </GridItem>
          <GridItem colSpan={4} fontWeight="bold" color={tone(600)}>
            Install Microsoft Visual C++ to support Tableau
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            Visit the page to download and run the{" "}
            <Link fontWeight="bold" href="https://docs.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170" isExternal>
              Microsoft Visual C++ 2019 installer from Microsoft <ExternalLinkIcon />
            </Link>
            . If you install Tableau before installing this, the Tableau installation will fail.
          </GridItem>
        </Grid>
      </Box>

      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              2
            </Tag>
          </GridItem>
          <GridItem colSpan={4} fontWeight="bold" color={tone(600)}>
            Download Athena Plugin
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            Visit the{" "}
            <Link fontWeight="bold" href="https://docs.aws.amazon.com/athena/latest/ug/connect-with-jdbc.html#download-the-jdbc-driver" isExternal>
              Using Athena with the JDBC Driver <ExternalLinkIcon />
            </Link>{" "}
            page and save the file named "{ATHENA_JAR_NAME}" (or whichever version number at the end is bigger).
          </GridItem>
        </Grid>
      </Box>

      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              3
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
              4
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
      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              5
            </Tag>
          </GridItem>
          <GridItem colSpan={4} fontWeight="bold" color={tone(600)}>
            Open Tableau
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            If Tableau Desktop is already open, close and restart the application for the changes to take effect.
            <Image src={tableauConnect} />
          </GridItem>
        </Grid>
      </Box>
    </>
  );
});
