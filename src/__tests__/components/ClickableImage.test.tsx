import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { create } from "react-test-renderer";
import { render, RenderWithChakra } from "test-utils";

import { ClickableImage } from "components/ClickableImage";

describe("ClickableImage component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <ClickableImage src="https://d0.awsstatic.com/logos/powered-by-aws.png" title="Powered by AWS" />
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", async () => {
    render(<ClickableImage src="https://d0.awsstatic.com/logos/powered-by-aws.png" title="Powered by AWS" />);

    expect(screen.getByAltText("Powered by AWS")).toBeTruthy();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("click event", async () => {
    render(<ClickableImage src="https://d0.awsstatic.com/logos/powered-by-aws.png" title="Powered by AWS" />);

    // manually trigger the click event
    fireEvent.click(screen.getByAltText("Powered by AWS"));

    await waitFor(() => screen.findByText("Close"));

    expect(screen.getByText("Close")).toBeInTheDocument();
  });
});
