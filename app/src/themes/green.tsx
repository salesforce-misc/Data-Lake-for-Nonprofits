import { extendTheme } from "@chakra-ui/react";
import { theme as baseTheme } from './base';

// https://chakra-ui.com/docs/theming/customize-theme
// NOTE: we want to keep the export name as 'theme' to help us with theme typings as discussed
//       here https://chakra-ui.com/docs/styled-system/theming/advanced#theme-typings
export const theme = extendTheme({
  name: 'green',
  styles: {
    global: {
      // styles for the `body`
      body: {
        bg: "green.50",
      },
    },
  },
  gradients: {
    bgLight: 'linear(to-b, green.300, green.500)',
    bgDark: 'linear(to-b, green.700, green.800)',
  },

  outlineButton: {
    scheme: "green",
    hover: {
      bg: "green.600",
      color: "green.50"
    },
    active: {
      bg: "green.500",
      color: "green.50"
    },
    selected: {
      bg: "green.500",
      color: "green.50"
    }
  },

  stepsIndicator: {
    currentProps: {
      color: "green.500",
      bg: "green.50",    
    },
    beforeProps: {
      color: "green.50",
      bg: "green.700",    
    },
    afterProps: {
      color: "green.500",
      bg: "green.300",    
    }
  },

  clickableImage: {
    scheme: "green",
  }

}, baseTheme);
