import {
  CloudFormationClient,
  DescribeStackEventsCommand,
  DescribeStackEventsCommandInput,
  DescribeStackEventsCommandOutput,
  StackEvent,
} from "@aws-sdk/client-cloudformation";

import { CredentialsInput } from "./validate-credentials";

export interface DescribeStackEventsInput extends CredentialsInput {
  stackName: string;
}

/**
 * Returns the stack events
 */
export async function describeStackEvents({ accessKey, secretKey, region, stackName }: DescribeStackEventsInput): Promise<StackEvent[]> {
  const cfnClient = new CloudFormationClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let params: DescribeStackEventsCommandInput = { StackName: stackName };
  let data: DescribeStackEventsCommandOutput;

  do {
    data = await cfnClient.send(new DescribeStackEventsCommand(params));
    params.NextToken = data.NextToken;
  } while (params.NextToken);

  return data.StackEvents ?? [];
}
