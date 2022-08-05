import { handler } from '../src/setupSQL';
import { mockClient } from 'aws-sdk-client-mock';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { Database } from '../src/utils/db';
import { Readable } from 'stream';

jest.mock('../src/utils/db');

describe('setupSQL', () => {
  const s3Mock = mockClient(S3Client);
  const secretsMock = mockClient(SecretsManagerClient);

  beforeEach(() => {
    s3Mock.reset();
    secretsMock.reset();
    // @ts-ignore
    Database.mockClear();

    s3Mock.on(GetObjectCommand, { Bucket: "metadatabucket", Key: "schemas/test.schema.json" }).resolves({
      Body: Readable.from([new TextEncoder().encode(JSON.stringify({
        properties: {
          // One of every type
          id: { type: "id", $comment: "Comment on field id" },
          reference: { type: "reference", $comment: "Comment on field reference" },
          string: { type: "string", $comment: "Comment on field string" },
          picklist: { type: "picklist", $comment: "Comment on field picklist" },
          multipicklist: { type: "multipicklist", $comment: "Comment on field multipicklist" },
          textarea: { type: "textarea", $comment: "Comment on field textarea" },
          url: { type: "url", $comment: "Comment on field url" },
          encryptedstring: { type: "encryptedstring", $comment: "Comment on field encryptedstring" },
          boolean: { type: "boolean", $comment: "Comment on field boolean" },
          double: { type: "double", $comment: "Comment on field double" },
          phone: { type: "phone", $comment: "Comment on field phone" },
          currency: { type: "currency", $comment: "Comment on field currency" },
          int: { type: "int", $comment: "Comment on field int" },
          long: { type: "long", $comment: "Comment on field long" },
          datetime: { type: "datetime", $comment: "Comment on field datetime" },
          date: { type: "date", $comment: "Comment on field date" },
          time: { type: "time", $comment: "Comment on field time" },
          email: { type: "email", $comment: "Comment on field email" },
          percent: { type: "percent", $comment: "Comment on field percent" },
          combobox: { type: "combobox", $comment: "Comment on field combobox" },
          base64: { type: "base64", $comment: "Comment on field base64" },
        }
      }))])
    });
  })

  test('handler', async () => {
    expect(
      await handler({ Key: 'schemas/test.schema.json', ETag: 'ABC123', LastModified: new Date().toISOString(), Size: 47382, StorageClass: 'STANDARD' })
    ).resolves;
  });
});