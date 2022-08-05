import chunkIt from "lodash/chunk";
import { fromIni } from "@aws-sdk/credential-provider-ini";
import {
  S3Client,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  ListObjectVersionsCommand,
  ListObjectVersionsCommandInput,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { delay } from "lodash";

export interface BucketInput {
  profile: string;
  bucketName: string;
  region: string;
}

interface BucketObjectInput extends BucketInput {
  key: string;
  versionId: string;
}

interface ObjectVersion {
  key: string;
  versionId: string;
}

async function deleteObject({ profile, bucketName, region, key, versionId }: BucketObjectInput, attempt: number = 0): Promise<void> {
  const client = new S3Client({
    region,
    credentials: fromIni({ profile }),
  });

  const params: DeleteObjectCommandInput = {
    Bucket: bucketName,
    Key: key,
    VersionId: versionId,
  };

  try {
    await client.send(new DeleteObjectCommand(params));
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('ENOTFOUND')) {
      console.log('DNS issue communicating with S3', error);
      if (attempt >= 3) {
        throw error;
      }
      await delay(async () => {
        await deleteObject({ profile, bucketName, region, key, versionId }, attempt + 1);
      }, 5000);
    }
  }
}

/**
 * listObjectVersions
 */
async function listObjectVersions({ profile, bucketName, region }: BucketInput): Promise<ObjectVersion[]> {
  const client = new S3Client({
    region,
    credentials: fromIni({ profile }),
  });

  let params: ListObjectVersionsCommandInput = {
    Bucket: bucketName,
    MaxKeys: 1000,
  };

  let result: ObjectVersion[] = [];

  do {
    const data = await client.send(new ListObjectVersionsCommand(params));
    params.KeyMarker = data.NextKeyMarker;
    params.VersionIdMarker = data.NextVersionIdMarker;
    let versions = data.Versions ?? [];
    for (const version of versions) {
      result.push({
        key: version.Key as string,
        versionId: version.VersionId as string,
      });
    }
    
    versions = data.DeleteMarkers ?? [];
    for (const version of versions) {
      result.push({
        key: version.Key as string,
        versionId: version.VersionId as string,
      });
    }
  } while (params.KeyMarker || params.VersionIdMarker);

  return result;
}

/**
 * DANGER - this function will delete everything in the bucket, exercise caution when using this function
 */
export async function emptyBucket({ profile, bucketName, region }: BucketInput): Promise<void> {
  let versions;
  try {
    versions = await listObjectVersions({ profile, bucketName, region });
  } catch (error) {
    if (error instanceof S3ServiceException) {
      if (error.name === "NoSuchBucket")  {
        console.log(`bucket ${bucketName} not found, skipping`);
        return
      }
    }
    throw error;
  }

  console.log(`Emptying bucket ${bucketName}`)
  console.log("----------------------------");
  console.log(`Deleting ${versions.length} object versions`);
  
  const worker = async({ key, versionId }: ObjectVersion) => {
    console.log(`Deleting ${key} ${versionId === 'null'? '': versionId}`);
    return deleteObject({ profile, region, bucketName, key, versionId });
  };
  
  
  const chunks = chunkIt(versions, 20); // chunks them 20 at a time
  while (chunks.length > 0) {
    const chunk = chunks.shift() ?? [];
    await Promise.all(chunk.map((version) => worker(version)));
  }

  console.log("----------------------------");
}
