import { cleanup, screen } from "@testing-library/react";
import { act, renderHook } from "@testing-library/react-hooks";
import { create } from "react-test-renderer";
// import * as reactHookForm from "react-hook-form";

import { render, CustomChakraProvider } from "test-utils";

import { StoreProvider } from "AppContext";

import { CredentialsForm, ICredentialsFormInput } from "pages/step1/CredentialsForm";
import { useForm } from "react-hook-form";

describe("Step1 -> CredentialsForm component", () => {
  afterEach(cleanup);

  test("snapshot", async () => {
    const { result } = renderHook(() => useForm<ICredentialsFormInput>());
    const {
      register,
      control,
      formState: { errors, isSubmitting },
    } = result.current;

    const tree = create(
      <CustomChakraProvider>
        <StoreProvider>
          <CredentialsForm {...{ register, errors, isSubmitting, control }} />
        </StoreProvider>
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    const { result } = renderHook(() =>
      useForm<ICredentialsFormInput>({
        defaultValues: {
          accessKeyId: "testAccessKey",
          secretAccessKey: "testSecretKey",
          region: "us-east-1",
        },
      })
    );

    const {
      register,
      control,
      formState: { errors, isSubmitting },
    } = result.current;

    render(
      <StoreProvider>
        <CredentialsForm {...{ register, errors, isSubmitting, control }} />
      </StoreProvider>
    );

    expect(screen.queryByText(/access key id/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/secret access key/i)).toBeTruthy();
    expect(screen.queryByDisplayValue("testAccessKey")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("testSecretKey")).toBeInTheDocument();
    expect(screen.queryByText(/secret access keys are sensitive information/i)).toBeInTheDocument();
  });
});
