import React from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { niceNumber } from "helpers/utils";
import { awsRegionsMap } from "data/aws-regions";
import { useMetadataStore } from "models/MetadataStore";

export const ReviewGrid = observer(() => {
  const installation = useInstallation();
  const { store } = useMetadataStore();

  const commonProps = {
    w: "100%",
    h: "100%",
    borderRadius: "md",
    p: 3,
  };

  const headerProps = {
    ...commonProps,
    // bg: "pink.600",
    // color: "pink.50",
    color: "pink.700",
    fontWeight: "bold",
  };

  const contentProps = {
    ...commonProps,
    bg: "pink.75",
    color: "pink.800",
  };

  return (
    <Grid templateColumns="0.5fr 1fr" gap={2}>
      <GridItem {...headerProps}>AWS Region</GridItem>
      <GridItem {...contentProps}>{awsRegionsMap[installation.region].label}</GridItem>
      <GridItem {...headerProps}>Connection Name</GridItem>
      <GridItem {...contentProps}>{installation.appFlowConnectionName}</GridItem>
      <GridItem {...headerProps}>Import Schedule</GridItem>
      <GridItem {...contentProps}>{installation.importOptionsStep.infoMessage}</GridItem>
      <GridItem {...headerProps}>Data Model</GridItem>
      <GridItem {...contentProps}>We will import {niceNumber(store.selectedObjects.length)} objects</GridItem>
    </Grid>
  );
});
