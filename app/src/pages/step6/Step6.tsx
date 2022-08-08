import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Heading, HStack, Text, useTheme } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { Header } from "components/Header";
import { CurvedBox } from "components/CurvedBox";
import { StepsBanner } from "components/StepsBanner";
import { AccessInformation } from "pages/step6/AccessInformation";
import { UsersPanel } from "pages/step6/UsersPanel";
import { useColorScheme } from "models/useColorScheme";
import { LaunchYourConnection } from "./LauncYourConnection";
import { AdminTools } from "./AdminTools";

export const Step6 = observer(() => {
  const theme = useTheme();
  const { tone, colorScheme } = useColorScheme();
  const installation = useInstallation();
  const navigate = useNavigate();
  const step = installation.createUsersStep;

  React.useEffect(() => {
    step.markStarted();
    window.scrollTo(0, 0);
  }, [step]);

  const handlePrevious = () => {
    navigate("/steps/5");
  };

  return (
    <>
      <CurvedBox bgGradient={theme.gradients.bgLight} />

      <Header />

      <Box position="relative">
        <CurvedBox />
        <StepsBanner current={6} />

        <Container maxW="container.md" pt="16px" position="relative" pb={10}>
          <Box float="right" fontSize="small" textAlign="center" color={tone(100)}>
            <Text>Installation ID</Text>
            <Text>{installation.id}</Text>
          </Box>

          <Heading display="inline-block" size="lg" pt="0px" pb="10px" color="white" letterSpacing="-1px">
            Connect to Analytics
          </Heading>

          <Box color={tone(50)}>
            Now that you have the data lake provisioned, you can connect to Tableau for analytics. Here you will gather all the necessary information
            needed to make that connection.
          </Box>

          <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={10} pb={4} position="relative">
            <UsersPanel />
          </Box>

          <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={10} pb={4} position="relative">
            <AccessInformation />
          </Box>

          <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={10} pb={4} position="relative">
            <LaunchYourConnection />
          </Box>

          <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={10} pb={4} position="relative">
            <AdminTools />
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
    </>
  );
});
