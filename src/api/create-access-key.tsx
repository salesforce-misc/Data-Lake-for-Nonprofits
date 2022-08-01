import { IAMClient, CreateAccessKeyCommand, AccessKey } from "@aws-sdk/client-iam";

import { CredentialsInput } from "./validate-credentials";

export interface CreateAccessKeyInput extends CredentialsInput {
  userName: string;
}

/**
 * Creates an access key.
 */
export async function createAccessKey({ accessKey, secretKey, region, userName }: CreateAccessKeyInput): Promise<AccessKey> {
  const client = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const data = await client.send(new CreateAccessKeyCommand({ UserName: userName }));
  if (!data.AccessKey) {
    throw new Error(`No access key was returned from calling AWS IAM API (createAccessKey)`);
  }

  return data.AccessKey;
}
