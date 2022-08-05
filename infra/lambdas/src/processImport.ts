import { S3Event, S3EventRecord, SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { inspect } from 'util';
import { processRecords } from './utils/insertDb';
import { processSchema } from './utils/readSchema';
import { S3TestEvent, getFile } from './utils/s3Event';
import { Schema } from './utils/schema';

let maxMemorySize = process.env.MAX_MEMORY_SIZE;
if (maxMemorySize === undefined && maxMemorySize !== '') {
  throw new Error("Must set MAX_MEMORY_SIZE environment variable!");
}
export const MAX_MEMORY_SIZE_MB = parseInt(maxMemorySize, 10);
const MEMORY_BASE_SIZE_MB = 100; // A simple no-op nodejs lambda would use this much memory, so subtract it from max memory
const ONE_MB = 1000 * 1000;

// An S3TestEvent is sent when setting up the queue, so it needs to be ignored
export const handler = async function(event: S3TestEvent | SQSEvent): Promise<SQSBatchResponse> {
    console.log('Invoke parameters:', event);
    
    const batchResponse: SQSBatchResponse = { batchItemFailures: [] };

    if ('Records' in event) {
        const sqsEvent = event as SQSEvent;

        console.log("Processing number of files:", sqsEvent.Records.length);
        for (const sqsRecord of sqsEvent.Records) {
            let unsafeRecord: unknown = JSON.parse(sqsRecord.body);
            if (unsafeRecord && 'Event' in (unsafeRecord as any) && (unsafeRecord as any).Event === 's3:TestEvent') {
                console.log("Skipping test event");
            } else if (unsafeRecord && 'Records' in (unsafeRecord as any)) { // only keys accessed are the `s3` key, so if true this makes it safe
                const s3Event: S3Event = unsafeRecord as S3Event;
                const record: S3EventRecord = s3Event.Records[0]; // There is only ever one
                try {
                    console.log("Processing file", `s3://${record.s3.bucket.name}/${record.s3.object.key}`);
                    if (record.s3.object.size / ONE_MB > MAX_MEMORY_SIZE_MB - MEMORY_BASE_SIZE_MB) {
                        throw new Error(`Received message which is larger than available memory, please increase memory size of the lambda (ProcessImportLambdaMemory parameter) to allow for processing. File: ${record.s3.object.key} is size ${record.s3.object.size} bytes`);
                    }

                    const [schemaName, installationId] = getSchemaNameFromKey(record.s3.object.key);

                    // Ignore return value, pull (cached) schema
                    await processSchema({ Key: `schemas/${schemaName}.${installationId}.schema.json` }, async (schema: Schema, _s3Key: string) => {
                        // Files named such as "1683758219-2022-03-28T19%3A38%3A35" need to be decoded into '1683758219-2022-03-28T19:38:35'.
                        const s3Key = decodeURIComponent(record.s3.object.key);
                        let records: object[] = await getFile(record.s3.bucket.name, s3Key);
                        console.log("File downloaded for processing:", s3Key);
                        await processRecords(schema, records);
                        // This line is used in a metric filter so changes to it should make changes to the metric filter as well
                        console.log("Processed number of records:", records.length);
                        return records;
                    });
                } catch (error: unknown) {
                    console.log("Got error processing file:", sqsRecord.body);
                    console.error(error);
                    batchResponse.batchItemFailures.push({ itemIdentifier: sqsRecord.messageId });
                }
            } else {
                batchResponse.batchItemFailures.push({ itemIdentifier: sqsRecord.messageId });
            }
        }
    } else {
        throw  new Error(`Unable to handle non-SQS drivent event: ${inspect(event, false, null)}`);
    }

    return batchResponse;
}

function getSchemaNameFromKey(key: string): [string, string] {
    // data/Account-abcd1234/7e4b2397-c759-4197-b731-d73a31053849/886019228-2022-03-28T20%3A41%3A07
    const schemaParts = key.replace(/^data\//i, '').replace(/\/.*/i, '').split('-');

    if (schemaParts.length == 2) {
        return [schemaParts[0], schemaParts[1]];
    } else {
        throw new Error(`Unable to properly extract schema name from ingest data key: ${key}`);
    }
}
