import { handler } from '../src/processImport';
import { mockClient } from 'aws-sdk-client-mock';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { Database } from '../src/utils/db';
import { Readable } from 'stream';

jest.mock('../src/utils/db');

const OBJECT_KEY = 'data/Test-abcd1234/7e4b2397-c759-4197-b731-d73a31053849/886019228';

describe('processImport', () => {
  const s3Mock = mockClient(S3Client);
  const secretsMock = mockClient(SecretsManagerClient);

  beforeEach(() => {
    s3Mock.reset();
    secretsMock.reset();
    // @ts-ignore
    Database.mockClear();

    mockS3Object('s3.bucket.name', OBJECT_KEY, {});
    mockS3Object('metadatabucket', 'schemas/Test.abcd1234.schema.json', {
      properties: {
        id: { type: 'id', label: "Id" },
        other: { type: 'string', label: "Other" },
      }
    });
  });

  function mockS3Object(bucket: string, key: string, data: any) {
    s3Mock.on(GetObjectCommand, { Bucket: bucket, Key: key }).resolves({
      Body: Readable.from([new TextEncoder().encode(JSON.stringify(data))])
    });
  }

  test('handler', async () => {
    expect(
      await handler({ Records: [{
        messageId: "messageId",
        receiptHandle: "receiptHandle",
        body: JSON.stringify({ 
          Records: [
            { s3: { bucket: { name: 's3.bucket.name' }, object: { key: OBJECT_KEY, size: 100 } } }
          ] 
        }),
        attributes: { ApproximateReceiveCount: '0', SentTimestamp: '', SenderId: '', ApproximateFirstReceiveTimestamp: '' },
        messageAttributes: {},
        md5OfBody: "md5OfBody",
        eventSource: "eventSource",
        eventSourceARN: "eventSourceARN",
        awsRegion: "us-east-1",
      }] })
    ).resolves;
  });
});