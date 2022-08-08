import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { StoreProvider } from "AppContext";

import { CountBadge } from "pages/back-home/CountBadge";

import * as metadataStore from "models/MetadataStore";

describe("BackHome -> CountBadge component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    // @ts-ignore
    jest.spyOn(metadataStore, "useMetadataStore").mockImplementation(() => {
      return {
        isError: false,
        isReady: true,
        store: { selectedObjects: [{}] },
      };
    });

    const tree = create(
      <RenderWithChakra>
        <StoreProvider>
          <CountBadge />
        </StoreProvider>
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly with 2 selected objects", () => {
    // @ts-ignore
    jest.spyOn(metadataStore, "useMetadataStore").mockImplementation(() => {
      return {
        isError: false,
        isReady: true,
        store: { selectedObjects: [{}, {}] },
      };
    });

    render(
      <StoreProvider>
        <CountBadge />
      </StoreProvider>
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
