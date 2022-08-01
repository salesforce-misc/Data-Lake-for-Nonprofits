import { Capability, CloudFormationClient, UpdateStackCommand, UpdateStackCommandInput, Parameter } from "@aws-sdk/client-cloudformation";
import { CredentialsInput } from "./validate-credentials";

export interface UpdateStackInput extends CredentialsInput {
  parameters: Parameter[];
  stackName: string;
  templateBody?: string;
  templateURL?: string;
}

/**
 * Updates a stack.
 */
export async function updateStack({
  accessKey,
  secretKey,
  region,
  parameters,
  stackName,
  templateBody,
  templateURL,
}: UpdateStackInput): Promise<string> {
  const cfnClient = new CloudFormationClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const params: UpdateStackCommandInput = {
    Parameters: parameters,
    StackName: stackName,
    TemplateBody: templateBody,
    TemplateURL: templateURL,
    Capabilities: [Capability.CAPABILITY_IAM, Capability.CAPABILITY_NAMED_IAM],
  };

  const data = await cfnClient.send(new UpdateStackCommand(params));

  return data.StackId ?? "";
}
