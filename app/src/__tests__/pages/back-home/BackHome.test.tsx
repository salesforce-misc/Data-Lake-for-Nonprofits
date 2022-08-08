import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { StoreProvider } from "AppContext";

import { ReviewGrid } from "pages/back-home/ReviewGrid";

import * as appContext from "AppContext";
import { BackHome } from "pages/back-home/BackHome";
import { BrowserRouter, Router } from "react-router-dom";

describe("BackHome component", () => {
  afterEach(cleanup);

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
      };
    });

    const tree = create(
      <RenderWithChakra>
        <StoreProvider>
          <BrowserRouter>
            <BackHome />
          </BrowserRouter>
        </StoreProvider>
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
      };
    });

    render(
      <StoreProvider>
        <BrowserRouter>
          <BackHome />
        </BrowserRouter>
      </StoreProvider>
    );

    expect(screen.getByText(/aws account id/i)).toBeInTheDocument();
    expect(screen.getByText(/test-account-id/i)).toBeInTheDocument();
    expect(screen.getByText(/aws region/i)).toBeInTheDocument();
    expect(screen.getByText(/connection name/i)).toBeInTheDocument();
    expect(screen.getByText(/test-appflow-connection-name/i)).toBeInTheDocument();
  });
});
