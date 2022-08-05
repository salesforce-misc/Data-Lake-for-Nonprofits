import { extendTheme } from "@chakra-ui/react";
import { theme as baseTheme } from './base';

// https://chakra-ui.com/docs/theming/customize-theme
// NOTE: we want to keep the export name as 'theme' to help us with theme typings as discussed
//       here https://chakra-ui.com/docs/styled-system/theming/advanced#theme-typings
export const theme = extendTheme({
  name: 'pink',
  styles: {
    global: {
      // styles for the `body`
      body: {
        bg: "pink.75",
      },
    },
  },
  gradients: {
    bgLight: 'linear(to-b, pink.300, pink.500)',
    bgDark: 'linear(to-b, pink.700, pink.800)',
  },

  outlineButton: {
    scheme: "pink",
    hover: {
      bg: "pink.600",
      color: "pink.50"
    },
    active: {
      bg: "pink.500",
      color: "pink.50"
    },
    selected: {
      bg: "pink.500",
      color: "pink.50"
    }
  },

  stepsIndicator: {
    currentProps: {
      color: "pink.500",
      bg: "pink.50",    
    },
    beforeProps: {
      color: "pink.50",
      bg: "pink.700",    
    },
    afterProps: {
      color: "pink.500",
      bg: "pink.300",    
    }
  },

  clickableImage: {
    scheme: "pink",
  }

}, baseTheme);
