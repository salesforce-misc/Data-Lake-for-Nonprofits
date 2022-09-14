import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { CurvedBox } from "components/CurvedBox";

describe("CurvedBox component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <CurvedBox />
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", async () => {
    render(<CurvedBox />);

    expect(screen.getByTestId("curved-box")).toBeInTheDocument();
  });
});
