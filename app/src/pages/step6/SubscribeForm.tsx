import React from "react";
import { Alert, AlertDescription, Box, Button, FormControl, FormErrorMessage, Input, useToast } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { SubmitHandler, useForm } from "react-hook-form";

import { useInstallation } from "AppContext";
import { subscribeSNS } from "api/subscribe-sns";
import { useColorScheme } from "models/useColorScheme";

interface IFormInput {
  email: string;
}

export const SubscribeForm = observer(() => {
  const installation = useInstallation();
  const toast = useToast();
  const { tone, colorScheme } = useColorScheme();
  const [error, setError] = React.useState("");

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (values) => {
    const emailValue = values.email;
    setError("");

    try {
      await subscribeSNS({
        accessKey: installation.credentials.accessKey,
        secretKey: installation.credentials.secretKey,
        region: installation.region,
        email: emailValue,
        topicArn: installation.snsTopicArn,
      });
      toast({
        status: "success",
        description: `Email "${emailValue}" subscribed!`,
        isClosable: false,
        duration: 10_000,
      });
      setTimeout(() => {
        window.scrollBy(0, 300);
        reset();
        setFocus("email");
      }, 250);
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
  };

  const validationOptions = {
    required: "An email address can not be empty",
    maxLength: { value: 64, message: "An email address can not be more than 64 characters long" },
    pattern: { value: /^.+?@.+?\..{2,}$/, message: "An email address should fit the form username@organization.org" },
  };

  return (
    <>
      {error && (
        <Alert status="error" variant="left-accent" mt={3} mb={0} color="red.700" alignItems="flex-start" fontSize="sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={errors.email !== undefined} mt={4}>
          <Input
            id="email"
            placeholder="you@organization.org"
            {...register("email", validationOptions)}
            focusBorderColor={tone(700)}
            bg={tone(25)}
            disabled={isSubmitting}
          />
          <FormErrorMessage ml={3} color="red.600">
            {errors.email && errors.email.message}
          </FormErrorMessage>
        </FormControl>
        <Box textAlign="right">
          <Button mt={4} colorScheme={colorScheme} isLoading={isSubmitting} type="submit" size="sm">
            Subscribe
          </Button>
        </Box>
      </form>
    </>
  );
});
