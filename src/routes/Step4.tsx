import { FC, useEffect, MouseEventHandler } from "react";
import { Box, Container, Heading, Text, HStack, Button, ChakraProvider, Grid, GridItem, Stack } from "@chakra-ui/react";
import { ArrowForwardIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import { theme } from "../themes/pink";
import { useInstallation } from "../AppContext";
import { CurvedBox } from "../components/CurvedBox";
import { StepsIndicator } from "../components/StepsIndicator";
import { awsRegionsMap } from "../data/aws-regions";
import { DataModelTablePreview } from "../components/DataModelTablePreview";
import { useMetadataStore } from "../models/MetadataStore";
import { niceNumber } from "../helpers/utils";

export const Step4: FC = observer(() => {
  const installation = useInstallation();
  const step = installation.reviewStep;
  const navigate = useNavigate();

  const handlePrevious = () => {
    navigate("/steps/3");
  };

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async () => {
    step.markCompleted();
    navigate("/steps/5");
  };

  useEffect(() => {
    step.markStarted();
    window.scrollTo(0, 0);
  }, [step]);

  return (
    <ChakraProvider theme={theme}>
      <Box position="relative">
        <CurvedBox />
        <Box bg="pink.600" w="full" position="relative">
          <Container maxW="container.md" pt="15px" pb="15px">
            <StepsIndicator current={4} />
          </Container>
        </Box>

        <Container maxW="container.md" pt="0px" position="relative">
          <Box float="right" fontSize="small" textAlign="center" color="pink.100">
            <Text>Installation ID</Text>
            <Text>{installation.id}</Text>
          </Box>
          <Text color="pink.100" mt={5}>
            Step 4
          </Text>
          <Heading display="inline-block" size="lg" pt="0px" pb="10px" color="white" letterSpacing="-1px">
            Review and confirm
          </Heading>
          <Box color="purple.50">
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

const ReviewGrid: FC = observer(() => {
  const installation = useInstallation();
  const { store } = useMetadataStore();

  const commonProps = {
    w: "100%",
    h: "100%",
    borderRadius: "md",
    p: 3,
  };

  const headerProps = {
    ...commonProps,
    // bg: "pink.600",
    // color: "pink.50",
    color: "pink.700",
    fontWeight: "bold",
  };

  const contentProps = {
    ...commonProps,
    bg: "pink.75",
    color: "pink.800",
  };

  return (
    <Grid templateColumns="0.5fr 1fr" gap={2}>
      <GridItem {...headerProps}>AWS Region</GridItem>
      <GridItem {...contentProps}>{awsRegionsMap[installation.region].label}</GridItem>
      <GridItem {...headerProps}>Connection Name</GridItem>
      <GridItem {...contentProps}>{installation.appFlowConnectionName}</GridItem>
      <GridItem {...headerProps}>Import Schedule</GridItem>
      <GridItem {...contentProps}>{installation.importOptionsStep.infoMessage}</GridItem>
      <GridItem {...headerProps}>Data Model</GridItem>
      <GridItem {...contentProps}>
        We will import {niceNumber(store.selectedObjects.length)} objects
      </GridItem>
    </Grid>
  );
});
