import { IAMClient, UpdateAccessKeyCommand } from "@aws-sdk/client-iam";

import { CredentialsInput } from "./validate-credentials";

export interface ActivateAccessKeyInput extends CredentialsInput {
  userName: string;
  accessKeyId: string;
}

/**
 * Activates an access key. If the key is already activated, this won't through an exception.
 */
export async function activateAccessKey({ accessKey, secretKey, region, userName, accessKeyId }: ActivateAccessKeyInput): Promise<void> {
  const client = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  await client.send(new UpdateAccessKeyCommand({ UserName: userName, AccessKeyId: accessKeyId, Status: "Active" }));
}
