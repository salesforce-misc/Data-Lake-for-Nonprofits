import React from "react";
import { Box, Container, Heading, Text, HStack, Button, ChakraProvider, Image, Progress, Stack, useTheme } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import awsImage from "images/processing-aws-01.png";
import sforgImage from "images/processing-sforg-01.png";

import { useInstallation } from "AppContext";
import { Header } from "components/Header";
import { CurvedBox } from "components/CurvedBox";
import { StepsBanner } from "components/StepsBanner";

import { DoNotCloseMessagePanel } from "pages/step5/DoNotCloseMessagePanel";
import { SuccessMessagePanel } from "pages/step5/SuccessMessagePanel";
import { DeploymentError } from "pages/step5/DeploymentError";
import { ProgressPanel } from "pages/step5/ProgressPanel";
import { ImportStatusPanel } from "pages/step5/ImportStatusPanel";

export const Step5 = observer(() => {
  const theme = useTheme();
  const installation = useInstallation();
  const step = installation.deploymentStep;
  const inProgress = installation.deploymentOperations.isInProgress;
  const navigate = useNavigate();

  const colorScheme = theme.name;

  const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = async () => {
    step.markCompleted();
    navigate("/steps/6");
  };

  React.useEffect(() => {
    step.markStarted();
    window.scrollTo(0, 0);
  }, [step]);

  React.useEffect(() => {
    installation.triggerDeployment();
  }, [installation]);

  React.useEffect(() => {
    window.onbeforeunload = (e) => {
      if (installation.deploymentOperations.isInProgress) {
        e.preventDefault();
        // Return string and mutate event to cover all browser types
        // This custom message is not supported in Chrome, Firefox or Safari
        return (e.returnValue = "Closing the window now will pause the Data Lake installation. Please leave the window open until it is completed.");
      }
    };
    const beforeUnload = window.onbeforeunload;

    return () => window.removeEventListener("beforeunload", beforeUnload);
  });

  return (
    <ChakraProvider theme={theme}>
      <CurvedBox bgGradient={theme.gradients.bgLight} />

      <Header />

      <Box position="relative">
        <CurvedBox />
        <StepsBanner current={5} />

        <Container maxW="container.md" pt="16px" position="relative">
          <Box float="right" fontSize="small" textAlign="center" color="green.100">
            <Text>Installation ID</Text>
            <Text>{installation.id}</Text>
          </Box>

          <Heading display="inline-block" size="lg" pt="0px" pb="10px" color="white" letterSpacing="-1px">
            Sit back and relax
          </Heading>

          <Box color="green.50" mb={10}>
            <Stack direction="column" spacing="8px" align="left" justifyContent="space-between">
              <Box mb={0}>
                We are provisioning the data lake and importing the data. You can sit back and relax and watch the progress of the data import.
              </Box>
              <Box mb={0}>Don't close the browser tab, otherwise the provisioning will pause before it's fully completed.</Box>
            </Stack>
          </Box>

          {inProgress && <Box mt="80px" />}

          <Box borderRadius="lg" boxShadow="base" bg="green.25" mt={4} p={4} pb={6} position="relative">
            {inProgress && (
              <>
                <Box
                  borderRadius="lg"
                  clipPath="ellipse(70% 100% at 50% 0%);"
                  position="absolute"
                  bgGradient="linear(to-t, green.50, green.100)"
                  left="0"
                  right="0"
                  top={0}
                  marginLeft="auto"
                  marginRight="auto"
                  height="100px"
                  w="100%"
                />
                <Progress
                  size="xs"
                  colorScheme={colorScheme}
                  borderRadius="lg"
                  isIndeterminate
                  width={{ base: "170px", md: "430px" }}
                  marginLeft="auto"
                  marginRight="auto"
                  left="0"
                  right="0"
                  opacity="0.2"
                  position="absolute"
                  top="-30px"
                />
                <Image src={sforgImage} boxSize="200px" objectFit="cover" position="absolute" left="0%" top="-130px" />
                <Image src={awsImage} boxSize={{ base: "200px", md: "200px" }} objectFit="cover" position="absolute" right="10%" top="-110px" />
                <Box mt="90px" />
              </>
            )}
            <DoNotCloseMessagePanel />
            <SuccessMessagePanel />
            <DeploymentError />
            <ProgressPanel />
          </Box>

          <ImportStatusPanel />

          <HStack justifyContent="flex-end" p={3} pt={6} mb={12}>
            <Button
              colorScheme={colorScheme}
              size="md"
              loadingText="Processing"
              disabled={!installation.deploymentOperations.isSuccess}
              rightIcon={<ArrowForwardIcon />}
              ml={3}
              onClick={handleSubmit}
            >
              Next
            </Button>
          </HStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
});
