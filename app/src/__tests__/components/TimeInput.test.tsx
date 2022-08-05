import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { TimeInput } from "components/TimeInput";

describe("TimeInput component", () => {
  afterEach(cleanup);

  const onChange = ({ hour, minute }) => {
    console.log(`${hour} ${minute}`);
  };

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <TimeInput hour="12" minute="15" onChange={onChange} />
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  //   test("render properly", () => {
  //     render(<TimeInput hour="12" minute="15" onChange={onChange} />);

  //     expect(screen.findByDisplayValue("12")).toBeInTheDocument();
  //     expect(screen.findByDisplayValue("15")).toBeInTheDocument();
  //     expect(screen.getByText("UTC")).toBeInTheDocument();
  //   });
});
