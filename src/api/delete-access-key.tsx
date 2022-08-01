import { IAMClient, DeleteAccessKeyCommand } from "@aws-sdk/client-iam";

import { deactivateAccessKey } from "./deactivate-access-key";
import { CredentialsInput } from "./validate-credentials";

export interface DeleteAccessKeyInput extends CredentialsInput {
  userName: string;
  accessKeyId: string;
}

/**
 * Deletes an access key. It deactivates the key before deleting the key.
 */
export async function deleteAccessKey({ accessKey, secretKey, region, userName, accessKeyId }: DeleteAccessKeyInput): Promise<void> {
  const client = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  await deactivateAccessKey({ accessKey, secretKey, region, userName, accessKeyId });
  // await delay(1); // Give it a second, this is not the best way to address eventual consistency, but good enough for now
  await client.send(new DeleteAccessKeyCommand({ UserName: userName, AccessKeyId: accessKeyId }));
}
