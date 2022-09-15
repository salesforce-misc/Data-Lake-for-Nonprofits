import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import * as appContext from "AppContext";
import * as usersStore from "models/useUsersStore";

import { WarningBanner } from "pages/step6/users-table/WarningBanner";
import { IUser, User } from "models/helpers/User";
import { IRawAccessKey, TAccessKeyStatus } from "models/helpers/UserAccessKey";

describe("WarningBanner component", () => {
  beforeEach(() => {
    // @ts-ignore
    jest.spyOn(appContext, "useInstallation").mockImplementation(() => {
      return {
        id: "1",
        startDate: "2022-01-01",
        startedBy: "test-user",
        accountId: "test-account-id",
        region: "us-east-1",
        appFlowConnectionName: "test-appflow-connection-name",
        credentials: [],
        nextStepNumber: "2",
        createUsersStep: {
          markStarted: jest.fn(),
          markCompleted: jest.fn(),
        },
      };
    });

    // @ts-ignore
    jest.spyOn(usersStore, "useUsersStore").mockImplementation(() => {
      return {
        store: {
          attachAthenaPolicy: (user, installation) => {
            user.hasAthenaManagedPolicy = true;
            return true;
          },
        },
      };
    });
  });

  afterEach(() => {
    cleanup;
  });

  test("snapshot", () => {
    const user: IUser = User.create({
      id: "1",
      name: "Simsek Mert",
      arn: "arn:aws:iam::xyzxyzxyzxx:root",
      createDate: new Date("2022-01-05"),
      accessKeys: {},
      policies: ["some-test-policy"],
      hasAthenaManagedPolicy: false,
      stale: false,
    });

    const tree = create(
      <CustomChakraProvider>
        <WarningBanner user={user} />
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render with a user having access", () => {
    const user: IUser = User.create({
      id: "1",
      name: "Simsek Mert",
      arn: "arn:aws:iam::xyzxyzxyzxx:root",
      createDate: new Date("2022-01-05"),
      accessKeys: {},
      policies: ["some-test-policy"],
      hasAthenaManagedPolicy: true, // this makes sure the user has access
      stale: false,
    });

    render(<WarningBanner user={user} />);

    expect(screen.getByTestId("test-root")).toBeTruthy();
  });

  test("render with a user with no policy", () => {
    const user: IUser = User.create({
      id: "1",
      name: "Simsek Mert",
      arn: "arn:aws:iam::xyzxyzxyzxx:root",
      createDate: new Date("2022-01-05"),
      accessKeys: {},
      policies: ["some-test-policy"],
      hasAthenaManagedPolicy: false,
      stale: false,
    });

    render(<WarningBanner user={user} />);

    expect(screen.getByText(/necessary policy is not attached/i)).toBeTruthy();
  });

  test("render with a user with no keys", () => {
    const user: IUser = User.create({
      id: "1",
      name: "Simsek Mert",
      arn: "arn:aws:iam::xyzxyzxyzxx:root",
      createDate: new Date("2022-01-05"),
      accessKeys: {},
      policies: ["arn:aws:iam::aws:policy/AdministratorAccess"],
      hasAthenaManagedPolicy: false,
      stale: false,
    });

    render(<WarningBanner user={user} />);

    expect(screen.getByText(/no access keys associated with the user/i)).toBeTruthy();
  });

  test("render with a user with inactive keys", () => {
    const user: IUser = User.create({
      id: "1",
      name: "Simsek Mert",
      arn: "arn:aws:iam::xyzxyzxyzxx:root",
      createDate: new Date("2022-01-05"),
      accessKeys: {},
      policies: ["arn:aws:iam::aws:policy/AdministratorAccess"],
      hasAthenaManagedPolicy: false,
      stale: false,
    });
    const rawAccessKey: IRawAccessKey = {
      id: "1",
      secret: "some-test-secret",
      createDate: new Date("2022-02-01"),
      status: TAccessKeyStatus.Inactive,
    };

    // Set the raw access key
    user.setAccessKey(rawAccessKey);

    render(<WarningBanner user={user} />);

    expect(screen.getByText(/access keys are inactive/i)).toBeTruthy();
  });

  test("attach policy for a user with no policy", async () => {
    const user: IUser = User.create({
      id: "1",
      name: "Simsek Mert",
      arn: "arn:aws:iam::xyzxyzxyzxx:root",
      createDate: new Date("2022-01-05"),
      accessKeys: {},
      policies: ["some-test-policy"],
      hasAthenaManagedPolicy: false,
      stale: false,
    });

    render(<WarningBanner user={user} />);

    expect(screen.getByText(/necessary policy is not attached/i)).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Attach Policy" });
    fireEvent.click(button);

    await screen.findByText("Attaching Policy");
    await screen.findByText("Attach Policy");
  });
});
