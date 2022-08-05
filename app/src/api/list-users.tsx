import { IAMClient, ListUsersCommand, ListUsersCommandInput, ListUsersCommandOutput, User } from "@aws-sdk/client-iam";

import { CredentialsInput } from "./validate-credentials";

export interface ListUsersInput extends CredentialsInput {
  pathPrefix?: string;
}

/**
 * Returns a list of IAM users matching the given path prefix
 */
export async function listUsers({ accessKey, secretKey, region, pathPrefix }: ListUsersInput): Promise<User[]> {
  const client = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let params: ListUsersCommandInput = { PathPrefix: pathPrefix, MaxItems: 1000 };
  let data: ListUsersCommandOutput;
  const users: User[] = [];

  do {
    data = await client.send(new ListUsersCommand(params));
    params.Marker = data.Marker;
    if (data.Users && data.Users.length > 0) users.push(...data.Users);
  } while (data.IsTruncated);

  return users;
}
