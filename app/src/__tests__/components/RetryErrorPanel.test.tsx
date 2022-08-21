import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { RetryErrorPanel } from "components/RetryErrorPanel";

const mockOnRetry = jest.fn();

describe("RetryErrorPanel component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <RetryErrorPanel errorMessage="An error occurred!" onRetry={mockOnRetry} />
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    render(<RetryErrorPanel errorMessage="An error occurred!" onRetry={mockOnRetry} />);

    expect(screen.getByText("An error occurred!")).toBeInTheDocument();
  });
});
