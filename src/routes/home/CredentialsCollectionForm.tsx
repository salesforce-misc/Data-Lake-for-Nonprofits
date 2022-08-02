import React from "react";
import { Box, Button } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { SubmitHandler, useForm } from "react-hook-form";

import { CredentialsForm, ICredentialsFormInput } from "components/CredentialsForm";
import { CredentialsError } from "components/CredentialsError";
import { CredentialsValidationException } from "api/validate-credentials";
import { useDetectedInstallationStore } from "models/DetectedInstallationsStore";
import { useColorScheme } from "models/useColorScheme";

interface ICredentialsCollectionForm {
  onCancel: () => void;
  onDone: () => void;
}

export const CredentialsCollectionForm = observer(({ onCancel, onDone }: ICredentialsCollectionForm) => {
  const { colorScheme } = useColorScheme();
  const [error, setError] = React.useState<CredentialsValidationException | Error>();
  const { store } = useDetectedInstallationStore();

  const onSubmit: SubmitHandler<ICredentialsFormInput> = async (values) => {
    setError(undefined);
    const accessKey = values.accessKeyId;
    const secretKey = values.secretAccessKey;
    try {
      await store.connectToAws(accessKey, secretKey);
      try {
        store.load(); // Trigger the loading but don't bother with status and errors, they are all handled later
      } catch (err) {
        console.error(err);
      }

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
        >
          Continue
        </Button>
      </Box>
    </>
  );
});
