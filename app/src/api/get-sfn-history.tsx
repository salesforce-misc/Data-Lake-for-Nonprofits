import includes from "lodash/includes";
import isEmpty from "lodash/isEmpty";
import {
  SFNClient,
  GetExecutionHistoryCommand,
  GetExecutionHistoryCommandInput,
  GetExecutionHistoryCommandOutput,
  HistoryEvent,
} from "@aws-sdk/client-sfn";

import { CredentialsInput } from "./validate-credentials";

export interface GetSFNHistory extends CredentialsInput {
  executionArn: string;
}

// NOTE: AWS SFN SDK does not have these types as enumerations :(
// We consider any of these types as an execution failure event
// For all event types, see https://docs.aws.amazon.com/step-functions/latest/apireference/API_HistoryEvent.html
const executionFailureTypes = ["ExecutionAborted", "ExecutionFailed", "ExecutionTimedOut"];

export const isExecutionFailureEvent = (event: HistoryEvent): boolean => {
  // We want to check if this event is a failure event that represents the whole execution.
  return includes(executionFailureTypes, event.type);
};

export interface ExecutionFailureInfo {
  cause: string;
  error: string;
}

export const getExecutionFailureInfo = (event: HistoryEvent): ExecutionFailureInfo => {
  // AWS SFN SDK has a property per event type
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sfn/modules/historyevent.html

  let cause = "Unknown";
  let error = "Unknown";

  switch (event.type) {
    case "ExecutionAborted":
      cause = event.executionAbortedEventDetails?.cause ?? cause;
      error = event.executionAbortedEventDetails?.error ?? error;
      break;
    case "ExecutionFailed":
      cause = event.executionFailedEventDetails?.cause ?? cause;
      error = event.executionFailedEventDetails?.error ?? error;
      break;
    case "ExecutionTimedOut":
      cause = event.executionTimedOutEventDetails?.cause ?? cause;
      error = event.executionTimedOutEventDetails?.error ?? error;
      break;
  }

  return {
    cause,
    error,
  };
};

/**
 * Get the history of the execution of a step functions state machine
 */
export async function getSFNHistory({ accessKey, secretKey, region, executionArn }: GetSFNHistory): Promise<HistoryEvent[]> {
  const cfnClient = new SFNClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let params: GetExecutionHistoryCommandInput = { executionArn, includeExecutionData: false, maxResults: 1000, reverseOrder: true };
  let data: GetExecutionHistoryCommandOutput;
  let events: HistoryEvent[] = [];

  do {
    data = await cfnClient.send(new GetExecutionHistoryCommand(params));
    params.nextToken = data.nextToken;
    if (!isEmpty(data.events)) {
      events.push(...(data.events ?? []));
    }
  } while (params.nextToken);

  return events;
}
