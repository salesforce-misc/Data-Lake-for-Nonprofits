import { cleanup } from "@testing-library/react";
import { create } from "react-test-renderer";

import { CustomChakraProvider } from "test-utils";

import { FieldsTable } from "components/fields-table/FieldsTable";
import { SFObject } from "models/helpers/SFObject";

describe("FieldsTable component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const sfObject = SFObject.create({
      name: "TestField",
      label: "Test Field",
      fields: {},
      fieldsLoaded: false,
      selected: false,
      stale: false,
    });

    const tree = create(
      <CustomChakraProvider>
        <FieldsTable object={sfObject} />
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
