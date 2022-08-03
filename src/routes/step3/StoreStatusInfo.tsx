import React from "react";
import { Box, Button, Progress, Alert, AlertIcon } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useMetadataStore } from "models/MetadataStore";
import { useColorScheme } from "models/useColorScheme";

export const StoreStatusInfo = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const { isReady, isError, store } = useMetadataStore();
  const progress = store.loadingPercentage;

  const handleTryAgain = () => {
    store.load();
  };

  return (
    (isError && (
      <Alert status="error" variant="left-accent" mt={0} mb={0} color="red.700" alignItems="flex-end">
        <AlertIcon alignSelf="flex-start" />
        <Box>
          <Box>
            Something went wrong and we are unable to connect to your Salesforce organization to get the data schema. This might be an intermittent
            problem. Wait for a few minutes and try again.
          </Box>
          <Box textAlign="right" w="full" mt={4}>
            <Button colorScheme="red" size="sm" onClick={handleTryAgain} loadingText="Processing" isLoading={!isError}>
              Try Again
            </Button>
          </Box>
        </Box>
      </Alert>
    )) ||
    (isReady && null) || (
      <Box mt={2} mb={4} p={8}>
        <Box textAlign="center" fontWeight="bold" color={tone(600)} fontSize="md" mb={4}>
          Retrieving your Salesforce data schema, this might take a few minutes
          <br />
          {Math.ceil(progress)} %
        </Box>
        <Progress size="sm" isIndeterminate colorScheme={colorScheme} bg={tone(100)} />
      </Box>
    )
  );
});
