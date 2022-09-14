import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { StoreProvider } from "AppContext";

import { ProgressPanel } from "pages/home/detected-installations/ProgressPanel";

import * as detectedInstallationStore from "models/useDetectedInstallationStore";

describe("DetectedInstallations -> ProgressPanel component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <StoreProvider>
          <ProgressPanel />
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
        isLoading: false,
        isReloading: false,
      };
    });

    render(
      <StoreProvider>
        <ProgressPanel />
      </StoreProvider>
    );

    expect(screen.findByRole("body")).toBeTruthy();
    expect(screen.queryByText(/processing/i)).not.toBeInTheDocument();
  });

  test("render properly with not loading and not reloading", () => {
    // @ts-ignore
    jest.spyOn(detectedInstallationStore, "useDetectedInstallationStore").mockImplementation(() => {
      return {
        isError: false,
        isLoading: false,
        isReloading: false,
      };
    });

    render(
      <StoreProvider>
        <ProgressPanel />
      </StoreProvider>
    );

    expect(screen.findByRole("body")).toBeTruthy();
    expect(screen.queryByText(/processing/i)).not.toBeInTheDocument();
  });

  test("render properly with processing when loading", () => {
    // @ts-ignore
    jest.spyOn(detectedInstallationStore, "useDetectedInstallationStore").mockImplementation(() => {
      return {
        isError: false,
        isLoading: true,
        isReloading: false,
      };
    });

    render(
      <StoreProvider>
        <ProgressPanel />
      </StoreProvider>
    );

    expect(screen.queryByText(/processing/i)).toBeInTheDocument();
  });

  test("render properly with processing when reloading", () => {
    // @ts-ignore
    jest.spyOn(detectedInstallationStore, "useDetectedInstallationStore").mockImplementation(() => {
      return {
        isError: false,
        isLoading: false,
        isReloading: true,
      };
    });

    render(
      <StoreProvider>
        <ProgressPanel />
      </StoreProvider>
    );

    expect(screen.queryByText(/processing/i)).toBeInTheDocument();
  });
});
