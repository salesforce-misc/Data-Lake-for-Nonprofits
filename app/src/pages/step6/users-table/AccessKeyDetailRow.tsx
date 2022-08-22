import React from "react";
import { observer } from "mobx-react";
import { Alert, Box, AlertDescription, Button, AlertTitle, useToast, Stack, Text, CloseButton } from "@chakra-ui/react";

import { useInstallation } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { delay } from "helpers/utils";
import { IUser } from "models/helpers/User";
import { TAccessKeyStatus, IUserAccessKey } from "models/helpers/UserAccessKey";
import { useUsersStore } from "models/useUsersStore";

import { DeleteAccessKeyPanel } from "./DeleteAccessKeyPanel";

interface IAccessKeyDetailRow {
  user: IUser;
  userAccessKey: IUserAccessKey;
}

export const AccessKeyDetailRow = observer(({ user, userAccessKey }: IAccessKeyDetailRow) => {
  const { tone, colorScheme } = useColorScheme();
  const installation = useInstallation();
  const { store } = useUsersStore(installation);
  const [deleteSelected, setSelectDelete] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const [error, setError] = React.useState("");
  const toast = useToast();

  if (deleted) return null;

  const isActive = userAccessKey.isActive;

  const handleChangeStatus = async (status: TAccessKeyStatus) => {
    setError("");
    setProcessing(true);
    const action = status === TAccessKeyStatus.Active ? "Activated" : "Deactivated";

    try {
      await delay(1); // To give a better visual cue
      await store.updateAccessKeyStatus(user, userAccessKey, status, installation);
      toast({
        status: status === TAccessKeyStatus.Active ? "success" : "warning",
        description: `${action} ${userAccessKey.id}`,
        isClosable: false,
        duration: 2000,
      });
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
    setProcessing(false);
  };

  const activate = () => handleChangeStatus(TAccessKeyStatus.Active);
  const deactivate = () => handleChangeStatus(TAccessKeyStatus.Inactive);

  return (
    <Box fontSize="sm" pl={6} mt={6} mb={6}>
      {error && (
        <Alert status="error" variant="left-accent" mt={0} mb={4} color="red.700" alignItems="flex-start" fontSize="sm">
          <Box flex="1">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription display="block">{error}</AlertDescription>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" onClick={() => setError("")} />
        </Alert>
      )}

      <Stack direction={{ base: "column", md: "row" }} gap={{ base: 0, md: 0 }} justifyContent="space-between">
        <Text color={isActive ? "green.500" : "gray.400"} w="60px">
          {isActive ? "Active" : "Inactive"}
        </Text>
        <Text color={isActive ? tone(600) : "gray.400"}>Access key ID</Text>
        <Text color={isActive ? tone(600) : "gray.400"}>{userAccessKey.id}</Text>
        <Box textAlign="right">
          {isActive && (
            <Button
              colorScheme={colorScheme}
              variant="solid"
              size="xs"
              mr={4}
              disabled={deleteSelected}
              isLoading={processing}
              onClick={deactivate}
              loadingText="Deactivating"
            >
              Deactivate
            </Button>
          )}
          {!isActive && (
            <Button
              colorScheme={colorScheme}
              variant="solid"
              size="xs"
              mr={4}
              disabled={deleteSelected}
              isLoading={processing}
              onClick={activate}
              loadingText="Activating"
            >
              Activate
            </Button>
          )}
          <Button
            colorScheme="red"
            variant="outline"
            size="xs"
            disabled={deleteSelected || processing}
            onClick={() => {
              setTimeout(() => window.scrollBy(0, 300), 200);
              setSelectDelete(true);
            }}
          >
            Delete
          </Button>
        </Box>
      </Stack>
      {deleteSelected && (
        <DeleteAccessKeyPanel user={user} userAccessKey={userAccessKey} onCancel={() => setSelectDelete(false)} onDeleted={() => setDeleted(true)} />
      )}
    </Box>
  );
});
