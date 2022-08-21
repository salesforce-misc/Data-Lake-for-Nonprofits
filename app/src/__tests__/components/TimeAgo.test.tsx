import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { TimeAgo } from "components/TimeAgo";

describe("TimeAgo component", () => {
  test("render properly", () => {
    render(<TimeAgo time={new Date()} />);

    expect(screen.getByText("0 seconds ago")).toBeInTheDocument();
  });
});
