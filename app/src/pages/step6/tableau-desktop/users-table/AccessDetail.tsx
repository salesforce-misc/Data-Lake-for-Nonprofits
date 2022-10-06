import React from "react";
import { observer } from "mobx-react";
import { Alert, Box, AlertDescription, Button, AlertTitle, useToast, Tooltip, Text, CloseButton } from "@chakra-ui/react";

import { useInstallation } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { DownloadableAccessKey } from "pages/step6/tableau-desktop/DownloadableAccessKey";
import { delay } from "helpers/utils";
import { IUser } from "models/helpers/User";
import { IUserAccessKey } from "models/helpers/UserAccessKey";
import { useUsersStore } from "models/useUsersStore";

import { WarningBanner } from "./WarningBanner";
import { AccessKeyDetailRow } from "./AccessKeyDetailRow";

interface IAccessDetail {
  user: IUser;
}

export const AccessDetail = observer(({ user }: IAccessDetail) => {
  const { tone, colorScheme } = useColorScheme();
  const installation = useInstallation();
  const { store } = useUsersStore(installation);
  const [addingAccessKey, setAddingAccessKey] = React.useState(false);
  const [accessKey, setAccessKey] = React.useState<IUserAccessKey>();
  const [error, setError] = React.useState("");
  const toast = useToast();

  const accessKeys = user.listAccessKeys;
  const maxReached = user.listAccessKeys.length > 1;
  const isDisabled = maxReached;

  const handleAdd = async () => {
    setError("");
    setAddingAccessKey(true);

    try {
      await delay(1); // To give a better visual cue
      const newAccessKey = await store.createAccessKey(user, installation);
      toast({
        status: "success",
        description: `Created ${newAccessKey.id}`,
        isClosable: false,
        duration: 1000,
      });
      setAccessKey(newAccessKey);
      setTimeout(() => window.scrollBy(0, 300), 250);
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
    setAddingAccessKey(false);
  };

  const addButton = (
    <Button
      colorScheme={colorScheme}
      variant="outline"
      size="xs"
      disabled={isDisabled}
      isLoading={addingAccessKey}
      loadingText="Creating access key"
      onClick={handleAdd}
    >
      Create Access Key
    </Button>
  );

  return (
    <>
      <WarningBanner user={user} />
      {accessKeys.map((item) => (
        <AccessKeyDetailRow key={item.id} user={user} userAccessKey={item} />
      ))}
      {error && (
        <Alert status="error" variant="left-accent" mt={0} mb={4} color="red.700" alignItems="flex-start" fontSize="sm">
          <Box flex="1">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription display="block">{error}</AlertDescription>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" onClick={() => setError("")} />
        </Alert>
      )}

      {accessKey && (
        <Box bg={tone(75)} p={3} borderRadius="md" mb={5} color={tone(700)}>
          <DownloadableAccessKey userName={user.name} userAccessKey={accessKey} onDone={() => setAccessKey(undefined)} />
        </Box>
      )}
      <Box textAlign="right">
        {maxReached && (
          <Tooltip shouldWrapChildren label="You can only have a maximum of 2 access keys">
            {addButton}
          </Tooltip>
        )}
        {!maxReached && addButton}
      </Box>
      {accessKeys.length > 0 && (
        <Box p={3} pl={6} mt={5} color={tone(700)} fontSize="sm" bg={tone(50)} borderRadius="md">
          <Text fontWeight="bold">Lost the secret keys?</Text>
          <Text>There is no way to retrieve the secret keys. However, you can delete an existing one and create a new one.</Text>
        </Box>
      )}
    </>
  );
});
