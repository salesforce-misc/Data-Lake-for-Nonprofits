import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import { observer } from "mobx-react";

import { theme as orange } from "themes/orange";
import { theme as purple } from "themes/purple";
import { theme as blue } from "themes/blue";
import { theme as pink } from "themes/pink";
import { theme as green } from "themes/green";

import { Home } from "pages/home/Home";
import { Step1 } from "pages/step1/Step1";
import { Step2 } from "pages/step2/Step2";
import { Step3 } from "pages/step3/Step3";
import { Step4 } from "pages/step4/Step4";
import { Step5 } from "pages/step5/Step5";
import { Step6 } from "pages/step6/Step6";

interface IChakraWrapper {
  theme: any;
  children?: React.ReactNode;
}

// A simple wrapper for ChakraProvider
const ChakraWrapper = ({ theme, children }: IChakraWrapper) => {
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
      <Route path="/" element={<ChakraWrapper theme={green} children={<Step5 />} />} />
      {/* <Route path="/" element={<ChakraWrapper theme={orange} children={<Home />} />} /> */}
      <Route path="/steps/1" element={<ChakraWrapper theme={orange} children={<Step1 />} />} />
      <Route path="/steps/2" element={<ChakraWrapper theme={blue} children={<Step2 />} />} />
      <Route path="/steps/3" element={<ChakraWrapper theme={purple} children={<Step3 />} />} />
      <Route path="/steps/4" element={<ChakraWrapper theme={pink} children={<Step4 />} />} />
      <Route path="/steps/5" element={<ChakraWrapper theme={green} children={<Step5 />} />} />
      <Route path="/steps/6" element={<ChakraWrapper theme={purple} children={<Step6 />} />} />
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
