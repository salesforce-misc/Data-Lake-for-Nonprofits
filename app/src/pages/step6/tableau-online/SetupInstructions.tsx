import React from "react";
import { Box, Text, Link, Alert, AlertIcon, AlertTitle, AlertDescription, Select, Grid, GridItem, Tag } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";

import { PostgreSqlAccessInformation } from "./PostgreSqlAccessInformation";

export const SetupInstructions = observer(() => {
  const { tone } = useColorScheme();

  return (
    <Box>
      {/* <Box borderRadius="lg" bg={tone(75)} mt={4} p={10} pt={4} pb={4} position="relative">
        <UsersPanel />
      </Box> */}

      <Box borderRadius="lg" bg={tone(75)} mt={4} p={10} pt={4} pb={4} position="relative">
        <PostgreSqlAccessInformation />
      </Box>

      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              1
            </Tag>
          </GridItem>
          <GridItem colSpan={4} fontWeight="bold" color={tone(600)}>
            Download Athena Plugin
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            Visit the{" "}
            <Link fontWeight="bold" href="https://docs.aws.amazon.com/athena/latest/ug/connect-with-jdbc.html#download-the-jdbc-driver" isExternal>
              Using Athena with the JDBC Driver <ExternalLinkIcon />
            </Link>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
});
