import { handler } from '../src/pullNewSchema';
import { mockClient } from 'aws-sdk-client-mock';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { AppflowClient, DescribeConnectorEntityCommand } from '@aws-sdk/client-appflow';
import { Readable } from 'stream';

describe('pullNewSchema', () => {
  const s3Mock = mockClient(S3Client);
  const appflowMock = mockClient(AppflowClient);

  beforeEach(() => {
    s3Mock.reset();
    appflowMock.reset();

    s3Mock.on(GetObjectCommand, { Bucket: "metadatabucket", Key: "schemas/test.schema.json" }).resolves({
      Body: Readable.from([new TextEncoder().encode(JSON.stringify({}))])
    });
    appflowMock.on(DescribeConnectorEntityCommand).resolves({
      connectorEntityFields: [
        { identifier: 'fieldName', supportedFieldTypeDetails: { v1: { filterOperators: [], fieldType: 'string' } } }
      ]
    }); 
  })

  test('handler', async () => {
    expect(
      await handler({ Key: 'schemas/test.schema.json', ETag: 'ABC123', LastModified: new Date().toISOString(), Size: 47382, StorageClass: 'STANDARD' })
    ).resolves;
  });
});