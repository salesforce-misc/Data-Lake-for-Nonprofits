import React, { FC } from "react";
import range from "lodash/range";
import isNumber from "lodash/isNumber";
import isEmpty from "lodash/isEmpty";
import { Box, Heading, Text, HStack, Stack, StackDivider, Badge, RadioGroup, Radio, Flex, Divider, Tag, Wrap, WrapItem, Alert, AlertIcon } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "../AppContext";
import { useMetadataStore } from "../models/MetadataStore";
import { ImportFrequency, MonthlySettingsSelection } from "../models/steps/ImportOptionsStep";
import { TimeInput } from "./TimeInput";
import { humanDay } from "../helpers/utils";

export const ImportFrequencyPanel: FC = observer(() => {
  const { isReady } = useMetadataStore();
  const installation = useInstallation();
  if (!isReady) return null;

  const step = installation.importOptionsStep;
  const importFrequency = step.frequency;
  const handleFrequencyChange = (frequency: ImportFrequency) => () => {
    step.setFrequency(frequency);
  };

  const getProps = (frequency: ImportFrequency) => {
    const common = {
      borderRadius: "md",
      p: 4,
      cursor: "pointer",
      onClick: handleFrequencyChange(frequency),
      fontWeight: "bold",
      color: "purple.700",
      fontSize: "sm",
    };
    if (frequency === importFrequency) return { ...common, borderWidth: "2px", borderColor: "purple.600" };
    return { ...common, borderWidth: "1px", borderColor: "purple.200" };
  };

  return (
    <Box p={0} mb={6}>
      <Heading size="md" pt="0px" pb="20px" color="purple.600" letterSpacing="-1px">
        How often should we import the data?
      </Heading>

      <Stack
        direction={{ base: "column", md: "row" }}
        align="stretch"
        divider={<StackDivider borderColor="purple.200" />}
        spacing={{ base: 5, md: 5 }}
        justifyContent="flex-start"
      >
        <Box w={{ base: "100%", md: "40%" }}>
          <RadioGroup>
            <Box {...getProps(ImportFrequency.Monthly)}>
              <Flex mr={2} justifyContent="space-between">
                <Radio isChecked={step.isMonthly} colorScheme="purple">
                  Monthly
                </Radio>
                <Box>
                  <Badge fontSize="0.6rem" colorScheme="purple">
                    Recommended
                  </Badge>
                </Box>
              </Flex>
            </Box>
            <Box mt={3} {...getProps(ImportFrequency.Weekly)}>
              <Radio isChecked={step.isWeekly} colorScheme="purple">
                Weekly
              </Radio>
            </Box>
            <Box mt={3} {...getProps(ImportFrequency.Daily)}>
              <Radio isChecked={step.isDaily} colorScheme="purple">
                Daily
              </Radio>
            </Box>
          </RadioGroup>
        </Box>
        <Box w={{ base: "100%", md: "60%" }}>
          {step.isMonthly && <MonthlySettingsPanel />}
          {step.isWeekly && <WeeklySettingsPanel />}
          {step.isDaily && <DailySettingsPanel />}
        </Box>
      </Stack>
    </Box>
  );
});

const DailySettingsPanel: FC = observer(() => {
  const installation = useInstallation();
  const step = installation.importOptionsStep;
  const settings = step.dailySettings;
  const time = settings.time;

  const handleTimeChange = ({ hour, minute }: { hour: string; minute: string }): void => {
    time.setHour(hour);
    time.setMinute(minute);
  };

  return (
    <Box>
      <Alert status="warning" variant="left-accent" mt={0} mb={3} colorScheme="purple" alignItems="flex-end">
        <AlertIcon alignSelf="flex-start" />
        Daily import is not recommended if you have millions of records of data as they incur additional cost
      </Alert>

      <Box p={3} bg="purple.75" borderRadius="md" mb={3}>
        {settings.infoMessage}
      </Box>

      <Divider borderColor="purple.200" mb={3} />

      <HStack spacing={2} color="purple.600">
        <Text fontSize="sm" fontWeight="bold">
          Time
        </Text>
        <Text fontSize="xs">(24-hour format)</Text>
      </HStack>

      <TimeInput hour={time.hour} minute={time.minute} onChange={handleTimeChange} />
      {/* <Divider borderColor="purple.200" mb={3} mt={3}/> */}

    </Box>
  );
});

const WeeklySettingsPanel: FC = observer(() => {
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

const MonthlySettingsPanel: FC = observer(() => {
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

const DayOfMonthGrid: FC = observer(() => {
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

  const NumBox: FC<{ num: number }> = observer(({ num }) => (
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
