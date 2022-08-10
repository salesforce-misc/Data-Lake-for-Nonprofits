// Deprecated
import React from "react";
import { Box, Grid, GridItem, Text, Tag, Image, Link } from "@chakra-ui/react";
import { observer } from "mobx-react";

import libraryDriverInstalledMac from "images/library-driver-installed.png";
import revealLibraryFolderMac from "images/reveal-library-folder.png";
import documentsAthenaPropertiesMac from "images/documents-athena-properties.png";
import tableauConnect from "images/tableau-connect.png";

import { useColorScheme } from "models/useColorScheme";

import { ATHENA_JAR_NAME } from "./SetupInstructions";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export const SetupInstructionsMac = observer(() => {
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
              2
            </Tag>
          </GridItem>
          <GridItem colSpan={4} fontWeight="bold" color={tone(600)}>
            Copy to the Library folder
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            You'll need to copy the downloaded "{ATHENA_JAR_NAME}" file into a subfolder within your Library folder. The Library folder is hidden by
            default. From within the Finder application on your mac, open the Go menu on the top bar and hold the{" "}
            <Text fontWeight="bold" display="inline">
              ⌥ Option
            </Text>{" "}
            key (next to{" "}
            <Text fontWeight="bold" display="inline">
              ⌘ Command
            </Text>
            , also sometimes marked as Alt on some keyboards) to see the Library folder; click it to open it. The menu looks like the following:
            <Image my={5} mx="auto" src={revealLibraryFolderMac} />
            You'll want to create 2 folders if they do not already exist, "Tableau" and underneath it, "Drivers". Put the "{ATHENA_JAR_NAME}" file in
            this folder. It should look like the following once completed:
            <Image margin="auto" src={libraryDriverInstalledMac} />
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
            Copy athena.properties File
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            You'll need to copy the downloaded "athena.properties" file into a subfolder within your Documents folder at{" "}
            <Text fontWeight="bold" display="inline">
              Documents/My Tableau Repository/Datasources
            </Text>
            . You'll want to create these 2 folders if they do not already exist, "My Tableau Repository" and underneath it, "Datasources". Be sure
            the spaces are included and spelled correctly! Put the{" "}
            <Text fontWeight="bold" display="inline">
              athena.properties
            </Text>{" "}
            file in this folder. It should look like the following once completed:
            <Image margin="auto" src={documentsAthenaPropertiesMac} />
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
