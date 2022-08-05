import { IAMClient, ListAccessKeysCommand, ListAccessKeysCommandInput, ListAccessKeysCommandOutput, AccessKeyMetadata } from "@aws-sdk/client-iam";

import { CredentialsInput } from "./validate-credentials";

export interface ListAccessKeysInput extends CredentialsInput {
  userName: string;
}

export async function listAccessKeys({ accessKey, secretKey, region, userName }: ListAccessKeysInput): Promise<AccessKeyMetadata[]> {
  const client = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let params: ListAccessKeysCommandInput = { UserName: userName, MaxItems: 1000 };
  let data: ListAccessKeysCommandOutput;
  const accessKeys: AccessKeyMetadata[] = [];

  do {
    data = await client.send(new ListAccessKeysCommand(params));
    params.Marker = data.Marker;
    if (data.AccessKeyMetadata && data.AccessKeyMetadata.length > 0) accessKeys.push(...data.AccessKeyMetadata);
  } while (data.IsTruncated);

  return accessKeys;
}
