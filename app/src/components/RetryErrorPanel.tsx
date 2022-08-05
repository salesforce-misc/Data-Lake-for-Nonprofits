import React from "react";
import isEmpty from "lodash/isEmpty";
import { Alert, AlertIcon, Box, Button, Flex } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { Markdown } from "components/Markdown";

interface IRetryErrorPanel {
  errorMessage: string;
  errorDetail?: string;
  onRetry: () => void;
}

export const RetryErrorPanel = observer(({ errorMessage, errorDetail, onRetry }: IRetryErrorPanel) => {
  const [expanded, setExpanded] = React.useState(false);
  const hasTechDetail = !isEmpty(errorDetail);

  return (
    <Alert status="error" mt={0} mb={6} color="red.700" alignItems="flex-start" borderRadius="lg">
      <AlertIcon alignSelf="flex-start" />
      <Box>
        <Box>
          {errorMessage}
          {hasTechDetail && (
            <>
              &nbsp;If you continue to get this error, you can peek at the technical details and seek assistance from a solution implementor agency.
            </>
          )}
        </Box>
        <Flex w="full" mt={4} justifyContent="space-between" textAlign="right">
          {hasTechDetail && (
            <Button size="sm" color="red.800" variant="link" onClick={() => setExpanded((previous) => !previous)} _focus={{ boxShadow: "none" }}>
              Click to see technical details
            </Button>
          )}
          {!hasTechDetail && <Box />}
          <Button colorScheme="red" size="sm" loadingText="Processing" onClick={() => onRetry()}>
            Try Again
          </Button>
        </Flex>
        {expanded && errorDetail && (
          <Box mt={6} mb={4}>
            <Markdown content={errorDetail} />
          </Box>
        )}
      </Box>
    </Alert>
  );
});
