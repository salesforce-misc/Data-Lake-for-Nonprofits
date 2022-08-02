import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Heading, HStack, Text } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { CurvedBox } from "components/CurvedBox";
import { StepsBanner } from "components/StepsBanner";
import { TableauAccessPanel } from "components/TableauAccessPanel";
import { UsersPanel } from "components/UsersPanel";
import { SubscribeSNSPanel } from "components/SubscribeSNSPanel";
import { CloudwatchDashboardPanel } from "components/CloudwatchDashboardPanel";
import { useColorScheme } from "models/useColorScheme";

export const Step6: FC = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const installation = useInstallation();
  const navigate = useNavigate();
  const step = installation.createUsersStep;

  useEffect(() => {
    step.markStarted();
    window.scrollTo(0, 0);
  }, [step]);

  const handlePrevious = () => {
    navigate("/steps/5");
  };

  return (
    <Box position="relative">
      <CurvedBox />
      <StepsBanner current={6} />

      <Container maxW="container.md" pt="0px" position="relative" pb={10}>
        <Box float="right" fontSize="small" textAlign="center" color={tone(100)}>
          <Text>Installation ID</Text>
          <Text>{installation.id}</Text>
        </Box>
        <Text color={tone(100)} mt={5}>
          Step 6
        </Text>
        <Heading display="inline-block" size="lg" pt="0px" pb="10px" color="white" letterSpacing="-1px">
          Gain access
        </Heading>
        <Box color={tone(50)}>Now that you have the data lake provisioned, you can create users to access the data lake using Tableau Desktop.</Box>

        <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={10} pb={4} position="relative">
          <UsersPanel />
        </Box>

        <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={10} pb={4} position="relative">
          <TableauAccessPanel />
        </Box>

        <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={10} pb={4} position="relative">
          <CloudwatchDashboardPanel region={installation.region} id={installation.id} />
        </Box>

        <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={10} pb={10} position="relative">
          <SubscribeSNSPanel />
        </Box>

        <HStack justifyContent="space-between" p={3} pt={6} mb={12}>
          <Button
            colorScheme={colorScheme}
            size="md"
            _hover={{ bg: tone(100) }}
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={handlePrevious}
          >
            Previous
          </Button>
        </HStack>
      </Container>
    </Box>
  );
});
