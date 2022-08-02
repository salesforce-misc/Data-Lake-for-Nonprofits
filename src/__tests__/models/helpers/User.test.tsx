import { IUser, User } from "models/helpers/User";
import { TAccessKeyStatus, IRawAccessKey } from "models/helpers/UserAccessKey";

describe("User Model", () => {
  const baseProps = {
    id: "1",
    name: "Simsek Mert",
    arn: "arn:aws:iam::xyzxyzxyzxx:root",
    createDate: new Date("2022-01-05"),
    accessKeys: {},
    policies: ["some-test-policy"],
    hasAthenaManagedPolicy: false,
    stale: false,
  };

  test("initialized properly", () => {
    const user: IUser = User.create(baseProps);

    expect(user.id).toBe("1");
    expect(user.name).toBe("Simsek Mert");
    expect(user.arn).toBe("arn:aws:iam::xyzxyzxyzxx:root");
    expect(user.createDate).toMatchObject(new Date("2022-01-05"));
    expect(user.policies.length).toBe(1);
    expect(user.hasAthenaManagedPolicy).toBe(false);
    expect(user.stale).toBe(false);
  });

  test("set user", () => {
    const user: IUser = User.create(baseProps);

    // Check initial user props
    expect(user.id).toBe("1");
    expect(user.name).toBe("Simsek Mert");
    expect(user.arn).toBe("arn:aws:iam::xyzxyzxyzxx:root");
    expect(user.createDate).toMatchObject(new Date("2022-01-05"));
    expect(user.policies.length).toBe(1);
    expect(user.hasAthenaManagedPolicy).toBe(false);

    const rawUser = {
      id: "2",
      name: "Test User",
      arn: "arn:aws:iam::xyzxyzxyzxx:test",
      createDate: new Date("2022-03-05"),
      policies: ["some-other-test-policy", "another-test-policy"],
      hasAthenaManagedPolicy: true,
    };

    // Set the raw user
    user.setUser(rawUser);

    // Check the user props after setting
    expect(user.id).toBe("2");
    expect(user.name).toBe("Test User");
    expect(user.arn).toBe("arn:aws:iam::xyzxyzxyzxx:test");
    expect(user.createDate).toMatchObject(new Date("2022-03-05"));
    expect(user.policies.length).toBe(2);
    expect(user.policies[0]).toBe("some-other-test-policy");
    expect(user.policies[1]).toBe("another-test-policy");
    expect(user.hasAthenaManagedPolicy).toBe(true);
    expect(user.stale).toBe(false);
  });

  /**
   * Test Scenario
   * ------------------------
   * Set a new access key
   * Expect it exist and props are accurate
   */
  test("set a new access key", () => {
    const user: IUser = User.create(baseProps);

    const rawAccessKey: IRawAccessKey = {
      id: "1",
      secret: "some-test-secret",
      createDate: new Date("2022-02-01"),
      status: TAccessKeyStatus.Active,
    };

    // Set the raw access key
    user.setAccessKey(rawAccessKey);

    // Check the access key props after setting
    expect(user.accessKeys.has("1")).toBe(true);
    expect(user.accessKeys.get("1")?.secret).toBe("some-test-secret");
    expect(user.accessKeys.get("1")?.createDate).toMatchObject(new Date("2022-02-01"));
    expect(user.accessKeys.get("1")?.status).toBe("ACTIVE");
  });

  /**
   * Test Scenario
   * ------------------------
   * Set a new access key
   * Expect it exist and props are accurate
   * Update the existing access key running setAccessKey action - id prop should be same
   * Expect it still exists and props are changed
   */
  test("set an existing access key", () => {
    const user: IUser = User.create(baseProps);

    // Set an access key
    user.setAccessKey({
      id: "1",
      secret: "some-test-secret",
      createDate: new Date("2022-02-01"),
      status: TAccessKeyStatus.Inactive,
    });

    // Check the access key props
    expect(user.accessKeys.has("1")).toBe(true);
    expect(user.accessKeys.get("1")?.secret).toBe("some-test-secret");
    expect(user.accessKeys.get("1")?.createDate).toMatchObject(new Date("2022-02-01"));
    expect(user.accessKeys.get("1")?.status).toBe("INACTIVE");

    // Update the access key
    user.setAccessKey({
      id: "1",
      secret: "updated-secret",
      createDate: new Date("2022-02-02"),
      status: TAccessKeyStatus.Active,
    });

    // Check the user props after updating
    expect(user.accessKeys.has("1")).toBe(true);
    expect(user.accessKeys.get("1")?.secret).toBe("updated-secret");
    expect(user.accessKeys.get("1")?.createDate).toMatchObject(new Date("2022-02-02"));
    expect(user.accessKeys.get("1")?.status).toBe("ACTIVE");
  });

  /**
   * Test Scenario
   * ------------------------
   * Set two access keys
   * Expect both exist and are not stale
   * Mark stale by running markStale action
   * Expect both still exist but are stale
   */
  test("mark stale", () => {
    const user: IUser = User.create(baseProps);

    // Set two access keys
    user.setAccessKey({
      id: "1",
      secret: "some-test-secret",
      createDate: new Date("2022-02-01"),
      status: TAccessKeyStatus.Active,
    });
    user.setAccessKey({
      id: "2",
      secret: "another-test-secret",
      createDate: new Date("2022-02-02"),
      status: TAccessKeyStatus.Active,
    });

    // Check the access keys
    expect(user.accessKeys.has("1")).toBe(true);
    expect(user.accessKeys.get("1")?.stale).toBe(false);
    expect(user.accessKeys.has("2")).toBe(true);
    expect(user.accessKeys.get("2")?.stale).toBe(false);

    // Mark stale
    user.markStale();

    // Check the access keys
    expect(user.accessKeys.has("1")).toBe(true);
    expect(user.accessKeys.get("1")?.stale).toBe(true);
    expect(user.accessKeys.has("2")).toBe(true);
    expect(user.accessKeys.get("2")?.stale).toBe(true);
  });

  /**
   * Test Scenario
   * ------------------------
   * Set the first access key
   * Mark stale by running markStale action
   * Set the second access key
   * Remove stale access keys by running removeStale action
   * Expect the first access key removed
   * Expect the second access key exist
   */
  test("remove stale", () => {
    const user: IUser = User.create(baseProps);

    // Set the first access key
    user.setAccessKey({
      id: "1",
      secret: "some-test-secret",
      createDate: new Date("2022-02-01"),
      status: TAccessKeyStatus.Active,
    });

    // Check the first access key
    expect(user.accessKeys.has("1")).toBe(true);
    expect(user.accessKeys.get("1")?.stale).toBe(false);

    // Mark stale
    user.markStale();

    // Check stale prop for the first access key
    expect(user.accessKeys.get("1")?.stale).toBe(true);

    // Set the second access key
    user.setAccessKey({
      id: "2",
      secret: "another-test-secret",
      createDate: new Date("2022-02-02"),
      status: TAccessKeyStatus.Active,
    });

    // Check the second access key
    expect(user.accessKeys.has("2")).toBe(true);
    expect(user.accessKeys.get("2")?.stale).toBe(false);

    // Remove stale
    user.removeStale();

    // Check the access keys
    expect(user.accessKeys.has("1")).toBe(false);
    expect(user.accessKeys.has("2")).toBe(true);
  });

  test("if the user does not have admin policy", () => {
    const user: IUser = User.create(baseProps);

    // Check admin policy
    expect(user.hasAdminPolicy).toBe(false);
  });

  test("if the user has admin policy", () => {
    const user: IUser = User.create({ ...baseProps, policies: ["arn:aws:iam::aws:policy/AdministratorAccess", "some-other-policy"] });

    // Check admin policy
    expect(user.policies[0]).toBe("arn:aws:iam::aws:policy/AdministratorAccess");
    expect(user.hasAdminPolicy).toBe(true);
  });

  /**
   * Test Scenario
   * ------------------------
   * Set two access keys with id 1 and 2
   * Expect listAccessKeys has 2 elements
   * Expect the first element has id 1
   * Expect the second element has id 2
   * Expect the third element is undefined
   */
  test("list access keys", () => {
    const user: IUser = User.create(baseProps);

    user.setAccessKey({
      id: "1",
      secret: "some-test-secret",
      createDate: new Date("2022-02-01"),
      status: TAccessKeyStatus.Active,
    });
    user.setAccessKey({
      id: "2",
      secret: "some-other-test-secret",
      createDate: new Date("2022-02-02"),
      status: TAccessKeyStatus.Active,
    });

    // Check access keys
    expect(user.listAccessKeys.length).toBe(2);
    expect(user.listAccessKeys[0].id).toBe("1");
    expect(user.listAccessKeys[1].id).toBe("2");
    expect(user.listAccessKeys[2]).toBe(undefined);
  });

  /**
   * Test Scenario
   * ------------------------
   * Expect NO_POLICY for a user with baseProps
   */
  test("NO_POLICY access status", () => {
    const user: IUser = User.create(baseProps);

    // Check access status
    expect(user.accessStatus).toBe("NO_POLICY");
  });

  /**
   * Test Scenario
   * ------------------------
   * Expect NO_KEYS for a user with Admin policy and no access keys
   */
  test("NO_KEYS access status", () => {
    const user: IUser = User.create({ ...baseProps, policies: ["arn:aws:iam::aws:policy/AdministratorAccess"] });

    // Check access status
    expect(user.accessStatus).toBe("NO_KEYS");
  });

  /**
   * Test Scenario
   * ------------------------
   * Initialize a user with Admin policy
   * Set an inactive access key
   * Expect NOT_ACTIVE_KEYS
   */
  test("NOT_ACTIVE_KEYS access status", () => {
    const user: IUser = User.create({ ...baseProps, policies: ["arn:aws:iam::aws:policy/AdministratorAccess"] });

    user.setAccessKey({
      id: "1",
      secret: "some-test-secret",
      createDate: new Date("2022-02-01"),
      status: TAccessKeyStatus.Inactive,
    });

    // Check access status
    expect(user.accessStatus).toBe("NOT_ACTIVE_KEYS");
  });

  /**
   * Test Scenario
   * ------------------------
   * Initialize a user with Admin policy
   * Set an active access key
   * Expect VALID for the user4 with Admin policy and an active key
   */
  test("VALID access status", () => {
    const user: IUser = User.create({ ...baseProps, policies: ["arn:aws:iam::aws:policy/AdministratorAccess"] });

    user.setAccessKey({
      id: "1",
      secret: "some-test-secret",
      createDate: new Date("2022-02-01"),
      status: TAccessKeyStatus.Active,
    });

    // Check access status
    expect(user.accessStatus).toBe("VALID");
  });
});
