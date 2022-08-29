import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import { useInstallation, useStore } from "AppContext";
import { Layout } from "components/Layout";
import { TimeAgo } from "components/TimeAgo";
import { isCompleted } from "models/Installation";
import { useColorScheme } from "models/useColorScheme";
import { AccessInformation } from "pages/step6/AccessInformation";
import { UsersPanel } from "pages/step6/users-panel/UsersPanel";
import { CloudwatchDashboardPanel } from "pages/step6/CloudwatchDashboardPanel";
import { SubscribeSNSPanel } from "pages/step6/SubscribeSNSPanel";
import { DataImportStatusPanel } from "pages/step5/data-import-status-panel/DataImportStatusPanel";

import { ReviewGrid } from "./ReviewGrid";
import { DataTablePanel } from "./DataTablePanel";
import { ManagePanel } from "./ManagePanel";
import { StartNewWarning } from "./StartNewWarning";
import { CredentialsCollectionForm } from "./CredentialsCollectionForm";

export const BackHome = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const navigate = useNavigate();
  const store = useStore();
  const installation = useInstallation();
  const [collectCredentials, setCollectCredentials] = React.useState(false);
  const [warning, setWarning] = React.useState(false);
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

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    if (collectCredentials || warning) setTimeout(() => window.scrollBy(0, 300), 200);
  }, [collectCredentials, warning]);

  return (
    <Layout step={0} title="Data Lake Information">
      <Box position="relative" boxShadow="base" borderRadius="lg" bg={tone(50)} p={10} pb={6} color={tone(800)}>
        <Box fontSize="small" mt={1} mb={8} color={tone(700)}>
          <TimeAgo time={installation.startDate} /> &#8226; by {installation.startedBy}
        </Box>

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
          <AccessInformation />
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
      <Box h="50px">&nbsp;</Box>
    </Layout>
  );
});
