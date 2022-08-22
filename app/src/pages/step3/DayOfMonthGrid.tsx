import React from "react";
import range from "lodash/range";
import isNumber from "lodash/isNumber";
import isEmpty from "lodash/isEmpty";
import { Box, HStack } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";

export const DayOfMonthGrid = observer(() => {
  const installation = useInstallation();
  const step = installation.importOptionsStep;
  const settings = step.monthlySettings;
  const disabled = !settings.isOnDay;
  const day = settings.day;

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) return;
    const attr = (event.target as HTMLElement).getAttribute("data-day");
    if (isEmpty(attr)) return;

    const num = parseInt(attr as string);
    if (!isNumber(num)) return;

    settings.setDay(num);
  };

  const getProps = (num: number) => {
    const common = {
      borderColor: "purple.400",
      fontSize: "sm",
      color: "purple.800",
      borderWidth: "1px",
      w: "26px",
      cursor: "pointer",
      _hover: { bg: "purple.300", color: "purple.800" },
      "data-day": num,
    };

    if (disabled && day !== num) return { ...common, borderColor: "purple.100", color: "purple.100", _hover: {}, cursor: "default" };
    if (disabled && day === num) return { ...common, bg: "purple.50", borderColor: "purple.200", color: "purple.200", _hover: {}, cursor: "default" };

    if (day === num) return { ...common, bg: "purple.700", color: "purple.50", cursor: "default", _hover: {} };
    return common;
  };

  const NumBox = observer(({ num }: { num: number }) => (
    <Box {...getProps(num)} textAlign="center">
      {num}
    </Box>
  ));

  return (
    <Box onClick={handleClick}>
      <HStack spacing={1}>
        {range(1, 8).map((num) => (
          <NumBox key={num} num={num} />
        ))}
      </HStack>
      <HStack spacing={1} mt={1}>
        {range(8, 15).map((num) => (
          <NumBox key={num} num={num} />
        ))}
      </HStack>
      <HStack spacing={1} mt={1}>
        {range(15, 22).map((num) => (
          <NumBox key={num} num={num} />
        ))}
      </HStack>
      <HStack spacing={1} mt={1}>
        {range(22, 29).map((num) => (
          <NumBox key={num} num={num} />
        ))}
      </HStack>
    </Box>
  );
});
