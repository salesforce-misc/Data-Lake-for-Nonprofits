import { FC, useState } from "react";
import {
  Box,
  HStack,
  useClipboard,
  Tooltip,
  Grid,
  GridItem,
  Heading,
  Text,
  Link,
  Tag,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  Image,
} from "@chakra-ui/react";
import { CheckCircleIcon, ChevronRightIcon, CopyIcon, DownloadIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import libraryDriverInstalledMac from "../images/library-driver-installed.png";
import revealLibraryFolderMac from "../images/reveal-library-folder.png";
import programFilesDriverInstalledWindows from "../images/programfiles-driver-installed.png";
import documentsAthenaPropertiesMac from "../images/documents-athena-properties.png";
import documentsAthenaPropertiesWindows from "../images/documents-athena-properties-windows.png";
import tableauCatalogDatabase from "../images/tableau-catalog-database.png";
import tableauConnect from "../images/tableau-connect.png";
import { observer } from "mobx-react";

import { useInstallation } from "../AppContext";
import { useColorScheme } from "../models/useColorScheme";
import { ClipboardField } from "./ClipboardField";

export const TableauAccessPanel: FC = observer(() => {
  const [expanded, setExpanded] = useState(false);
  const { tone } = useColorScheme();

  return (
    <>
      <Heading size="md" pt="0px" pb="30px" color={tone(600)} letterSpacing="-1px">
        Data lake access information
      </Heading>
      <AccessInfoGrid />

      <Box cursor="pointer" onClick={() => setExpanded((previous) => !previous)} fontWeight="small" color={tone(700)} mb={expanded ? 4 : 0}>
        <ChevronRightIcon transition="transform 0.2s" transform={expanded ? "rotate(90deg)" : "rotate(0deg)"} />
        Click to see setup instructions for Tableau Desktop
      </Box>
      {expanded && <SetupInstructions />}
    </>
  );
});

const AccessInfoGrid: FC = observer(() => {
  const { tone } = useColorScheme();
  const installation = useInstallation();
  const athenaServer = installation.athenaServer;
  const port = installation.athenaServerPort;
  const s3Staging = installation.athenaOutput;
  const catalog = installation.athenaDataCatalog;
  const workgroup = installation.athenaPrimaryWorkGroup;

  const commonProps = {
    w: "100%",
    h: "100%",
    borderRadius: "md",
    p: 1,
    pl: 3,
  };

  const headerProps = {
    ...commonProps,
    color: tone(700),
    bg: tone(75),
    fontWeight: "bold",
  };

  const contentProps = {
    ...commonProps,
    color: tone(800),
  };

  return (
    <Grid templateColumns="0.5fr 1fr" gap={2} mb={6}>
      <GridItem {...headerProps}>Server</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value={athenaServer} />
      </GridItem>
      <GridItem {...headerProps}>Port</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value={port} />
      </GridItem>
      <GridItem {...headerProps}>S3 Staging Directory</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value={s3Staging} />
      </GridItem>
      <GridItem {...headerProps}>Catalog</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value={catalog} />
      </GridItem>
      <GridItem {...headerProps}>Workgroup</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value={workgroup} />
      </GridItem>
      <GridItem {...headerProps}>Database</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value="public" />
      </GridItem>
    </Grid>
  );
});

const AthenaProperties: FC = observer(() => {
  const installation = useInstallation();
  const workgroup = installation.athenaPrimaryWorkGroup;
  const { tone } = useColorScheme();
  const value = `Workgroup=${workgroup}\nMetadataRetrievalMethod=ProxyAPI`;
  const { hasCopied, onCopy } = useClipboard(value, 500);

  const handleDownload = () => {
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", `data:text/plain,${encodeURIComponent(value)}`);
    downloadLink.setAttribute("download", "athena.properties");
    downloadLink.click();
  };

  return (
    <>
      <HStack color={tone(700)} mb={2}>
        <Text fontWeight="bold" pl={2} pr={3}>
          athena.properties
        </Text>
        <Tooltip label={hasCopied ? "Copied" : "Copy"}>{hasCopied ? <CheckCircleIcon /> : <CopyIcon cursor="pointer" onClick={onCopy} />}</Tooltip>
        <Box pl={2} pb={1}>
          <Tooltip label="Download">
            <DownloadIcon cursor="pointer" onClick={handleDownload} />
          </Tooltip>
        </Box>
      </HStack>
      <Box bg={tone(75)} p={3} borderRadius="lg" mb={5} color={tone(700)}>
        <Text display="block" fontSize="sm">
          Workgroup={workgroup}
        </Text>
        <Text display="block" fontSize="sm">
          MetadataRetrievalMethod=ProxyAPI
        </Text>
      </Box>
    </>
  );
});

enum SUPPORTED_OS {
  WINDOWS = "Windows",
  MAC = "Mac",
}

const ATHENA_JAR_NAME = "AthenaJDBC42.jar";

function getOperatingSystem() {
  return Object.values(SUPPORTED_OS).find((v) => navigator.userAgent.indexOf(v) >= 0);
}

const SetupInstructions: FC = observer(() => {
  const { tone } = useColorScheme();
  const os = getOperatingSystem();
  const [selectedOs, setSelectedOs] = useState(os || SUPPORTED_OS.WINDOWS);
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

const SetupInstructionsMac: FC = observer(() => {
  const { tone } = useColorScheme();
  return (
    <>
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
            the spaces are included and spelled correctly! Put the{" "}
            <Text fontWeight="bold" display="inline">
              athena.properties
            </Text>{" "}
            file in this folder. It should look like the following once completed:
            <Image margin="auto" src={documentsAthenaPropertiesMac} />
          </GridItem>
        </Grid>
      </Box>
    </>
  );
});

const PreSetupInstructionsWindows: FC = observer(() => {
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
    </>
  );
});

const SetupInstructionsWindows: FC = observer(() => {
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
