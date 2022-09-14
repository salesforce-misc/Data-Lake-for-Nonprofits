import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { StepsBanner } from "components/StepsBanner";

describe("StepsBanner component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <StepsBanner current={1} />
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    render(<StepsBanner current={3} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
