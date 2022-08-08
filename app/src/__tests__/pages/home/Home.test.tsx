import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { StoreProvider } from "AppContext";

import { Home } from "pages/home/Home";

import * as detectedInstallationStore from "models/useDetectedInstallationStore";

const mockOnCancel = jest.fn();

describe("Home component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <StoreProvider>
          <Home />
        </StoreProvider>
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
