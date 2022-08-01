import { Field } from "models/helpers/Field";

describe("Field", () => {
  const baseProps = {
    name: "TestField",
    label: "Test Field",
    type: "id",
    excluded: false,
  };

  test("initialized properly", () => {
    const fieldModel = Field.create(baseProps);

    expect(fieldModel.name).toBe("TestField");
    expect(fieldModel.label).toBe("Test Field");
    expect(fieldModel.type).toBe("id");
    expect(fieldModel.excluded).toBe(false);
  });

  test("address is a compound type", () => {
    const fieldModel = Field.create({ ...baseProps, type: "address" });

    expect(fieldModel.compound).toBe(true);
  });

  test("location is a compound type", () => {
    const fieldModel = Field.create({ ...baseProps, type: "location" });

    expect(fieldModel.compound).toBe(true);
  });

  test("any other type different than address and location is not a compound type", () => {
    const fieldModel = Field.create(baseProps);

    expect(fieldModel.compound).toBe(false);
  });

  test("can not exclude id type", () => {
    const fieldModel = Field.create(baseProps);

    expect(fieldModel.compound).toBe(false);
    expect(fieldModel.canExclude).toBe(false);
  });

  test("can not exclude certain names", () => {
    const fieldModel = Field.create({ ...baseProps, name: "SystemModstamp", type: "test" });

    expect(fieldModel.compound).toBe(false);
    expect(fieldModel.canExclude).toBe(false);
  });

  test("can exclude other field types", () => {
    const fieldModel = Field.create({ ...baseProps, name: "test", type: "test" });

    expect(fieldModel.canExclude).toBe(true);
  });

  test("can not toggle excluded prop if canExclude is false", () => {
    const fieldModel = Field.create(baseProps);

    // Make sure it has canExclude false
    expect(fieldModel.canExclude).toBe(false);

    // Check excluded false
    expect(fieldModel.excluded).toBe(false);
    // Toogle exclude
    fieldModel.toggleExclude();
    // Check excluded still false
    expect(fieldModel.excluded).toBe(false);
  });

  test("can not toggle excluded prop for compound type", () => {
    const fieldModel = Field.create({ ...baseProps, type: "address" });

    // Make sure it is compound
    expect(fieldModel.compound).toBe(true);

    // Check excluded false
    expect(fieldModel.excluded).toBe(false);
    // Toogle exclude
    fieldModel.toggleExclude();
    // Check excluded still false
    expect(fieldModel.excluded).toBe(false);
  });

  test("can toggle excluded prop for other types", () => {
    const fieldModel = Field.create({ ...baseProps, name: "test", type: "test" });

    // Make sure it has canExclude true
    expect(fieldModel.canExclude).toBe(true);
    // Make sure it is compound
    expect(fieldModel.compound).toBe(false);

    // Check excluded false
    expect(fieldModel.excluded).toBe(false);
    // Toogle exclude
    fieldModel.toggleExclude();
    // Check excluded to be true after toggle
    expect(fieldModel.excluded).toBe(true);
  });
});
