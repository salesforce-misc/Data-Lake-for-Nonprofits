import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { AthenaProperties } from "pages/step6/AthenaProperties";
import { ChevronRightIcon } from "@chakra-ui/icons";

export const LaunchYourConnection = observer(() => {
  const { tone } = useColorScheme();
  const [expanded, setExpanded] = React.useState(false);

  return (
    <>
      <Heading size="md" pt="0px" pb="30px" color={tone(600)} letterSpacing="-1px">
        Launch Your Connection in Tableau
      </Heading>

      <Box display="block" fontSize="sm" mb={6}>
        Launch your Tableau application. Utilize the User and Access Information from above to complete the steps outlined in this help document
        inside of Tableau Desktop or Tableau Cloud.
      </Box>

      <Heading
        cursor="pointer"
        onClick={() => setExpanded((previous) => !previous)}
        size="sm"
        pt="0px"
        pb="20px"
        color={tone(600)}
        letterSpacing="-1px"
      >
        Special Considerations for using Tableau Desktop
        <ChevronRightIcon transition="transform 0.2s" transform={expanded ? "rotate(0deg)" : "rotate(90deg)"} />
      </Heading>

      {expanded && (
        <>
          <Box display="block" fontSize="sm" mb={6}>
            If you are using Tableau desktop you will need to modify your JDBC connection using a properties file before starting the setup steps in
            the help document.
          </Box>

          <AthenaProperties />
        </>
      )}

      <Box display="block" fontSize="sm" mb={6}>
        {/* @TODO fill this based on testing */}
        If you are using Tableau Cloud you will need to...
      </Box>
    </>
  );
});
