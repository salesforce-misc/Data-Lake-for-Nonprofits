import React from "react";
import { Box, HStack, Button, Divider } from "@chakra-ui/react";
import { ArrowForwardIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import { useInstallation } from "AppContext";
import { Layout } from "components/Layout";
import { ImportFrequencyPanel } from "pages/step3/ImportFrequencyPanel";
import { useMetadataStore } from "models/MetadataStore";
import { useColorScheme } from "models/useColorScheme";

import { StoreStatusInfo } from "pages/step3/StoreStatusInfo";
import { DataModelPanel } from "pages/step3/DataModelPanel";

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
    <Layout
      step={3}
      title="Select data import options"
      description="In this step, you can pick the standard Amp Impact import options for your Salesforce data or customize these options to fit your needs. You also get to specify the schedule at which data is imported."
    >
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
          id="step3-btn-next"
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
    </Layout>
  );
});
