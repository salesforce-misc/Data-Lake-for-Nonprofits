import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { RenderWithChakra } from "test-utils";

import { OutlineButton } from "components/OutlineButton";

describe("OutlineButton component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <OutlineButton />
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
