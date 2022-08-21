import { cleanup } from "@testing-library/react";
import { create } from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";

import { RenderWithChakra } from "test-utils";

import { StoreProvider } from "AppContext";

import { Home } from "pages/home/Home";

describe("Home component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <StoreProvider>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </StoreProvider>
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
