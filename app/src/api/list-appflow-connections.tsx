import { AppflowClient, ConnectorType, DescribeConnectorProfilesCommand, DescribeConnectorProfilesCommandInput } from "@aws-sdk/client-appflow";

/**
 * Returns a list of all the connection names for the Salesforce connector.
 */
export async function listAppflowConnections({
  accessKey,
  secretKey,
  region,
}: {
  accessKey: string;
  secretKey: string;
  region: string;
}): Promise<string[]> {
  const appFlowClient = new AppflowClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let params: DescribeConnectorProfilesCommandInput = { connectorType: ConnectorType.SALESFORCE, maxResults: 100 };
  const names: string[] = [];

  do {
    const data = await appFlowClient.send(new DescribeConnectorProfilesCommand(params));
    params.nextToken = data.nextToken;
    names.push(...((data.connectorProfileDetails ?? []).map((connector) => connector.connectorProfileName as string)));
  } while (params.nextToken);

  return names;
}
