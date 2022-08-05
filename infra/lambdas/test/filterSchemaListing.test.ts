import { handler } from '../src/filterSchemaListing';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client } from '@aws-sdk/client-s3';
import { AppflowClient, ListConnectorEntitiesCommand } from '@aws-sdk/client-appflow';

describe('filterSchemaListing', () => {
  const s3Mock = mockClient(S3Client);
  const appflowMock = mockClient(AppflowClient);

  beforeEach(() => {
    s3Mock.reset();
    appflowMock.reset();

    appflowMock.on(ListConnectorEntitiesCommand).resolves({
      connectorEntityMap: {
        'Objects': [
          { name: 'test' }
        ]
      }
    }); 
  })

  test('handler', async () => {
    expect(
      await handler({ schemas: [{ Key: 'schemas/test.schema.json', ETag: 'ABC123', LastModified: new Date().toISOString(), Size: 47382, StorageClass: 'STANDARD' }] })
    ).resolves;
  });
});