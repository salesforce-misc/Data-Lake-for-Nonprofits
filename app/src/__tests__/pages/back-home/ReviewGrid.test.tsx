import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { StoreProvider } from "AppContext";

import { ReviewGrid } from "pages/back-home/ReviewGrid";

import * as appContext from "AppContext";

describe("BackHome -> ReviewGrid component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    // @ts-ignore
    jest.spyOn(appContext, "useInstallation").mockImplementation(() => {
      return {
        accountId: "test-account-id",
        region: "us-east-1",
        appFlowConnectionName: "test-appflow-connection-name",
        connectToSalesforceStep: "test-step",
      };
    });

    const tree = create(
      <CustomChakraProvider>
        <StoreProvider>
          <ReviewGrid />
        </StoreProvider>
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    // @ts-ignore
    jest.spyOn(appContext, "useInstallation").mockImplementation(() => {
      return {
        accountId: "test-account-id",
        region: "us-east-1",
        appFlowConnectionName: "test-appflow-connection-name",
        connectToSalesforceStep: "test-step",
      };
    });

    render(
      <StoreProvider>
        <ReviewGrid />
      </StoreProvider>
    );

    expect(screen.getByText(/aws account id/i)).toBeInTheDocument();
    expect(screen.getByText(/test-account-id/i)).toBeInTheDocument();
    expect(screen.getByText(/aws region/i)).toBeInTheDocument();
    expect(screen.getByText(/connection name/i)).toBeInTheDocument();
    expect(screen.getByText(/test-appflow-connection-name/i)).toBeInTheDocument();
  });
});
