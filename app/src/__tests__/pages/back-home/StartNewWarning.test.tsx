import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, CustomChakraProvider } from "test-utils";

import { StoreProvider } from "AppContext";

import { ReviewGrid } from "pages/back-home/ReviewGrid";

import * as appContext from "AppContext";
import { StartNewWarning } from "pages/back-home/StartNewWarning";

const mockOnCancel = jest.fn();
const mockOnContinue = jest.fn();

describe("BackHome -> StartNewWarning component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const tree = create(
      <CustomChakraProvider>
        <StoreProvider>
          <StartNewWarning onCancel={mockOnCancel} onContinue={mockOnContinue} />
        </StoreProvider>
      </CustomChakraProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    render(
      <StoreProvider>
        <StartNewWarning onCancel={mockOnCancel} onContinue={mockOnContinue} />
      </StoreProvider>
    );

    expect(screen.getByText(/your existing data lake/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/continue/i)).toBeInTheDocument();
  });
});
