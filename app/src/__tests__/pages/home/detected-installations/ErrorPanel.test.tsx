import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { StoreProvider } from "AppContext";

import { ErrorPanel } from "pages/home/detected-installations/ErrorPanel";

import * as detectedInstallationStore from "models/useDetectedInstallationStore";

const mockOnCancel = jest.fn();

describe("DetectedInstallations -> ErrorPanel component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <StoreProvider>
          <ErrorPanel onCancel={mockOnCancel} />
        </StoreProvider>
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly with an error", () => {
    // @ts-ignore
    jest.spyOn(detectedInstallationStore, "useDetectedInstallationStore").mockImplementation(() => {
      return {
        isError: true,
        store: {
          errorMessage: "An error occurred!",
        },
      };
    });

    render(
      <StoreProvider>
        <ErrorPanel onCancel={mockOnCancel} />
      </StoreProvider>
    );

    expect(screen.queryByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByText(/an error occurred!/i)).toBeInTheDocument();
    expect(screen.queryByText(/cancel/i)).toBeInTheDocument();
  });

  test("render properly with no error", () => {
    // @ts-ignore
    jest.spyOn(detectedInstallationStore, "useDetectedInstallationStore").mockImplementation(() => {
      return {
        isError: false,
        store: {},
      };
    });

    render(
      <StoreProvider>
        <ErrorPanel onCancel={mockOnCancel} />
      </StoreProvider>
    );

    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/an error occurred!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument();
  });
});
