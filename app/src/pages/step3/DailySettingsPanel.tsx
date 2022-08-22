import React from "react";
import { Box, Text, HStack, Divider, Alert, AlertIcon } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { TimeInput } from "components/TimeInput";

export const DailySettingsPanel = observer(() => {
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
    </Box>
  );
});
