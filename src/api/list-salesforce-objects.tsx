import { AppflowClient, ConnectorType, ListConnectorEntitiesCommand, ListConnectorEntitiesCommandInput } from "@aws-sdk/client-appflow";
import _get from "lodash/get";

export interface IRawSalesforceObject {
  name: string;
  label: string;
}

/**
 * Returns a list of all objects in Salesforce
 */
export async function listSalesforceObjects({
  accessKey,
  secretKey,
  region,
  connectionName,
}: {
  accessKey: string;
  secretKey: string;
  region: string;
  connectionName: string;
}): Promise<IRawSalesforceObject[]> {
  const appFlowClient = new AppflowClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const params: ListConnectorEntitiesCommandInput = { connectorType: ConnectorType.SALESFORCE, connectorProfileName: connectionName };
  const data = await appFlowClient.send(new ListConnectorEntitiesCommand(params));
  const objects = _get(data, "connectorEntityMap.Objects", []);

  return objects.map((obj: { name: string; label: string }) => ({ name: obj.name, label: obj.label }));
}
