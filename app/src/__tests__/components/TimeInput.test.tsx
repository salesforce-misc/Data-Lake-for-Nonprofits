import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { TimeInput } from "components/TimeInput";

const mockOnChange = jest.fn();

describe("TimeInput component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <TimeInput hour="12" minute="15" onChange={mockOnChange} />
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
