import { FC, useState } from "react";
import isEmpty from "lodash/isEmpty";
import { Box, Heading, Button, FormErrorMessage, FormControl, Input, Alert, AlertIcon, InputGroup, InputRightElement } from "@chakra-ui/react";
import { UseFormRegister, FieldErrors, useWatch, Control } from "react-hook-form";

import { useStore } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { accessKey, secretKey } from "helpers/settings";

export interface ICredentialsFormInput {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}
export interface ICredentialsForm {
  register: UseFormRegister<ICredentialsFormInput>;
  errors: FieldErrors<ICredentialsFormInput>;
  isSubmitting: boolean;
  control: Control<ICredentialsFormInput>;
}

export const CredentialsForm = ({ register, errors, isSubmitting, control }: ICredentialsForm) => {
  const store = useStore();
  const { tone, colorScheme } = useColorScheme();
  const credentials = store.credentials;
  const accessKeyDefaultValue = credentials.accessKey || accessKey;
  const secretKeyDefaultValue = credentials.secretKey || secretKey;
  const secretKeyValue = useWatch({ control, name: "secretAccessKey", defaultValue: secretKeyDefaultValue });
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  return (
    <Box p={6} borderRadius="lg" boxShadow="base" bg={tone(50)}>
      <Heading size="sm" pt="5px" pb="20px" color={tone(600)}>
        Access Key ID &amp; Secret Access Key
      </Heading>

      {/* @ts-ignore */}
      <FormControl isInvalid={errors.accessKeyId || errors.secretAccessKey}>
        <Input
          id="accessKeyId"
          placeholder="Access key id"
          defaultValue={accessKeyDefaultValue}
          {...register("accessKeyId", { required: "Required" })}
          focusBorderColor={tone(700)}
          bg={tone(75)}
          disabled={isSubmitting}
        />
        <FormErrorMessage>{errors.accessKeyId && errors.accessKeyId.message}</FormErrorMessage>

        <InputGroup size="md" mt={5}>
          <Input
            pr="4.5rem"
            type={show ? "text" : "password"}
            placeholder="Secret access key"
            id="secretAccessKey"
            defaultValue={secretKeyDefaultValue}
            {...register("secretAccessKey", { required: "Required" })}
            focusBorderColor={tone(700)}
            bg={tone(75)}
            disabled={isSubmitting}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={handleClick}
              colorScheme={colorScheme}
              variant="outline"
              _focus={{ boxShadow: "none" }}
              isDisabled={isEmpty(secretKeyValue)}
            >
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>

        <FormErrorMessage>{errors.secretAccessKey && errors.secretAccessKey.message}</FormErrorMessage>
        <Alert status="warning" variant="left-accent" mt={5} fontSize="sm">
          <AlertIcon />
          Secret access keys are sensitive information, keep them secured and protected, never post them on public platforms or leave them unsecured
          as this can compromise your account security
        </Alert>
      </FormControl>
    </Box>
  );
};
