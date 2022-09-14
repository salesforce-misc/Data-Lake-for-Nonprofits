import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { StoreProvider } from "AppContext";

import { CredentialsCollectionForm } from "pages/back-home/CredentialsCollectionForm";

import * as appContext from "AppContext";

const mockOnCancel = jest.fn();
const mockOnDone = jest.fn();

describe("BackHome -> CredentialsCollectionForm component", () => {
  afterEach(cleanup);

  test("render properly", () => {
    // @ts-ignore
    jest.spyOn(appContext, "useInstallation").mockImplementation(() => {
      return {};
    });

    render(
      <StoreProvider>
        <CredentialsCollectionForm onCancel={mockOnCancel} onDone={mockOnDone} />
      </StoreProvider>
    );

    expect(screen.getByText("Resume")).toBeInTheDocument();
  });
});
