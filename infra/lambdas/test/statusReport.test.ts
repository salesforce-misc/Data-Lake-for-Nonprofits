import { handler, ImportStage } from '../src/statusReport';
import { mockClient } from 'aws-sdk-client-mock';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { Database } from '../src/utils/db';

jest.mock('../src/utils/db');

describe('statusReport', () => {
  const s3Mock = mockClient(S3Client);
  const secretsMock = mockClient(SecretsManagerClient);

  beforeEach(() => {
    s3Mock.reset();
    secretsMock.reset();
    // @ts-ignore
    Database.mockClear();

    s3Mock.on(GetObjectCommand, { Bucket: "metadatabucket", Key: "schemas/test.schema.json" }).resolves({
      Body: Readable.from([new TextEncoder().encode(JSON.stringify({}))])
    });
    secretsMock.on(GetSecretValueCommand).resolves({
      SecretString: JSON.stringify({ host: 'host', username: 'username', password: 'password' })
    })
  })

  test('handler - PREPARE', async () => {
    expect(
      await handler({
        s3: { Key: 'schemas/test.schema.json', ETag: 'ABC123', LastModified: new Date().toISOString(), Size: 47382, StorageClass: 'STANDARD' },
        flowName: 'Test-abc123',
        executionId: '1234-5678',
        importStage: ImportStage.PREPARE,
      })
    ).resolves;
  });

  test('handler - BEGIN', async () => {
    expect(
      await handler({
        s3: { Key: 'schemas/test.schema.json', ETag: 'ABC123', LastModified: new Date().toISOString(), Size: 47382, StorageClass: 'STANDARD' },
        flowName: 'Test-abc123',
        executionId: '1234-5678',
        importStage: ImportStage.BEGIN,
      })
    ).resolves;
  });

  test('handler - IMPORT', async () => {
    expect(
      await handler({
        s3: { Key: 'schemas/test.schema.json', ETag: 'ABC123', LastModified: new Date().toISOString(), Size: 47382, StorageClass: 'STANDARD' },
        flowName: 'Test-abc123',
        executionId: '1234-5678',
        importStage: ImportStage.IMPORT,
      })
    ).resolves;
  });
  
  test('handler - CLEANUP', async () => {
    expect(
      await handler({
        s3: { Key: 'schemas/test.schema.json', ETag: 'ABC123', LastModified: new Date().toISOString(), Size: 47382, StorageClass: 'STANDARD' },
        flowName: 'Test-abc123',
        executionId: '1234-5678',
        importStage: ImportStage.CLEANUP,
      })
    ).resolves;
  });
});