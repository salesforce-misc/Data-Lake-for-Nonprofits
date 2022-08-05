import React from "react";
import { Box, Divider, Stack, Link as ChakraLink, UnorderedList, ListItem } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import awsConnectImage01 from "images/aws-connect-01.png";
import awsConnectImage02 from "images/aws-connect-02.png";

import { ClickableImage } from "components/ClickableImage";

export const InstructionSection = () => {
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
