import React from "react";
import { Box, Stack, Heading, HStack, Image, VStack, StackDivider, Container } from "@chakra-ui/react";

import { theme } from "themes/orange";
import AWSLogo from "images/AWS_logo_RGB_BLK.png";
import SalesforceLogo from "images/Salesforce-dot-org-Logo-CMYK-Hrzl.png";

export const Header = () => {
  return (
    <Container maxW="container.md" pt="20px" position="relative">
      <VStack spacing="16px">
        <HStack
          direction={{ base: "column", lg: "row" }}
          spacing={{ base: "0", lg: "0" }}
          divider={<StackDivider borderColor="gray.200" />}
          width="100%"
        >
          <Box maxW="220px" maxH="100px" paddingRight="10px">
            <Image src={SalesforceLogo} />
          </Box>
          <Box maxW="60px">
            <Image src={AWSLogo} marginTop="8px" marginLeft="24px" />
          </Box>
        </HStack>
        <Stack direction={{ base: "column", lg: "row" }} spacing={{ base: "0", lg: "0" }} width="100%">
          <Box maxH="160px" marginBottom="32px">
            <Heading
              display="inline-block"
              size="lg"
              pt="10px"
              pb="10px"
              pl={2}
              bgGradient={theme.gradients.bgDark}
              bgClip="text"
              letterSpacing="-1px"
            >
              Datalake for Nonprofits, Powered by AWS
            </Heading>
          </Box>
        </Stack>
      </VStack>
    </Container>
  );
};
