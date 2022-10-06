import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";

export const PostgreSqlAccessInformation = observer(() => {
  const { tone } = useColorScheme();

  return (
    <>
      <Heading id="step6-h2-access-information" size="md" pt="0px" pb="30px" color={tone(600)} letterSpacing="-1px">
        PostgreSQL Access Information
      </Heading>

      <Box display="block" fontSize="sm" mb={6}>
        You will connect your data lake to Tableau Online using PostgreSQL, a natively supported connector for Tableau Online. This information will
        be used inside of Tableau when making the connection.
      </Box>
    </>
  );
});
