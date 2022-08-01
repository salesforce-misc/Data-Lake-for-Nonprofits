import { CloudFormationClient, UpdateTerminationProtectionCommand, UpdateTerminationProtectionCommandInput } from "@aws-sdk/client-cloudformation";
import { CredentialsInput } from "./validate-credentials";

export interface EnableTerminationProtectionInput extends CredentialsInput {
  stackName: string;
}

/**
 * Creates a stack.
 */
export async function enableTerminationProtection({ accessKey, secretKey, region, stackName }: EnableTerminationProtectionInput): Promise<void> {
  const cfnClient = new CloudFormationClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const params: UpdateTerminationProtectionCommandInput = {
    StackName: stackName,
    EnableTerminationProtection: true,
  };

  await cfnClient.send(new UpdateTerminationProtectionCommand(params));

  return;
}
