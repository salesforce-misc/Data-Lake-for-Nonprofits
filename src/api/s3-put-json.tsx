import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";

import { CredentialsInput } from "./validate-credentials";

export interface S3PutJsonInput extends CredentialsInput {
  bucketName: string;
  objectKey: string;
  jsonContent: string;
  kmsKeyId: string;
}

/**
 * Uploads a json file to S3
 */
export async function s3PutJson({ accessKey, secretKey, region, bucketName, objectKey, jsonContent, kmsKeyId }: S3PutJsonInput): Promise<void> {
  const cfnClient = new S3Client({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const params: PutObjectCommandInput = {
    Bucket: bucketName,
    Key: objectKey,
    Body: jsonContent,
    ContentType: "application/json",
    ServerSideEncryption: "aws:kms",
    SSEKMSKeyId: kmsKeyId,

  };

  await cfnClient.send(new PutObjectCommand(params));
}
