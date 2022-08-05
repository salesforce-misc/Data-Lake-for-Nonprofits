import { SFNClient, DescribeExecutionCommand, DescribeExecutionCommandOutput } from "@aws-sdk/client-sfn";

import { CredentialsInput } from "./validate-credentials";

export interface DescribeSFNInput extends CredentialsInput {
  executionArn: string;
}

/**
 * Get information about the execution of a step functions state machine
 */
export async function describeSFN({ accessKey, secretKey, region, executionArn }: DescribeSFNInput): Promise<DescribeExecutionCommandOutput> {
  const cfnClient = new SFNClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const result = await cfnClient.send(new DescribeExecutionCommand({ executionArn }));

  return result;
}
