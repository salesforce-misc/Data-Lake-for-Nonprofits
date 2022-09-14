import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";

import { render, CustomChakraProvider } from "test-utils";

import * as appContext from "AppContext";
import * as metadataStore from "models/MetadataStore";
import { Step4 } from "pages/step4/Step4";

const spyScrollTo = jest.fn();

describe("Step4 component", () => {
  beforeEach(() => {
    Object.defineProperty(global.window, "scrollTo", { value: spyScrollTo });
  });

  afterEach(() => {
    spyScrollTo.mockClear();
    cleanup;
  });

  test("snapshot", () => {
    // @ts-ignore
    jest.spyOn(appContext, "useInstallation").mockImplementation(() => {
      return {
        id: "1",
        startDate: "2022-01-01",
        startedBy: "test-user",
        accountId: "test-account-id",
        region: "us-east-1",
        appFlowConnectionName: "test-appflow-connection-name",
        credentials: [],
        deploymentStep: "1",
        nextStepNumber: "2",
        importOptionsStep: {
          markStarted: jest.fn(),
          markCompleted: jest.fn(),
        },
        reviewStep: {
          markStarted: jest.fn(),
          markCompleted: jest.fn(),
        },
      };
    });
    // @ts-ignore
    jest.spyOn(metadataStore, "useMetadataStore").mockImplementation(() => {
      return {
        isReady: true,
        store: {
          selectedObjects: [{}],
        },
      };
    });

    const tree = create(
      <CustomChakraProvider>
        <appContext.StoreProvider>
          <BrowserRouter>
            <Step4 />
          </BrowserRouter>
        </appContext.StoreProvider>
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    // @ts-ignore
    jest.spyOn(appContext, "useInstallation").mockImplementation(() => {
      return {
        id: "1",
        startDate: "2022-01-01",
        startedBy: "test-user",
        accountId: "test-account-id",
        region: "us-east-1",
        appFlowConnectionName: "test-appflow-connection-name",
        credentials: [],
        deploymentStep: "1",
        nextStepNumber: "2",
        importOptionsStep: {
          markStarted: jest.fn(),
          markCompleted: jest.fn(),
        },
        reviewStep: {
          markStarted: jest.fn(),
          markCompleted: jest.fn(),
        },
      };
    });
    // @ts-ignore
    jest.spyOn(metadataStore, "useMetadataStore").mockImplementation(() => {
      return {
        isReady: true,
        store: {
          selectedObjects: [{}],
        },
      };
    });

    render(
      <appContext.StoreProvider>
        <BrowserRouter>
          <Step4 />
        </BrowserRouter>
      </appContext.StoreProvider>
    );

    expect(screen.getAllByText(/review and confirm/i)).toBeTruthy();
    expect(screen.getAllByText(/region/i)).toBeTruthy();
    expect(screen.getByText(/did we get everything right/i)).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });
});
