// Deprecated
import React from "react";
import { Box, Grid, GridItem, Link, Tag } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { useColorScheme } from "../../models/useColorScheme";

export const PreSetupInstructionsWindows = observer(() => {
  const { tone } = useColorScheme();
  return (
    <>
      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              1
            </Tag>
          </GridItem>
          <GridItem colSpan={4} fontWeight="bold" color={tone(600)}>
            Install Microsoft Visual C++ to support Tableau
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            Visit the page to download and run the{" "}
            <Link fontWeight="bold" href="https://docs.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170" isExternal>
              Microsoft Visual C++ 2019 installer from Microsoft <ExternalLinkIcon />
            </Link>
            . If you install Tableau before installing this, the Tableau installation will fail.
          </GridItem>
        </Grid>
      </Box>
    </>
  );
});
