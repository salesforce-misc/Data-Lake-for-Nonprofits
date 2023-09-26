import React from "react";
import { Box, Heading, Text, HStack, Button } from "@chakra-ui/react";
import { ArrowForwardIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import { useInstallation } from "AppContext";
import { Layout } from "components/Layout";
import { DataModelTablePreview } from "pages/step4/data-model-table-preview/DataModelTablePreview";

import { ReviewGrid } from "pages/step4/ReviewGrid";

export const Step4 = observer(() => {
  const installation = useInstallation();
  const step = installation.reviewStep;
  const navigate = useNavigate();

  const handlePrevious = () => {
    navigate("/steps/3");
  };

  const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = async () => {
    step.markCompleted();
    navigate("/steps/5");
  };

  React.useEffect(() => {
    step.markStarted();
    window.scrollTo(0, 0);
  }, [step]);

  return (
    <Layout
      step={4}
      title="Review and Confirm"
      description="Did we get everything right? Take a look at all the answers you provided and confirm your selections."
    >
      <Box borderRadius="lg" boxShadow="base" bg="pink.50" mt={4} p={8} pb={10} pt={10}>
        <ReviewGrid />
        <DataModelTablePreview colorScheme="pink" showCaption={false} />
      </Box>

      <Box borderRadius="lg" boxShadow="base" bg="pink.50" mt={4} p={8} pb={10} pt={10}>
        <Heading size="md" pt="0px" pb="10px" color="pink.600" letterSpacing="-1px">
          What's next?
        </Heading>

        <Text>
          We will start the process of setting up the data lake at AWS and importing your Amp Impact and other selected Salesforce object records. Depending on the number of records to
          import, the next step might take 15 minutes to a few hours to complete.
        </Text>
      </Box>

      <HStack justifyContent="space-between" p={3} pt={6} mb={12}>
        <Button colorScheme="pink" size="md" _hover={{ bg: "pink.100" }} leftIcon={<ArrowBackIcon />} variant="ghost" onClick={handlePrevious}>
          Previous
        </Button>
        <Button
          id="step4-btn-next"
          colorScheme="pink"
          size="md"
          loadingText="Processing"
          rightIcon={<ArrowForwardIcon />}
          ml={3}
          onClick={handleSubmit}
        >
          Next
        </Button>
      </HStack>
    </Layout>
  );
});
