import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { StepBox } from "pages/home/StepBox";

describe("StepBox component", () => {
  afterEach(cleanup);

  const mockStep1 = {
    title: "Connect to your AWS account",
    desc: "We need your AWS admin credentials.",
  };

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <StepBox step={mockStep1} index={0} />
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    render(<StepBox step={mockStep1} index={0} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Connect to your AWS account")).toBeInTheDocument();
    expect(screen.getByText("We need your AWS admin credentials.")).toBeInTheDocument();
  });
});
