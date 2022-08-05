import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({ region: process.env.AWS_REGION });

let metadataBucket = process.env.METADATA_BUCKET;
if (metadataBucket === undefined && metadataBucket !== '') {
  throw new Error("Must set METADATA_BUCKET environment variable!");
}
export const METADATA_BUCKET = metadataBucket;
let metadataBucketKey = process.env.METADATA_BUCKET_KEY;
if (metadataBucketKey === undefined && metadataBucketKey !== '') {
  throw new Error("Must set METADATA_BUCKET_KEY environment variable!");
}
export const METADATA_BUCKET_KEY = metadataBucketKey;

export enum Status {
    PREPARING = 'PREPARING',
    IN_PROGRESS = 'IN_PROGRESS',
    IMPORTING = 'IMPORTING',
    SUCCESSFUL = 'SUCCESSFUL',
}

export interface ImportMetadata {
    rowCount: number;
    columnCount: number;
    importSeconds: number;
    bytesWritten: number;
}

export interface StatusReport {
    status: Status;
    metadata?: ImportMetadata;
}

export async function writeStatus(schemaName: string, executionId: string, status: StatusReport): Promise<void> {
    const s3Key = `state/runs/${executionId}/${schemaName}.status.json`;
    console.log("Write", s3Key, "for schema", schemaName);
    const command: PutObjectCommand = new PutObjectCommand({ 
        Bucket: METADATA_BUCKET, 
        Key: s3Key, 
        Body: JSON.stringify(status),
        SSEKMSKeyId: METADATA_BUCKET_KEY,
        ServerSideEncryption: 'aws:kms'
    });
    // Don't handle error, let bubble up to sfn and retry
    await client.send(command);
}
