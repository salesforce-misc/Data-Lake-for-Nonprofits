import { cleanup, render, screen } from "@testing-library/react";
import { initializeStore, StoreProvider, useInstallation, useStore } from "AppContext";
import { AppStore } from "models/AppStore";

describe("AppContext", () => {
  beforeEach(() => {
    const appStore = AppStore.create({});
    const installation = appStore.newInstallation();
    appStore.setInstallation(installation);
    
    initializeStore();
  });
  
  afterEach(cleanup);

  test("useStore hook", () => {
    const StoreComponent = () => {
      const store = useStore();

      return <div>{(store && "Store found!") || "No store found!"}</div>;
    };

    render(
      <StoreProvider>
        <StoreComponent />
      </StoreProvider>
    );

    expect(screen.getByText("Store found!")).toBeInTheDocument();
  });

  test("useInstallation hook", () => {
    const InstallationComponent = () => {
      const installation = useInstallation();

      return <div>{(installation && "Installation found!") || "No installation found!"}</div>;
    };

    render(
      <StoreProvider>
        <InstallationComponent />
      </StoreProvider>
    );

    expect(screen.getByText("Installation found!")).toBeInTheDocument();
  });
});
