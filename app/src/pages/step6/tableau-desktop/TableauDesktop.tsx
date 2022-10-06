import React from "react";
import { Box, Heading, Link } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { SetupInstructions } from "./SetupInstructions";

export const TableauDesktop = observer(() => {
  const { tone } = useColorScheme();

  return (
    <>
      <Heading size="md" pt="0px" pb="30px" color={tone(600)} letterSpacing="-1px">
        Launch Your Connection in Tableau Desktop
      </Heading>

      <Box display="block" fontSize="sm" mb={6}>
        Launch your Tableau application.{" "}
        <Link fontWeight="bold" href="https://help.tableau.com/current/pro/desktop/en-us/examples_amazonathena.htm" isExternal>
          Utilize the User and Access Information from below to complete the steps outlined in this help document <ExternalLinkIcon />
        </Link>{" "}
        inside of Tableau Desktop.
      </Box>

      <SetupInstructions />
    </>
  );
});
