import React from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { isCompleted } from "models/Installation";
import { useColorScheme } from "models/useColorScheme";
import { awsRegionsMap } from "data/aws-regions";

export const ReviewGrid = observer(() => {
  const { tone } = useColorScheme();
  const installation = useInstallation();

  const commonProps = {
    w: "100%",
    h: "100%",
    p: 2,
  };

  const headerProps = {
    ...commonProps,
    color: tone(700),
    fontWeight: "bold",
  };

  const headerPropsOdd = {
    ...headerProps,
    bg: tone(75),
  };

  const contentProps = {
    ...commonProps,
    color: tone(800),
    pl: 3,
  };

  const contentPropsOdd = {
    ...contentProps,
    bg: tone(75),
  };

  return (
    <Grid templateColumns="0.5fr 1fr" rowGap={3} pb={6}>
      <GridItem {...headerPropsOdd}>AWS Account Id</GridItem>
      <GridItem {...contentPropsOdd}>{installation.accountId}</GridItem>

      <GridItem {...headerProps}>AWS Region</GridItem>
      <GridItem {...contentProps}>{awsRegionsMap[installation.region].label}</GridItem>

      {installation.appFlowConnectionName && (
        <>
          <GridItem {...headerPropsOdd}>Connection Name</GridItem>
          <GridItem {...contentPropsOdd}>{installation.appFlowConnectionName}</GridItem>
        </>
      )}
      {isCompleted(installation.connectToSalesforceStep) && (
        <>
          <GridItem {...headerProps}>Import Schedule</GridItem>
          <GridItem {...contentProps}>{installation.importOptionsStep.infoMessage}</GridItem>
        </>
      )}
    </Grid>
  );
});
