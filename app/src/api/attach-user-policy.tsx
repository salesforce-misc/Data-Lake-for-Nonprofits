import { IAMClient, AttachUserPolicyCommand, AttachUserPolicyCommandInput } from "@aws-sdk/client-iam";

import { CredentialsInput } from "./validate-credentials";

export interface AttachUserPolicyInput extends CredentialsInput {
  userName: string;
  policyArn: string;
}

export async function attachUserPolicy({ accessKey, secretKey, region, policyArn, userName }: AttachUserPolicyInput): Promise<void> {
  const client = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const params: AttachUserPolicyCommandInput = {
    PolicyArn: policyArn,
    UserName: userName,
  };

  await client.send(new AttachUserPolicyCommand(params));
}
