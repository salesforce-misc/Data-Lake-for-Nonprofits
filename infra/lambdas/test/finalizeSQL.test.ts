import { handler } from '../src/finalizeSQL';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client } from '@aws-sdk/client-s3';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { Database } from '../src/utils/db';

jest.mock('../src/utils/db');

describe('finalizeSQL', () => {
  const s3Mock = mockClient(S3Client);
  const secretsMock = mockClient(SecretsManagerClient);

  beforeEach(() => {
    s3Mock.reset();
    secretsMock.reset();
    // @ts-ignore
    Database.mockClear();
  })

  test('handler', async () => {
    expect(
      await handler({ objects: { 'test': true } })
    ).resolves;
  });
});