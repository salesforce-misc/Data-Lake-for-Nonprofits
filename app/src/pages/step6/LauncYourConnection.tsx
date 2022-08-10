import React from "react";
import { Box, Heading, Link } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { AthenaProperties } from "pages/step6/AthenaProperties";
import { ChevronRightIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { SetupInstructions } from "./SetupInstructions";

export const LaunchYourConnection = observer(() => {
  const { tone } = useColorScheme();
  const [expandedDesktop, setExpandedDesktop] = React.useState(false);
  const [expandedCloud, setExpandedCloud] = React.useState(false);

  return (
    <>
      <Heading size="md" pt="0px" pb="30px" color={tone(600)} letterSpacing="-1px">
        Launch Your Connection in Tableau
      </Heading>

      <Box display="block" fontSize="sm" mb={6}>
        Launch your Tableau application.{" "}
        <Link fontWeight="bold" href="https://help.tableau.com/current/pro/desktop/en-us/examples_amazonathena.htm" isExternal>
          Utilize the User and Access Information from above to complete the steps outlined in this help document <ExternalLinkIcon />
        </Link>{" "}
        inside of Tableau Desktop or Tableau Cloud.
      </Box>

      <Heading
        cursor="pointer"
        onClick={() => setExpandedDesktop((previous) => !previous)}
        size="sm"
        pt="0px"
        pb="20px"
        mb={3}
        color={tone(600)}
        letterSpacing="-1px"
      >
        Special Considerations for using Tableau Desktop
        <ChevronRightIcon transition="transform 0.2s" transform={expandedDesktop ? "rotate(0deg)" : "rotate(90deg)"} />
      </Heading>

      {expandedDesktop && (
        <>
          <Box display="block" fontSize="sm" mb={6}>
            If you are using Tableau desktop you will need to modify your JDBC connection using a properties file before starting the setup steps in
            the help document.
          </Box>

          <SetupInstructions />
        </>
      )}

      <Heading
        cursor="pointer"
        onClick={() => setExpandedCloud((previous) => !previous)}
        size="sm"
        pt="0px"
        pb="20px"
        color={tone(600)}
        letterSpacing="-1px"
      >
        {/* @TODO fill this based on testing */}
        If you are using Tableau Cloud you will need to...
        <ChevronRightIcon transition="transform 0.2s" transform={expandedCloud ? "rotate(0deg)" : "rotate(90deg)"} />
      </Heading>

      {expandedCloud && (
        <>
          <Box display="block" fontSize="sm" mb={6}>
            TBD
          </Box>
        </>
      )}
    </>
  );
});
