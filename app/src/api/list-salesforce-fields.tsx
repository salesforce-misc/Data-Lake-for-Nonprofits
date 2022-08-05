import {
  AppflowClient,
  ConnectorType,
  DescribeConnectorEntityCommand,
  DescribeConnectorEntityCommandInput,
  ConnectorEntityField,
} from "@aws-sdk/client-appflow";
import _get from "lodash/get";

/**
 * Returns a list of all the fields for a Salesforce object
 */
export async function listSalesforceFields({
  accessKey,
  secretKey,
  region,
  connectionName,
  objectName,
}: {
  accessKey: string;
  secretKey: string;
  region: string;
  connectionName: string;
  objectName: string;
}): Promise<{ name: string; label: string; type: string }[]> {
  const appFlowClient = new AppflowClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const params: DescribeConnectorEntityCommandInput = {
    connectorType: ConnectorType.SALESFORCE,
    connectorProfileName: connectionName,
    connectorEntityName: objectName,
  };
  const data = await appFlowClient.send(new DescribeConnectorEntityCommand(params));
  const fields = data.connectorEntityFields ?? [];
  const extract = (field: ConnectorEntityField): { name: string; label: string; type: string } => {
    return {
      // see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-appflow/modules/connectorentityfield.html
      type: _get(field, "supportedFieldTypeDetails.v1.fieldType", ""), // TODO - what will happen if appflow changes from v1 to v2?
      name: field.identifier ?? "",
      label: field.label ?? "",
    };
  };

  return fields.map(extract);
}
