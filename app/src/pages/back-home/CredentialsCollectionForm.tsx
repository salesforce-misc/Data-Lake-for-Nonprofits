import React from "react";
import { Box, Button } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { SubmitHandler, useForm } from "react-hook-form";

import { useInstallation } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { CredentialsValidationException } from "api/validate-credentials";

import { CredentialsForm, ICredentialsFormInput } from "pages/step1/CredentialsForm";
import { CredentialsError } from "pages/step1/CredentialsError";

interface ICredentialsCollectionForm {
  onCancel: () => void;
  onDone: () => void;
  buttonTitle?: string;
}

export const CredentialsCollectionForm = observer(({ onCancel, onDone, buttonTitle = "Resume" }: ICredentialsCollectionForm) => {
  const { colorScheme } = useColorScheme();
  const [error, setError] = React.useState<CredentialsValidationException | Error>();
  const installation = useInstallation();

  const onSubmit: SubmitHandler<ICredentialsFormInput> = async (values) => {
    setError(undefined);
    const accessKey = values.accessKeyId;
    const secretKey = values.secretAccessKey;
    const region = installation.region;

    try {
      await installation.connectToAwsStep.connectToAws(accessKey, secretKey, region);
      if (installation.isPostDeployment) installation.metadataStore.reset();

      return onDone();
    } catch (err: any) {
      console.log(err);
      setError(err);
    }
  };

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ICredentialsFormInput>();

  const buttonProps: any = {};
  if (buttonTitle === "Resume") buttonProps.rightIcon = <ArrowForwardIcon />;

  return (
    <>
      <CredentialsError exception={error} />

      <Box pt={6}>
        {/* @ts-ignore */}
        <CredentialsForm {...{ register, errors, isSubmitting, control }} />
      </Box>

      <Box textAlign="right" w="full" mt={6} mb={0}>
        <Button colorScheme={colorScheme} size="md" disabled={isSubmitting} variant="ghost" onClick={() => onCancel()}>
          Cancel
        </Button>
        <Button
          colorScheme={colorScheme}
          size="md"
          loadingText="Connecting"
          ml={3}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          onClick={handleSubmit(onSubmit)}
          {...buttonProps}
        >
          {buttonTitle}
        </Button>
      </Box>
    </>
  );
});
