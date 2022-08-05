import {
  CloudFormationClient,
  StackStatus,
  ListStacksCommand,
  ListStacksCommandInput,
  StackSummary,
  ListStacksCommandOutput,
} from "@aws-sdk/client-cloudformation";

import { CredentialsInput } from "./validate-credentials";

export interface ListStacksInput extends CredentialsInput {
  statusArray?: StackStatus[];
}

export async function listStacks({ accessKey, secretKey, region, statusArray }: ListStacksInput): Promise<StackSummary[]> {
  const client = new CloudFormationClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let params: ListStacksCommandInput = { StackStatusFilter: statusArray };
  let data: ListStacksCommandOutput;

  let result: StackSummary[] = [];

  do {
    data = await client.send(new ListStacksCommand(params));
    if (data.StackSummaries && data.StackSummaries.length > 0) {
      result.push(...data.StackSummaries);
    }

    params.NextToken = data.NextToken;
  } while (params.NextToken);

  return result;
}
