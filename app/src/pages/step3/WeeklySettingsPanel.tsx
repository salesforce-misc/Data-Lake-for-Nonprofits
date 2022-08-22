import React from "react";
import isNumber from "lodash/isNumber";
import isEmpty from "lodash/isEmpty";
import { Box, Text, HStack, Divider, Tag, Wrap, WrapItem } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { TimeInput } from "components/TimeInput";

export const WeeklySettingsPanel = observer(() => {
  const installation = useInstallation();
  const step = installation.importOptionsStep;
  const settings = step.weeklySettings;
  const time = settings.time;
  const isSelected = (day: number) => settings.day === day;

  const handleDayChange = (event: React.MouseEvent) => {
    const attr = (event.target as HTMLElement).getAttribute("data-day");
    if (isEmpty(attr)) return;

    const num = parseInt(attr as string);
    if (!isNumber(num)) return;

    settings.setDay(num);
  };

  const handleTimeChange = ({ hour, minute }: { hour: string; minute: string }): void => {
    time.setHour(hour);
    time.setMinute(minute);
  };

  return (
    <Box>
      <Box p={3} bg="purple.75" borderRadius="md" mb={3}>
        {settings.infoMessage}
      </Box>

      <Divider borderColor="purple.200" mb={3} />

      <Box>
        <Text fontSize="sm" fontWeight="bold" color="purple.600">
          Day
        </Text>
        <Wrap spacing={2} mt={3} mb={4} onClick={handleDayChange}>
          {settings.daysList.map((item) => (
            <WrapItem key={item.value}>
              <Tag colorScheme="purple" cursor="pointer" data-day={item.value} variant={isSelected(item.value) ? "solid" : "outline"}>
                {item.name}
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      <Divider borderColor="purple.200" mb={3} />

      <HStack spacing={2} color="purple.600">
        <Text fontSize="sm" fontWeight="bold">
          Time
        </Text>
        <Text fontSize="xs">(24-hour format)</Text>
      </HStack>

      <TimeInput hour={time.hour} minute={time.minute} onChange={handleTimeChange} />
    </Box>
  );
});
