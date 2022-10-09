import React from "react";
import { Box, HStack, Heading } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { UsersTable } from "pages/step6/tableau-desktop/users-table/UsersTable";
import { useColorScheme } from "models/useColorScheme";

import { RefreshButton } from "./RefreshButton";
import { ErrorPanel } from "./ErrorPanel";
import { ProgressPanel } from "./ProgressPanel";
import { InfoBanner } from "./InfoBanner";

export const UsersPanel = observer(() => {
  const { tone } = useColorScheme();

  return (
    <>
      <HStack justifyContent="space-between" pb="20px">
        <Heading size="md" color={tone(600)} letterSpacing="-1px">
          Users
        </Heading>
        <RefreshButton />
      </HStack>

      <Box mb={4} color={tone(800)}>
        Create users who will need access to the data. These users will have <i>least privilege</i> credentials to access only the data and resources
        they need.
      </Box>

      <ErrorPanel />
      <ProgressPanel />
      <InfoBanner />
      <UsersTable />
    </>
  );
});
