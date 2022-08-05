import React from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "../../AppContext";
import { useColorScheme } from "../../models/useColorScheme";
import { ClipboardField } from "../../components/ClipboardField";

export const AccessInfoGrid = observer(() => {
  const { tone } = useColorScheme();
  const installation = useInstallation();
  const athenaServer = installation.athenaServer;
  const port = installation.athenaServerPort;
  const s3Staging = installation.athenaOutput;
  const catalog = installation.athenaDataCatalog;
  const workgroup = installation.athenaPrimaryWorkGroup;

  const commonProps = {
    w: "100%",
    h: "100%",
    borderRadius: "md",
    p: 1,
    pl: 3,
  };

  const headerProps = {
    ...commonProps,
    color: tone(700),
    bg: tone(75),
    fontWeight: "bold",
  };

  const contentProps = {
    ...commonProps,
    color: tone(800),
  };

  return (
    <Grid templateColumns="0.5fr 1fr" gap={2} mb={6}>
      <GridItem {...headerProps}>Server</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value={athenaServer} />
      </GridItem>
      <GridItem {...headerProps}>Port</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value={port} />
      </GridItem>
      <GridItem {...headerProps}>S3 Staging Directory</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value={s3Staging} />
      </GridItem>
      <GridItem {...headerProps}>Catalog</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value={catalog} />
      </GridItem>
      <GridItem {...headerProps}>Workgroup</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value={workgroup} />
      </GridItem>
      <GridItem {...headerProps}>Database</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value="public" />
      </GridItem>
    </Grid>
  );
});
