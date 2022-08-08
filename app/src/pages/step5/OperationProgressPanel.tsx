import React from "react";
import { Box, Text, HStack, Progress } from "@chakra-ui/react";
import { TimeIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { theme } from "themes/green";
import { IOperation } from "models/operations/Operation";

import { ProcessingTime } from "pages/step5/ProcessingTime";

const colorScheme = theme.name;

interface IOperationProgressPanel {
  operation: IOperation;
  message?: string;
}

export const OperationProgressPanel = observer(({ operation, message }: IOperationProgressPanel) => {
  let targetColorScheme = colorScheme;
  const percentage = Math.floor(operation ? operation.progressPercentage : 0);
  const failure = operation.isFailure;
  const hasStripe = !failure && operation.isInProgress;
  const isAnimated = hasStripe;

  let fontColor = `${colorScheme}.700`;
  let bg = `${colorScheme}.75`;

  if (operation.isNotStarted) {
    fontColor = "gray.400";
    targetColorScheme = "gray";
    bg = "gray.75";
  } else if (failure) {
    fontColor = "red.700";
    targetColorScheme = "red";
    bg = "red.50";
  }

  const progressProps = {
    colorScheme: targetColorScheme,
    size: "sm",
    mt: 1,
    borderRadius: "lg",
    bg,
    isAnimated,
    hasStripe,
  };

  return (
    <HStack fontSize="sm" color={fontColor} mb={4} alignContent="space-between">
      <Box w="full">
        <Text float="right" fontWeight="bold">
          {percentage}%
        </Text>
        <Text>
          {!message && operation.progressMessage}
          {message}
        </Text>

        <Progress value={percentage} {...progressProps} />
      </Box>
      <Box w="110px" textAlign="right" alignSelf="center">
        <TimeIcon mr={2} />
        <ProcessingTime operation={operation} />
      </Box>
    </HStack>
  );
});
