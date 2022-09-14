import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";

import { theme } from "themes/orange";

export const CustomChakraProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChakraProvider theme={theme}>
      <div data-testid="test-root">{children}</div>
    </ChakraProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) => render(ui, { wrapper: CustomChakraProvider, ...options });

export * from "@testing-library/react";

export { customRender as render };
