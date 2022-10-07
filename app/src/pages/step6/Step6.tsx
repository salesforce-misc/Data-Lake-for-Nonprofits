import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, HStack } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { Layout } from "components/Layout";
import { useColorScheme } from "models/useColorScheme";
import { TableauDesktop } from "./tableau-desktop/TableauDesktop";
import { TableauOnline } from "./tableau-online/TableauOnline";
import { AdminTools } from "./AdminTools";

export const Step6 = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const installation = useInstallation();
  const navigate = useNavigate();
  const step = installation.createUsersStep;

  React.useEffect(() => {
    step.markStarted();
    window.scrollTo(0, 0);
  }, [step]);

  const handlePrevious = () => {
    navigate("/steps/5");
  };

  return (
    <Layout
      step={6}
      title="Connect to Analytics"
      description="Now that you have the data lake provisioned, you can connect to Tableau for analytics. Here you will gather all the necessary information needed to make that connection."
    >
      <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={10} pb={4} position="relative">
        <TableauOnline />
      </Box>

      <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={10} pb={4} position="relative">
        <TableauDesktop />
      </Box>

      <Box borderRadius="lg" boxShadow="base" bg={tone(25)} mt={4} p={10} pb={4} position="relative">
        <AdminTools />
      </Box>

      <HStack justifyContent="space-between" p={3} pt={6} mb={12}>
        <Button colorScheme={colorScheme} size="md" _hover={{ bg: tone(100) }} leftIcon={<ArrowBackIcon />} variant="ghost" onClick={handlePrevious}>
          Previous
        </Button>
      </HStack>
    </Layout>
  );
});
