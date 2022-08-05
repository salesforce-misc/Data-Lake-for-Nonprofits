import React from "react";
import { Box, Container, Heading, Text, HStack, Button, ChakraProvider, Stack } from "@chakra-ui/react";
import { ArrowForwardIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import { useInstallation } from "AppContext";
import { theme } from "themes/pink";
import { Header } from "components/Header";
import { CurvedBox } from "components/CurvedBox";
import { StepsIndicator } from "components/StepsIndicator";
import { DataModelTablePreview } from "routes/step4/DataModelTablePreview";

import { ReviewGrid } from "routes/step4/ReviewGrid";

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
    <ChakraProvider theme={theme}>
      <CurvedBox bgGradient={theme.gradients.bgLight} />

      <Header />

      <Box position="relative">
        <CurvedBox />
        <Box bg="pink.600" w="full" position="relative">
          <Container maxW="container.md" pt="15px" pb="15px">
            <StepsIndicator current={4} />
          </Container>
        </Box>

        <Container maxW="container.md" pt="16px" position="relative">
          <Box float="right" fontSize="small" textAlign="center" color="pink.100">
            <Text>Installation ID</Text>
            <Text>{installation.id}</Text>
          </Box>

          <Heading display="inline-block" size="lg" pt="0px" pb="10px" color="white" letterSpacing="-1px">
            Review and confirm
          </Heading>

          <Box color="purple.50" mb={10}>
            <Stack direction="row" spacing="0" align="left" justifyContent="space-between">
              <Box mb={0}>Did we get everything right? Take a look at all the answers you provided and confirm your selections.</Box>
            </Stack>
          </Box>

          <Box borderRadius="lg" boxShadow="base" bg="pink.50" mt={4} p={8} pb={10} pt={10}>
            <ReviewGrid />
            <DataModelTablePreview colorScheme="pink" showCaption={false} />
          </Box>

          <Box borderRadius="lg" boxShadow="base" bg="pink.50" mt={4} p={8} pb={10} pt={10}>
            <Heading size="md" pt="0px" pb="10px" color="pink.600" letterSpacing="-1px">
              What's next?
            </Heading>

            <Text>
              We will start the process of setting up the datalake at AWS and importing your Salesforce records. Depending on the number of records to
              import, the next step might take 15 minutes to a few hours to complete.
            </Text>
          </Box>

          <HStack justifyContent="space-between" p={3} pt={6} mb={12}>
            <Button colorScheme="pink" size="md" _hover={{ bg: "pink.100" }} leftIcon={<ArrowBackIcon />} variant="ghost" onClick={handlePrevious}>
              Previous
            </Button>
            <Button colorScheme="pink" size="md" loadingText="Processing" rightIcon={<ArrowForwardIcon />} ml={3} onClick={handleSubmit}>
              Next
            </Button>
          </HStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
});
