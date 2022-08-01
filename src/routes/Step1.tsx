import { FC, useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  Button,
  Collapse,
  Divider,
  Stack,
  Link as ChakraLink,
  UnorderedList,
  ListItem,
  Image,
} from "@chakra-ui/react";
import { ArrowForwardIcon, ArrowBackIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import awsConnectImage01 from "../images/aws-connect-01.png";
import awsConnectImage02 from "../images/aws-connect-02.png";
import awsPlugImage01 from "../images/aws-plug-01.png";
import { CredentialsValidationException } from "../api/validate-credentials";
import { useInstallation, useStore } from "../AppContext";
import { CurvedBox } from "../components/CurvedBox";
import { StepsIndicator } from "../components/StepsIndicator";
import { ClickableImage } from "../components/ClickableImage";
import { OutlineButton } from "../components/OutlineButton";
import { YesNoAnswer } from "../models/steps/BaseStep";
import { CredentialsForm, ICredentialsFormInput } from "../components/CredentialsForm";
import { RegionForm } from "../components/RegionForm";
import { CredentialsError } from "../components/CredentialsError";

export const Step1: FC = observer(() => {
  const installation = useInstallation();
  const step = installation.connectToAwsStep;
  const needsAssistance = step.needsAssistance;
  const navigate = useNavigate();
  const [stepException, setStepException] = useState<CredentialsValidationException | Error>();
  const appStore = useStore();

  const handleAnswer = (answer: YesNoAnswer) => () => {
    step.setNeedsAssistance(answer);
  };

  const handlePrevious = () => {
    navigate("/");
  };

  const onSubmit: SubmitHandler<ICredentialsFormInput> = async (values) => {
    setStepException(undefined);
    const accessKey = values.accessKeyId;
    const secretKey = values.secretAccessKey;
    const region = values.region;
    try {
      await step.connectToAws(accessKey, secretKey, region);
      step.markCompleted();
      navigate("/steps/2");
    } catch (err: any) {
      console.log(err);
      setStepException(err);
    }
  };

  useEffect(() => {
    step.markStarted();
    window.scrollTo(0, 0);
  }, [appStore, step]);

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ICredentialsFormInput>();

  const regionDescription =
    "AWS has many data centers grouped by geographical regions. Select a region that is closest to your location. We will keep your data in the region you select. If you are not sure, you can select the US East (Ohio) Region";

  return (
    <Box position="relative">
      <CurvedBox />
      <Box bg="orange.400" w="full" position="relative">
        <Container maxW="container.md" pt="15px" pb="15px">
          <StepsIndicator current={1} />
        </Container>
      </Box>

      <Container maxW="container.md" pt="0px" position="relative">
        <Text color="orange.100" mt={5}>
          Step 1
        </Text>
        <Heading display="inline-block" size="lg" pt="0px" pb="30px" color="gray.100" letterSpacing="-1px">
          Connect to your AWS account
        </Heading>
        <Box color="gray.50">
          <Stack direction="row" spacing="0px" align="left" justifyContent="space-between">
            <Box mb={10}>
              We need your AWS <b>admin</b> credentials, specifically the <b>access keys</b>, so that we can connect to your AWS account and provision
              the resources for the data lake. Access keys consist of two parts: an access key id and a secret access key. These access keys must be
              for a user with admin permissions. &nbsp; &nbsp;If you haven't created access keys before, we will guide you through the process of
              obtaining the needed credentials.
            </Box>
            <Box maxH={{ base: "150px", md: "200px" }} position="relative" top="-20px">
              <Image src={awsPlugImage01} />
            </Box>
          </Stack>
        </Box>

        <Box borderRadius="lg" boxShadow="base" bg="orange.50" mt={0} p={6}>
          <Box p={0}>
            <Heading size="md" pt="0px" pb="30px" color="orange.600" letterSpacing="-1px">
              Would you need assistance in creating AWS admin access and secret keys?
            </Heading>
            <Box textAlign="right" w="full" mb={4}>
              <OutlineButton selected={needsAssistance === YesNoAnswer.Yes} onClick={handleAnswer(YesNoAnswer.Yes)}>
                Yes
              </OutlineButton>
              <OutlineButton selected={needsAssistance === YesNoAnswer.No} onClick={handleAnswer(YesNoAnswer.No)} ml={3}>
                No
              </OutlineButton>
            </Box>
          </Box>

          <Collapse in={needsAssistance === YesNoAnswer.Yes} animateOpacity>
            <Box pt={6}>
              <InstructionSection />
            </Box>
          </Collapse>
        </Box>
        <Collapse in={needsAssistance !== YesNoAnswer.MissingAnswer} animateOpacity>
          <CredentialsError exception={stepException} />

          <Box pt={6}>
            {/* @ts-ignore */}
            <CredentialsForm {...{ register, errors, isSubmitting, control }} />
          </Box>
          <Box pt={6}>
            {/* @ts-ignore */}
            <RegionForm {...{ register, errors, isSubmitting }} description={regionDescription} defaultRegion={installation.region} />
          </Box>
        </Collapse>

        <HStack justifyContent="space-between" p={3} pt={6} mb={12}>
          <Button colorScheme="orange" size="md" leftIcon={<ArrowBackIcon />} disabled={isSubmitting} variant="ghost" onClick={handlePrevious}>
            Previous
          </Button>
          <Button
            colorScheme="orange"
            size="md"
            loadingText="Connecting"
            rightIcon={<ArrowForwardIcon />}
            ml={3}
            isLoading={isSubmitting}
            disabled={needsAssistance === YesNoAnswer.MissingAnswer || isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Next
          </Button>
        </HStack>
      </Container>
    </Box>
  );
});

const InstructionSection: FC = () => {
  return (
    <Box bg="orange.75" p={6} borderRadius="lg" border="1px" borderColor="orange.100">
      <Stack direction={{ base: "column", md: "row" }} spacing="30px" pt={6} pb={6}>
        <Box>
          <ClickableImage w={{ base: "full", md: "300px" }} src={awsConnectImage01} title="AWS Console Login Page" />
        </Box>
        <Box>
          <UnorderedList ml={5} mt={0} mb={3} color="orange.900">
            <ListItem>
              Log in to the &nbsp;
              <ChakraLink href="https://aws.amazon.com/console/" isExternal color="orange.600">
                AWS console <ExternalLinkIcon mx="2px" />
              </ChakraLink>
              &nbsp; using an admin user, not the root user.
            </ListItem>
          </UnorderedList>
          <Box fontSize="sm" mt={4} bg="orange.100" p={3} borderRadius="lg">
            Remember to log in using an admin user and not the root user
          </Box>
        </Box>
      </Stack>

      <Divider borderColor="orange.200" />

      <Stack direction={{ base: "column", md: "row" }} spacing="30px" mt={6} mb={0}>
        <Box>
          <ClickableImage w={{ base: "full", md: "300px" }} src={awsConnectImage02} title="AWS Console IAM Page" />
        </Box>
        <Box>
          <UnorderedList ml={5} mt={0} mb={0} color="orange.900">
            <ListItem>
              Then, head over to the{" "}
              <ChakraLink href="https://console.aws.amazon.com/iamv2/home#/users" isExternal color="orange.600">
                Identity and Management section (IAM) <ExternalLinkIcon mx="2px" />
              </ChakraLink>
            </ListItem>
            <ListItem mt={4}>
              Pick the user name that you used to log in. The user should have admin permissions. Then, select the Security Credentials tab.
            </ListItem>
            <ListItem mt={4}>
              Click on the Create access key button to generate the access keys, you will get a chance to view and download the access keys. You can
              now use the access keys to fill in the information below.
            </ListItem>
          </UnorderedList>
        </Box>
      </Stack>
    </Box>
  );
};
