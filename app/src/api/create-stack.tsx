import { Capability, CloudFormationClient, CreateStackCommand, CreateStackCommandInput, Parameter } from "@aws-sdk/client-cloudformation";
import { CredentialsInput } from "./validate-credentials";

export interface CreateStackInput extends CredentialsInput {
  parameters: Parameter[];
  stackName: string;
  templateBody?: string;
  templateURL?: string;
  requestToken: string;
}

/**
 * Creates a stack.
 */
export async function createStack({
  accessKey,
  secretKey,
  region,
  parameters,
  stackName,
  templateBody,
  templateURL,
  requestToken,
}: CreateStackInput): Promise<string> {
  const cfnClient = new CloudFormationClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const params: CreateStackCommandInput = {
    Parameters: parameters,
    StackName: stackName,
    TemplateBody: templateBody,
    TemplateURL: templateURL,
    ClientRequestToken: requestToken,
    Capabilities: [Capability.CAPABILITY_IAM, Capability.CAPABILITY_NAMED_IAM],
  };

  const data = await cfnClient.send(new CreateStackCommand(params));

  return data.StackId ?? "";
}
