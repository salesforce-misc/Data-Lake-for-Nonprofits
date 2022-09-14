import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";

import { render, CustomChakraProvider } from "test-utils";

import * as appContext from "AppContext";
import * as metadataStore from "models/MetadataStore";
import * as importStatusStore from "models/ImportStatusStore";
import { WarningBanner } from "pages/step6/users-table/WarningBanner";
import { IUser, User } from "models/helpers/User";

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
    jest.spyOn(metadataStore, "useMetadataStore").mockImplementation(() => {
      return {
        isReady: true,
        store: {
          selectedObjects: [{}],
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
    user.hasAccess;

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
    user.hasAccess;

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
    user.hasAccess;

    render(<WarningBanner user={user} />);

    expect(screen.getByText(/no access keys associated with the user/i)).toBeTruthy();
  });
});
