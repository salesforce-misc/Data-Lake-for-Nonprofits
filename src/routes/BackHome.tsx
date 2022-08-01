import { FC, useEffect, useState } from "react";
import { Box, Container, Heading, Text, Button, Flex, Grid, GridItem, Alert, AlertIcon, Badge, Progress } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";

import { theme } from "../themes/orange";
import { CurvedBox } from "../components/CurvedBox";
import { TimeAgo } from "../components/TimeAgo";
import { useInstallation, useStore } from "../AppContext";
import { isCompleted } from "../models/Installation";
import { useColorScheme } from "../models/useColorScheme";
import { awsRegionsMap } from "../data/aws-regions";
import { TableauAccessPanel } from "../components/TableauAccessPanel";
import { CredentialsForm, ICredentialsFormInput } from "../components/CredentialsForm";
import { CredentialsValidationException } from "../api/validate-credentials";
import { CredentialsError } from "../components/CredentialsError";
import { UsersPanel } from "../components/UsersPanel";
import { CloudwatchDashboardPanel } from "../components/CloudwatchDashboardPanel";
import { SubscribeSNSPanel } from "../components/SubscribeSNSPanel";
import { DataImportStatusPanel } from "../components/DataImportStatusPanel";
import { DataModelTablePreview } from "../components/DataModelTablePreview";
import { useMetadataStore } from "../models/MetadataStore";
import { Header } from "components/Header";

export const BackHome: FC = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const navigate = useNavigate();
  const store = useStore();
  const installation = useInstallation();
  const [collectCredentials, setCollectCredentials] = useState(false);
  const [warning, setWarning] = useState(false);
  const completedProvisioning = isCompleted(installation.deploymentStep);
  const reviewCompleted = isCompleted(installation.reviewStep);
  const credentialsAvailable = !installation.credentials.empty;

  const gotoNextStep = () => {
    const nextStep = installation.nextStepNumber;
    navigate(`/steps/${nextStep}`);
  };

  const handleCollectCredentials = () => {
    if (credentialsAvailable) return gotoNextStep();
    setCollectCredentials(true);
  };

  const handleStartNew = () => {
    if (reviewCompleted) {
      setWarning(true);
    } else {
      store.newInstallation();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (collectCredentials || warning) setTimeout(() => window.scrollBy(0, 300), 200);
  }, [collectCredentials, warning]);

  return (
    <>
      <CurvedBox bgGradient={theme.gradients.bgLight} />

      <Container maxW="container.md" pt="20px" position="relative">
        <Header />
      </Container>

      <Container maxW="container.md" position="relative">
        <Box mt="-4" position="relative" boxShadow="base" borderRadius="lg" bg={tone(50)} p={10} pb={6} color={tone(800)}>
          <Flex mb={8}>
            <Box flex="1">
              <Heading size="lg" color={tone(600)} letterSpacing="-1px" textTransform="uppercase">
                Data Lake
              </Heading>
              <Box fontSize="small" mt={1} color={tone(700)}>
                <TimeAgo time={installation.startDate} /> &#8226; by {installation.startedBy}
              </Box>
            </Box>
            <Box color={tone(700)} mt={1} fontSize="xs">
              <Text display="block">Installation Id</Text>
              <Text>{installation.id}</Text>
            </Box>
          </Flex>
          <ReviewGrid />
          {!completedProvisioning && !collectCredentials && !warning && (
            <>
              <Text pl={2} mt={6}>
                Click <b>Resume</b> to continue the steps of provisioning the data lake
                {!credentialsAvailable && <>, we will ask you for your AWS admin credentials so that we can connect to your AWS account your </>}. You
                can also choose to start a new data lake.
              </Text>
              <Box textAlign="right" w="full" mt={6} mb={0}>
                <Button colorScheme={colorScheme} size="md" variant="outline" mr={6} onClick={handleStartNew}>
                  Start New
                </Button>
                <Button colorScheme={colorScheme} size="md" rightIcon={<ArrowForwardIcon />} onClick={handleCollectCredentials}>
                  Resume
                </Button>
              </Box>
            </>
          )}
        </Box>
        {completedProvisioning && (
          <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={6} p={10} pb={10}>
            <TableauAccessPanel />
          </Box>
        )}
        {completedProvisioning && credentialsAvailable && (
          <>
            <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={6} p={10} pb={4} position="relative">
              <UsersPanel />
            </Box>

            <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={6} p={10} pb={6}>
              <DataImportStatusPanel />
            </Box>

            <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={6} p={10} pb={6}>
              <DataTablePanel />
            </Box>

            <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={6} p={10} pb={4} position="relative">
              <CloudwatchDashboardPanel region={installation.region} id={installation.id} />
            </Box>

            <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={6} p={10} pb={4} position="relative">
              <SubscribeSNSPanel />
            </Box>
          </>
        )}
        {completedProvisioning && !credentialsAvailable && <ManagePanel />}
        {warning && <StartNewWarning onCancel={() => setWarning(false)} onContinue={() => store.newInstallation()} />}
        {collectCredentials && (
          <CredentialsCollectionForm
            onCancel={() => setCollectCredentials(false)}
            onDone={() => {
              setCollectCredentials(false);
              gotoNextStep();
            }}
          />
        )}
      </Container>
      <Box h="50px">&nbsp;</Box>
    </>
  );
});

const DataTablePanel: FC = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const { store, isReady } = useMetadataStore();
  const selectedObjectsCount = store.selectedObjects.length;
  const isEmptyModel = selectedObjectsCount === 0;

  return (
    <>
      <Heading size="md" pt="0px" pb="0px" color={tone(600)} letterSpacing="-1px">
        Objects <CountBadge />
      </Heading>
      {isEmptyModel && isReady && (
        <Box bg={tone(100)} textAlign="center" p={4} mt={6} mb={4} fontSize="sm" color={tone(600)} borderRadius="md">
          No objects
        </Box>
      )}
      <DataTableStatusInfo />
      <DataModelTablePreview colorScheme={colorScheme} showCaption={false} />
    </>
  );
});

const DataTableStatusInfo: FC = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const { isReady, isError, store } = useMetadataStore();
  const progress = store.loadingPercentage;
  const handleTryAgain = () => {
    store.load();
  };

  if (isError) {
    return (
      <Alert status="error" variant="left-accent" mt={6} mb={4} color="red.700" alignItems="flex-end">
        <AlertIcon alignSelf="flex-start" />
        <Box>
          <Box>
            Something went wrong and we are unable get the data schema. This might be an intermittent problem. Wait for a few minutes and try again.
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
    <Box mt={6} mb={4} p={0}>
      <Box textAlign="center" fontWeight="bold" color={tone(600)} fontSize="md" mb={4}>
        Retrieving the data schema, this might take a few seconds
        <br />
        {Math.ceil(progress)} %
      </Box>
      <Progress size="sm" isIndeterminate colorScheme={colorScheme} bg={tone(100)} />
    </Box>
  );
});

const CountBadge: FC = observer(() => {
  const { tone } = useColorScheme();
  const { isError, isReady, store } = useMetadataStore();

  if (isError || !isReady) return null;

  return (
    <Badge ml={3} p={1} pl={2} pr={2} bg={tone(100)} fontSize="small" borderRadius="full" color={tone(700)} fontWeight="bold">
      {store.selectedObjects.length}
    </Badge>
  );
});

const ManagePanel: FC = observer(() => {
  const store = useStore();
  const { tone, colorScheme } = useColorScheme();
  const [collectCredentials, setCollectCredentials] = useState(false);
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    if (collectCredentials || warning) setTimeout(() => window.scrollBy(0, 300), 200);
  }, [collectCredentials, warning]);

  return (
    <>
      <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={6} p={10} pb={6} color={tone(800)}>
        <Heading size="md" pt="0px" pb="10px" color={tone(600)} letterSpacing="-1px">
          Manage data lake
        </Heading>
        <Text>
          You can manage users, see the latest data import status and more. Click <b>Manage</b> to unlock these capabilities. We will ask you for your
          AWS admin credentials so that we can connect to your AWS account.
        </Text>
        {!collectCredentials && !warning && (
          <Box textAlign="right" w="full" mt={6} mb={0}>
            <Button colorScheme={colorScheme} size="md" variant="outline" mr={6} onClick={() => setWarning(true)}>
              Start New
            </Button>
            <Button colorScheme={colorScheme} size="md" onClick={() => setCollectCredentials(true)}>
              Manage
            </Button>
          </Box>
        )}
      </Box>

      {warning && <StartNewWarning onCancel={() => setWarning(false)} onContinue={() => store.newInstallation()} />}

      {collectCredentials && (
        <CredentialsCollectionForm
          buttonTitle="Manage"
          onCancel={() => setCollectCredentials(false)}
          onDone={() => {
            setCollectCredentials(false);
          }}
        />
      )}
    </>
  );
});

const StartNewWarning: FC<{ onCancel: () => void; onContinue: () => void }> = observer(({ onCancel, onContinue }) => {
  const { tone, colorScheme } = useColorScheme();

  return (
    <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={6} p={10} pb={6}>
      <Alert status="warning" borderRadius="lg" color={tone(700)}>
        <Flex>
          <AlertIcon mt={1} />
          <Text flex={1}>
            You existing data lake is consuming AWS resources that might incur cost, starting a new data lake will <b>not delete</b> these resources
            and your existing data lake will be left intact. Take additional steps to clean the existing resources if desired.
          </Text>
        </Flex>
      </Alert>
      <Box textAlign="right" w="full" mt={6} mb={0}>
        <Button colorScheme={colorScheme} size="md" variant="outline" mr={6} onClick={() => onCancel()}>
          Cancel
        </Button>
        <Button colorScheme={colorScheme} size="md" onClick={() => onContinue()}>
          Continue
        </Button>
      </Box>
    </Box>
  );
});

const CredentialsCollectionForm: FC<{ onCancel: () => void; onDone: () => void; buttonTitle?: string }> = observer(
  ({ onCancel, onDone, buttonTitle = "Resume" }) => {
    const { colorScheme } = useColorScheme();
    const [error, setError] = useState<CredentialsValidationException | Error>();
    const installation = useInstallation();
    const onSubmit: SubmitHandler<ICredentialsFormInput> = async (values) => {
      setError(undefined);
      const accessKey = values.accessKeyId;
      const secretKey = values.secretAccessKey;
      const region = installation.region;
      try {
        await installation.connectToAwsStep.connectToAws(accessKey, secretKey, region);
        if (installation.isPostDeployment) installation.metadataStore.reset();
        return onDone();
      } catch (err: any) {
        console.log(err);
        setError(err);
      }
    };

    const {
      handleSubmit,
      register,
      control,
      formState: { errors, isSubmitting },
    } = useForm<ICredentialsFormInput>();

    const buttonProps: any = {};
    if (buttonTitle === "Resume") buttonProps.rightIcon = <ArrowForwardIcon />;

    return (
      <>
        <CredentialsError exception={error} />

        <Box pt={6}>
          {/* @ts-ignore */}
          <CredentialsForm {...{ register, errors, isSubmitting, control }} />
        </Box>

        <Box textAlign="right" w="full" mt={6} mb={0}>
          <Button colorScheme={colorScheme} size="md" disabled={isSubmitting} variant="ghost" onClick={() => onCancel()}>
            Cancel
          </Button>
          <Button
            colorScheme={colorScheme}
            size="md"
            loadingText="Connecting"
            ml={3}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            {...buttonProps}
          >
            {buttonTitle}
          </Button>
        </Box>
      </>
    );
  }
);

const ReviewGrid: FC = observer(() => {
  const { tone } = useColorScheme();
  const installation = useInstallation();

  const commonProps = {
    w: "100%",
    h: "100%",
    borderRadius: "md",
    p: 0,
  };

  const headerProps = {
    ...commonProps,
    color: tone(700),
    fontWeight: "bold",
  };

  const contentProps = {
    ...commonProps,
    bg: tone(75),
    color: tone(800),
    p: 1,
    pl: 3,
  };

  return (
    <Grid templateColumns="0.5fr 1fr" gap={2} pb={6}>
      <GridItem {...headerProps}>AWS Account Id</GridItem>
      <GridItem {...contentProps}>{installation.accountId}</GridItem>

      <GridItem {...headerProps}>AWS Region</GridItem>
      <GridItem {...contentProps}>{awsRegionsMap[installation.region].label}</GridItem>

      {installation.appFlowConnectionName && (
        <>
          <GridItem {...headerProps}>Connection Name</GridItem>
          <GridItem {...contentProps}>{installation.appFlowConnectionName}</GridItem>
        </>
      )}
      {isCompleted(installation.connectToSalesforceStep) && (
        <>
          <GridItem {...headerProps}>Import Schedule</GridItem>
          <GridItem {...contentProps}>{installation.importOptionsStep.infoMessage}</GridItem>
        </>
      )}
    </Grid>
  );
});
