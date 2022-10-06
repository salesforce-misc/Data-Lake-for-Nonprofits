import React from "react";
import { Box, Text, Link, Alert, AlertIcon, AlertTitle, AlertDescription, Select } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";

import { SetupInstructionsMac } from "./SetupInstructionsMac";
import { SetupInstructionsWindows } from "./SetupInstructionsWindows";
import { UsersPanel } from "./users-panel/UsersPanel";
import { AthenaAccessInformation } from "./AthenaAccessInformation";

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

  return (
    <Box>
      <Box borderRadius="lg" bg={tone(75)} mt={4} p={10} pt={4} pb={4} position="relative">
        <UsersPanel />
      </Box>

      <Box borderRadius="lg" bg={tone(75)} mt={4} p={10} pt={4} pb={4} position="relative">
        <AthenaAccessInformation />
      </Box>

      {!os && (
        <Alert status="warning" variant="left-accent" mt={4} mb={4} fontSize="sm">
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
        <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={10} position="relative">
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
        </Box>
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
      {selectedOs === SUPPORTED_OS.MAC && <SetupInstructionsMac />}
      {selectedOs === SUPPORTED_OS.WINDOWS && <SetupInstructionsWindows />}
    </Box>
  );
});
