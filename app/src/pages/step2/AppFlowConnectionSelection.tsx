import React from "react";
import isEmpty from "lodash/isEmpty";
import { Box, Heading, HStack, Button, Select, Progress, Alert, AlertIcon, IconButton } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { useConnectionsStore } from "models/ConnectionsStore";

export const AppFlowConnectionSelection = observer(() => {
  const installation = useInstallation();
  const { isError, isLoading, isReloading, store } = useConnectionsStore();
  const connectionNames = store.connectionNames;
  const connectionName = installation.appFlowConnectionName;

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    installation.setAppFlowConnectionName(event.target.value);
  };

  const handleTryAgain = async () => {
    store.load();
  };

  React.useEffect(() => {
    if (!isEmpty(connectionNames) && connectionNames?.length === 1) {
      // If we only have one connection name, we will use it
      installation.setAppFlowConnectionName(connectionNames[0]);
    } else if (isEmpty(connectionNames) && !isLoading && !isReloading) {
      installation.setAppFlowConnectionName("");
    }
  }, [connectionNames, installation, isLoading, isReloading]);

  React.useEffect(() => {
    if (isError) {
      // When there is an error, we want to clear any selection
      installation.setAppFlowConnectionName("");
    }
  }, [isError, installation]);

  return (
    (isLoading && (
      <Box mt={6} mb={8}>
        <Box textAlign="center" fontWeight="bold" color="blue.500" fontSize="sm" mb={2}>
          Retrieving AppFlow Connection Names
        </Box>
        <Progress id="appflow-connection-loader" size="sm" isIndeterminate colorScheme="blue" bg="blue.75" />
      </Box>
    )) ||
    (isError && !isReloading && (
      <Alert status="error" variant="left-accent" mt={0} mb={8} color="red.700" alignItems="flex-end">
        <AlertIcon alignSelf="flex-start" />
        <Box>
          <Box>
            Something went wrong and we are unable to connect to your AWS account to get the list of Salesforce connections. This might be an
            intermittent problem. Wait for a few minutes and try again.
          </Box>
          <Box textAlign="right" w="full" mt={4}>
            <Button colorScheme="red" size="sm" onClick={handleTryAgain} loadingText="Processing" isLoading={isLoading || isReloading}>
              Try Again
            </Button>
          </Box>
        </Box>
      </Alert>
    )) ||
    (isEmpty(connectionNames) && (
      <Alert status="info" variant="left-accent" mt={0} mb={8} color="blue.700" alignItems="flex-end">
        <AlertIcon alignSelf="flex-start" />
        <Box>
          <Box>
            We are unable to find the connection name. It might take a few minutes before the connection name is available. Wait for a few seconds and
            try again.
          </Box>
          <Box textAlign="right" w="full" mt={4}>
            <Button colorScheme="blue" size="sm" onClick={handleTryAgain} loadingText="Processing" isLoading={isLoading || isReloading}>
              Try Again
            </Button>
          </Box>
        </Box>
      </Alert>
    )) || (
      <Box bg="blue.75" p={6} mb={8} borderRadius="lg" border="1px" borderColor="blue.100">
        <Heading id="step2-h2-select-connection" size="sm" pb="10px" color="blue.600">
          Select the connection name
        </Heading>

        <HStack>
          <Select bg="blue.50" id="appFlowConnectionName" value={connectionName} onChange={handleChange} disabled={isLoading || isReloading}>
            <option value="">Select a connection name</option>
            {connectionNames?.map((name, index) => (
              <option value={name} key={index}>
                {name}
              </option>
            ))}
          </Select>
          <IconButton
            id="step2-button-reload-connections"
            colorScheme="blue"
            variant="outline"
            aria-label="Search database"
            onClick={handleTryAgain}
            icon={<RepeatIcon />}
            isLoading={isLoading || isReloading}
          />
        </HStack>
      </Box>
    )
  );
});
