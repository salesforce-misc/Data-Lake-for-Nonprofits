import React from "react";
import { observer } from "mobx-react";

import { useImportStatusStore } from "models/ImportStatusStore";
import { TimeAgo } from "components/TimeAgo";

export const StartTime = observer(() => {
  const { store } = useImportStatusStore();
  if (store.isGettingSchemas) return null;
  if (store.startTime === 0) return null;

  return <TimeAgo time={store.startTime} />;
});
