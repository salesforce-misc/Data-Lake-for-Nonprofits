import { FC, useState } from "react";
import { observer } from "mobx-react";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Alert,
  Box,
  AlertDescription,
  Button,
  AlertTitle,
  useToast,
  Tooltip,
  HStack,
  Stack,
  Text,
  CloseButton,
} from "@chakra-ui/react";
import { CheckIcon, ChevronRightIcon, DeleteIcon, NotAllowedIcon } from "@chakra-ui/icons";

import { useInstallation } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { TimeAgo } from "components/TimeAgo";
import { DownloadableAccessKey } from "components/DownloadableAccessKey";
import { delay } from "helpers/utils";
import { useUsersStore } from "models/UsersStore";
import { IUser, TUserAccessStatus } from "models/helpers/User";
import { TAccessKeyStatus, IUserAccessKey } from "models/helpers/UserAccessKey";

export const UsersTable: FC = observer(() => {
  const { colorScheme } = useColorScheme();
  const installation = useInstallation();
  const { isLoading, store } = useUsersStore(installation);

  if (isLoading) return null;
  if (store.empty) return null;

  return (
    <Table variant="simple" mt={3} colorScheme={colorScheme} size="md" mb={6}>
      <Thead>
        <Tr>
          <Th pl="40px">User</Th>
          <Th w="150px">Created</Th>
          <Th w="90px">Access</Th>
          <Th w="20px"></Th>
        </Tr>
      </Thead>
      <Tbody>
        {store.listUsers.map((user) => (
          <UserRow key={user.name} user={user} />
        ))}
      </Tbody>
    </Table>
  );
});

const UserRow: FC<{ user: IUser }> = observer(({ user }) => {
  const installation = useInstallation();
  const { store } = useUsersStore(installation);
  const { tone } = useColorScheme();
  const toast = useToast();
  const [deleteSelected, setSelectDelete] = useState(false);
  const [doneDeleting, setDoneDeleting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
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

const AccessDetail: FC<{ user: IUser }> = observer(({ user }) => {
  const { tone, colorScheme } = useColorScheme();
  const installation = useInstallation();
  const { store } = useUsersStore(installation);
  const [addingAccessKey, setAddingAccessKey] = useState(false);
  const [accessKey, setAccessKey] = useState<IUserAccessKey>();
  const [error, setError] = useState("");
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

const WarningBanner: FC<{ user: IUser }> = observer(({ user }) => {
  const { colorScheme } = useColorScheme();
  const installation = useInstallation();
  const { store } = useUsersStore(installation);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
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

const AccessKeyDetailRow: FC<{ user: IUser; userAccessKey: IUserAccessKey }> = observer(({ user, userAccessKey }) => {
  const { tone, colorScheme } = useColorScheme();
  const installation = useInstallation();
  const { store } = useUsersStore(installation);
  const [deleteSelected, setSelectDelete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");
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

const DeleteAccessKeyPanel: FC<{ user: IUser; userAccessKey: IUserAccessKey; onCancel: () => void; onDeleted: () => void }> = observer(
  ({ user, userAccessKey, onCancel, onDeleted }) => {
    const installation = useInstallation();
    const { store } = useUsersStore(installation);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
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
  }
);
