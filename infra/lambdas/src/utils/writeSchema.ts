import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Schema } from './schema';
import { METADATA_BUCKET } from "./readSchema";

const client = new S3Client({ region: process.env.AWS_REGION });

let metadataBucketKey = process.env.METADATA_BUCKET_KEY;
if (metadataBucketKey === undefined && metadataBucketKey !== '') {
  throw new Error("Must set METADATA_BUCKET_KEY environment variable!");
}
export const METADATA_BUCKET_KEY = metadataBucketKey;

export async function writeSchema(s3Key: string, schema: Schema): Promise<void> {
  console.log("Write", s3Key, "schema for", schema.name, "installation:", schema.installationId, "with properties (fields) count:", Object.keys(schema.properties).length, "and excluded properties count:", schema.exclude.size);
  let unsafeJson: any = schema as any;
  const command: PutObjectCommand = new PutObjectCommand({ 
    Bucket: METADATA_BUCKET, 
    Key: s3Key, 
    Body: JSON.stringify(unsafeJson),
    SSEKMSKeyId: METADATA_BUCKET_KEY,
    ServerSideEncryption: 'aws:kms'
  });
  // Don't handle error, let bubble up to sfn and retry
  await client.send(command);
}

export async function removeSchema(s3Key: string): Promise<void> {
  console.log('Remove schema on S3', s3Key);
  const command = new DeleteObjectCommand({ Bucket: METADATA_BUCKET, Key: s3Key });

  await client.send(command);
}