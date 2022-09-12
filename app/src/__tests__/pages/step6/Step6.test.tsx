import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";

import { render, RenderWithChakra } from "test-utils";

import * as appContext from "AppContext";
import * as metadataStore from "models/MetadataStore";
import * as importStatusStore from "models/ImportStatusStore";
import { Step6 } from "pages/step6/Step6";

const spyScrollTo = jest.fn();

describe("Step6 component", () => {
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
        createUsersStep: {
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
            <Step6 />
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
        createUsersStep: {
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
          <Step6 />
        </BrowserRouter>
      </appContext.StoreProvider>
    );

    expect(screen.getAllByText(/connect to analytics/i)).toBeTruthy();
    expect(screen.getAllByText(/region/i)).toBeTruthy();
    expect(screen.getByText(/now that you have the data lake provisioned/i)).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });
});
