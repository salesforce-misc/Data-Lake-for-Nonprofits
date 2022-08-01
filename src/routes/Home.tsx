import { FC, useEffect, useState } from "react";
import isNil from "lodash/isNil";
import { Box, Container, Heading, Text, Button, Grid, GridItem, Tag } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { GiPlug } from "react-icons/gi";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";

import { theme } from "../themes/orange";
import { Header } from "components/Header";
import { OutlineButton } from "../components/OutlineButton";
import { CurvedBox } from "../components/CurvedBox";
import { useStore } from "../AppContext";
import { BackHome } from "./BackHome";
import { useColorScheme } from "../models/useColorScheme";
import { CredentialsValidationException } from "../api/validate-credentials";
import { CredentialsForm, ICredentialsFormInput } from "../components/CredentialsForm";
import { CredentialsError } from "../components/CredentialsError";
import { IDetectedInstallation, useDetectedInstallationStore } from "../models/DetectedInstallationsStore";
import { DetectedInstallationSelections } from "../components/DetectedInstallationSelections";

type StepInfo = {
  title: string;
  desc: string;
};

const steps: StepInfo[] = [
  {
    title: "Connect to your AWS account",
    desc: `We need your AWS admin credentials so that we can connect to your AWS account and provision the resources for the data lake. We will
  guide you through the process of obtaining the needed credentials`,
  },
  {
    title: "Connect to your Salesforce organization",
    desc: `For AWS to access your Salesforce data, we will need your authorization. We will guide you through the steps of setting up Amazon AppFlow which
    is a service that allows AWS to connect to Salesforce, you will be creating a Salesforce connection, signing in to Salesforce and authorizing access`,
  },
  {
    title: "Select data import options",
    desc: `In this step, you can pick the standard NPSP import options for your Salesforce data or customize these options to fit your needs`,
  },
  {
    title: "Review and confirm",
    desc: `You get a chance to review and confirm the settings you have provided`,
  },
  {
    title: "Sit back and relax",
    desc: `In this step, we will do all the necessary provisioning and data importing. You can sit back and relax and watch the progress of the data import`,
  },
  {
    title: "Gain access",
    desc: "This is the final step, you can create users with credentials to access the data lake using Tableau desktop",
  },
];

export const Home: FC = observer(() => {
  const appStore = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (appStore.completedStep1) return <BackHome />;

  const handleNewInstallation = async () => {
    const hasInstallation = !isNil(appStore.installation);

    if (!hasInstallation) {
      appStore.newInstallation();
    }

    navigate("/steps/1");
  };

  return (
    <>
      <CurvedBox bgGradient={theme.gradients.bgLight} />

      <Container maxW="container.md" pt="20px" position="relative">
        <Header />
      </Container>

      <Container maxW="container.md" position="relative">
        <Box mt="-4" position="relative" boxShadow="base" borderRadius="lg" bg="orange.50" p={6}>
          <Box>
            <Heading
              display="inline-block"
              size="lg"
              pt="10px"
              pb="10px"
              pl={2}
              bgGradient="linear(to-r, orange.500, orange.400)"
              bgClip="text"
              textTransform="uppercase"
              letterSpacing="-1px"
            >
              What to expect
            </Heading>
          </Box>
          <Text pl={2}>
            In just a few steps, you can bring your Salesforce data to AWS and keep it in sync. Take a look at the summary of the steps needed, no
            worries though, we will guide you through each step.
          </Text>
          <Box textAlign="right" w="full" mt={4} mb={8}>
            <Button colorScheme="orange" size="md" rightIcon={<ArrowForwardIcon />} onClick={handleNewInstallation}>
              Let's Go
            </Button>
          </Box>

          {steps.map((item, index) => (
            <StepBox key={index} step={item} index={index} />
          ))}
        </Box>

        <ResumePanel />
      </Container>
      <Box h="50px">&nbsp;</Box>
    </>
  );
});

const ResumePanel: FC = observer(() => {
  const [collectCredentials, setCollectCredentials] = useState(false);
  const [credentialsAvailable, setCredentialsAvailable] = useState(false);
  const appStore = useStore();
  const { store } = useDetectedInstallationStore();

  useEffect(() => {
    // This pushes the scroll bar a bit lower to help the user see the additional card
    if (collectCredentials) setTimeout(() => window.scrollBy(0, 300), 200);
  }, [collectCredentials]);

  const handleCancel = () => {
    setCollectCredentials(false);
    setCredentialsAvailable(false);
  };

  const handleResume = (installation: IDetectedInstallation) => {
    appStore.useDetectedInstallation(installation, store.credentials);
    if (appStore.installation?.isPostDeployment) {
      appStore.installation.metadataStore.reset();
    }
  };

  return (
    <>
      {credentialsAvailable && (
        <Box boxShadow="base" borderRadius="lg" bg="orange.50" p={6} mt="40px">
          <DetectedInstallationSelections onCancel={handleCancel} onResume={handleResume} />
        </Box>
      )}
      {!credentialsAvailable && (
        <Box boxShadow="base" borderRadius="lg" bg="orange.50" p={6} mt="40px">
          <Box>
            <Heading
              display="inline-block"
              size="md"
              pt="10px"
              pb="10px"
              pl={2}
              bgGradient="linear(to-r, orange.500, orange.400)"
              bgClip="text"
              letterSpacing="-1px"
            >
              Resume
            </Heading>
          </Box>
          <Text pl={2}>
            If you have already created a datalake using the EZ Data Lake app and would like to view or resume its setup, we got you covered. Click
            the button to reconnect to an existing datalake, we will ask you for your AWS admin credentials so that we can detect the existing
            datalake setup.
          </Text>
          {!collectCredentials && (
            <Box textAlign="right" w="full" mt={4} mb={0}>
              <OutlineButton rightIcon={<GiPlug />} onClick={() => setCollectCredentials(true)}>
                Resume
              </OutlineButton>
            </Box>
          )}
        </Box>
      )}

      {collectCredentials && (
        <CredentialsCollectionForm
          onCancel={() => {
            setCollectCredentials(false);
            setCredentialsAvailable(false);
          }}
          onDone={() => {
            setCollectCredentials(false);
            setCredentialsAvailable(true);
          }}
        />
      )}
    </>
  );
});

const CredentialsCollectionForm: FC<{ onCancel: () => void; onDone: () => void }> = observer(({ onCancel, onDone }) => {
  const { colorScheme } = useColorScheme();
  const [error, setError] = useState<CredentialsValidationException | Error>();
  const { store } = useDetectedInstallationStore();

  const onSubmit: SubmitHandler<ICredentialsFormInput> = async (values) => {
    setError(undefined);
    const accessKey = values.accessKeyId;
    const secretKey = values.secretAccessKey;
    try {
      await store.connectToAws(accessKey, secretKey);
      try {
        store.load(); // Trigger the loading but don't bother with status and errors, they are all handled later
      } catch (err) {
        console.error(err);
      }

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
        >
          Continue
        </Button>
      </Box>
    </>
  );
});

const StepBox: FC<{ step: StepInfo; index: number }> = ({ step, index }) => (
  <Box minH="80px" borderRadius="lg" bg="orange.75" mb={3}>
    <Grid templateColumns="0.1fr 1fr 1fr 1fr 1fr" gap={0} p={4}>
      <GridItem rowSpan={2} colSpan={1} pr={4}>
        <Tag color="orange.500" bg="orange.200" borderRadius="full" size="lg" fontWeight="bold">
          {index + 1}
        </Tag>
      </GridItem>
      <GridItem colSpan={4} fontWeight="bold" color="orange.600">
        {step.title}
      </GridItem>
      <GridItem colSpan={4}>{step.desc}</GridItem>
    </Grid>
  </Box>
);
