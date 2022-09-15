# Unit Tests

For information about running tests for create-react-app applications
<https://create-react-app.dev/docs/running-tests/>

Unit tests have been organized within the same folder structure as the application has under `__tests__` folder.

## Mocks

Since Jest has not fully supported ESM yet, we used mocks for some third party libraries.
These mocks can be found under `src/__mocks__`
Following modules are being mocked here.

- react-markdown
- remark-gfm

## Test Utilities

We have test utilities defined in `test-utils.tsx` file.

We use custom renderer to apply `ChakraProvider` to unit tests.

```javascript
const CustomProvider = ({ children }: { children: React.ReactNode }) => {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: CustomProvider, ...options });
```

For some cases, it is very helpful to use some mock components. For such cases, we wrap such components by a mock component in order to render with `ChakraProvider`

```javascript
export const RenderWithChakra = ({
  children,
}: {
  children: React.ReactNode,
}) => <ChakraProvider theme={theme}>{children}</ChakraProvider>;
```

In all cases, we use `orange` theme to pass into `ChakraProvider`

```javascript
import { theme } from "themes/orange";
```

## Mocking App Store

```javascript
beforeEach(() => {
  const appStore = AppStore.create({});
  const installation = appStore.newInstallation();
  appStore.setInstallation(installation);

  initializeStore();
});
```

## Mocking custom hooks

The most used custom hooks are mocked as follows

```javascript
import * as detectedInstallationStore from "models/useDetectedInstallationStore";

jest
  .spyOn(detectedInstallationStore, "useDetectedInstallationStore")
  .mockImplementation(() => {
    return {
      isError: false,
      isReady: true,
      isLoading: false,
      isReloading: false,
      store: {
        empty: true,
        credentials: {
          accountId: "mock-account-id",
        },
      },
    };
  });
```

## How to Run

Unit tests can be run by the following command.

```javascript
yarn test
```

This command will run all unit tests under the `src/__tests__` folder.
