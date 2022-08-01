import {
  IAMClient,
  ListGroupsForUserCommand,
  ListGroupsForUserCommandInput,
  ListGroupsForUserCommandOutput,
  Group,
} from "@aws-sdk/client-iam";

import { CredentialsInput } from "./validate-credentials";

export interface ListUserGroupsInput extends CredentialsInput {
  userName: string;
}

export async function listUserGroups({ accessKey, secretKey, region, userName }: ListUserGroupsInput): Promise<Group[]> {
  const client = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let params: ListGroupsForUserCommandInput = { UserName: userName, MaxItems: 999 };
  let data: ListGroupsForUserCommandOutput;
  const result: Group[] = [];

  do {
    data = await client.send(new ListGroupsForUserCommand(params));
    params.Marker = data.Marker;
    if (data.Groups && data.Groups.length > 0) result.push(...data.Groups);
  } while (data.IsTruncated);

  return result;
}
