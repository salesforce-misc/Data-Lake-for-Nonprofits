import first from "lodash/first";
import { CloudFormationClient, DescribeStacksCommand, DescribeStacksCommandInput, Stack } from "@aws-sdk/client-cloudformation";

import { CredentialsInput } from "./validate-credentials";

export interface DescribeStackInput extends CredentialsInput {
  stackName: string;
}

/**
 * Returns the stack information
 */
export async function describeStack({ accessKey, secretKey, region, stackName }: DescribeStackInput): Promise<Stack | undefined> {
  const cfnClient = new CloudFormationClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const params: DescribeStacksCommandInput = {
    StackName: stackName,
  };

  const data = await cfnClient.send(new DescribeStacksCommand(params));
  return first(data.Stacks);
}
