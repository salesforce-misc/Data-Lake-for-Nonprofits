import { FC } from "react";
import { HStack, Tag, useTheme } from "@chakra-ui/react";
import { observer } from "mobx-react";

export const StepsIndicator: FC<{ current: number }> = observer(({ current }) => {
  const theme = useTheme().stepsIndicator;
  const getProps = (index: number) => {
    if (index > current) return theme.afterProps;
    if (index < current) return theme.beforeProps;

    return theme.currentProps;
  };

  const elements = [1, 2, 3, 4, 5, 6].map((value: number) => (
    <Tag key={value} {...getProps(value)} borderRadius="full" size="lg" fontWeight="bold">
      {value}
    </Tag>
  ));

  return <HStack>{elements}</HStack>;
});
