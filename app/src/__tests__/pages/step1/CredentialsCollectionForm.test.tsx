import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { StoreProvider } from "AppContext";

import { CredentialsCollectionForm } from "pages/step1/CredentialsCollectionForm";

const mockOnCancel = jest.fn();
const mockOnDone = jest.fn();

describe("Step1 -> CredentialsCollectionForm component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <RenderWithChakra>
        <StoreProvider>
          <CredentialsCollectionForm onCancel={mockOnCancel} onDone={mockOnDone} />
        </StoreProvider>
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    render(
      <StoreProvider>
        <CredentialsCollectionForm onCancel={mockOnCancel} onDone={mockOnDone} />
      </StoreProvider>
    );

    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });
});
