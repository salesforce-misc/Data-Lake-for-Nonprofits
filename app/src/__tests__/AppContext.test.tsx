import { cleanup, render, screen } from "@testing-library/react";
import { initializeStore, StoreProvider, useStore } from "AppContext";

describe("AppContext", () => {
  beforeEach(() => {
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

  // test("useInstallation hook", () => {
  //   const InstallationComponent = () => {
  //     const installation = useInstallation();

  //     return <div>{(installation && "Store found!") || "No store found!"}</div>;
  //   };

  //   render(
  //     <StoreProvider>
  //       <InstallationComponent />
  //     </StoreProvider>
  //   );

  //   expect(screen.getByText("Store found!")).toBeInTheDocument();
  // });
});
