import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { FieldsViewOptions } from "models/useFieldsTable";
import { SFObject } from "models/helpers/SFObject";

import { EmptyMessage } from "components/fields-table/EmptyMessage";
import { Field } from "models/helpers/Field";

describe("EmptyMessage component", () => {
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
        <EmptyMessage object={sfModel} viewOption={FieldsViewOptions.All} fields={[]} searchText="" />
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render null if fields prop is not empty", () => {
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

    const field = Field.create({
      name: "TestField1",
      label: "Test Field 1",
      type: "test1",
      excluded: false,
    });

    render(<EmptyMessage object={sfModel} fields={[field]} viewOption={FieldsViewOptions.All} searchText="" />, {
      container: document.body.appendChild(testDiv),
    });

    // eslint-disable-next-line testing-library/no-node-access
    expect(document.getElementById("root")).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.getElementById("root")).toHaveTextContent("");
  });

  test("render no mathces are found if search text is not empty", () => {
    const sfModel = SFObject.create({
      name: "TestField",
      label: "Test Field",
      fields: {},
      fieldsLoaded: false,
      selected: false,
      stale: false,
    });

    render(<EmptyMessage object={sfModel} fields={[]} viewOption={FieldsViewOptions.All} searchText="test-search-text" />);

    expect(screen.getByText(/no matches are found/i)).toBeInTheDocument();
  });

  test("render no fields are found", () => {
    const sfModel = SFObject.create({
      name: "TestField",
      label: "Test Field",
      fields: {},
      fieldsLoaded: false,
      selected: false,
      stale: false,
    });

    render(<EmptyMessage object={sfModel} fields={[]} viewOption={FieldsViewOptions.All} searchText="" />);

    expect(screen.getByText(/no fields are found/i)).toBeInTheDocument();
  });
});
