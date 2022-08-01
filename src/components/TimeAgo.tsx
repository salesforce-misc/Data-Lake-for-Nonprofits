import { FC } from "react";
import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import isString from "lodash/isString";
import { observer } from "mobx-react";
import ReactTimeAgo from "react-timeago";

export const TimeAgo: FC<{ time?: string | Date | number }> = observer(({ time }) => {
  if (isNil(time)) return null;
  if (time === 0) return null;
  if (isString(time) && isEmpty(time)) return null;

  return <ReactTimeAgo date={time} />;
});
