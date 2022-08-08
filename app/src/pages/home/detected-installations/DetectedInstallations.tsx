import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useDetectedInstallationStore } from "models/useDetectedInstallationStore";
import { useColorScheme } from "models/useColorScheme";
import { IDetectedInstallation } from "models/helpers/DetectedInstallation";

import { CountBadge } from "./CountBadge";
import { ProgressPanel } from "./ProgressPanel";
import { ErrorPanel } from "./ErrorPanel";
import { EmptyMessage } from "./EmptyMessage";
import { ListingPanel } from "./ListingPanel";

interface IDetectedInstallationSelections {
  onCancel: () => void;
  onResume: (installation: IDetectedInstallation) => void;
}

export const DetectedInstallations = observer(({ onCancel, onResume }: IDetectedInstallationSelections) => {
  const { tone } = useColorScheme();
  const { store } = useDetectedInstallationStore();

  const handleCancel = () => {
    store.credentials.reset();
    store.reset();
    onCancel();
  };

  const handleResume = (id: string) => {
    onResume(store.installations.get(id)!);
  };

  return (
    <Box>
      <Heading size="md" pt="0px" pb={4} color={tone(600)} letterSpacing="-1px">
        Available data lakes <CountBadge />
      </Heading>
      <ProgressPanel />
      <ErrorPanel onCancel={handleCancel} />
      <EmptyMessage onCancel={handleCancel} />
      <ListingPanel onCancel={handleCancel} onResume={handleResume} />
    </Box>
  );
});
