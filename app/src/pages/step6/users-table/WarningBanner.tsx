import React from "react";
import { observer } from "mobx-react";
import { Alert, Box, AlertDescription, Button, AlertTitle, useToast, CloseButton } from "@chakra-ui/react";

import { useInstallation } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { delay } from "helpers/utils";
import { IUser, TUserAccessStatus } from "models/helpers/User";
import { useUsersStore } from "models/useUsersStore";

interface IWarningBanner {
  user: IUser;
}

export const WarningBanner = observer(({ user }: IWarningBanner) => {
  const { colorScheme } = useColorScheme();
  const installation = useInstallation();
  const { store } = useUsersStore(installation);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState("");
  const toast = useToast();

  const handleAttachPolicy = async () => {
    setError("");
    setProcessing(true);

    try {
      await delay(1); // To give a better visual cue
      await store.attachAthenaPolicy(user, installation);
      toast({
        status: "success",
        description: "Policy attached",
        isClosable: false,
        duration: 1000,
      });
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
    setProcessing(false);
  };

  let content = null;
  if (user.hasAccess) return null;
  if (user.accessStatus === TUserAccessStatus.No_Keys) {
    // @ts-ignore
    content = (
      <Alert status="warning" mt={0} mb={4} borderRadius="md" color="red.700" alignItems="flex-start" fontSize="sm">
        <AlertDescription>
          The user does not have access to the data lake because there are no access keys associated with the user. Create an access key for the user
          using the button below.
        </AlertDescription>
      </Alert>
    );
  }

  if (user.accessStatus === TUserAccessStatus.No_Active_Keys) {
    // @ts-ignore
    content = (
      <Alert status="warning" mt={0} mb={4} borderRadius="md" color="red.700" alignItems="flex-start" fontSize="sm">
        <AlertDescription>
          The user does not have access to the data lake because all the access keys are inactive. Activate one for the user to gain access.
        </AlertDescription>
      </Alert>
    );
  }

  if (user.accessStatus === TUserAccessStatus.No_POLICY) {
    // @ts-ignore
    content = (
      <Alert status="warning" mt={0} mb={4} borderRadius="md" color="red.700" alignItems="flex-start" fontSize="sm">
        <Box>
          <AlertDescription>
            The user does not have access to the data lake because the necessary policy is not attached to the user. Click the 'Attach Policy' button
            to attempt to remedy the problem.
          </AlertDescription>
          <Box textAlign="right" mt={4}>
            <Button colorScheme={colorScheme} size="xs" isLoading={processing} loadingText="Attaching Policy" onClick={handleAttachPolicy}>
              Attach Policy
            </Button>
          </Box>
        </Box>
      </Alert>
    );
  }

  return (
    <>
      {error && (
        <Alert status="error" variant="left-accent" mt={0} mb={4} color="red.700" alignItems="flex-start" fontSize="sm">
          <Box flex="1">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription display="block">{error}</AlertDescription>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" onClick={() => setError("")} />
        </Alert>
      )}

      {content}
    </>
  );
});
