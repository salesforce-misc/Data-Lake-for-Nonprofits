import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";

import { theme } from "themes/orange";

export const RenderWithChakra = ({ children }: { children: React.ReactNode }) => <ChakraProvider theme={theme}>{children}</ChakraProvider>;

const CustomProvider = ({ children }: { children: React.ReactNode }) => {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) => render(ui, { wrapper: CustomProvider, ...options });

export * from "@testing-library/react";

export { customRender as render };
