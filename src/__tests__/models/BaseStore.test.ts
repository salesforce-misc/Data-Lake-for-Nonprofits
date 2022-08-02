import { BaseStore, IBaseStore, IStoreLoadingState } from "models/BaseStore";

describe("BaseStore Model", () => {
  const baseProps = {
    loadingState: IStoreLoadingState.Initial,
    loadingError: "",
    loadingPercentage: 0,
  };

  test("initialized properly", () => {
    const baseStore: IBaseStore = BaseStore.create(baseProps);

    expect(baseStore.loadingState).toBe("INITIAL");
    expect(baseStore.loadingError).toBe(undefined);
    expect(baseStore.loadingPercentage).toBe(0);
  });

  test("props after created with loading state", () => {
    const baseStore: IBaseStore = BaseStore.create({ ...baseProps, loadingState: IStoreLoadingState.Loading });

    expect(baseStore.loadingState).toBe("INITIAL");
    expect(baseStore.loadingError).toBe(undefined);
    expect(baseStore.loadingPercentage).toBe(0);
  });

  test("props after created with reloading state", () => {
    const baseStore: IBaseStore = BaseStore.create({ ...baseProps, loadingState: IStoreLoadingState.Reloading });

    expect(baseStore.loadingState).toBe("INITIAL");
    expect(baseStore.loadingError).toBe(undefined);
    expect(baseStore.loadingPercentage).toBe(0);
  });

  test("props after created with an error", () => {
    const baseStore: IBaseStore = BaseStore.create({ ...baseProps, loadingError: "Error occurred!" });

    expect(baseStore.loadingState).toBe("INITIAL");
    expect(baseStore.loadingError).toBe(undefined);
    expect(baseStore.loadingPercentage).toBe(0);
  });

  /**
   * Test Scenario
   * ------------------------
   * Initialize the store
   * Expect the percentage to be 0
   * Set the percentage to 40
   * Expect the percentage to be 40
   * Set the percentage to 120
   * Expect the percentage to be 100
   * Set the percentage to -30
   * Expect the percentage to be 0
   */
  test("set loading percentage", () => {
    const baseStore: IBaseStore = BaseStore.create(baseProps);

    expect(baseStore.loadingPercentage).toBe(0);

    baseStore.setLoadingPercentage(40);
    expect(baseStore.loadingPercentage).toBe(40);

    baseStore.setLoadingPercentage(120);
    expect(baseStore.loadingPercentage).toBe(100);

    baseStore.setLoadingPercentage(-30);
    expect(baseStore.loadingPercentage).toBe(0);
  });

  /**
   * Test Scenario
   * ------------------------
   * Initialize the store
   * Expect the percentage to be 0
   * Increment the percentage by 20
   * Expect the percentage to be 20
   * Increment the percentage by 30
   * Expect the percentage to be 50
   * Increment the percentage by 60
   * Expect the percentage to be 100
   */
  test("increment loading percentage", () => {
    const baseStore: IBaseStore = BaseStore.create(baseProps);

    expect(baseStore.loadingPercentage).toBe(0);

    baseStore.incrementLoadingPercentage(20); // 0 + 20 = 20
    expect(baseStore.loadingPercentage).toBe(20);

    baseStore.incrementLoadingPercentage(30); // 20 + 30 = 50
    expect(baseStore.loadingPercentage).toBe(50);

    baseStore.incrementLoadingPercentage(60); // 50 + 60 = 110
    expect(baseStore.loadingPercentage).toBe(100);
  });

  /**
   * Test Scenario
   * ------------------------
   * Initialize the store
   * Expect the percentage to be 0
   * Increment the percentage by 20
   * Expect the percentage to be 20
   * Reset the store
   * Expect the loading percentage to be 0
   * Expect the loading error to be undefined
   * Expect the loading state to be INITIAL
   */
  test("reset the store", () => {
    const baseStore: IBaseStore = BaseStore.create(baseProps);

    expect(baseStore.loadingPercentage).toBe(0);

    baseStore.incrementLoadingPercentage(20);
    expect(baseStore.loadingPercentage).toBe(20);

    baseStore.reset();

    expect(baseStore.loadingPercentage).toBe(0);
    expect(baseStore.loadingError).toBe(undefined);
    expect(baseStore.loadingState).toBe("INITIAL");
  });

  /**
   * Test Scenario
   * ------------------------
   * Initialize the store
   * Expect the loading percentage to be 0
   * Expect the loading error to be undefined
   * Expect the loading state to be INITIAL
   * Load the store
   * Expect the error message since there is no implementation for doLoad
   */
  test("error message", () => {
    const baseStore: IBaseStore = BaseStore.create(baseProps);

    expect(baseStore.loadingPercentage).toBe(0);
    expect(baseStore.loadingError).toBe(undefined);
    expect(baseStore.loadingState).toBe("INITIAL");

    baseStore.load();

    expect(baseStore.errorMessage).toBe("Method 'doLoad' must be implemented by sub models");
  });

  /**
   * Test Scenario
   * ------------------------
   * Initialize the store
   * Expect the loading percentage to be 0
   * Expect the loading error to be undefined
   * Expect the loading state to be INITIAL
   * Define a sub store called TestStore based on BaseStore
   * Initialize testStore
   * Run load action on testStore
   * Expect the error message to be empty
   */
  test("error message when doLoad is implemented", () => {
    const baseStore: IBaseStore = BaseStore.create(baseProps);

    expect(baseStore.loadingPercentage).toBe(0);
    expect(baseStore.loadingError).toBe(undefined);
    expect(baseStore.loadingState).toBe("INITIAL");

    // Implement a sub model based on BaseStore
    const TestStore = BaseStore.named("TestStore").actions(() => ({
      async doLoad() {
        return "test return";
      },
    }));

    const testStore = TestStore.create();

    testStore.load();

    expect(testStore.errorMessage).toBe("");
  });
});
