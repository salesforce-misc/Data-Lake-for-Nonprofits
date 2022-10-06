import React from "react";
import { Box, Button, FormControl, Input, FormErrorMessage, Alert, AlertDescription, useToast } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { SubmitHandler, useForm } from "react-hook-form";

import { useInstallation } from "AppContext";
import { DownloadableAccessKey } from "pages/step6/tableau-desktop/DownloadableAccessKey";
import { useColorScheme } from "models/useColorScheme";
import { IUserAccessKey } from "models/helpers/UserAccessKey";
import { useUsersStore } from "models/useUsersStore";

interface IFormInput {
  userName: string;
}

interface ICreateUserForm {
  onClose: () => void;
}

export const CreateUserForm = observer(({ onClose }: ICreateUserForm) => {
  const installation = useInstallation();
  const toast = useToast();
  const { store } = useUsersStore(installation);
  const { tone, colorScheme } = useColorScheme();
  const [accessKey, setAccessKey] = React.useState<IUserAccessKey>();
  const [userName, setUserName] = React.useState<string>();
  const [error, setError] = React.useState<string>("");

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
