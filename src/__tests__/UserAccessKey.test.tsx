import { AccessKeyStatus, IUserAccessKey, UserAccessKey } from "models/helpers/UserAccessKey";

describe("UserAccessKey Model", () => {
  const baseProps = {
    id: "1",
    secret: "some-test-secret",
    createDate: new Date("2022-01-05"),
    status: AccessKeyStatus.Active,
    stale: false,
  };

  test("initialized properly", () => {
    const accessKey: IUserAccessKey = UserAccessKey.create(baseProps);

    expect(accessKey.id).toBe("1");
    expect(accessKey.secret).toBe("some-test-secret");
    expect(accessKey.createDate).toMatchObject(new Date("2022-01-05"));
    expect(accessKey.status).toBe("ACTIVE");
    expect(accessKey.stale).toBe(false);
  });

  test("set access key", () => {
    const accessKey: IUserAccessKey = UserAccessKey.create(baseProps);

    // Check initial props
    expect(accessKey.id).toBe("1");
    expect(accessKey.secret).toBe("some-test-secret");
    expect(accessKey.createDate).toMatchObject(new Date("2022-01-05"));
    expect(accessKey.status).toBe("ACTIVE");
    expect(accessKey.stale).toBe(false);

    const rawAccessKey = {
      id: "2",
      secret: "some-other-test-secret",
      createDate: new Date("2022-02-01"),
      status: AccessKeyStatus.Inactive,
    };

    // Set access key
    accessKey.setAccessKey(rawAccessKey);

    // Check the props after setting
    expect(accessKey.id).toBe("1"); // id doesn't get set
    expect(accessKey.secret).toBe("some-other-test-secret");
    expect(accessKey.createDate).toMatchObject(new Date("2022-02-01"));
    expect(accessKey.status).toBe("INACTIVE");
  });

  test("set status", () => {
    const accessKey: IUserAccessKey = UserAccessKey.create(baseProps);

    // Check initial status
    expect(accessKey.status).toBe("ACTIVE");

    // Set the status
    accessKey.setStatus(AccessKeyStatus.Inactive);

    // Check the status to be inactive
    expect(accessKey.status).toBe("INACTIVE");

    // Set the status back to active
    accessKey.setStatus(AccessKeyStatus.Active);

    // Check the status to be active again
    expect(accessKey.status).toBe("ACTIVE");
  });

  test("mark stale", () => {
    const accessKey: IUserAccessKey = UserAccessKey.create(baseProps);

    // Check initial stale prop
    expect(accessKey.stale).toBe(false);

    // Mark as stale
    accessKey.markStale();

    // Check the stale prop
    expect(accessKey.stale).toBe(true);
  });

  test("if it is active using the view", () => {
    const accessKey: IUserAccessKey = UserAccessKey.create(baseProps);

    // Check initial prop
    expect(accessKey.status).toBe("ACTIVE");

    // Check the view
    expect(accessKey.isActive).toBe(true);
  });
});
