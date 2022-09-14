import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { StoreProvider } from "AppContext";

import { EmptyMessage } from "pages/home/detected-installations/EmptyMessage";

import * as detectedInstallationStore from "models/useDetectedInstallationStore";
import { ListingPanel } from "pages/home/detected-installations/ListingPanel";

const mockOnCancel = jest.fn();
const mockOnResume = jest.fn();

describe("DetectedInstallations -> ListingPanel component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <StoreProvider>
          <ListingPanel onCancel={mockOnCancel} onResume={mockOnResume} />
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
        isReady: true,
      };
    });

    render(
      <StoreProvider>
        <ListingPanel onCancel={mockOnCancel} onResume={mockOnResume} />
      </StoreProvider>
    );

    expect(screen.findByRole("body")).toBeTruthy();
    expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/resume/i)).not.toBeInTheDocument();
  });

  test("render properly with loading", () => {
    // @ts-ignore
    jest.spyOn(detectedInstallationStore, "useDetectedInstallationStore").mockImplementation(() => {
      return {
        isError: false,
        isLoading: true,
        isReloading: false,
        isReady: true,
      };
    });

    render(
      <StoreProvider>
        <ListingPanel onCancel={mockOnCancel} onResume={mockOnResume} />
      </StoreProvider>
    );

    expect(screen.findByRole("body")).toBeTruthy();
    expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/resume/i)).not.toBeInTheDocument();
  });

  test("render properly with not ready", () => {
    // @ts-ignore
    jest.spyOn(detectedInstallationStore, "useDetectedInstallationStore").mockImplementation(() => {
      return {
        isError: false,
        isLoading: false,
        isReloading: false,
        isReady: false,
      };
    });

    render(
      <StoreProvider>
        <ListingPanel onCancel={mockOnCancel} onResume={mockOnResume} />
      </StoreProvider>
    );

    expect(screen.findByRole("body")).toBeTruthy();
    expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/resume/i)).not.toBeInTheDocument();
  });

  test("render properly with an empty store", () => {
    // @ts-ignore
    jest.spyOn(detectedInstallationStore, "useDetectedInstallationStore").mockImplementation(() => {
      return {
        isError: false,
        isLoading: false,
        isReloading: false,
        isReady: true,
        store: {
          empty: true,
        },
      };
    });

    render(
      <StoreProvider>
        <ListingPanel onCancel={mockOnCancel} onResume={mockOnResume} />
      </StoreProvider>
    );

    expect(screen.findByRole("body")).toBeTruthy();
    expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/resume/i)).not.toBeInTheDocument();
  });

  test("render properly with a store", () => {
    // @ts-ignore
    jest.spyOn(detectedInstallationStore, "useDetectedInstallationStore").mockImplementation(() => {
      return {
        isError: false,
        isLoading: false,
        isReloading: false,
        isReady: true,
        store: {
          empty: false,
          list: [
            {
              id: 1,
              label: "Mock1",
              webUrlOrigin: "",
              reachable: true,
              region: "us-east-1",
              installationJson: {},
            },
          ],
        },
      };
    });

    render(
      <StoreProvider>
        <ListingPanel onCancel={mockOnCancel} onResume={mockOnResume} />
      </StoreProvider>
    );

    expect(screen.findByRole("body")).toBeTruthy();
    expect(screen.queryByText(/cancel/i)).toBeInTheDocument();
    expect(screen.queryByText(/resume/i)).toBeInTheDocument();
  });
});
