import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { SFObject } from "models/helpers/SFObject";

import { EmptyMessage } from "components/objects-table/EmptyMessage";
import { ObjectsViewOptions } from "models/useObjectsTable";

describe("ObjectsTable -> EmptyMessage component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const sfModel = SFObject.create({
      name: "TestField",
      label: "Test Field",
      fields: {},
      fieldsLoaded: false,
      selected: false,
      stale: false,
    });

    const tree = create(
      <CustomChakraProvider>
        <EmptyMessage objects={[sfModel]} viewOption={ObjectsViewOptions.All} searchText="" />
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render null if objects prop is not empty", () => {
    const testDiv = document.createElement("div");
    testDiv.id = "root";

    const sfModel = SFObject.create({
      name: "TestField",
      label: "Test Field",
      fields: {},
      fieldsLoaded: false,
      selected: false,
      stale: false,
    });

    render(<EmptyMessage objects={[sfModel]} viewOption={ObjectsViewOptions.All} searchText="" />, {
      container: document.body.appendChild(testDiv),
    });

    // eslint-disable-next-line testing-library/no-node-access
    expect(document.getElementById("root")).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.getElementById("root")).toHaveTextContent("");
  });

  test("render no mathces are found if search text is not empty", () => {
    render(<EmptyMessage objects={[]} viewOption={ObjectsViewOptions.All} searchText="test-search-text" />);

    expect(screen.getByText(/no matches are found/i)).toBeInTheDocument();
  });

  test("render no objects are found", () => {
    render(<EmptyMessage objects={[]} viewOption={ObjectsViewOptions.All} searchText="" />);

    expect(screen.getByText(/no objects are found/i)).toBeInTheDocument();
  });
});
