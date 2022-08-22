import React from "react";
import { observer } from "mobx-react";
import { Alert, Box, AlertDescription, Button, AlertTitle, useToast } from "@chakra-ui/react";

import { useInstallation } from "AppContext";
import { delay } from "helpers/utils";
import { IUser } from "models/helpers/User";
import { IUserAccessKey } from "models/helpers/UserAccessKey";
import { useUsersStore } from "models/useUsersStore";

interface IDeleteAccessKeyPanel {
  user: IUser;
  userAccessKey: IUserAccessKey;
  onCancel: () => void;
  onDeleted: () => void;
}

export const DeleteAccessKeyPanel = observer(({ user, userAccessKey, onCancel, onDeleted }: IDeleteAccessKeyPanel) => {
  const installation = useInstallation();
  const { store } = useUsersStore(installation);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState("");
  const toast = useToast();

  const handleDelete = async () => {
    setError("");
    setProcessing(true);
    try {
      await delay(1); // To give a better visual cue
      await store.deleteAccessKey(user, userAccessKey, installation);
      toast({
        status: "warning",
        description: `Deleted ${userAccessKey.id}`,
        isClosable: false,
        duration: 1000,
      });
      onDeleted();
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
    setProcessing(false);
  };

  return (
    <Box mt={4} mb={10}>
      {error && (
        <Alert status="error" variant="left-accent" mt={0} mb={4} color="red.700" alignItems="flex-start" fontSize="sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert status="error" borderRadius="md" color="red.800">
        <Box w="full">
          <AlertTitle>Delete {userAccessKey.id}?</AlertTitle>
          <AlertDescription fontSize="sm" display="block" mt={2}>
            Deleting an access key is permanent and it can not be undone. You will no longer be able to use this access key to query the data lake.
          </AlertDescription>
          <Box textAlign="right" mt={3}>
            <Button colorScheme="red" variant="outline" size="sm" disabled={processing} onClick={onCancel} mr={4}>
              Cancel
            </Button>
            <Button colorScheme="red" size="sm" isLoading={processing} onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </Box>
      </Alert>
    </Box>
  );
});
