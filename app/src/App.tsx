import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import { observer } from "mobx-react";

import { theme as orange } from "./themes/orange";
import { theme as purple } from "./themes/purple";
import { theme as blue } from "./themes/blue";
import { theme as pink } from "./themes/pink";
import { theme as green } from "./themes/green";
import { Home } from "./routes/home/Home";
import { Step1 } from "./routes/step1/Step1";
import { Step2 } from "./routes/step2/Step2";
import { Step3 } from "./routes/step3/Step3";
import { Step4 } from "./routes/step4/Step4";
import { Step5 } from "./routes/step5/Step5";
import { Step6 } from "./routes/step6/Step6";

interface IThemeWrapper {
  theme: any;
  children?: React.ReactNode;
}

// A simple wrapper for ChakraProvider
const ThemeWrapper = ({ theme, children }: IThemeWrapper) => {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};

const App = () => {
  // If the user does a browser refresh, they need to be redirected back to the home page
  const pathname = window.location.pathname;
  if (pathname !== "/") {
    // redirect
    window.location.pathname = "/";
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={<ThemeWrapper theme={orange} children={<Home />} />} />
      {/* <Route path="/" element={<ThemeWrapper theme={purple} children={<Step6 />} />} /> */}
      <Route path="/steps/1" element={<ThemeWrapper theme={orange} children={<Step1 />} />} />
      <Route path="/steps/2" element={<ThemeWrapper theme={blue} children={<Step2 />} />} />
      <Route path="/steps/3" element={<ThemeWrapper theme={purple} children={<Step3 />} />} />
      <Route path="/steps/4" element={<ThemeWrapper theme={pink} children={<Step4 />} />} />
      <Route path="/steps/5" element={<ThemeWrapper theme={green} children={<Step5 />} />} />
      <Route path="/steps/6" element={<ThemeWrapper theme={purple} children={<Step6 />} />} />
      <Route
        path="*"
        element={
          <main style={{ padding: "1rem" }}>
            <p>There's nothing here!</p>
          </main>
        }
      />
    </Routes>
  );
};

export default observer(App);
