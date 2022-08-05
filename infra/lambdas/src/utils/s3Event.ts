import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { inspect } from 'util';
import eventstream from 'event-stream';

/*
    Test event looks like:
    {
        "Service":"Amazon S3",
        "Event":"s3:TestEvent",
        "Time":"2022-03-24T20:21:44.840Z",
        "Bucket":"sf-import-matwidma",
        "RequestId":"9F6Y0V3VK45RPG39",
        "HostId":"1gMdSdJWCr5He/v7gG8UdZgNERp04wrMf/YM8wFu5UzKdJxbuIMwexqU+fmQzHL4NfObH0ag8LY="
    }
*/
export interface S3TestEvent {
    Service: "Amazon S3";
    Event: "s3:TestEvent";
    Time: string;
    Bucket: string;
    RequestId: string;
    HostId: string;
}
/*
    S3 Notification Event looks like:
    {
        "Records":[
            {
                "eventVersion":"2.1",
                "eventSource":"aws:s3",
                "awsRegion":"us-east-1",
                "eventTime":"2022-03-24T20:24:11.371Z",
                "eventName":"ObjectCreated:Put",
                "userIdentity": {"principalId":"AWS:AROAZZXQ22XDSH2VN32LK:7dda3d6a75fc4d87b4c259f06a946675"},
                "requestParameters": {"sourceIPAddress":"10.0.182.45"},
                "responseElements": {"x-amz-request-id":"C8WYGQ29R18PDQFX","x-amz-id-2":"gnER/F/UgGqpTRAVjfc/kCLsvWZB8rp29CSAcByMH+dTGCamC1fRKmb1CtJ4T/U6T+FyYmDQiH8i3NbP36AuOaDIYzt510is"},
                "s3": {
                    "s3SchemaVersion":"1.0",
                    "configurationId":"d4e7ca17-35f6-4b11-b4cd-8b0ecd1b181b",
                    "bucket": {
                        "name":"sf-import-matwidma",
                        "ownerIdentity": {"principalId":"A3AREUJNL3M69W"},
                        "arn":"arn:aws:s3:::sf-import-matwidma"
                    },
                    "object": {
                        "key":"data/Account-matwidma/2085a88b-4e95-4cb1-aaea-16435f915dea/826799777-2022-03-24T20%3A23%3A52",
                        "size":3959468,
                        "eTag":"35387e1f02394a9ab0a23320f31746ff",
                        "versionId":"cWxod4EaGMlyhn8jcKCBb7H757rr37EL",
                        "sequencer":"00623CD36B36D578C3"
                    }
                }
            }
        ]
    }
*/
const client = new S3Client({ region: process.env.AWS_REGION });

export async function getFile(bucket: string, key: string) {
    const getObject = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await client.send(getObject);
    if (response) {
        let body = response.Body;
        if (body !== undefined) {
            const stream = body as Readable;
            return await streamRecords(stream);
        }
    }
    throw new Error(`Unexpected response from S3 fetching ${bucket}/${key}, got no Error but received no Body in GetObject call: ${inspect(response, false, null)}`);
}

async function streamRecords(stream: Readable): Promise<object[]> {
    return new Promise((resolve, reject) => {
        const records: object[] = [];
        stream.pipe(eventstream.split("\n")).pipe(eventstream.mapSync((data: unknown) => {
            // Last record can come across as undefined or empty string, and the data string must be at least {}
            if (data && typeof data === 'string' && data.length > 2) {
                const record: unknown = JSON.parse(data);
                if (typeof record === 'object' && record instanceof Object) {
                    records.push(record);
                    return;
                }
            }

            // If it was empty string don't both logging it out
            if (data !== '') {
                console.log("Ignoring data, typeof:", typeof data, "inspect:", inspect(data, false, null));
            }
        }))
        .on('error', reject)
        .on('end', () => {
            resolve(records);
        });
    });
}

export async function streamToString(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
};