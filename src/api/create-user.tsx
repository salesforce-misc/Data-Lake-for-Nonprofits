import { IAMClient, CreateUserCommand, CreateUserCommandInput, User } from "@aws-sdk/client-iam";

import { CredentialsInput } from "./validate-credentials";

export interface CreateUserInput extends CredentialsInput {
  pathPrefix: string;
  userName: string;
}

/**
 * Creates an IAM user.
 */
export async function createUser({ accessKey, secretKey, region, pathPrefix, userName }: CreateUserInput): Promise<User> {
  const client = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const params: CreateUserCommandInput = {
    Path: pathPrefix,
    UserName: userName,
  };

  const data = await client.send(new CreateUserCommand(params));
  if (!data.User) {
    throw new Error(`No user was returned from calling AWS IAM API (createUser)`);
  }

  return data.User;
}
