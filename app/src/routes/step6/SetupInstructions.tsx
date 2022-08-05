// Deprecated
import React from "react";
import { Box, Grid, GridItem, Text, Link, Tag, Alert, AlertIcon, AlertTitle, AlertDescription, Select, Image } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import tableauCatalogDatabase from "../images/tableau-catalog-database.png";
import tableauConnect from "../images/tableau-connect.png";
import { observer } from "mobx-react";

import { useInstallation } from "../../AppContext";
import { useColorScheme } from "../../models/useColorScheme";
import { SetupInstructionsMac } from "./SetupInstructionsMac";
import { SetupInstructionsWindows } from "./SetupInstructionsWindows";
import { PreSetupInstructionsWindows } from "./PreSetupInstructionsWindows";
import { AthenaProperties } from "./AthenaProperties";

enum SUPPORTED_OS {
  WINDOWS = "Windows",
  MAC = "Mac",
}

export const ATHENA_JAR_NAME = "AthenaJDBC42.jar";

export function getOperatingSystem() {
  return Object.values(SUPPORTED_OS).find((v) => navigator.userAgent.indexOf(v) >= 0);
}

export const SetupInstructions = observer(() => {
  const { tone } = useColorScheme();
  const os = getOperatingSystem();
  const [selectedOs, setSelectedOs] = React.useState(os || SUPPORTED_OS.WINDOWS);
  let indexOffset = 0;
  if (selectedOs === SUPPORTED_OS.WINDOWS) {
    indexOffset = 1;
  }
  const installation = useInstallation();
  return (
    <>
      <AthenaProperties />

      {!os && (
        <Alert status="warning" variant="left-accent" mt={5} mb={5} fontSize="sm">
          <AlertIcon />
          <Box>
            <AlertTitle>Your operating system is not supported by this system.</AlertTitle>
            <AlertDescription>
              The below instructions may or may not work for your operating system. Please see the{" "}
              <Link
                fontWeight="bold"
                href="https://www.tableau.com/support/drivers?_ga=2.225514010.1097273419.1650636249-150013086.1649353699"
                isExternal
              >
                Tableau installation instructions <ExternalLinkIcon />
              </Link>{" "}
              for more guidance.
            </AlertDescription>
          </Box>
        </Alert>
      )}
      {os && (
        <Text color={tone(800)}>
          Full instructions{" "}
          <Link
            fontWeight="bold"
            href="https://www.tableau.com/support/drivers?_ga=2.225514010.1097273419.1650636249-150013086.1649353699"
            isExternal
          >
            from Tableau can be found here <ExternalLinkIcon />
          </Link>
          . These instructions below are tailored to the needs of this system.
        </Text>
      )}
      <Select mt={3} mb={5} value={selectedOs} onChange={(e) => setSelectedOs(e.target.value as SUPPORTED_OS)}>
        {Object.values(SUPPORTED_OS).map((operSys: SUPPORTED_OS) => {
          return (
            <option key={operSys} value={operSys}>
              {operSys}
            </option>
          );
        })}
      </Select>
      {selectedOs === SUPPORTED_OS.WINDOWS && <PreSetupInstructionsWindows />}
      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              {1 + indexOffset}
            </Tag>
          </GridItem>
          <GridItem colSpan={4} fontWeight="bold" color={tone(600)}>
            Download Tableau
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            Visit the{" "}
            <Link fontWeight="bold" href="https://www.tableau.com/products/desktop/download" isExternal>
              Tableau download page <ExternalLinkIcon />
            </Link>{" "}
            and run the installer. You may skip this step if you already have it installed.
          </GridItem>
        </Grid>
      </Box>
      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              {2 + indexOffset}
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
      {selectedOs === SUPPORTED_OS.MAC && <SetupInstructionsMac />}
      {selectedOs === SUPPORTED_OS.WINDOWS && <SetupInstructionsWindows />}
      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              {5 + indexOffset}
            </Tag>
          </GridItem>
          <GridItem colSpan={4} fontWeight="bold" color={tone(600)}>
            Open Tableau
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            If Tableau is already open, close it and restart it. Once started, on the left side pane under "Connect", under the section "To a server"
            there should be a "More &gt;" link, click it. "Amazon Athena" should be near the top of the list, alphabetcially.
            <br />
            <br />
            Fill out the fields using a combination of the above information and the Access Key ID and Secret Access Key you can generate for a new
            user above. It should look like this when finished:
            <Image src={tableauConnect} />
          </GridItem>
        </Grid>
      </Box>
      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              {6 + indexOffset}
            </Tag>
          </GridItem>
          <GridItem colSpan={4} fontWeight="bold" color={tone(600)}>
            Select installation &amp; Enjoy!
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            To find the Salesforce data, from the "Catalog" dropdown select "sf_data_{installation.id}". Next, from "Database" select "public". After
            the queries complete you should see all tables listed on the left.
            <Image margin="auto" p={5} src={tableauCatalogDatabase} />
          </GridItem>
        </Grid>
      </Box>
    </>
  );
});
