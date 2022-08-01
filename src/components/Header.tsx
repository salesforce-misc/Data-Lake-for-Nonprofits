import React from "react";
import { Box, Stack, Heading, Image } from "@chakra-ui/react";

import { theme } from "../themes/orange";

export const Header = () => {
  return (
    <Stack direction={{ base: "column", lg: "row" }} spacing={{ base: "0", lg: "0" }} align="center" justifyContent="center">
      <Box maxW="300px">
        <Image src={ezDataLakeTitleImage} />
      </Box>
      <Box maxW="400px">
        <Image src={welcomeImage} />
      </Box>
    </Stack>
  );
};
