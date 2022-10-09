import React from "react";
import { Box, Grid, GridItem, Image, Tag } from "@chakra-ui/react";
import { observer } from "mobx-react";

import selectPostgreSQL from "images/select-postgresql-connector.png";
import tableauPostgresCreds from "images/tableau-postgres-creds.png";

import { useColorScheme } from "models/useColorScheme";

import { PostgreSqlAccessInformation } from "./PostgreSqlAccessInformation";

export const SetupInstructions = observer(() => {
  const { tone } = useColorScheme();

  return (
    <Box>
      <Box borderRadius="lg" bg={tone(75)} mt={4} mb={3} p={10} pt={4} pb={4} position="relative">
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
            Select PostgreSQL connector.
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            Add a connector using PostgreSQL option.
            <Image my={5} ml={0} src={selectPostgreSQL} />
          </GridItem>
        </Grid>
      </Box>

      <Box minH="100px" borderRadius="lg" bg={tone(75)} mb={3}>
        <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
          <GridItem rowSpan={2} colSpan={1} pr={4}>
            <Tag color={tone(500)} bg={tone(200)} borderRadius="full" size="lg" fontWeight="bold">
              2
            </Tag>
          </GridItem>
          <GridItem colSpan={4} fontWeight="bold" color={tone(600)}>
            Utilize connection credentials
          </GridItem>
          <GridItem colSpan={4} color={tone(800)}>
            Use the connection credentials from above in order to connect to PostgreSQL database.
            <Image my={5} ml={0} src={tableauPostgresCreds} />
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
});
