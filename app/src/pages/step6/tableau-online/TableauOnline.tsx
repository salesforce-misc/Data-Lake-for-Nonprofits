import React from "react";
import { Box, Heading, Link } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { ChevronRightIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { SetupInstructions } from "./SetupInstructions";

export const TableauOnline = observer(() => {
  const { tone } = useColorScheme();

  return (
    <>
      <Heading size="md" pt="0px" pb="30px" color={tone(600)} letterSpacing="-1px">
        Launch Your Connection in Tableau Online
      </Heading>

      <Box display="block" fontSize="sm" mb={6}>
        Login to Table Online.{" "}
        <Link fontWeight="bold" href="hhttps://help.tableau.com/current/pro/desktop/en-us/examples_postgresql.htm" isExternal>
          Utilize the Access Information from below to complete the steps outlined in this help document <ExternalLinkIcon />
        </Link>{" "}
        inside of Tableau Online.
      </Box>

      <SetupInstructions />
    </>
  );
});
