import { DescribeFlowCommandOutput, ResourceNotFoundException } from "@aws-sdk/client-appflow";
import { flowName, S3ListingEvent, Schema } from './utils/schema';
import { processSchema } from './utils/readSchema';
import { describeFlow } from './utils/readAppFlow';
import { createFlow, updateFlow } from './utils/writeAppFlow';

export const handler = async function(event: S3ListingEvent): Promise<S3ListingEvent> {
  console.log(event);

  return processSchema(event, handle);
}

async function handle(schema: Schema) {
  let flow: DescribeFlowCommandOutput;
  try {
    flow = await describeFlow(schema);
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      console.log('Flow ', flowName(schema), 'not found, creating...');
      await createFlow(schema);

      // No need to perform update since it was just created
      return;
    } else {
      throw error;
    }
  }

  console.log('Flow', flowName(schema), 'found:', JSON.stringify(flow));
  
  if (flow.flowName && flow.triggerConfig && flow.sourceFlowConfig && flow.destinationFlowConfigList) {
    console.log("Updating flow", flow.flowName, "with field count:", Object.keys(schema.properties).length, "and excluded field count:", schema.exclude.size);
    await updateFlow(schema, flow);
  } else {
    throw new Error(`Unable to update flow because some required parts are missing when describing the flow: ${JSON.stringify(flow)}`);
  }
}
