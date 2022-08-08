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
    borderRadius: "md",
    p: 0,
  };

  const headerProps = {
    ...commonProps,
    color: tone(700),
    fontWeight: "bold",
  };

  const contentProps = {
    ...commonProps,
    bg: tone(75),
    color: tone(800),
    p: 1,
    pl: 3,
  };

  return (
    <Grid templateColumns="0.5fr 1fr" gap={2} pb={6}>
      <GridItem {...headerProps}>AWS Account Id</GridItem>
      <GridItem {...contentProps}>{installation.accountId}</GridItem>

      <GridItem {...headerProps}>AWS Region</GridItem>
      <GridItem {...contentProps}>{awsRegionsMap[installation.region].label}</GridItem>

      {installation.appFlowConnectionName && (
        <>
          <GridItem {...headerProps}>Connection Name</GridItem>
          <GridItem {...contentProps}>{installation.appFlowConnectionName}</GridItem>
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
