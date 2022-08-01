import { FC, useEffect, MouseEventHandler } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  Button,
  ChakraProvider,
  Alert,
  AlertIcon,
  Image,
  Progress,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { ArrowForwardIcon, TimeIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import awsImage from "../images/processing-aws-01.png";
import sforgImage from "../images/processing-sforg-01.png";

import { theme } from "../themes/green";
import { useInstallation } from "../AppContext";
import { CurvedBox } from "../components/CurvedBox";
import { humanProcessingTime } from "../helpers/utils";
import { IOperation } from "../models/operations/Operation";
import { DataImportStatusPanel } from "../components/DataImportStatusPanel";
import { RetryErrorPanel } from "../components/RetryErrorPanel";
import { StepsBanner } from "../components/StepsBanner";

const colorScheme = theme.name;

export const Step5: FC = observer(() => {
  const installation = useInstallation();
  const step = installation.deploymentStep;
  const inProgress = installation.deploymentOperations.isInProgress;
  const navigate = useNavigate();

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async () => {
    step.markCompleted();
    navigate("/steps/6");
  };

  useEffect(() => {
    step.markStarted();
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    installation.triggerDeployment();
  }, [installation]);

  useEffect(() => {
    window.onbeforeunload = (e) => {
      if (installation.deploymentOperations.isInProgress) {
        e.preventDefault();
        // Return string and mutate event to cover all browser types
        // This custom message is not supported in Chrome, Firefox or Safari
        return (e.returnValue =
          "Closing the window now will pause the EZ Datalake installation. Please leave the window open until it is completed.");
      }
    };
    const beforeUnload = window.onbeforeunload;
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  });

  return (
    <ChakraProvider theme={theme}>
      <Box position="relative">
        <CurvedBox />
        <StepsBanner current={5} />

        <Container maxW="container.md" pt="0px" position="relative">
          <Box float="right" fontSize="small" textAlign="center" color="green.100">
            <Text>Installation ID</Text>
            <Text>{installation.id}</Text>
          </Box>
          <Text color="green.100" mt={5}>
            Step 5
          </Text>
          <Heading display="inline-block" size="lg" pt="0px" pb="10px" color="white" letterSpacing="-1px">
            Sit back and relax
          </Heading>
          <Box color="green.50">
            We are provisioning the data lake and importing the data. You can sit back and relax and watch the progress of the data import. Don't
            close the browser tab, otherwise the provisioning will pause before it's fully completed.
          </Box>

          {inProgress && <Box mt="140px" />}
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

const ImportStatusPanel: FC = observer(() => {
  const installation = useInstallation();
  if (!installation.deploymentOperations.isSuccess) return null;

  return (
    <Box borderRadius="lg" boxShadow="base" bg="green.25" mt={6} p={7} pb={6}>
      <DataImportStatusPanel />
    </Box>
  );
});

const DoNotCloseMessagePanel: FC = observer(() => {
  const installation = useInstallation();
  const deployment = installation.deploymentOperations;

  if (!deployment.isInProgress) return null;

  return (
    <Box my={5} px={3}>
      <Alert status="warning" borderRadius="lg" fontSize="sm" color="orange.700">
        <AlertDescription>Don't close the browser tab, otherwise the provisioning will pause before it's fully completed.</AlertDescription>
      </Alert>
    </Box>
  );
});

const SuccessMessagePanel: FC = observer(() => {
  const installation = useInstallation();
  const deployment = installation.deploymentOperations;

  if (!deployment.isSuccess) return null;

  return (
    <Alert
      mb={6}
      status="success"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="180px"
      borderRadius="md"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        Data Lake is ready!
      </AlertTitle>
      <AlertDescription maxWidth="sm">Great news! we got everything in place and you are ready to proceed to the next step</AlertDescription>
    </Alert>
  );
});

const ProgressPanel: FC = observer(() => {
  const installation = useInstallation();
  const deployment = installation.deploymentOperations;

  return (
    <Box p={3} pb={4}>
      {deployment.operations.map((operation, index) => (
        <OperationProgressPanel key={index} operation={operation} />
      ))}
      <Box mt="60px">
        <OperationProgressPanel operation={deployment} message="Overall Progress" />
      </Box>
    </Box>
  );
});

const OperationProgressPanel: FC<{ operation: IOperation; message?: string }> = observer(({ operation, message }) => {
  let targetColorScheme = colorScheme;
  const percentage = Math.floor(operation ? operation.progressPercentage : 0);
  const failure = operation.isFailure;
  const hasStripe = !failure && operation.isInProgress;
  const isAnimated = hasStripe;

  let fontColor = `${colorScheme}.700`;
  let bg = `${colorScheme}.75`;

  if (operation.isNotStarted) {
    fontColor = "gray.400";
    targetColorScheme = "gray";
    bg = "gray.75";
  } else if (failure) {
    fontColor = "red.700";
    targetColorScheme = "red";
    bg = "red.50";
  }

  const progressProps = {
    colorScheme: targetColorScheme,
    size: "sm",
    mt: 1,
    borderRadius: "lg",
    bg,
    isAnimated,
    hasStripe,
  };

  return (
    <HStack fontSize="sm" color={fontColor} mb={4} alignContent="space-between">
      <Box w="full">
        <Text float="right" fontWeight="bold">
          {percentage}%
        </Text>
        <Text>
          {!message && operation.progressMessage}
          {message}
        </Text>

        <Progress value={percentage} {...progressProps} />
      </Box>
      <Box w="110px" textAlign="right" alignSelf="center">
        <TimeIcon mr={2} />
        <ProcessingTime operation={operation} />
      </Box>
    </HStack>
  );
});

const ProcessingTime: FC<{ operation: IOperation }> = observer(({ operation }) => {
  return <>{humanProcessingTime(operation.processingTime)}</>;
});

const DeploymentError: FC = observer(() => {
  const installation = useInstallation();
  const deployment = installation.deploymentOperations;
  const errorDetail = deployment.errorDetail;
  const message =
    "Oops, things did not go smoothly, we are unable to provision the data lake. This might be an intermittent problem. Wait for a few minutes  and try again.";

  if (!deployment.isFailure) return null;

  return <RetryErrorPanel errorMessage={message} errorDetail={errorDetail} onRetry={() => installation.triggerDeployment()} />;
});
