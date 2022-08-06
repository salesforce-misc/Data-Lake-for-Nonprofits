import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import { GiPlug } from "react-icons/gi";
import { observer } from "mobx-react";

import { useStore } from "AppContext";
import { OutlineButton } from "components/OutlineButton";
import { useDetectedInstallationStore } from "models/useDetectedInstallationStore";
import { IDetectedInstallation } from "models/helpers/DetectedInstallation";

import { CredentialsCollectionForm } from "routes/step1/CredentialsCollectionForm";
import { DetectedInstallations } from "routes/home/detected-installations/DetectedInstallations";

export const ResumePanel = observer(() => {
  const [collectCredentials, setCollectCredentials] = React.useState(false);
  const [credentialsAvailable, setCredentialsAvailable] = React.useState(false);
  const appStore = useStore();
  const { store } = useDetectedInstallationStore();

  React.useEffect(() => {
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
          <DetectedInstallations onCancel={handleCancel} onResume={handleResume} />
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
