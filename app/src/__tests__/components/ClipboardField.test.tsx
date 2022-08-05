import { cleanup, fireEvent, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { ClipboardField } from "components/ClipboardField";

describe("ClipboardField component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <ClipboardField value="Snapshot Test Value" />
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render text properly", async () => {
    render(<ClipboardField value="Test Value" />);

    expect(screen.getByText("Test Value")).toBeTruthy();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("render password properly", () => {
    render(<ClipboardField value="Test Value" isPassword={true} />);

    expect(screen.queryByText("Test Value")).not.toBeInTheDocument();
    expect(screen.getByText("**************************************")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();

    expect(screen.getByRole("button")).toHaveTextContent("Show");

    // Trigger the click event on Show button
    fireEvent.click(screen.getByText(/show/i));
    expect(screen.getByRole("button")).toHaveTextContent("Hide");

    // Trigger the click event on Hide button
    fireEvent.click(screen.getByText(/hide/i));

    expect(screen.getByRole("button")).toHaveTextContent("Show");
  });

  test("can copy a text", async () => {
    render(<ClipboardField value="Test Value" canCopy={false} />);

    expect(screen.getByText("Test Value")).toBeInTheDocument();

    expect(screen.queryByTestId("copy-icon")).not.toBeInTheDocument();
  });
});
