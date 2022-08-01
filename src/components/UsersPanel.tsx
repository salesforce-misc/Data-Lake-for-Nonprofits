import { FC, useState } from "react";
import {
  Box,
  HStack,
  Heading,
  Text,
  Progress,
  IconButton,
  Button,
  FormControl,
  Input,
  FormErrorMessage,
  Alert,
  AlertDescription,
  useToast,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { SubmitHandler, useForm } from "react-hook-form";

import { useInstallation } from "../AppContext";
import { useColorScheme } from "../models/useColorScheme";
import { IUserAccessKey, useUsersStore } from "../models/UsersStore";
import { RetryErrorPanel } from "./RetryErrorPanel";
import { DownloadableAccessKey } from "./DownloadableAccessKey";
import { UsersTable } from "./UsersTable";

export const UsersPanel: FC = observer(() => {
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
        Create users who will need access to the data. These users will have <i>least privilege</i> credentials to access only the data and resources they need.
      </Box>
      <ErrorPanel />
      <ProgressPanel />
      <InfoBanner />
      <UsersTable />
    </>
  );
});

const InfoBanner: FC = observer(() => {
  const installation = useInstallation();
  const [isAdding, setAdding] = useState(false);
  const { isError, isLoading, isReloading } = useUsersStore(installation);
  const { tone, colorScheme } = useColorScheme();

  if (isError) return null;

  return (
    <Box bg={tone(75)} p={3} borderRadius="md" mb={5} color={tone(700)}>
      <Text display="block" fontSize="sm" mb={2}>
        When connecting to your data lake, you need access keys. Access keys are associated with users. Add a user to obtain the
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

interface IFormInput {
  userName: string;
}

const CreateUserForm: FC<{ onClose: () => void }> = observer(({ onClose }) => {
  const installation = useInstallation();
  const toast = useToast();
  const { store } = useUsersStore(installation);
  const { tone, colorScheme } = useColorScheme();
  const [accessKey, setAccessKey] = useState<IUserAccessKey>();
  const [userName, setUserName] = useState<string>();
  const [error, setError] = useState("");

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (values) => {
    const userNameValue = values.userName;
    setError("");

    try {
      const user = await store.createAthenaUser(userNameValue, installation);
      const accessKeys = user.listAccessKeys;
      if (accessKeys.length > 0) {
        setAccessKey(user.listAccessKeys[0]);
        setUserName(user.name);
      }
      toast({
        status: "success",
        description: `User "${user.name}" created`,
        isClosable: false,
        duration: 3000,
      });
      setTimeout(() => window.scrollBy(0, 300), 250);
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
  };

  const validationOptions = {
    required: "A user name can not be empty",
    maxLength: { value: 64, message: "A user name can not be more than 64 characters long" },
    pattern: { value: /^[\w+=,.@-]{1,64}$/, message: "A user name can ONLY contain alphanumeric characters, or any of the following: _+=,.@-" },
  };

  // userName validation https://docs.aws.amazon.com/IAM/latest/APIReference/API_CreateUser.html
  return (
    <>
      {error && (
        <Alert status="error" variant="left-accent" mt={3} mb={0} color="red.700" alignItems="flex-start" fontSize="sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!accessKey && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl isInvalid={errors.userName !== undefined} mt={4}>
            <Input
              id="userName"
              placeholder="Type user name"
              {...register("userName", validationOptions)}
              focusBorderColor={tone(700)}
              bg={tone(25)}
              disabled={isSubmitting}
            />
            <FormErrorMessage ml={3} color="red.600">
              {errors.userName && errors.userName.message}
            </FormErrorMessage>
          </FormControl>
          <Box textAlign="right">
            <Button mt={4} mr={3} colorScheme={colorScheme} variant="outline" disabled={isSubmitting} size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button mt={4} colorScheme={colorScheme} isLoading={isSubmitting} type="submit" size="sm">
              Submit
            </Button>
          </Box>
        </form>
      )}
      {accessKey && <DownloadableAccessKey userAccessKey={accessKey} userName={userName as string} onDone={onClose} />}
    </>
  );
});

const RefreshButton: FC = observer(() => {
  const installation = useInstallation();
  const { isLoading, isReloading, store } = useUsersStore(installation);
  const { colorScheme } = useColorScheme();

  return (
    <IconButton
      colorScheme={colorScheme}
      variant="outline"
      size="xs"
      aria-label="Check again"
      onClick={() => store.load(installation)}
      icon={<RepeatIcon />}
      isLoading={isLoading || isReloading}
      _focus={{ boxShadow: "none" }}
    />
  );
});

const ProgressPanel: FC = observer(() => {
  const installation = useInstallation();
  const { isError, isLoading, isReloading } = useUsersStore(installation);
  const { tone, colorScheme } = useColorScheme();

  if (isError) return null;
  if (!isLoading && !isReloading) return null;

  return <Progress size="sm" isIndeterminate colorScheme={colorScheme} bg={tone(100)} borderRadius="lg" mb={4} mt={0} />;
});

const ErrorPanel: FC = observer(() => {
  const installation = useInstallation();
  const { isError, store } = useUsersStore(installation);

  if (!isError) return null;

  const message =
    "Something went wrong and we are unable to connect to your AWS account to get the list of users. This might be an intermittent problem. Wait for a few minutes and try again.";

  return <RetryErrorPanel errorMessage={message} errorDetail="" onRetry={() => store.load(installation)} />;
});
