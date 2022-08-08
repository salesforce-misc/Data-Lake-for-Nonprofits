import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { StoreProvider } from "AppContext";

import { Home } from "pages/home/Home";

import * as detectedInstallationStore from "models/useDetectedInstallationStore";
import { BrowserRouter, Router } from "react-router-dom";

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
