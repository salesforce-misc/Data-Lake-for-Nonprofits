import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { StoreProvider } from "AppContext";

import { ManagePanel } from "pages/back-home/ManagePanel";

import * as metadataStore from "models/MetadataStore";

describe("BackHome -> DataTableStatusInfo component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <StoreProvider>
          <ManagePanel />
        </StoreProvider>
      </RenderWithChakra>
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
