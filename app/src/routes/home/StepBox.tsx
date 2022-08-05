import React from "react";
import { Box, Grid, GridItem, Tag } from "@chakra-ui/react";

import { TStepInfo } from "routes/home/Steps";

interface IStepBox {
  step: TStepInfo;
  index: number;
}

export const StepBox = ({ step, index }: IStepBox) => (
  <Box minH="80px" borderRadius="lg" bg="orange.75" mb={3}>
    <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
      <GridItem rowSpan={2} colSpan={1} pr={4}>
        <Tag color="orange.500" bg="orange.200" borderRadius="full" size="lg" fontWeight="bold">
          {index + 1}
        </Tag>
      </GridItem>
      <GridItem colSpan={4} fontWeight="bold" color="orange.600">
        {step.title}
      </GridItem>
      <GridItem colSpan={4}>{step.desc}</GridItem>
    </Grid>
  </Box>
);
