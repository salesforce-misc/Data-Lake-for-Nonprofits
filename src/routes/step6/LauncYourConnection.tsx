import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { AthenaProperties } from "routes/step6/AthenaProperties";

export const LaunchYourConnection = observer(() => {
  const { tone } = useColorScheme();

  return (
    <>
      <Heading size="md" pt="0px" pb="30px" color={tone(600)} letterSpacing="-1px">
        Launch Your Connection in Tableau
      </Heading>

      <Box display="block" fontSize="sm" mb={6}>
        Launch your Tableau application. Utilize the User and Access Information from above to complete the steps outlined in this help document
        inside of Tableau Desktop or Tableau Cloud.
      </Box>

      <Box display="block" fontSize="sm" mb={6}>
        If you are using Tableau desktop you will need to modify your JDBC connection using a properties file before starting the setup steps in the
        help document.
      </Box>

      <AthenaProperties />

      <Box display="block" fontSize="sm" mb={6}>
        {/* @TODO fill this based on testing */}
        If you are using Tableau Cloud you will need to...
      </Box>
    </>
  );
});
