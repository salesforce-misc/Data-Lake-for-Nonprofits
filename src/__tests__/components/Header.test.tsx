import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { Header } from "components/Header";

describe("Header component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <Header />
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render app title", () => {
    render(<Header />);

    expect(screen.getByText("Datalake for Nonprofits, Powered by AWS")).toBeInTheDocument();
  });
});
