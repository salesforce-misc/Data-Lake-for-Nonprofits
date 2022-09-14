import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { StoreProvider } from "AppContext";

import { CredentialsError } from "pages/step1/CredentialsError";
import { CredentialsValidationErrorCode, CredentialsValidationException } from "api/validate-credentials";

describe("Step1 -> CredentialsError component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <StoreProvider>
          <CredentialsError />
        </StoreProvider>
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly without an exception", () => {
    render(
      <StoreProvider>
        <CredentialsError />
      </StoreProvider>
    );

    expect(screen.findByRole("body")).toBeTruthy();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  test("render properly with an invalid key exception", () => {
    const exception = new CredentialsValidationException(CredentialsValidationErrorCode.InvalidKeys);

    render(
      <StoreProvider>
        <CredentialsError exception={exception} />
      </StoreProvider>
    );

    expect(screen.queryByText(/a problem with the access keys/i)).toBeInTheDocument();
    expect(screen.queryByText(/the keys are invalid/i)).toBeInTheDocument();
  });

  test("render properly with a non-admin key exception", () => {
    const exception = new CredentialsValidationException(CredentialsValidationErrorCode.NotAdmin);

    render(
      <StoreProvider>
        <CredentialsError exception={exception} />
      </StoreProvider>
    );

    expect(screen.queryByText(/a problem with the access keys/i)).toBeInTheDocument();
    expect(screen.queryByText(/the keys are valid but they are for a user who does not have admin permissions/i)).toBeInTheDocument();
  });

  test("render properly with a non-admin key exception", () => {
    const exception = new CredentialsValidationException(CredentialsValidationErrorCode.AccountMismatch);

    render(
      <StoreProvider>
        <CredentialsError exception={exception} />
      </StoreProvider>
    );

    expect(screen.queryByText(/a problem with the access keys/i)).toBeInTheDocument();
    expect(screen.queryByText(/the keys are for a different aws account/i)).toBeInTheDocument();
  });

  test("render properly with a default exception", () => {
    const exception = new CredentialsValidationException(CredentialsValidationErrorCode.Unknown);

    render(
      <StoreProvider>
        <CredentialsError exception={exception} />
      </StoreProvider>
    );

    expect(screen.queryByText(/a problem with the access keys/i)).toBeInTheDocument();
    expect(screen.queryByText(/we are unable to validate the keys/i)).toBeInTheDocument();
  });

  test("render properly with an unknown exception", () => {
    const exception = new Error();

    render(
      <StoreProvider>
        <CredentialsError exception={exception} />
      </StoreProvider>
    );

    expect(screen.queryByText(/a problem has been encountered/i)).toBeInTheDocument();
    expect(screen.queryByText(/we are unable to proceed to the next step/i)).toBeInTheDocument();
  });
});
