import React from "react";
import { Box, Text, Button, Flex, Alert, AlertIcon } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";

interface IStartNewWarning {
  onCancel: () => void;
  onContinue: () => void;
}

export const StartNewWarning = observer(({ onCancel, onContinue }: IStartNewWarning) => {
  const { tone, colorScheme } = useColorScheme();

  return (
    <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={6} p={10} pb={6}>
      <Alert status="warning" borderRadius="lg" color={tone(700)}>
        <Flex>
          <AlertIcon mt={1} />
          <Text flex={1}>
            You existing data lake is consuming AWS resources that might incur cost, starting a new data lake will <b>not delete</b> these resources
            and your existing data lake will be left intact. Take additional steps to clean the existing resources if desired.
          </Text>
        </Flex>
      </Alert>
      <Box textAlign="right" w="full" mt={6} mb={0}>
        <Button colorScheme={colorScheme} size="md" variant="outline" mr={6} onClick={() => onCancel()}>
          Cancel
        </Button>
        <Button colorScheme={colorScheme} size="md" onClick={() => onContinue()}>
          Continue
        </Button>
      </Box>
    </Box>
  );
});
