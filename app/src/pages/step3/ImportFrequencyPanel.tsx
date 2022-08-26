import React from "react";
import { Box, Heading, Stack, StackDivider, Badge, RadioGroup, Radio, Flex } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { useMetadataStore } from "models/MetadataStore";
import { ImportFrequency } from "models/steps/ImportOptionsStep";

import { MonthlySettingsPanel } from "./MonthlySettingsPanel";
import { WeeklySettingsPanel } from "./WeeklySettingsPanel";
import { DailySettingsPanel } from "./DailySettingsPanel";

export const ImportFrequencyPanel = observer(() => {
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
          <RadioGroup id="import-frequency-radio-group">
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
