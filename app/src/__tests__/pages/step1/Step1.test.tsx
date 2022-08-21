import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";

import { render, RenderWithChakra } from "test-utils";

import * as appContext from "AppContext";
import { Step1 } from "pages/step1/Step1";

const spyScrollTo = jest.fn();

describe("Step1 component", () => {
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
        connectToSalesforceStep: "test-step",
        credentials: [],
        deploymentStep: "1",
        reviewStep: "1",
        nextStepNumber: "2",
        connectToAwsStep: {
          needsAssistance: false,
        },
      };
    });

    const tree = create(
      <RenderWithChakra>
        <appContext.StoreProvider>
          <BrowserRouter>
            <Step1 />
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
        connectToSalesforceStep: "test-step",
        credentials: [],
        deploymentStep: "1",
        reviewStep: "1",
        nextStepNumber: "2",
        connectToAwsStep: {
          needsAssistance: false,
          markStarted: jest.fn(),
          markCompleted: jest.fn(),
        },
      };
    });

    render(
      <appContext.StoreProvider>
        <BrowserRouter>
          <Step1 />
        </BrowserRouter>
      </appContext.StoreProvider>
    );

    expect(screen.getAllByText(/connect to your aws account/i)).toBeTruthy();
    expect(screen.getByText(/we need your aws/i)).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });
});
