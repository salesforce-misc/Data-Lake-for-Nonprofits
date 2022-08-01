import { extendTheme } from "@chakra-ui/react";
import { theme as baseTheme } from './base';

// https://chakra-ui.com/docs/theming/customize-theme
// NOTE: we want to keep the export name as 'theme' to help us with theme typings as discussed
//       here https://chakra-ui.com/docs/styled-system/theming/advanced#theme-typings
export const theme = extendTheme({
  name: 'purple',
  styles: {
    global: {
      // styles for the `body`
      body: {
        bg: "purple.50",
      },
    },
  },
  gradients: {
    bgLight: 'linear(to-b, purple.300, purple.500)',
    bgDark: 'linear(to-b, purple.700, purple.800)',
  },

  outlineButton: {
    scheme: "purple",
    hover: {
      bg: "purple.600",
      color: "purple.50"
    },
    active: {
      bg: "purple.500",
      color: "purple.50"
    },
    selected: {
      bg: "purple.500",
      color: "purple.50"
    }
  },

  stepsIndicator: {
    currentProps: {
      color: "purple.500",
      bg: "purple.50",    
    },
    beforeProps: {
      color: "purple.50",
      bg: "purple.700",    
    },
    afterProps: {
      color: "purple.500",
      bg: "purple.300",    
    }
  },

  clickableImage: {
    scheme: "purple",
  }

}, baseTheme);
