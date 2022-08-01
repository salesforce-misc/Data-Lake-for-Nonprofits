import {
  CloudFormationClient,
  DescribeStackResourcesCommand,
  DescribeStackResourcesCommandInput,
  StackResource,
} from "@aws-sdk/client-cloudformation";

import { CredentialsInput } from "./validate-credentials";

export interface DescribeStackResourcesInput extends CredentialsInput {
  stackName: string;
  logicalResourceId?: string;
  physicalResourceId?: string;
}

/**
 * Returns the stack resources
 */
export async function describeStackResources({
  accessKey,
  secretKey,
  region,
  stackName,
  logicalResourceId,
  physicalResourceId,
}: DescribeStackResourcesInput): Promise<StackResource[]> {
  const cfnClient = new CloudFormationClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const params: DescribeStackResourcesCommandInput = {
    StackName: stackName,
    LogicalResourceId: logicalResourceId,
    PhysicalResourceId: physicalResourceId,
  };

  const data = await cfnClient.send(new DescribeStackResourcesCommand(params));

  return data.StackResources ?? [];
}
