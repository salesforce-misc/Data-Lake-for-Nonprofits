import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { StepsIndicator } from "components/StepsIndicator";

describe("StepsIndicator component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <StepsIndicator current={1} />
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    render(<StepsIndicator current={3} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
