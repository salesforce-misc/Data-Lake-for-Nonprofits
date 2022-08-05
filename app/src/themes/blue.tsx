import { extendTheme } from "@chakra-ui/react";
import { theme as baseTheme } from './base';

// https://chakra-ui.com/docs/theming/customize-theme
// NOTE: we want to keep the export name as 'theme' to help us with theme typings as discussed
//       here https://chakra-ui.com/docs/styled-system/theming/advanced#theme-typings
export const theme = extendTheme({
  name: 'blue',
  styles: {
    global: {
      // styles for the `body`
      body: {
        // To remove the blue border https://github.com/chakra-ui/chakra-ui/issues/708
        // and https://www.a11yproject.com/posts/never-remove-css-outlines
        // _focus: { boxShadow: "none" }, this is not working yet
        bg: "gray.100", // #f9fdff
      },
    },
  },
  gradients: {
    bgLight: 'linear(to-b, blue.300, blue.500)',
    bgDark: 'linear(to-b, blue.700, blue.800)',
  },

  outlineButton: {
    scheme: "blue",
    hover: {
      bg: "blue.600",
      color: "blue.50"
    },
    active: {
      bg: "blue.500",
      color: "blue.50"
    },
    selected: {
      bg: "blue.500",
      color: "blue.50"
    }
  },

  stepsIndicator: {
    currentProps: {
      color: "blue.500",
      bg: "blue.50",    
    },
    beforeProps: {
      color: "blue.50",
      bg: "blue.700",    
    },
    afterProps: {
      color: "blue.500",
      bg: "blue.300",    
    }
  },

  clickableImage: {
    scheme: "blue",
  }

}, baseTheme);
