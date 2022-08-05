import { IAMClient, UpdateAccessKeyCommand } from "@aws-sdk/client-iam";

import { CredentialsInput } from "./validate-credentials";

export interface DeactivateAccessKeyInput extends CredentialsInput {
  userName: string;
  accessKeyId: string;
}

/**
 * Deactivates an access key. If the key is already deactivated, this won't through an exception.
 */
export async function deactivateAccessKey({ accessKey, secretKey, region, userName, accessKeyId }: DeactivateAccessKeyInput): Promise<void> {
  const client = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  await client.send(new UpdateAccessKeyCommand({ UserName: userName, AccessKeyId: accessKeyId, Status: "Inactive" }));
}
