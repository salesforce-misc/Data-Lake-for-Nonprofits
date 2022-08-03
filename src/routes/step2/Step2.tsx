import React from "react";
import isEmpty from "lodash/isEmpty";
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  Button,
  Link as ChakraLink,
  ChakraProvider,
  UnorderedList,
  ListItem,
  Stack,
  Collapse,
  Divider,
} from "@chakra-ui/react";
import { ArrowForwardIcon, ArrowBackIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import appflowConnectionImage01 from "images/appflow-connection-01.png";
import appflowConnectionImage02 from "images/appflow-connection-02.png";
import appflowConnectionImage03 from "images/appflow-connection-03.png";
import appflowConnectionImage04 from "images/appflow-connection-04.png";

import { useInstallation, useStore } from "AppContext";
import { theme } from "themes/blue";
import { CurvedBox } from "components/CurvedBox";
import { StepsIndicator } from "components/StepsIndicator";
import { ClickableImage } from "components/ClickableImage";
import { YesNoAnswer } from "models/steps/BaseStep";
import { OutlineButton } from "components/OutlineButton";
import { Header } from "components/Header";
import { AppFlowConnectionSelection } from "routes/step2/AppFlowConnectionSelection";

export const Step2 = observer(() => {
  const installation = useInstallation();
  const region = installation.region;
  const step = installation.connectToSalesforceStep;
  const createdConnection = step.createdConnection;
  const navigate = useNavigate();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const appStore = useStore();

  const handleAnswer = (answer: YesNoAnswer) => () => {
    step.setCreatedConnection(answer);
  };

  const handlePrevious = () => {
    navigate("/steps/1");
  };

  const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = async () => {
    if (isEmpty(installation.appFlowConnectionName)) throw Error("No appFlow connection name is selected");
    step.markCompleted();
    setSubmitting(false);
    navigate("/steps/3");
  };

  React.useEffect(() => {
    step.markStarted();
    window.scrollTo(0, 0);
  }, [appStore, step]);

  const canProceed = createdConnection === YesNoAnswer.Yes && !isEmpty(installation.appFlowConnectionName);

  return (
    <ChakraProvider theme={theme}>
      <CurvedBox bgGradient={theme.gradients.bgLight} />

      <Header />

      <Box position="relative">
        <CurvedBox />

        <Box bg="blue.600" w="full" position="relative">
          <Container maxW="container.md" pt="15px" pb="15px">
            <StepsIndicator current={2} />
          </Container>
        </Box>

        <Container maxW="container.md" pt="0px" position="relative">
          <Heading display="inline-block" size="lg" pt="16px" pb="30px" color="gray.100" letterSpacing="-1px">
            Connect to your Salesforce organization
          </Heading>

          <Box color="gray.50" mb={10}>
            <Stack direction="column" spacing="8px" align="left" justifyContent="space-between">
              <Box>For AWS to access your Salesforce data, we will need your authorization.</Box>
              <Box>We will guide you through the steps of setting up Amazon AppFlow which is a service that allows AWS to connect to Salesforce.</Box>
              <Box>You will be creating a Salesforce connection, signing in to Salesforce and authorizing access.</Box>
            </Stack>
          </Box>

          <Box borderRadius="lg" boxShadow="base" bg="blue.50" mt={4} p={8}>
            <Box p={0} mb={6}>
              <Heading size="md" pt="0px" pb="10px" color="blue.600" letterSpacing="-1px">
                Create a dedicated Salesforce user
              </Heading>
              <Text mb={4}>
                To gain access to your Salesforce data, you need a Salesforce user for authentication purposes. It is best security practice to use a
                dedicated user for this purpose. This helps ensure business continuity and adheres to the principle of least privilege to help secure
                your data. For detailed instructions, see &nbsp;
                <ChakraLink href="https://help.salesforce.com/articleView?id=000331470&amp;type=1&amp;mode=1" isExternal color="blue.600">
                  Create a secure Salesforce API user <ExternalLinkIcon mx="2px" />
                </ChakraLink>
              </Text>
              If you do not have an extra full Salesforce user license available, you can skip this step and instead repurpose a user with a profile
              or permission set that provides:
              <UnorderedList ml={5} mt={2} mb={3}>
                <ListItem>Access to the objects and fields in Salesforce that you plan to sync</ListItem>
                <ListItem>System Permission: API Enabled</ListItem>
                <ListItem> System Permission: Manage Connected Apps</ListItem>
              </UnorderedList>
              This is likely a user with a System Administrator or similar profile.
            </Box>

            <Box p={0}>
              <Heading size="md" pt="0px" pb="10px" color="blue.600" letterSpacing="-1px">
                Create a Salesforce connection using Amazon AppFlow
              </Heading>
              <Text mb={4}>
                Amazon AppFlow is a service that allows AWS to connect to Salesforce, for this to work, you need to create a Salesforce connection
                using Amazon AppFlow.
              </Text>
            </Box>

            <Stack direction={{ base: "column", md: "row" }} spacing="30px" pt={3} pb={6}>
              <Box>
                <ClickableImage w={{ base: "full", md: "300px" }} src={appflowConnectionImage01} title="AppFlow Connections Page" />
              </Box>
              <Box>
                <UnorderedList ml={5} mt={2} mb={3} color="blue.800">
                  <ListItem>
                    Go to the &nbsp;
                    <ChakraLink
                      href={`https://${region}.console.aws.amazon.com/appflow/home?region=${region}#/connections/salesforce`}
                      isExternal
                      color="blue.600"
                    >
                      AppFlow connections page <ExternalLinkIcon mx="2px" />
                    </ChakraLink>
                  </ListItem>
                  <ListItem> Click on the Create connection button </ListItem>
                </UnorderedList>
              </Box>
            </Stack>

            <Divider borderColor="blue.100" />

            <Stack direction={{ base: "column", md: "row" }} spacing="30px" pt={3} pb={6} mt={2}>
              <Box>
                <ClickableImage w={{ base: "full", md: "300px" }} src={appflowConnectionImage02} title="AppFlow Connection Page" />
              </Box>
              <Box>
                <UnorderedList ml={5} mt={2} mb={3} color="blue.800">
                  <ListItem>Choose the Salesforce environment you want to connect to</ListItem>
                  <ListItem>Leave the Private Link selection as 'Disabled'</ListItem>
                  <ListItem>Leave the Data Encryption setting as is</ListItem>
                  <ListItem>Type a name for the connection, it can be anything you want, then click Continue</ListItem>
                </UnorderedList>
              </Box>
            </Stack>

            <Divider borderColor="blue.100" />

            <Stack direction={{ base: "column", md: "row" }} spacing="30px" pt={3} pb={6} mt={3}>
              <Box>
                <ClickableImage w={{ base: "full", md: "300px" }} src={appflowConnectionImage03} title="Salesforce Login Page" />
              </Box>
              <Box>
                <UnorderedList ml={5} mt={2} mb={3} color="blue.800">
                  <ListItem>Provide the user name and password for the dedicated Salesforce user that you created earlier</ListItem>
                </UnorderedList>

                <Box fontSize="sm" mt={3} bg="blue.75" p={3} borderRadius="lg">
                  Remember to log in using the newly created dedicated Salesforce user
                </Box>
              </Box>
            </Stack>

            <Divider borderColor="blue.100" />

            <Stack direction={{ base: "column", md: "row" }} spacing="30px" pt={3} pb={6} mt={3}>
              <Box>
                <ClickableImage w={{ base: "full", md: "300px" }} src={appflowConnectionImage04} title="Salesforce Allow Access Page" />
              </Box>
              <Box>
                <UnorderedList ml={5} mt={2} mb={3} color="blue.800">
                  <ListItem>Allow access to your Salesforce data</ListItem>
                  <ListItem>
                    You will be directed back to the AppFlow connections page, you should see the connection name that you just created. You don't
                    need to do anything else on the AppFlow connections page. Go ahead and select Yes for the next question.
                  </ListItem>
                </UnorderedList>
              </Box>
            </Stack>

            <Stack direction="row" spacing="0px" pt={3} pb={6} alignItems="baseline" justifyContent="space-between">
              <Heading size="md" color="blue.600" letterSpacing="-1px" mt={0}>
                Did you create a Salesforce connection using Amazon AppFlow?
              </Heading>
              <Box textAlign="right">
                <OutlineButton selected={createdConnection === YesNoAnswer.Yes} onClick={handleAnswer(YesNoAnswer.Yes)} ml={3}>
                  Yes
                </OutlineButton>
              </Box>
            </Stack>

            <Collapse in={createdConnection === YesNoAnswer.Yes} animateOpacity>
              <Box>{createdConnection === YesNoAnswer.Yes && <AppFlowConnectionSelection />}</Box>
            </Collapse>
          </Box>

          <HStack justifyContent="space-between" p={3} pt={6} mb={12}>
            <Button colorScheme="blue" size="md" leftIcon={<ArrowBackIcon />} disabled={isSubmitting} variant="ghost" onClick={handlePrevious}>
              Previous
            </Button>
            <Button
              colorScheme="blue"
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
    </ChakraProvider>
  );
});
