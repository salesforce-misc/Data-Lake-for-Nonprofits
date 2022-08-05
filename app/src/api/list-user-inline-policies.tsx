import {
  IAMClient,
  ListUserPoliciesCommand,
  ListUserPoliciesCommandInput,
  ListUserPoliciesCommandOutput,
} from "@aws-sdk/client-iam";

import { CredentialsInput } from "./validate-credentials";

export interface ListUserPoliciesInput extends CredentialsInput {
  userName: string;
}

export async function listUserInlinePolicies({ accessKey, secretKey, region, userName }: ListUserPoliciesInput): Promise<string[]> {
  const client = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let params: ListUserPoliciesCommandInput = { UserName: userName, MaxItems: 999 };
  let data: ListUserPoliciesCommandOutput;
  const result: string[] = [];

  do {
    data = await client.send(new ListUserPoliciesCommand(params));
    params.Marker = data.Marker;
    if (data.PolicyNames && data.PolicyNames.length > 0) {
      result.push(...data.PolicyNames);
    }

  } while (data.IsTruncated);

  return result;
}
