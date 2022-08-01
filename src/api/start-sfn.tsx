import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";

import { CredentialsInput } from "./validate-credentials";

export interface StartSFNInput extends CredentialsInput {
  stateMachineArn: string;
}

/**
 * Start an execution of a step functions state machine
 */
export async function startSFN({
  accessKey,
  secretKey,
  region,
  stateMachineArn,
}: StartSFNInput): Promise<{ executionArn: string; startTime: number }> {
  const cfnClient = new SFNClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const result = await cfnClient.send(new StartExecutionCommand({ stateMachineArn }));
  return {
    executionArn: result.executionArn ?? "",
    startTime: result.startDate?.getTime() ?? Date.now(),
  };
}
