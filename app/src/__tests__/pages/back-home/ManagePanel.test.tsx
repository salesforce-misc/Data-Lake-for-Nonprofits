import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { StoreProvider } from "AppContext";

import { ManagePanel } from "pages/back-home/ManagePanel";

describe("BackHome -> ManagePanel component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <StoreProvider>
          <ManagePanel />
        </StoreProvider>
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    render(
      <StoreProvider>
        <ManagePanel />
      </StoreProvider>
    );

    expect(screen.getByText(/manage data lake/i)).toBeInTheDocument();
    expect(screen.getByText("Start New")).toBeInTheDocument();
  });
});
