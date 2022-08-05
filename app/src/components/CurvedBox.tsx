import React from "react";
import { Box, BoxProps, useTheme } from "@chakra-ui/react";

/**
 * A div with a curved bottom
 * To generate a curved css section
 * see https://cssmatic.net/css-curved-background-generator/
 */
export const CurvedBox = (props: BoxProps) => {
  const theme: any = useTheme();

  return (
    <Box
      sx={{
        display: "block",
        boxSizing: "border-box",
        bgGradient: theme.gradients?.bgDark,
        clipPath: "ellipse(111% 100% at 65.86% 0%)",
        position: "absolute",
        left: 0,
        top: 0,
        height: { base: "500px", md: "450px" },
        w: "full",
        ...props,
      }}
      data-testid="curved-box"
    />
  );
};
