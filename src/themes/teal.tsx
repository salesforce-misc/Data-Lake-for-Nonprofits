import { extendTheme } from "@chakra-ui/react";
import { theme as baseTheme } from './base';

// https://chakra-ui.com/docs/theming/customize-theme
// NOTE: we want to keep the export name as 'theme' to help us with theme typings as discussed
//       here https://chakra-ui.com/docs/styled-system/theming/advanced#theme-typings
export const theme = extendTheme({
  name: 'teal',
  styles: {
    global: {
      // styles for the `body`
      body: {
        bg: "teal.50",
      },
    },
  },
  gradients: {
    bgLight: 'linear(to-b, teal.300, teal.500)',
    bgDark: 'linear(to-b, teal.700, teal.800)',
  },

  outlineButton: {
    scheme: "teal",
    hover: {
      bg: "teal.600",
      color: "teal.50"
    },
    active: {
      bg: "teal.500",
      color: "teal.50"
    },
    selected: {
      bg: "teal.500",
      color: "teal.50"
    }
  },

  stepsIndicator: {
    currentProps: {
      color: "teal.500",
      bg: "teal.50",    
    },
    beforeProps: {
      color: "teal.50",
      bg: "teal.700",    
    },
    afterProps: {
      color: "teal.500",
      bg: "teal.300",    
    }
  },

  clickableImage: {
    scheme: "teal",
  }

}, baseTheme);
