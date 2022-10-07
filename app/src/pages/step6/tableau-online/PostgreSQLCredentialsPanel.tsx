import React from "react";
import { Alert, Box, Button, Grid, GridItem } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { ClipboardField } from "components/ClipboardField";

export const PostgreSQLCredentialsPanel = observer(() => {
  const [error, setError] = React.useState<string>("");
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const { tone, colorScheme } = useColorScheme();
  const { dbHost, dbPort, dbName, dbUsername, dbPassword, credentials, setDatabaseSecrets } = useInstallation();

  const server = dbHost || "**************";
  const port = dbHost ? dbPort : "**************";
  const database = dbHost ? dbName : "**************";
  const username = dbHost ? dbUsername : "**************";
  const password = dbHost ? dbPassword : "**************";
  const showButton = dbHost ? false : true;

  const onClick = async () => {
    setLoading(true);
    setError("");

    try {
      await setDatabaseSecrets(credentials);
      setLoading(false);
    } catch (err: any) {
      console.log(err);
      setError(err.message);
      setLoading(false);
    }
  };

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
    <Box>
      <Grid templateColumns="0.5fr 1fr" rowGap={2} mb={6}>
        <GridItem {...headerPropsOdd}>Server</GridItem>
        <GridItem {...contentPropsOdd}>
          <ClipboardField value={server} />
        </GridItem>
        <GridItem {...headerProps}>Port</GridItem>
        <GridItem {...contentProps}>
          <ClipboardField value={port.toString()} />
        </GridItem>
        <GridItem {...headerPropsOdd}>Database</GridItem>
        <GridItem {...contentPropsOdd}>
          <ClipboardField value={database} />
        </GridItem>
        <GridItem {...headerProps}>Username</GridItem>
        <GridItem {...contentProps}>
          <ClipboardField value={username} />
        </GridItem>
        <GridItem {...headerPropsOdd}>Password</GridItem>
        <GridItem {...contentPropsOdd}>
          <ClipboardField value={password} />
        </GridItem>
      </Grid>

      {error && <Alert status="error">{error}</Alert>}

      {showButton && (
        <Box textAlign="center">
          <Button
            mt={4}
            colorScheme={colorScheme}
            isLoading={isLoading}
            loadingText="Pulling Access Information"
            size="sm"
            type="button"
            onClick={onClick}
          >
            Show Access Information
          </Button>
        </Box>
      )}
    </Box>
  );
});
