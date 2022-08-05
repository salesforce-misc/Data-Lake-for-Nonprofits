import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { Markdown } from "components/Markdown";
import { PaginationButtons } from "components/PaginationButtons";
import { RetryErrorPanel } from "components/RetryErrorPanel";

describe("RetryErrorPanel component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <RetryErrorPanel errorMessage="An error occurred!" onRetry={() => console.log("retried")} />
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    render(<RetryErrorPanel errorMessage="An error occurred!" onRetry={() => console.log("retried")} />);

    expect(screen.getByText("An error occurred!")).toBeInTheDocument();
  });
});
