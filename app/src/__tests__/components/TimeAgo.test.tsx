import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { TimeAgo } from "components/TimeAgo";

describe("TimeAgo component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <TimeAgo time={new Date("2020-12-15 15:00:00")} />
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    render(<TimeAgo time={new Date()} />);

    expect(screen.getByText("0 seconds ago")).toBeInTheDocument();
  });
});
