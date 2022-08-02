import { DetectedInstallation, IDetectedInstallation } from "models/helpers/DetectedInstallation";

describe("DetectedInstallation Model", () => {
  const baseProps = {
    id: "1",
    webUrlOrigin: "some-test-url",
    reachable: true,
    region: "us-east-1",
    installationJson: {
      startDate: "2022-01-01",
      startedBy: "testUser",
      accountId: "testAccountId",
      appFlowConnectionName: "testAppFlowConnectionName",
    },
  };

  test("initialized properly", () => {
    const installation: IDetectedInstallation = DetectedInstallation.create(baseProps);

    expect(installation.id).toBe("1");
    expect(installation.webUrlOrigin).toBe("some-test-url");
    expect(installation.reachable).toBe(true);
    expect(installation.region).toBe("us-east-1");
    expect(installation.installationJson.startDate).toBe("2022-01-01");
    expect(installation.installationJson.startedBy).toBe("testUser");
    expect(installation.installationJson.accountId).toBe("testAccountId");
    expect(installation.installationJson.appFlowConnectionName).toBe("testAppFlowConnectionName");
  });

  test("start date view", () => {
    const installation: IDetectedInstallation = DetectedInstallation.create(baseProps);

    expect(installation.startDate).toBe("2022-01-01");
  });

  test("started by view", () => {
    const installation: IDetectedInstallation = DetectedInstallation.create(baseProps);

    expect(installation.startedBy).toBe("testUser");
  });

  test("account id view", () => {
    const installation: IDetectedInstallation = DetectedInstallation.create(baseProps);

    expect(installation.accountId).toBe("testAccountId");
  });

  test("appFlow connection name view", () => {
    const installation: IDetectedInstallation = DetectedInstallation.create(baseProps);

    expect(installation.appFlowConnectionName).toBe("testAppFlowConnectionName");
  });
});
