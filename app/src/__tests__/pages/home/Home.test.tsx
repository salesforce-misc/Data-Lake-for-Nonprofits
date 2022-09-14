import { cleanup } from "@testing-library/react";
import { create } from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";

import { CustomChakraProvider } from "test-utils";

import { StoreProvider } from "AppContext";

import { Home } from "pages/home/Home";

describe("Home component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <StoreProvider>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </StoreProvider>
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
