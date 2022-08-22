import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { useUsersStore } from "models/useUsersStore";

import { CreateUserForm } from "./CreateUserForm";

export const InfoBanner = observer(() => {
  const [isAdding, setAdding] = React.useState(false);
  const installation = useInstallation();
  const { isError, isLoading, isReloading } = useUsersStore(installation);
  const { tone, colorScheme } = useColorScheme();

  if (isError) return null;

  return (
    <Box bg={tone(75)} p={3} borderRadius="md" mb={5} color={tone(700)}>
      <Text display="block" fontSize="sm" mb={2}>
        When using Tableau to connect to your data lake, you need AWS IAM access keys. Access keys are associated with users. Add a user to obtain the
        access keys.
      </Text>

      {!isAdding && (
        <Box textAlign="right">
          <Button colorScheme={colorScheme} size="sm" disabled={isError || isLoading || isReloading || isAdding} onClick={() => setAdding(true)}>
            Add User
          </Button>
        </Box>
      )}
      {isAdding && <CreateUserForm onClose={() => setAdding(false)} />}
    </Box>
  );
});
