import { S3Client, ListObjectsV2Command, ListObjectsV2CommandInput } from "@aws-sdk/client-s3";

import { CredentialsInput } from "./validate-credentials";

export interface S3ListObjectsInput extends CredentialsInput {
  bucketName: string;
  prefix?: string;
}

export interface S3Object {
  key: string;
  etag: string;
}

/**
 * List objects in s3
 */
export async function s3ListObjects({ accessKey, secretKey, region, bucketName, prefix }: S3ListObjectsInput): Promise<S3Object[]> {
  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let params: ListObjectsV2CommandInput = {
    Bucket: bucketName,
    MaxKeys: 1000,
    Prefix: prefix,
  };

  let result: S3Object[] = [];

  do {
    const data = await client.send(new ListObjectsV2Command(params));
    params.ContinuationToken = data.NextContinuationToken;
    for (const object of data.Contents ?? []) {
      if (object.Key && object.ETag) {
        result.push({
          key: object.Key,
          etag: object.ETag,
        });
      }
    }
  } while (params.ContinuationToken);

  return result;
}
