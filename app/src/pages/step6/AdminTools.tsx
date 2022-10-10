import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { CloudwatchDashboardPanel } from "pages/step6/CloudwatchDashboardPanel";
import { SubscribeSNSPanel } from "pages/step6/SubscribeSNSPanel";
import { useColorScheme } from "models/useColorScheme";

export const AdminTools = observer(() => {
  const [expanded, setExpanded] = React.useState(false);
  const { tone } = useColorScheme();
  const installation = useInstallation();

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
        Admin Tools
        <ChevronRightIcon transition="transform 0.2s" transform={expanded ? "rotate(0deg)" : "rotate(90deg)"} />
      </Heading>

      {expanded && (
        <Box>
          <Box display="block" fontSize="sm" mb={6}>
            You can use these admin features to monitor the ongoing health of your data lake
          </Box>

          <Box borderRadius="md" boxShadow="base" bg={tone(100)} mt={4} p={10} pb={10} position="relative">
            <SubscribeSNSPanel />
          </Box>

          <Box borderRadius="md" boxShadow="base" bg={tone(100)} mt={4} p={10} pb={10} mb={6} position="relative">
            <CloudwatchDashboardPanel region={installation.region} id={installation.id} />
          </Box>
        </Box>
      )}
    </>
  );
});
