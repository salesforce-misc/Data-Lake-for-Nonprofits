import React from "react";
import { HStack, Tag, useTheme } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { steps, TStepInfo } from "routes/home/Steps";

interface IStepsIndicator {
  current: number;
}

export const StepsIndicator = observer(({ current }: IStepsIndicator) => {
  const theme = useTheme().stepsIndicator;

  const getProps = (index: number) => {
    if (index > current) return theme.afterProps;
    if (index < current) return theme.beforeProps;

    return theme.currentProps;
  };

  const elements = steps.map((step: TStepInfo, index: number) => (
    <Tag key={index} {...getProps(index)} borderRadius="full" size="lg" fontWeight="bold">
      {index}
    </Tag>
  ));

  return <HStack>{elements}</HStack>;
});
