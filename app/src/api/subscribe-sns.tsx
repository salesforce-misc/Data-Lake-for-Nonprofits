import { SNSClient, SubscribeCommand } from "@aws-sdk/client-sns";

import { CredentialsInput } from "./validate-credentials";

export interface SubscribeSNSInput extends CredentialsInput {
  email: string;
  topicArn: string;
}

/**
 * Subscribe to system notifications
 */
export async function subscribeSNS({
  accessKey,
  secretKey,
  region,
  email,
  topicArn,
}: SubscribeSNSInput): Promise<void> {
  const snsClient = new SNSClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    }
  })

  await snsClient.send(new SubscribeCommand({ TopicArn: topicArn, Protocol: 'email', Endpoint: email }));
}
