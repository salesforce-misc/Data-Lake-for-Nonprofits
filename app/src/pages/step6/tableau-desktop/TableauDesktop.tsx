import React from "react";
import { Box, Heading, Link } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { SetupInstructions } from "./SetupInstructions";

export const TableauDesktop = observer(() => {
  const [expanded, setExpanded] = React.useState(false);
  const { tone } = useColorScheme();

  return (
    <>
      <Heading
        cursor="pointer"
        onClick={() => setExpanded((previous) => !previous)}
        mb={expanded ? 4 : 0}
        size="md"
        pt="0px"
        pb="20px"
        color={tone(600)}
        letterSpacing="-1px"
      >
        Launch Your Connection in Tableau Desktop
        <ChevronRightIcon transition="transform 0.2s" transform={expanded ? "rotate(0deg)" : "rotate(90deg)"} />
      </Heading>

      {expanded && (
        <Box>
          <Box display="block" fontSize="sm" mb={6}>
            Launch your Tableau application.{" "}
            <Link fontWeight="bold" href="https://help.tableau.com/current/pro/desktop/en-us/examples_amazonathena.htm" isExternal>
              Utilize the User and Access Information from below to complete the steps outlined in this help document <ExternalLinkIcon />
            </Link>{" "}
            inside of Tableau Desktop.
          </Box>

          <SetupInstructions />
        </Box>
      )}
    </>
  );
});
