import React from "react";
import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useStore } from "AppContext";
import { useColorScheme } from "models/useColorScheme";

import { StartNewWarning } from "./StartNewWarning";
import { CredentialsCollectionForm } from "./CredentialsCollectionForm";

export const ManagePanel = observer(() => {
  const store = useStore();
  const { tone, colorScheme } = useColorScheme();
  const [collectCredentials, setCollectCredentials] = React.useState(false);
  const [warning, setWarning] = React.useState(false);

  React.useEffect(() => {
    if (collectCredentials || warning) setTimeout(() => window.scrollBy(0, 300), 200);
  }, [collectCredentials, warning]);

  return (
    <>
      <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={6} p={10} pb={6} color={tone(800)}>
        <Heading size="md" pt="0px" pb="10px" color={tone(600)} letterSpacing="-1px">
          Manage data lake
        </Heading>
        <Text>
          You can manage users, see the latest data import status and more. Click <b>Manage</b> to unlock these capabilities. We will ask you for your
          AWS admin credentials so that we can connect to your AWS account.
        </Text>
        {!collectCredentials && !warning && (
          <Box textAlign="right" w="full" mt={6} mb={0}>
            <Button colorScheme={colorScheme} size="md" variant="outline" mr={6} onClick={() => setWarning(true)}>
              Start New
            </Button>
            <Button colorScheme={colorScheme} size="md" onClick={() => setCollectCredentials(true)}>
              Manage
            </Button>
          </Box>
        )}
      </Box>

      {warning && <StartNewWarning onCancel={() => setWarning(false)} onContinue={() => store.newInstallation()} />}

      {collectCredentials && (
        <CredentialsCollectionForm
          buttonTitle="Manage"
          onCancel={() => setCollectCredentials(false)}
          onDone={() => {
            setCollectCredentials(false);
          }}
        />
      )}
    </>
  );
});
