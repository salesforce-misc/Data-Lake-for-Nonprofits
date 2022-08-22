import React from "react";
import { observer } from "mobx-react";
import { Td, Tr, Alert, Box, AlertDescription, Button, AlertTitle, useToast, Tooltip, HStack } from "@chakra-ui/react";
import { CheckIcon, ChevronRightIcon, DeleteIcon, NotAllowedIcon } from "@chakra-ui/icons";

import { useInstallation } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { TimeAgo } from "components/TimeAgo";
import { IUser } from "models/helpers/User";
import { useUsersStore } from "models/useUsersStore";

import { AccessDetail } from "./AccessDetail";

interface IUserRow {
  user: IUser;
}

export const UserRow = observer(({ user }: IUserRow) => {
  const installation = useInstallation();
  const { store } = useUsersStore(installation);
  const { tone } = useColorScheme();
  const toast = useToast();
  const [deleteSelected, setSelectDelete] = React.useState(false);
  const [doneDeleting, setDoneDeleting] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);
  const userName = user.name;

  const handleDelete = async () => {
    setError("");
    setProcessing(true);
    try {
      await store.deleteUser(userName, installation);
      setDoneDeleting(true);
      setSelectDelete(false);
      toast({
        status: "success",
        description: `User "${userName}" deleted`,
        isClosable: false,
        duration: 3000,
      });
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
    setProcessing(false);
  };

  if (doneDeleting) return null;

  return (
    <>
      <Tr>
        <Td
          fontSize="sm"
          cursor={deleteSelected ? "default" : "pointer"}
          onClick={() => (deleteSelected ? "" : setExpanded((previous) => !previous))}
        >
          <HStack alignItems="flex-start">
            <ChevronRightIcon transition="transform 0.2s" transform={expanded ? "rotate(90deg)" : "rotate(0deg)"} />
            <Box>{user.name}</Box>
          </HStack>
        </Td>
        <Td fontSize="xs">
          <TimeAgo time={user.createDate} />
        </Td>
        <Td textAlign="center">
          {!user.hasAccess && !deleteSelected && !expanded && (
            <Tooltip label="The user does not have access to the data lake, click for more details">
              <NotAllowedIcon color="red.300" cursor="pointer" onClick={() => setExpanded(true)} />
            </Tooltip>
          )}
          {!user.hasAccess && !deleteSelected && expanded && <NotAllowedIcon color="red.300" />}
          {!user.hasAccess && deleteSelected && <NotAllowedIcon color="red.300" />}
          {user.hasAccess && <CheckIcon color={tone(300)} />}
        </Td>
        {!deleteSelected && !expanded && (
          <Td
            p={0}
            textAlign="center"
            onClick={() => {
              setTimeout(() => window.scrollBy(0, 200), 200);
              setSelectDelete(true);
            }}
            cursor="pointer"
          >
            <DeleteIcon color={tone(500)} />
          </Td>
        )}
        {!deleteSelected && expanded && (
          <Td p={0} textAlign="center">
            <DeleteIcon color={tone(100)} />
          </Td>
        )}
        {deleteSelected && (
          <Td p={0} textAlign="center">
            <DeleteIcon color={tone(100)} />
          </Td>
        )}
      </Tr>
      {deleteSelected && (
        <Tr>
          <Td colSpan={4} pb={8} color="red.800">
            {error && (
              <Alert status="error" variant="left-accent" mt={0} mb={4} color="red.700" alignItems="flex-start" fontSize="sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert status="error" borderRadius="md">
              <Box w="full">
                <AlertTitle>Are you sure?</AlertTitle>
                <AlertDescription fontSize="sm" display="block" mt={2}>
                  Deleting the user will delete all the access keys associated with the user. After which, they no longer can be used with Tableau
                  Desktop to access the data lake.
                </AlertDescription>
                <Box textAlign="right" mt={3}>
                  <Button colorScheme="red" variant="outline" size="sm" disabled={processing} onClick={() => setSelectDelete(false)} mr={4}>
                    Cancel
                  </Button>
                  <Button colorScheme="red" size="sm" isLoading={processing} onClick={handleDelete}>
                    Delete User
                  </Button>
                </Box>
              </Box>
            </Alert>
          </Td>
        </Tr>
      )}

      {!deleteSelected && expanded && (
        <Tr>
          <Td colSpan={4} pb={8}>
            <AccessDetail user={user} />
          </Td>
        </Tr>
      )}
    </>
  );
});
