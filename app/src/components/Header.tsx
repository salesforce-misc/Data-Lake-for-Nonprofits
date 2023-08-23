import React from "react";
import { observer } from "mobx-react";
import { Box, Stack, Heading, HStack, Image, VStack, StackDivider, Container, useTheme } from "@chakra-ui/react";

// import { theme } from "themes/orange";

import AWSLogo from "images/AWS_logo_RGB_BLK.png";
import SalesforceLogo from "images/Salesforce_Corporate_Logo_RGB.png";
import VeraLogo from "images/vera-solutions-squarelogo-1455866080574.png";

export const Header = observer(() => {
  const theme = useTheme();

  return (
    <Container maxW="container.md" pt="20px" position="relative">
      <VStack spacing="24px">
        <HStack
          direction={{ base: "column", lg: "row" }}
          spacing={{ base: "0", lg: "0" }}
          divider={<StackDivider borderColor="gray.200" />}
          width="100%"
        >
            <Box maxW="90px" paddingRight="24px">
            <Image src={VeraLogo} />
          </Box>
          <Box maxW="90px" paddingRight="24px">
            <Image src={SalesforceLogo} />
          </Box>
          <Box maxW="65px">
            <Image src={AWSLogo} marginLeft="24px" />
          </Box>
        </HStack>
        <Stack direction={{ base: "column", lg: "row" }} spacing={{ base: "0", lg: "0" }} width="100%">
          <Box maxH="160px" marginBottom="32px">
            <Heading id="h2-title" display="inline-block" size="lg" pb="10px" bgGradient={theme.gradients.bgDark} bgClip="text" letterSpacing="-1px">
              Data Lake for Nonprofits, Powered by AWS
            </Heading>
          </Box>
        </Stack>
      </VStack>
    </Container>
  );
});
