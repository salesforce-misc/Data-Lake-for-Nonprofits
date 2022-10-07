import React from "react";
import { Box, Heading, Link } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { SetupInstructions } from "./SetupInstructions";

export const TableauOnline = observer(() => {
  const { tone } = useColorScheme();

  return (
    <>
      <Heading size="md" pt="0px" pb="30px" color={tone(600)} letterSpacing="-1px">
        Launch Your Connection in Tableau Online
      </Heading>

      <Box display="block" fontSize="sm" mb={6}>
        Login to{" "}
        <Link fontWeight="bold" href="https://sso.online.tableau.com/public/idp/SSO" isExternal>
          Tableau Online.
        </Link>
        <ExternalLinkIcon sx={{ mb: 1 }} /> Utilize the Access Information from below to complete the steps outlined in this help document inside of
        Tableau Online.
      </Box>

      <SetupInstructions />
    </>
  );
});
