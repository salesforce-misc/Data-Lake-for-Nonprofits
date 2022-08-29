import React from "react";
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";

export const SuccessMessagePanel = observer(() => {
  const installation = useInstallation();
  const deployment = installation.deploymentOperations;

  if (!deployment.isSuccess) return null;

  return (
    <Alert
      mb={6}
      status="success"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="180px"
      borderRadius="md"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        Data Lake is ready!
      </AlertTitle>
      <AlertDescription maxWidth="sm">Great news! We got everything in place and you are ready to proceed to the next step</AlertDescription>
    </Alert>
  );
});
