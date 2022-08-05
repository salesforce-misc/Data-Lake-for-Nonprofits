import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { ResumePanel } from "routes/home/ResumePanel";
import { StoreProvider } from "AppContext";

describe("ResumePanel component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <StoreProvider>
          <ResumePanel />
        </StoreProvider>
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    render(
      <StoreProvider>
        <ResumePanel />
      </StoreProvider>
    );

    expect(screen.getAllByText("Resume")).toBeTruthy();
    expect(screen.getByText(/if you have already created/i)).toBeInTheDocument();
  });
});
