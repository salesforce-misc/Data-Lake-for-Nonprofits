import { 
  AppflowClient, 
  ConnectorType, 
  Task,
  DescribeFlowCommandOutput,
  CreateFlowCommand,
  TriggerType,
  AggregationType,
  FileType,
  UpdateFlowCommand,
  UpdateFlowCommandOutput,
} from "@aws-sdk/client-appflow";
import { inspect } from 'util';
import { Schema } from "./schema";
import { CONNECTION_NAME } from './readAppFlow';

let importBucket = process.env.IMPORT_BUCKET;
if (importBucket === undefined && importBucket !== '') {
  throw new Error("Must set IMPORT_BUCKET environment variable!");
}
export const IMPORT_BUCKET = importBucket;
let kmsKeyArn = process.env.APPFLOW_KMS_KEY_ARN;
if (kmsKeyArn === undefined && kmsKeyArn !== '') {
  throw new Error("Must set APPFLOW_KMS_KEY_ARN environment variable!");
}
export const APPFLOW_KMS_KEY_ARN = kmsKeyArn;

const DATA_IMPORT_LOCATION = 'data'; // data/<SalesforceObjectName>/...
const client = new AppflowClient({ region: process.env.AWS_REGION });

export async function createFlow(schema: Schema) {
  const flowName = `${schema.name}-${schema.installationId}`;
  console.log("Creating flow because it does not already exist, name:", flowName, "in bucket", IMPORT_BUCKET, "at", DATA_IMPORT_LOCATION);
  const create = new CreateFlowCommand({ 
    flowName: flowName,
    kmsArn: APPFLOW_KMS_KEY_ARN,
    triggerConfig: {
      triggerType: TriggerType.ONDEMAND,
    },
    sourceFlowConfig: {
      connectorType: ConnectorType.SALESFORCE,
      connectorProfileName: CONNECTION_NAME,
      sourceConnectorProperties: {
        Salesforce: {
          object: schema.name,
          enableDynamicFieldUpdate: false,
          includeDeletedRecords: false,
        }
      },
    },
    destinationFlowConfigList: [
      {
        connectorType: ConnectorType.S3,
        destinationConnectorProperties: {
          S3: {
            bucketName: IMPORT_BUCKET,
            bucketPrefix: DATA_IMPORT_LOCATION,
            s3OutputFormatConfig: {
              fileType: FileType.JSON,
              prefixConfig: {},
              aggregationConfig: {
                aggregationType: AggregationType.NONE
              }
            }
          }
        }
      }
    ],
    tasks: generateTasks(schema),
  });
  console.log("Sending create flow command:", inspect(create, false, null));
  return await client.send(create);
}

export async function updateFlow(schema: Schema, flow: DescribeFlowCommandOutput): Promise<UpdateFlowCommandOutput> {
  const update = new UpdateFlowCommand({ 
    flowName: flow.flowName,
    // Cannot use flow.triggerConfig here because it contains flow.triggerConfig.triggerProperties == {} when read
    // from the API using describe, but the update call cannot have this property
    triggerConfig: {
      triggerType: TriggerType.ONDEMAND,
      triggerProperties: undefined,
    },
    sourceFlowConfig: flow.sourceFlowConfig,
    destinationFlowConfigList: flow.destinationFlowConfigList,
    tasks: generateTasks(schema),
  });

  return await client.send(update);
}

function generateTasks(schema: Schema): Task[] {
  const tasks: Task[] = [
    { 
      taskType: 'Filter',
      sourceFields: Object.keys(schema.properties),
      taskProperties: {}, 
      connectorOperator: { Salesforce: "PROJECTION" }
    },
  ];
  for (const name in schema.properties) {
    const field = schema.properties[name];
    tasks.push({
      taskType: 'Map',
      sourceFields: [name],
      taskProperties: {
        SOURCE_DATA_TYPE: field.type,
        DESTINATION_DATA_TYPE: field.type,
      },
      destinationField: name,
      connectorOperator: { Salesforce: "NO_OP" },
    });
  }

  return tasks;
}
