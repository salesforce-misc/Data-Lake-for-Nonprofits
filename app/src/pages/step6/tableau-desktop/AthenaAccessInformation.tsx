import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";

import { AthenaAccessInfoGrid } from "./AthenaAccessInfoGrid";

export const AthenaAccessInformation = observer(() => {
  const { tone } = useColorScheme();

  return (
    <>
      <Heading id="step6-h2-access-information" size="md" pt="0px" pb="30px" color={tone(600)} letterSpacing="-1px">
        Amazon Athena Access Information
      </Heading>

      <Box display="block" fontSize="sm" mb={6}>
        You will connect your data lake to Tableau using Amazon Athena, a natively supported connector for Tableau Desktop and Tableau Cloud. This
        information will be used inside of Tableau when making the connection.
      </Box>

      <AthenaAccessInfoGrid />
    </>
  );
});
