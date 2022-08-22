import React from "react";
import { Box, Text, HStack, RadioGroup, Radio, Divider } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { MonthlySettingsSelection } from "models/steps/ImportOptionsStep";
import { TimeInput } from "components/TimeInput";
import { humanDay } from "helpers/utils";

import { DayOfMonthGrid } from "./DayOfMonthGrid";

export const MonthlySettingsPanel = observer(() => {
  const installation = useInstallation();
  const step = installation.importOptionsStep;
  const settings = step.monthlySettings;
  const time = settings.time;

  const handleDayChange = (value: string) => {
    settings.setSelection(value as MonthlySettingsSelection);
  };

  const handleTimeChange = ({ hour, minute }: { hour: string; minute: string }): void => {
    time.setHour(hour);
    time.setMinute(minute);
  };

  return (
    <RadioGroup onChange={handleDayChange} value={settings.selection}>
      <Box p={3} bg="purple.75" borderRadius="md" mb={3}>
        {settings.infoMessage}
      </Box>

      <Divider borderColor="purple.200" mb={3} />

      <Box>
        <Text fontSize="sm" fontWeight="bold" color="purple.600">
          Day
        </Text>
        <Box p={3} pb={1}>
          <Radio size="sm" colorScheme="purple" isChecked={settings.isLastDay} value={MonthlySettingsSelection.LastDay}>
            Last day of the month
          </Radio>
        </Box>
        <Box pl={3} pt={2} pb={0}>
          <Radio size="sm" colorScheme="purple" isChecked={settings.isLastWeekday} value={MonthlySettingsSelection.LastWeekDay}>
            Last weekday of the month
          </Radio>
        </Box>
        <Box pl={3} mt={2} mb={5}>
          <Radio size="sm" colorScheme="purple" isChecked={settings.isOnDay} value={MonthlySettingsSelection.OnDay}>
            The {humanDay(settings.day)} day of the month
          </Radio>
          <Box ml={5} mt={2}>
            <DayOfMonthGrid />
          </Box>
        </Box>
      </Box>

      <Divider borderColor="purple.200" mb={3} />

      <HStack spacing={2} color="purple.600">
        <Text fontSize="sm" fontWeight="bold">
          Time
        </Text>
        <Text fontSize="xs">(24-hour format)</Text>
      </HStack>

      <TimeInput hour={time.hour} minute={time.minute} onChange={handleTimeChange} />
    </RadioGroup>
  );
});
