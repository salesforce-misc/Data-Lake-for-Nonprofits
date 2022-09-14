import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { CustomChakraProvider } from "test-utils";

import { OutlineButton } from "components/OutlineButton";

describe("OutlineButton component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <OutlineButton />
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
