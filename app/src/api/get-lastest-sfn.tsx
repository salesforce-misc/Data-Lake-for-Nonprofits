import { SFNClient, ListExecutionsCommand, ListExecutionsCommandInput, ListExecutionsCommandOutput, ExecutionListItem } from "@aws-sdk/client-sfn";

import { CredentialsInput } from "./validate-credentials";

export interface GetLatestSFN extends CredentialsInput {
  stateMachineArn: string;
}

/**
 * Get the latest execution of the provided step functions state machine
 */
export async function getLatestSFN({ accessKey, secretKey, region, stateMachineArn }: GetLatestSFN): Promise<ExecutionListItem | undefined> {
  const cfnClient = new SFNClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let params: ListExecutionsCommandInput = { stateMachineArn, maxResults: 1 };
  let data: ListExecutionsCommandOutput;

  do {
    // This command returns the latest execution first
    // see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sfn/classes/listexecutionscommand.html
    data = await cfnClient.send(new ListExecutionsCommand(params));
    params.nextToken = data.nextToken;
    if (data.executions && data.executions?.length > 0) {
      return data.executions[0];
    }
  } while (params.nextToken);

  return undefined;
}
