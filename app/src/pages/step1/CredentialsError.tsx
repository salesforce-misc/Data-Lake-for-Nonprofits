import { FC } from "react";
import { observer } from "mobx-react";
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, ListItem, UnorderedList } from "@chakra-ui/react";

import { CredentialsValidationErrorCode, CredentialsValidationException } from "../../api/validate-credentials";

export const CredentialsError: FC<{ exception?: CredentialsValidationException | Error }> = observer(({ exception }) => {
  if (!exception) return null;

  let title: string;
  let content: React.ReactElement = <></>;

  if (exception instanceof CredentialsValidationException) {
    title = "A problem with the access keys";
    switch (exception?.code) {
      case CredentialsValidationErrorCode.InvalidKeys:
        content = (
          <Box>
            The keys are invalid. This could be due to one or more of the following reasons:
            <UnorderedList ml={5} mt={2}>
              <ListItem>The keys are incorrect, check that you are using the correct values</ListItem>
              <ListItem>The access keys are deactivated</ListItem>
              <ListItem>The access keys are deleted and therefore no longer valid</ListItem>
            </UnorderedList>
          </Box>
        );
        break;
      case CredentialsValidationErrorCode.NotAdmin:
        content = (
          <Box>
            The keys are valid but they are for a user who does not have admin permissions. Add the <b>AdministratorAccess</b> policy to the user and
            try again.
          </Box>
        );
        break;
      case CredentialsValidationErrorCode.AccountMismatch:
        content = <Box>The keys are for a different AWS account.</Box>;
        break;

      default:
        content = (
          <Box>
            We are unable to validate the keys. This could be due to one or more of the following reasons:
            <UnorderedList ml={5} mt={2} mb={3}>
              <ListItem>A problem with the internet connection</ListItem>
              <ListItem>An intermittent problem while trying to validate the keys</ListItem>
            </UnorderedList>
            Try again in a few minutes
          </Box>
        );
        break;
    }
  } else {
    title = "A problem has been encountered";
    content = (
      <Box>
        We are unable to proceed to the next step. This could be due to one or more of the following reasons:
        <UnorderedList ml={5} mt={2} mb={3}>
          <ListItem>A problem with the internet connection</ListItem>
          <ListItem>An intermittent problem while trying to proceed to the next step</ListItem>
        </UnorderedList>
        Try again in a few minutes
      </Box>
    );
  }

  return (
    <Alert status="error" variant="left-accent" mt={5} color="red.700" alignItems="flex-start" borderColor="red.600">
      <AlertIcon mt="3px" color="red.600" />
      <Box>
        <AlertTitle mr={2}>{title}</AlertTitle>
        <AlertDescription>{content}</AlertDescription>
      </Box>
    </Alert>
  );
});
