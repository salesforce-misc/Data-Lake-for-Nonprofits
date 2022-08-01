import { extendTheme } from "@chakra-ui/react";
import { theme as baseTheme } from './base';

// https://chakra-ui.com/docs/theming/customize-theme
// NOTE: we want to keep the export name as 'theme' to help us with theme typings as discussed
//       here https://chakra-ui.com/docs/styled-system/theming/advanced#theme-typings
export const theme = extendTheme({
  name: 'orange',
  styles: {
    global: {
      // styles for the `body`
      body: {
        // To remove the blue border https://github.com/chakra-ui/chakra-ui/issues/708
        // and https://www.a11yproject.com/posts/never-remove-css-outlines
        // _focus: { boxShadow: "none" }, this is not working yet
        bg: "orange.100",
      },
    },
  },
  gradients: {
    bgLight: 'linear(to-b, orange.300, orange.500)',
    bgDark: 'linear(to-b, orange.500, orange.600)',
  },

  outlineButton: {
    scheme: "orange",
    hover: {
      bg: "orange.600",
      color: "orange.50"
    },
    active: {
      bg: "orange.500",
      color: "orange.50"
    },
    selected: {
      bg: "orange.500",
      color: "orange.50"
    }
  },

  stepsIndicator: {
    currentProps: {
      color: "orange.500",
      bg: "orange.50",    
    },
    beforeProps: {
      color: "orange.50",
      bg: "orange.700",    
    },
    afterProps: {
      color: "orange.500",
      bg: "orange.300",    
    }
  },

  clickableImage: {
    scheme: "orange",
  }

}, baseTheme);
