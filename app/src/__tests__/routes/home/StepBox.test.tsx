import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { TimeInput } from "components/TimeInput";
import { StepBox } from "routes/home/StepBox";
import { steps } from "routes/home/Steps";

describe("StepBox component", () => {
  afterEach(cleanup);

  const mockStep1 = {
    title: "Connect to your AWS account",
    desc: "We need your AWS admin credentials.",
  };

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <StepBox step={mockStep1} index={0} />
      </RenderWithChakra>
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
