import { FC } from "react";
import { Box, BoxProps, useTheme } from "@chakra-ui/react";

/**
 * A div with a curved bottom
 */
export const CurvedBox: FC<BoxProps> = (props) => {
  // To generate a curved css section
  // see https://cssmatic.net/css-curved-background-generator/

  const theme: any = useTheme();

  const curvedStyle = {
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
  };

  return <Box sx={curvedStyle} />;
};
