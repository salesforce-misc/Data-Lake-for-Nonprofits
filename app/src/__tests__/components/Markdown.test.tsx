import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { Markdown } from "components/Markdown";

describe("Markdown component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <Markdown content="test-content" />
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    render(<Markdown content="test-content" />);

    expect(screen.getByText("test-content")).toBeInTheDocument();
  });
});
