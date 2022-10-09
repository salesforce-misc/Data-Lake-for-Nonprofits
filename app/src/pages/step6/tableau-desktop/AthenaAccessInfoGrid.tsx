import React from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { ClipboardField } from "components/ClipboardField";

export const AthenaAccessInfoGrid = observer(() => {
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
    p: 2,
    pl: 1,
  };

  const headerProps = {
    ...commonProps,
    color: tone(700),
    bg: tone(75),
    fontSize: 14,
    fontWeight: "bold",
  };

  const headerPropsOdd = {
    ...headerProps,
    bg: tone(25),
  };

  const contentProps = {
    ...commonProps,
    fontSize: 14,
    color: tone(800),
  };

  const contentPropsOdd = {
    ...contentProps,
    bg: tone(25),
  };

  return (
    <Grid templateColumns="0.5fr 1fr" rowGap={2} mb={6}>
      <GridItem {...headerPropsOdd}>Server</GridItem>
      <GridItem {...contentPropsOdd}>
        <ClipboardField value={`${athenaServer}:443;Workgroup=${workgroup};MetadataRetrievalMethod=ProxyAPI;`} />
      </GridItem>
      <GridItem {...headerProps}>Port</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value={port} />
      </GridItem>
      <GridItem {...headerPropsOdd}>S3 Staging Directory</GridItem>
      <GridItem {...contentPropsOdd}>
        <ClipboardField value={s3Staging} />
      </GridItem>
      <GridItem {...headerProps}>Catalog</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value={catalog} />
      </GridItem>
      <GridItem {...headerPropsOdd}>Workgroup</GridItem>
      <GridItem {...contentPropsOdd}>
        <ClipboardField value={workgroup} />
      </GridItem>
      <GridItem {...headerProps}>Database</GridItem>
      <GridItem {...contentProps}>
        <ClipboardField value="public" />
      </GridItem>
    </Grid>
  );
});
