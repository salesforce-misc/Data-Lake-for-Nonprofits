import { cleanup, screen } from "@testing-library/react";
import { create } from "react-test-renderer";

import { render, RenderWithChakra } from "test-utils";

import { StoreProvider } from "AppContext";

import { ProgressPanel } from "routes/home/detected-installations/ProgressPanel";

import * as detectedInstallationStore from "models/useDetectedInstallationStore";
import { Row } from "routes/home/detected-installations/Row";
import { DetectedInstallation } from "models/helpers/DetectedInstallation";

const mockOnSelected = jest.fn();

describe("DetectedInstallations -> Row component", () => {
  afterEach(cleanup);

  test("snapshot", () => {
    const item = DetectedInstallation.create({
      id: "1",
      webUrlOrigin: "",
      reachable: true,
      region: "us-east-1",
      installationJson: {},
    });

    const tree = create(
      <RenderWithChakra>
        <StoreProvider>
          <Row item={item} selected={false} onSelected={mockOnSelected} />
        </StoreProvider>
      </RenderWithChakra>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("render properly", () => {
    const item = DetectedInstallation.create({
      id: "1",
      webUrlOrigin: "",
      reachable: true,
      region: "us-east-1",
      installationJson: {},
    });

    render(
      <StoreProvider>
        <Row item={item} selected={false} onSelected={mockOnSelected} />
      </StoreProvider>
    );

    expect(screen.queryByText(/connection name/i)).toBeInTheDocument();
  });
});
