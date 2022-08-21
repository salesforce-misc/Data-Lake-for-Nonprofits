import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";

import { render, RenderWithChakra } from "test-utils";

import * as appContext from "AppContext";
import { Step2 } from "pages/step2/Step2";

const spyScrollTo = jest.fn();

describe("Step2 component", () => {
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
        reviewStep: "1",
        nextStepNumber: "2",
        connectToSalesforceStep: {
          createdConnection: "Yes",
          markStarted: jest.fn(),
          markCompleted: jest.fn(),
          setCreatedConnection: jest.fn(),
        },
      };
    });

    const tree = create(
      <RenderWithChakra>
        <appContext.StoreProvider>
          <BrowserRouter>
            <Step2 />
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
        deploymentStep: "1",
        reviewStep: "1",
        nextStepNumber: "2",
        connectToSalesforceStep: {
          createdConnection: "Yes",
          markStarted: jest.fn(),
          markCompleted: jest.fn(),
          setCreatedConnection: jest.fn(),
        },
      };
    });

    render(
      <appContext.StoreProvider>
        <BrowserRouter>
          <Step2 />
        </BrowserRouter>
      </appContext.StoreProvider>
    );

    expect(screen.getAllByText(/connect to your salesforce organization/i)).toBeTruthy();
    expect(screen.getByText(/create a dedicated salesforce user/i)).toBeInTheDocument();
    expect(screen.getByText(/create a dedicated salesforce user/i)).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });
});
