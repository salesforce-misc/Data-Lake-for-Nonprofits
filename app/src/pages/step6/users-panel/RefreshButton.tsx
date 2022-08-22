import React from "react";
import { IconButton } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { useInstallation } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { useUsersStore } from "models/useUsersStore";

export const RefreshButton = observer(() => {
  const installation = useInstallation();
  const { isLoading, isReloading, store } = useUsersStore(installation);
  const { colorScheme } = useColorScheme();

  return (
    <IconButton
      colorScheme={colorScheme}
      variant="outline"
      size="xs"
      aria-label="Check again"
      onClick={() => store.load(installation)}
      icon={<RepeatIcon />}
      isLoading={isLoading || isReloading}
      _focus={{ boxShadow: "none" }}
    />
  );
});
