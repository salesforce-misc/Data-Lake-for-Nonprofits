import { extendTheme, theme as baseTheme } from "@chakra-ui/react";
import { darken, lighten } from "@chakra-ui/theme-tools";

// https://chakra-ui.com/docs/theming/customize-theme
// NOTE: we want to keep the export name as 'theme' to help us with theme typings as discussed
//       here https://chakra-ui.com/docs/styled-system/theming/advanced#theme-typings
export const theme = extendTheme({
  styles: {
    global: {
      // styles for the `body`
      body: {
        bg: "orange.100",
      },
    },
  },
  colors: {
    orange: {
      25: "#fffcf5",
      75: "#fff4e0",
    },
    blue: {
      25: "#edf7fd",
      75: "#d9f1ff",
    },
    gray: {
      25: lighten("gray.50", 1)(baseTheme),
      75: darken("gray.50", 1)(baseTheme),
    },
    purple: {
      25: '#fdfbff',
      75: '#f4ebff',
    },
    pink: {
      25: '#fcf4f5',
      75: '#fee6ed',
    },
    green: {
      25: '#f7fff9',
      75: '#c6f6d552',
    },
    teal: {
      25: '#f0fffc',
      75: '#dbfff8',
    }
  },
  breakpoints: {
    sm: "500px",
    md: "768px",
    lg: "960px",
    xl: "1200px",
  },
  fonts: {
    heading: "Open Sans, sans-serif",
    body: "Open Sans, sans-serif",
  },
});
