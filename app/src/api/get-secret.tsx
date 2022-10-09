import {
  SecretsManagerClient,
  GetSecretValueCommand,
  GetSecretValueCommandInput,
  GetSecretValueCommandOutput,
} from "@aws-sdk/client-secrets-manager";

import { CredentialsInput } from "./validate-credentials";

export interface GetSecretValueInput extends CredentialsInput {
  secretArn: string;
}

export interface Configuration {
  host: string;
  username: string;
  password: string;
}

/**
 * Get secret value from Secrets Manager
 */
export async function getSecretValue({ accessKey, secretKey, region, secretArn }: GetSecretValueInput): Promise<Configuration> {
  const client = new SecretsManagerClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const params: GetSecretValueCommandInput = {
    SecretId: secretArn,
  };

  let secret: string | undefined;

  const response: GetSecretValueCommandOutput = await client.send(new GetSecretValueCommand(params));

  if (response.SecretString) {
    secret = response.SecretString;
  } else {
    throw new Error("Unable to get secret string!");
  }

  const unsafeJson: any = JSON.parse(secret);

  return {
    host: unsafeJson.host,
    username: unsafeJson.username,
    password: unsafeJson.password,
  };
}
