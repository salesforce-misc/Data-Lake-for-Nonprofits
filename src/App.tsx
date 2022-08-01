import { FC, ReactElement } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import { observer } from "mobx-react";

import { theme as orange } from "./themes/orange";
import { theme as purple } from "./themes/purple";
import { Home } from "./routes/Home";
import { Step1 } from "./routes/Step1";
import { Step2 } from "./routes/Step2";
import { Step3 } from "./routes/Step3";
import { Step4 } from "./routes/Step4";
import { Step5 } from "./routes/Step5";
import { Step6 } from "./routes/Step6";

const App: FC = () => {
  // If the user does a browser refresh, they need to be redirected back to the home page
  const pathname = window.location.pathname;
  if (pathname !== "/") {
    // redirect
    window.location.pathname = "/";
    return null;
  }

  // A simple wrapper function to allow us to include ChakraProvider with the provided theme
  const wrap: (theme: any, element: ReactElement) => JSX.Element = (theme, element) => {
    return <ChakraProvider theme={theme}>{element}</ChakraProvider>;
  };

  return (
    <ChakraProvider theme={orange}>
      <Routes>
        <Route path="/" element={wrap(orange, <Home />)} />
        <Route path="/steps/1" element={<Step1 />} />
        <Route path="/steps/2" element={<Step2 />} />
        <Route path="/steps/3" element={wrap(purple, <Step3 />)} />
        <Route path="/steps/4" element={<Step4 />} />
        <Route path="/steps/5" element={<Step5 />} />
        <Route path="/steps/6" element={wrap(purple, <Step6 />)} />
      </Routes>
    </ChakraProvider>
  );
};

export default observer(App);
