import React from "react";
import { Box, Container } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { StepsIndicator } from "components/StepsIndicator";
import { useColorScheme } from "models/useColorScheme";

interface IStepsBanner {
  current: number;
}

export const StepsBanner = observer(({ current }: IStepsBanner) => {
  const { tone } = useColorScheme();

  return (
    <Box bg={tone(600)} w="full" position="relative">
      <Container maxW="container.md" pt="15px" pb="15px">
        <StepsIndicator current={current} />
      </Container>
    </Box>
  );
});
