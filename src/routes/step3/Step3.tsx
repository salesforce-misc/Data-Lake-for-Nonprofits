import { FC, useEffect, useState, MouseEventHandler } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  Button,
  Stack,
  Progress,
  Alert,
  AlertIcon,
  Divider,
  AlertDescription,
  AlertTitle,
  Badge,
} from "@chakra-ui/react";
import { ArrowForwardIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import { useInstallation } from "AppContext";
import { CurvedBox } from "components/CurvedBox";
import { StepsIndicator } from "components/StepsIndicator";
import { ImportFrequencyPanel } from "components/ImportFrequencyPanel";
import { DataModelDescription } from "components/DataModelDescription";
import { ObjectsTable } from "components/ObjectsTable";
import { niceNumber } from "helpers/utils";
import { useMetadataStore } from "models/MetadataStore";
import { useColorScheme } from "models/useColorScheme";

export const Step3: FC = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const installation = useInstallation();
  const step = installation.importOptionsStep;
  const navigate = useNavigate();
  const [isSubmitting, setSubmitting] = useState(false);
  const { isReady, store } = useMetadataStore();
  const selectedObjectsCount = store.selectedObjects.length;

  const handlePrevious = () => {
    navigate("/steps/2");
  };

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async () => {
    step.markCompleted();
    setSubmitting(false);
    navigate("/steps/4");
  };

  useEffect(() => {
    step.markStarted();
    window.scrollTo(0, 0); // TODO - bring me back
  }, [step]);

  const canProceed = isReady && selectedObjectsCount > 0;

  return (
    <Box position="relative">
      <CurvedBox />
      <Box bg={tone(600)} w="full" position="relative">
        <Container maxW="container.md" pt="15px" pb="15px">
          <StepsIndicator current={3} />
        </Container>
      </Box>

      <Container maxW="container.md" pt="0px" position="relative">
        <Text color={tone(100)} mt={5}>
          Step 3
        </Text>
        <Heading display="inline-block" size="lg" pt="0px" pb="30px" color={tone(50)} letterSpacing="-1px">
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
  );
});

const DataModelPanel: FC = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const { isReady, store } = useMetadataStore();

  if (!isReady) return null;
  const hasMissingObjects = store.missingObjects.length > 0;

  return (
    <Box p={0} mb={6} pt={15} color={tone(800)}>
      <Heading size="md" pt="0px" pb="20px" color={tone(600)} letterSpacing="-1px">
        Salesforce NPSP data model
      </Heading>

      {hasMissingObjects && (
        <Box p={6} bg={tone(75)} borderRadius="md" mb={4} mt={0}>
          <DataModelDescription />
        </Box>
      )}

      {!store.empty && (
        <>
          <Alert status="info" colorScheme={colorScheme} bg={tone(75)} mt={0} borderRadius="md" p={6}>
            <Box>
              <AlertTitle color={tone(600)} mb={2}>
                Objects to import
                <Badge colorScheme={colorScheme} borderRadius="full" ml={2} fontSize="md" fontWeight="bold" pl={2} pr={2}>
                  {niceNumber(store.selectedObjects.length)}
                </Badge>
              </AlertTitle>
              <AlertDescription fontSize="md">
                If needed, you can include or exclude <b>objects</b> by clicking on the object name.
                <Text mt={3}>
                  You can also exclude <b>fields</b> by clicking on the 'Customize Fields' button.
                </Text>
              </AlertDescription>
            </Box>
          </Alert>
          <ObjectsTable />
        </>
      )}
    </Box>
  );
});

const StoreStatusInfo: FC = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const { isReady, isError, store } = useMetadataStore();
  const progress = store.loadingPercentage;
  const handleTryAgain = () => {
    store.load();
  };

  if (isError) {
    return (
      <Alert status="error" variant="left-accent" mt={0} mb={0} color="red.700" alignItems="flex-end">
        <AlertIcon alignSelf="flex-start" />
        <Box>
          <Box>
            Something went wrong and we are unable to connect to your Salesforce organization to get the data schema. This might be an intermittent
            problem. Wait for a few minutes and try again.
          </Box>
          <Box textAlign="right" w="full" mt={4}>
            <Button colorScheme="red" size="sm" onClick={handleTryAgain} loadingText="Processing" isLoading={!isError}>
              Try Again
            </Button>
          </Box>
        </Box>
      </Alert>
    );
  }

  if (isReady) return null;

  return (
    <Box mt={2} mb={4} p={8}>
      <Box textAlign="center" fontWeight="bold" color={tone(600)} fontSize="md" mb={4}>
        Retrieving your Salesforce data schema, this might take a few minutes
        <br />
        {Math.ceil(progress)} %
      </Box>
      <Progress size="sm" isIndeterminate colorScheme={colorScheme} bg={tone(100)} />
    </Box>
  );
});
