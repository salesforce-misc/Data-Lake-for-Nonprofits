import { FC } from "react";
import { Box, Container } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { StepsIndicator } from "./StepsIndicator";
import { useColorScheme } from "../models/useColorScheme";

export const StepsBanner: FC<{ current: number }> = observer(({ current }) => {
  const { tone } = useColorScheme();

  return (
    <Box bg={tone(600)} w="full" position="relative">
      <Container maxW="container.md" pt="15px" pb="15px">
        <StepsIndicator current={current} />
      </Container>
    </Box>
  );
});
