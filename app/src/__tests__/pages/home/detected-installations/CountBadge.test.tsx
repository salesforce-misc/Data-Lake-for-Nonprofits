import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { StoreProvider } from "AppContext";

import { CountBadge } from "pages/home/detected-installations/CountBadge";

import * as detectedInstallationStore from "models/useDetectedInstallationStore";

describe("DetectedInstallations -> CountBadge component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <StoreProvider>
          <CountBadge />
        </StoreProvider>
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly with no installation", () => {
    // @ts-ignore
    jest.spyOn(detectedInstallationStore, "useDetectedInstallationStore").mockImplementation(() => {
      return {
        isError: false,
        isReady: true,
        isLoading: false,
        isReloading: false,
        store: { installations: { size: 5 } },
      };
    });

    render(
      <StoreProvider>
        <CountBadge />
      </StoreProvider>
    );

    expect(screen.findByRole("body")).toBeTruthy();
  });

  test("render properly with installations", () => {
    // @ts-ignore
    jest.spyOn(detectedInstallationStore, "useDetectedInstallationStore").mockImplementation(() => {
      return {
        isError: false,
        isReady: true,
        isLoading: false,
        isReloading: false,
        store: { installations: { size: 2 } },
      };
    });

    render(
      <StoreProvider>
        <CountBadge />
      </StoreProvider>
    );

    expect(screen.getByText("2")).toBeTruthy();
  });
});
