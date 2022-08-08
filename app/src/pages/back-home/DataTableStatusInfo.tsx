import React from "react";
import { Box, Button, Alert, AlertIcon, Progress } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { useMetadataStore } from "models/MetadataStore";

export const DataTableStatusInfo = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const { isReady, isError, store } = useMetadataStore();
  const progress = store.loadingPercentage;

  const handleTryAgain = () => {
    store.load();
  };

  return (
    (isError && (
      <Alert status="error" variant="left-accent" mt={6} mb={4} color="red.700" alignItems="flex-end">
        <AlertIcon alignSelf="flex-start" />
        <Box>
          <Box>
            Something went wrong and we are unable get the data schema. This might be an intermittent problem. Wait for a few minutes and try again.
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
      <Box mt={6} mb={4} p={0}>
        <Box textAlign="center" fontWeight="bold" color={tone(600)} fontSize="md" mb={4}>
          Retrieving the data schema, this might take a few seconds
          <br />
          {Math.ceil(progress)} %
        </Box>
        <Progress size="sm" isIndeterminate colorScheme={colorScheme} bg={tone(100)} />
      </Box>
    )
  );
});
