import { handler } from '../src/updateFlowSchema';
import { mockClient } from 'aws-sdk-client-mock';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { AppflowClient, DescribeFlowCommand, ResourceNotFoundException } from '@aws-sdk/client-appflow';
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
  })

  test('handler - Create', async () => {
    appflowMock.on(DescribeFlowCommand).callsFake(() => {
      throw new ResourceNotFoundException({$metadata: {}});
    });

    expect(
      await handler({ Key: 'schemas/test.schema.json', ETag: 'ABC123', LastModified: new Date().toISOString(), Size: 47382, StorageClass: 'STANDARD' })
    ).resolves;
  });

  test('handler - Update', async () => {
    appflowMock.on(DescribeFlowCommand).resolves({
      flowName: 'Test-abc123',
      triggerConfig: { triggerType: 'OnDemand' },
      sourceFlowConfig: {
        connectorType: 'Salesforce',
        connectorProfileName: 'connectionname',
        sourceConnectorProperties: {
          Salesforce: {
            object: 'test',
            enableDynamicFieldUpdate: false,
            includeDeletedRecords: false,
          }
        }
      },
      destinationFlowConfigList: [
        {
          connectorType: 'S3',
          destinationConnectorProperties: {
            S3: {
              bucketName: 'importbucket',
              bucketPrefix: 'data',
              s3OutputFormatConfig: {
                fileType: 'JSON',
                prefixConfig: {},
                aggregationConfig: { aggregationType: 'None' }
              }
            }
          }
        }
      ],
      tasks: [
        {
          taskType: 'Filter',
          sourceFields: [],
          taskProperties: {},
          connectorOperator: { Salesforce: 'PROJECTION' }
        }
      ]
    })

    expect(
      await handler({ Key: 'schemas/test.schema.json', ETag: 'ABC123', LastModified: new Date().toISOString(), Size: 47382, StorageClass: 'STANDARD' })
    ).resolves;
  });
});