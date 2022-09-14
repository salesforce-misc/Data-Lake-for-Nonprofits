import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { StoreProvider } from "AppContext";

import { DataTablePanel } from "pages/back-home/DataTablePanel";

import * as metadataStore from "models/MetadataStore";

describe("BackHome -> DataTablePanel component", () => {
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
      <CustomChakraProvider>
        <StoreProvider>
          <DataTablePanel />
        </StoreProvider>
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly with 2 selected objects", () => {
    // @ts-ignore
    jest.spyOn(metadataStore, "useMetadataStore").mockImplementation(() => {
      return {
        isError: false,
        isReady: true,
        store: {
          selectedObjects: [
            { label: "test1", name: "Test1" },
            { label: "test2", name: "Test2" },
          ],
        },
      };
    });

    render(
      <StoreProvider>
        <DataTablePanel />
      </StoreProvider>
    );

    expect(screen.getByText("Objects")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("render properly with no selected objects", () => {
    // @ts-ignore
    jest.spyOn(metadataStore, "useMetadataStore").mockImplementation(() => {
      return {
        isError: false,
        isReady: true,
        store: { selectedObjects: [] },
      };
    });

    render(
      <StoreProvider>
        <DataTablePanel />
      </StoreProvider>
    );

    expect(screen.getByText("No objects")).toBeInTheDocument();
  });
});
