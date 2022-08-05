import { 
  AppflowClient, 
  ConnectorType, 
  DescribeConnectorEntityCommand, 
  DescribeConnectorEntityCommandOutput,
  DescribeFlowCommand,
  DescribeFlowCommandOutput,
  DescribeFlowExecutionRecordsCommand,
  DescribeFlowExecutionRecordsCommandOutput,
  ListConnectorEntitiesCommand,
  ListConnectorEntitiesCommandOutput,
} from "@aws-sdk/client-appflow";
import { Schema, flowName } from "./schema";

let connectionName = process.env.CONNECTION_NAME;
if (connectionName === undefined && connectionName !== '') {
  throw new Error("Must set CONNECTION_NAME environment variable!");
}
export const CONNECTION_NAME = connectionName;

const client = new AppflowClient({ region: process.env.AWS_REGION });

export async function describeEntity(schema: Schema): Promise<DescribeConnectorEntityCommandOutput> {
  const command = new DescribeConnectorEntityCommand({
    connectorEntityName: schema.name,
    connectorType: ConnectorType.SALESFORCE,
    connectorProfileName: CONNECTION_NAME
  });
  // Don't handle error, let bubble up to sfn and retry
  return await client.send(command);
}

export async function describeFlow(schema: Schema): Promise<DescribeFlowCommandOutput> {
  const command = new DescribeFlowCommand({ flowName: flowName(schema) });

  return await client.send(command);
}

export async function describeFlowExecutionRecords(schemaName: string, installationId: string): Promise<DescribeFlowExecutionRecordsCommandOutput> {
  const command = new DescribeFlowExecutionRecordsCommand({ flowName: flowName(schemaName, installationId), maxResults: 1 });
  console.log('Sending describe flow execution records command', command);
  return await client.send(command);
}

export async function listEntities(): Promise<ListConnectorEntitiesCommandOutput> {
  const command = new ListConnectorEntitiesCommand({ connectorProfileName: CONNECTION_NAME, connectorType: ConnectorType.SALESFORCE });
  console.log('Sending list entities command', command);
  return await client.send(command);
}