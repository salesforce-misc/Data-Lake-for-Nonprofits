import {
  IAMClient,
  ListAttachedUserPoliciesCommand,
  ListAttachedUserPoliciesCommandInput,
  ListAttachedUserPoliciesCommandOutput,
  AttachedPolicy,
} from "@aws-sdk/client-iam";

import { CredentialsInput } from "./validate-credentials";

export interface ListUserPoliciesInput extends CredentialsInput {
  userName: string;
}

export async function listUserPolicies({ accessKey, secretKey, region, userName }: ListUserPoliciesInput): Promise<AttachedPolicy[]> {
  const client = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let params: ListAttachedUserPoliciesCommandInput = { UserName: userName, MaxItems: 999 };
  let data: ListAttachedUserPoliciesCommandOutput;
  const result: AttachedPolicy[] = [];

  do {
    data = await client.send(new ListAttachedUserPoliciesCommand(params));
    params.Marker = data.Marker;
    if (data.AttachedPolicies && data.AttachedPolicies.length > 0) result.push(...data.AttachedPolicies);
  } while (data.IsTruncated);

  return result;
}
