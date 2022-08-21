import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";

import { render, RenderWithChakra } from "test-utils";

import * as appContext from "AppContext";
import * as metadataStore from "models/MetadataStore";
import * as importStatusStore from "models/ImportStatusStore";
import { Step5 } from "pages/step5/Step5";

const spyScrollTo = jest.fn();

describe("Step5 component", () => {
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
        nextStepNumber: "2",
        deploymentOperations: {
          isInProgress: true,
          isSuccess: true,
          operations: [],
        },
        deploymentStep: {
          markStarted: jest.fn(),
          markCompleted: jest.fn(),
        },
        triggerDeployment: jest.fn(),
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
    // @ts-ignore
    jest.spyOn(importStatusStore, "useImportStatusStore").mockImplementation(() => {
      return {
        isError: false,
        store: {
          loadingError: false,
          selectedObjects: [{}],
        },
      };
    });

    const tree = create(
      <RenderWithChakra>
        <appContext.StoreProvider>
          <BrowserRouter>
            <Step5 />
          </BrowserRouter>
        </appContext.StoreProvider>
      </RenderWithChakra>
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
        nextStepNumber: "2",
        deploymentOperations: {
          isInProgress: true,
          isSuccess: true,
          operations: [],
        },
        deploymentStep: {
          markStarted: jest.fn(),
          markCompleted: jest.fn(),
        },
        triggerDeployment: jest.fn(),
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
    // @ts-ignore
    jest.spyOn(importStatusStore, "useImportStatusStore").mockImplementation(() => {
      return {
        isError: false,
        store: {
          loadingError: false,
          selectedObjects: [{}],
        },
      };
    });

    render(
      <appContext.StoreProvider>
        <BrowserRouter>
          <Step5 />
        </BrowserRouter>
      </appContext.StoreProvider>
    );

    expect(screen.getAllByText(/sit back and relax/i)).toBeTruthy();
    expect(screen.getAllByText(/installation id/i)).toBeTruthy();
    expect(screen.getByText(/we are provisioning the data lake/i)).toBeInTheDocument();
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });
});
