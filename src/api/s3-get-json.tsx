import { S3Client, GetObjectCommand, GetObjectCommandInput } from "@aws-sdk/client-s3";

import { CredentialsInput } from "./validate-credentials";

export interface S3GetJsonInput extends CredentialsInput {
  bucketName: string;
  objectKey: string;
}

async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  let done: boolean = false;
  const decoder = new TextDecoder();
  let string = "";
  do {
    const result = await reader.read();
    done = result.done;
    if (result.value) {
      string += decoder.decode(result.value, { stream: true });
    }
  } while (!done);

  return string;
}

/**
 * Reads a json file from S3
 */
export async function s3GetJson({ accessKey, secretKey, region, bucketName, objectKey }: S3GetJsonInput): Promise<unknown> {
  const cfnClient = new S3Client({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const params: GetObjectCommandInput = {
    Bucket: bucketName,
    Key: objectKey,
    ResponseContentType: "application/json",
  };

  const data = await cfnClient.send(new GetObjectCommand(params));
  if (!data.Body) return {};

  try {
    const jsonStr = await streamToString(data.Body as ReadableStream);
    return JSON.parse(jsonStr);
  } catch (error) {
    throw new Error(`Couldn't get or parse the json file at "${objectKey}". Error ${error}`);
  }
}
