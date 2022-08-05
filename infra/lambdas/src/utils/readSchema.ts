import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { inspect } from 'util';
import { Readable } from "stream";
import { Schema, S3ListingEvent, extractSchemaName, PartialS3EventListing } from './schema';
import { streamToString } from './s3Event';

const client = new S3Client({ region: process.env.AWS_REGION });
let metadataBucket = process.env.METADATA_BUCKET;
if (metadataBucket === undefined && metadataBucket !== '') {
  throw new Error("Must set METADATA_BUCKET environment variable!");
}
export const METADATA_BUCKET = metadataBucket;

const schemaCache: { [x in string]: Schema } = {};

export async function processSchema<T extends void>(event: S3ListingEvent, func: (schema: Schema, s3Key: string) => Promise<T>): Promise<S3ListingEvent>
export async function processSchema<T>(event: PartialS3EventListing, func: (schema: Schema, s3Key: string) => Promise<T extends void ? never : T>): Promise<T extends void ? never : T>
export async function processSchema<T>(event: PartialS3EventListing, func: (schema: Schema, s3Key: string) => Promise<T>): Promise<T | S3ListingEvent | PartialS3EventListing> {
  let result: T;

  const [schemaName, installationId] = extractSchemaName(event);
  
  if (schemaCache[schemaName]) {
    const schema = schemaCache[schemaName];
    console.log("Pulled cached schema", schemaName, "for", installationId);
    result = await func(schema, event.Key);
  } else { 
    console.log("Pulling schema", schemaName, "for", installationId);

    let schema: Schema;
    try {
      const command: GetObjectCommand = new GetObjectCommand({ Bucket: METADATA_BUCKET, Key: event.Key });
      console.log("Getting object:", command);
      // Don't handle error, let bubble up to sfn and retry
      const response = await client.send(command);

      if (response && response.Body) {
        const body = response.Body;
        const schemaJson: unknown = JSON.parse((await streamToString(body as Readable)).toString());
        schema = toSchema(schemaJson, schemaName, installationId);

        schemaCache[schemaName] = schema;
      } else {
        throw new Error(`Unexpected response from S3 fetching ${METADATA_BUCKET}/${event.Key}, got no Error but received no Body in GetObject call: ${inspect(response, false, null)}`);
      }
    } catch (error: unknown) {
      console.error("Error fetching schema:", error);
      throw error;
    }
    result = await func(schema, event.Key);
  }

  if (result) {
    return result;
  } else {
    return event;
  }
}

function toSchema(json: unknown, schemaName: string, installationId: string): Schema {
  if (json && typeof json == 'object') {
    const unsafeJson: any = json as any;
    console.log("Converting unknown JSON into Schema object", json);
    return {
      name: unsafeJson.name || schemaName,
      installationId: unsafeJson.installationId || installationId,
      type: 'object',
      label: unsafeJson.label,
      exclude: unsafeJson.exclude || {},
      properties: unsafeJson.properties || {},
    }
  } else {
    throw new Error(`Unable to properly parse schema file because JSON received doesn't match expected format: ${json}`);
  }
}
