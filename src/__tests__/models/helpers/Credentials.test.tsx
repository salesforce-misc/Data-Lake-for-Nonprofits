import { Credentials, ICredentials } from "models/helpers/Credentials";

describe("Credentials Model", () => {
  const baseProps = {
    accessKey: "testAccessKey",
    secretKey: "AxTestAccEssKeyBz",
    accountId: "1932311111", // not a real account id
    userArn: "arn:aws:iam::1932311111:root",
    userName: "testUserName",
  };

  test("initialized properly", () => {
    const creds: ICredentials = Credentials.create(baseProps);

    expect(creds.accessKey).toBe("testAccessKey");
    expect(creds.secretKey).toBe("AxTestAccEssKeyBz");
    expect(creds.accountId).toBe("1932311111");
    expect(creds.userArn).toBe("arn:aws:iam::1932311111:root");
    expect(creds.userName).toBe("testUserName");
  });

  test("reset credentials using reset action", () => {
    const creds: ICredentials = Credentials.create(baseProps);

    // Check initial props
    expect(creds.accessKey).toBe("testAccessKey");
    expect(creds.secretKey).toBe("AxTestAccEssKeyBz");
    expect(creds.accountId).toBe("1932311111");
    expect(creds.userArn).toBe("arn:aws:iam::1932311111:root");
    expect(creds.userName).toBe("testUserName");

    // Run reset action
    creds.reset();

    // Check props after reset
    expect(creds.accessKey).toBe("");
    expect(creds.secretKey).toBe("");
    expect(creds.accountId).toBe("");
    expect(creds.userArn).toBe("");
    expect(creds.userName).toBe(undefined);
  });

  test("root user", () => {
    const creds: ICredentials = Credentials.create(baseProps);

    expect(creds.isRoot).toBe(true);
  });

  test("non-root user", () => {
    const creds: ICredentials = Credentials.create({ ...baseProps, userArn: "arn:aws:iam::1932311111:test" });

    expect(creds.isRoot).toBe(false);
  });

  test("non-empty credentials", () => {
    const creds: ICredentials = Credentials.create(baseProps);

    expect(creds.empty).toBe(false);
  });

  test("empty access key", () => {
    const creds: ICredentials = Credentials.create({ ...baseProps, accessKey: "" });

    expect(creds.empty).toBe(true);
  });

  test("empty secret key", () => {
    const creds: ICredentials = Credentials.create({ ...baseProps, secretKey: "" });

    expect(creds.empty).toBe(true);
  });
});
