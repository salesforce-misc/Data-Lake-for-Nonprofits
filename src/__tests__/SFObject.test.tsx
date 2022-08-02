import { ISFObject, SFObject } from "models/helpers/SFObject";

describe("SFObject Model", () => {
  const baseProps = {
    name: "TestField",
    label: "Test Field",
    fields: {},
    fieldsLoaded: false,
    selected: false,
    stale: false,
  };

  test("initialized properly", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    expect(sfModel.name).toBe("TestField");
    expect(sfModel.label).toBe("Test Field");
    expect(sfModel.fields).toMatchObject({});
    expect(sfModel.fieldsLoaded).toBe(false);
    expect(sfModel.selected).toBe(false);
    expect(sfModel.stale).toBe(false);
  });

  test("set object using setObject action", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    // Check name and label before setting
    expect(sfModel.name).toBe("TestField");
    expect(sfModel.label).toBe("Test Field");

    // Run setObject action
    sfModel.setObject({ name: "TestRawName", label: "Test Raw Name" });

    // Check name and label after setting
    expect(sfModel.name).toBe("TestRawName");
    expect(sfModel.label).toBe("Test Raw Name");
  });

  test("set fields using setFields action", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const fields = [
      {
        name: "TestField1",
        label: "Test Field 1",
        type: "test1",
      },
      {
        name: "TestField2",
        label: "Test Field 2",
        type: "test2",
      },
    ];

    // Run setFields action
    sfModel.setFields(fields);

    // Check fields after setting
    expect(sfModel.fields.get("TestField1")?.name).toBe("TestField1");
    expect(sfModel.fields.get("TestField1")?.label).toBe("Test Field 1");
    expect(sfModel.fields.get("TestField2")?.name).toBe("TestField2");
    expect(sfModel.fields.get("TestField2")?.label).toBe("Test Field 2");
  });

  test("set fields using setFields action except compound fields", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const fields = [
      {
        name: "TestField1",
        label: "Test Field 1",
        type: "test1",
      },
      {
        name: "TestField2",
        label: "Test Field 2",
        type: "location",
      },
    ];

    // Run setFields action
    sfModel.setFields(fields);

    // Check fields after setting
    expect(sfModel.fields.get("TestField1")?.name).toBe("TestField1");
    expect(sfModel.fields.get("TestField1")?.label).toBe("Test Field 1");
    expect(sfModel.fields.get("TestField1")?.excluded).toBe(false);
    expect(sfModel.fields.get("TestField2")?.name).toBe("TestField2");
    expect(sfModel.fields.get("TestField2")?.label).toBe("Test Field 2");
    expect(sfModel.fields.get("TestField2")?.excluded).toBe(true);
  });

  test("set field using setField action", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const field1 = {
      name: "TestField1",
      label: "Test Field 1",
      type: "test1",
      excluded: false,
    };
    const field2 = {
      name: "TestField2",
      label: "Test Field 2",
      type: "test2",
      excluded: false,
    };

    // Run setField action for field1
    sfModel.setField(field1);
    // Check fields after setting
    expect(sfModel.fields.get("TestField1")?.name).toBe("TestField1");
    expect(sfModel.fields.get("TestField1")?.label).toBe("Test Field 1");
    expect(sfModel.fields.get("TestField1")?.excluded).toBe(false);

    // Run setField action for field2
    sfModel.setField(field2);
    // Check fields after setting
    expect(sfModel.fields.get("TestField2")?.name).toBe("TestField2");
    expect(sfModel.fields.get("TestField2")?.label).toBe("Test Field 2");
    expect(sfModel.fields.get("TestField2")?.excluded).toBe(false);
  });

  test("set fields loaded using setFieldsLoaded action", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    // Check fieldsLoaded before
    expect(sfModel.fieldsLoaded).toBe(false);

    // Run setFieldLoaded to set it to be true
    sfModel.setFieldsLoaded(true);

    // Check fieldsLoaded after
    expect(sfModel.fieldsLoaded).toBe(true);

    // Run setFieldLoaded to set it to be false again
    sfModel.setFieldsLoaded(false);

    // Check fieldsLoaded after
    expect(sfModel.fieldsLoaded).toBe(false);
  });

  test("set selected using setSelected action", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    // Check selected before
    expect(sfModel.selected).toBe(false);

    // Run setFieldLoaded to set it to be true
    sfModel.setSelected(true);

    // Check selected after
    expect(sfModel.selected).toBe(true);

    // Run setSelected to set it to be false again
    sfModel.setSelected(false);

    // Check selected after
    expect(sfModel.selected).toBe(false);
  });

  test("set stale using markStale action", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    // Check stale before
    expect(sfModel.stale).toBe(false);

    // Run markStale
    sfModel.markStale();

    // Check stale after
    expect(sfModel.stale).toBe(true);
  });

  test("get selectable fields using selectableFields view", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const fields = [
      {
        name: "TestField1",
        label: "Test Field 1",
        type: "test1",
        canExclude: true,
      },
      {
        name: "TestField2",
        label: "Test Field 2",
        type: "location",
        canExclude: false,
      },
    ];

    // Set fields
    sfModel.setFields(fields);

    // Get selectableFields view
    expect(sfModel.selectableFields.length).toBe(1);
  });

  test("get listable fields using listableFields view", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const fields = [
      {
        name: "TestField1",
        label: "Test Field 1",
        type: "location",
        compound: true,
      },
      {
        name: "TestField2",
        label: "Test Field 2",
        type: "test",
        compound: false,
      },
      {
        name: "TestField3",
        label: "Test Field 3",
        type: "test",
        compound: false,
      },
    ];

    // Set fields
    sfModel.setFields(fields);

    // Get listableFields view
    expect(sfModel.listableFields.length).toBe(2);
  });

  test("get immutable fields using immutableFields view", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const fields = [
      {
        name: "TestField1",
        label: "Test Field 1",
        type: "location",
      },
      {
        name: "TestField2",
        label: "Test Field 2",
        type: "test",
      },
      {
        name: "TestField3",
        label: "Test Field 3",
        type: "id",
      },
    ];

    // Set fields
    sfModel.setFields(fields);

    // Checks
    expect(sfModel.fields.get("TestField1")?.compound).toBe(true);
    expect(sfModel.fields.get("TestField1")?.canExclude).toBe(false);
    expect(sfModel.fields.get("TestField2")?.compound).toBe(false);
    expect(sfModel.fields.get("TestField2")?.canExclude).toBe(true);
    expect(sfModel.fields.get("TestField3")?.compound).toBe(false); // +
    expect(sfModel.fields.get("TestField3")?.canExclude).toBe(false); // +

    // Get immutableFields view
    expect(sfModel.immutableFields.length).toBe(1);
  });

  test("get selected fields using selectedFields view", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const fields = [
      {
        name: "TestField1",
        label: "Test Field 1",
        type: "location",
      },
      {
        name: "TestField2",
        label: "Test Field 2",
        type: "test",
      },
      {
        name: "TestField3",
        label: "Test Field 3",
        type: "id",
      },
    ];

    // Set fields
    sfModel.setFields(fields);

    // Checks
    expect(sfModel.fields.get("TestField1")?.excluded).toBe(true);
    expect(sfModel.fields.get("TestField2")?.excluded).toBe(false); // +
    expect(sfModel.fields.get("TestField3")?.excluded).toBe(false); // +

    // Get selectedFields view
    expect(sfModel.selectedFields.length).toBe(2);
  });

  test("get user selected fields using userSelectedFields view", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const fields = [
      {
        name: "TestField1",
        label: "Test Field 1",
        type: "location",
      },
      {
        name: "TestField2",
        label: "Test Field 2",
        type: "test",
      },
      {
        name: "TestField3",
        label: "Test Field 3",
        type: "id",
      },
    ];

    // Set fields
    sfModel.setFields(fields);

    // Checks
    expect(sfModel.fields.get("TestField1")?.excluded).toBe(true);
    expect(sfModel.fields.get("TestField1")?.canExclude).toBe(false);
    expect(sfModel.fields.get("TestField2")?.excluded).toBe(false); // +
    expect(sfModel.fields.get("TestField2")?.canExclude).toBe(true); // +
    expect(sfModel.fields.get("TestField3")?.excluded).toBe(false);
    expect(sfModel.fields.get("TestField3")?.canExclude).toBe(false);

    // Get userSelectedFields view
    expect(sfModel.userSelectedFields.length).toBe(1);
  });

  test("get excluded fields using excludedFields view", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const fields = [
      {
        name: "TestField1",
        label: "Test Field 1",
        type: "location",
      },
      {
        name: "TestField2",
        label: "Test Field 2",
        type: "test",
      },
      {
        name: "TestField3",
        label: "Test Field 3",
        type: "test",
      },
    ];

    // Set fields
    sfModel.setFields(fields);

    // Checks
    expect(sfModel.fields.get("TestField1")?.excluded).toBe(true);
    expect(sfModel.fields.get("TestField1")?.compound).toBe(true);
    expect(sfModel.fields.get("TestField2")?.excluded).toBe(false);
    expect(sfModel.fields.get("TestField2")?.compound).toBe(false);
    expect(sfModel.fields.get("TestField3")?.excluded).toBe(false);
    expect(sfModel.fields.get("TestField3")?.compound).toBe(false);

    // Get excludedFields view
    expect(sfModel.excludedFields.length).toBe(0);
  });

  test("get all excluded fields using allExcludedFields view", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const fields = [
      {
        name: "TestField1",
        label: "Test Field 1",
        type: "location",
      },
      {
        name: "TestField2",
        label: "Test Field 2",
        type: "test",
      },
      {
        name: "TestField3",
        label: "Test Field 3",
        type: "test",
      },
    ];

    // Set fields
    sfModel.setFields(fields);

    // Checks
    expect(sfModel.fields.get("TestField1")?.excluded).toBe(true);
    expect(sfModel.fields.get("TestField2")?.excluded).toBe(false);
    expect(sfModel.fields.get("TestField3")?.excluded).toBe(false);

    // Get allExcludedFields view
    expect(sfModel.allExcludedFields.length).toBe(1);
  });

  test("get number of fields using fieldsCount view", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const fields = [
      {
        name: "TestField1",
        label: "Test Field 1",
        type: "location",
      },
      {
        name: "TestField2",
        label: "Test Field 2",
        type: "test",
      },
      {
        name: "TestField3",
        label: "Test Field 3",
        type: "test",
      },
    ];

    // Set fields
    sfModel.setFields(fields);

    // Get fieldsCount view
    expect(sfModel.fieldsCount).toBe(2);
    expect(sfModel.listableFields.length).toBe(2);
    expect(sfModel.fieldsCount).toBe(sfModel.listableFields.length);
  });

  test("get number of selected fields using selectedFieldsCount view", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const fields = [
      {
        name: "TestField1",
        label: "Test Field 1",
        type: "location",
      },
      {
        name: "TestField2",
        label: "Test Field 2",
        type: "test",
      },
      {
        name: "TestField3",
        label: "Test Field 3",
        type: "test",
      },
    ];

    // Set fields
    sfModel.setFields(fields);

    // Get selectedFieldsCount view
    expect(sfModel.selectedFieldsCount).toBe(sfModel.selectableFields.length);
  });

  test("get number of excluded fields using excludedFieldsCount view", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    const fields = [
      {
        name: "TestField1",
        label: "Test Field 1",
        type: "location",
      },
      {
        name: "TestField2",
        label: "Test Field 2",
        type: "test",
      },
      {
        name: "TestField3",
        label: "Test Field 3",
        type: "test",
      },
    ];

    // Set fields
    sfModel.setFields(fields);

    // Get excludedFieldsCount view
    expect(sfModel.excludedFieldsCount).toBe(sfModel.excludedFields.length);
  });

  test("check the object is not default", () => {
    const sfModel: ISFObject = SFObject.create(baseProps);

    // Check the object is not default
    expect(sfModel.isDefault).toBe(false);
  });

  test("check the Account object is default", () => {
    const sfModel: ISFObject = SFObject.create({ ...baseProps, name: "Account" });

    // Check the object is default since Account is a default object
    expect(sfModel.isDefault).toBe(true);
  });
});
