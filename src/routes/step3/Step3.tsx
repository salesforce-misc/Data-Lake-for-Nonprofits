import React from "react";
import { Box, Container, Heading, HStack, Button, Stack, Divider } from "@chakra-ui/react";
import { ArrowForwardIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import { theme } from "themes/purple";
import { useInstallation } from "AppContext";
import { CurvedBox } from "components/CurvedBox";
import { StepsIndicator } from "components/StepsIndicator";
import { ImportFrequencyPanel } from "components/ImportFrequencyPanel";
import { Header } from "components/Header";
import { useMetadataStore } from "models/MetadataStore";
import { useColorScheme } from "models/useColorScheme";

import { StoreStatusInfo } from "routes/step3/StoreStatusInfo";
import { DataModelPanel } from "routes/step3/DataModelPanel";

export const Step3 = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const installation = useInstallation();
  const step = installation.importOptionsStep;
  const navigate = useNavigate();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const { isReady, store } = useMetadataStore();
  const selectedObjectsCount = store.selectedObjects.length;

  const handlePrevious = () => {
    navigate("/steps/2");
  };

  const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = async () => {
    step.markCompleted();
    setSubmitting(false);
    navigate("/steps/4");
  };

  React.useEffect(() => {
    step.markStarted();
    window.scrollTo(0, 0); // TODO - bring me back
  }, [step]);

  const canProceed = isReady && selectedObjectsCount > 0;

  return (
    <>
      <CurvedBox bgGradient={theme.gradients.bgLight} />

      <Header />

      <Box position="relative">
        <CurvedBox />
        <Box bg={tone(600)} w="full" position="relative">
          <Container maxW="container.md" pt="15px" pb="15px">
            <StepsIndicator current={3} />
          </Container>
        </Box>

        <Container maxW="container.md" pt="0px" position="relative">
          <Heading display="inline-block" size="lg" pt="16px" pb="30px" color={tone(50)} letterSpacing="-1px">
            Select data import options
          </Heading>

          <Box color={tone(50)}>
            <Stack direction="row" spacing="0" align="left" justifyContent="space-between">
              <Box mb={6}>
                In this step, you can pick the standard NPSP import options for your Salesforce data or customize these options to fit your needs. You
                also get to specify the schedule at which data is imported.
              </Box>
            </Stack>
          </Box>

          <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={8}>
            <StoreStatusInfo />
            <ImportFrequencyPanel />
            {isReady && <Divider borderColor={tone(100)} pt={8} mb={6} />}
            <DataModelPanel />
          </Box>

          <HStack justifyContent="space-between" p={3} pt={6} mb={12}>
            <Button
              colorScheme={colorScheme}
              size="md"
              _hover={{ bg: tone(100) }}
              leftIcon={<ArrowBackIcon />}
              disabled={isSubmitting}
              variant="ghost"
              onClick={handlePrevious}
            >
              Previous
            </Button>
            <Button
              colorScheme={colorScheme}
              size="md"
              loadingText="Processing"
              rightIcon={<ArrowForwardIcon />}
              ml={3}
              isLoading={isSubmitting}
              disabled={!canProceed || isSubmitting}
              onClick={handleSubmit}
            >
              Next
            </Button>
          </HStack>
        </Container>
      </Box>
    </>
  );
});
