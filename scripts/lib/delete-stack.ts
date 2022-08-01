import first from "lodash/first";
import find from "lodash/find";
import { fromIni } from "@aws-sdk/credential-provider-ini";
import {
  CloudFormationClient,
  DescribeStacksCommand,
  DescribeStacksCommandInput,
  Stack,
  ListStacksCommand,
  ListStacksCommandInput,
  StackStatus,
  StackResource,
  DescribeStackResourcesCommandInput,
  DescribeStackResourcesCommand,
  DeleteStackCommand,
  UpdateTerminationProtectionCommand,
} from "@aws-sdk/client-cloudformation";
import { ModifyDBClusterCommand, RDSClient } from "@aws-sdk/client-rds";
import { emptyBucket } from "./empty-bucket";
import { deleteWorkgroup } from "./empty-workgroup";
import { CleanupItems } from "./cleanup";

export interface StackInput {
  profile: string;
  stackName: string;
  region: string;
}

export interface StackSummary {
  id: string;
  name: string;
  statusReason: string;
  status: string;
}

const delay = (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

/**
 * Returns the stack resources
 */
async function describeStackResources({ profile, region, stackName }: StackInput): Promise<StackResource[]> {
  const cfnClient = new CloudFormationClient({
    region,
    credentials: fromIni({ profile }),
  });

  const params: DescribeStackResourcesCommandInput = {
    StackName: stackName,
  };

  const data = await cfnClient.send(new DescribeStackResourcesCommand(params));

  return data.StackResources ?? [];
}

/**
 * listStacks
 */
async function listStacks({ profile, region }: { profile: string; region: string }): Promise<StackSummary[]> {
  const cfnClient = new CloudFormationClient({
    region,
    credentials: fromIni({ profile }),
  });

  let params: ListStacksCommandInput = {};
  const result: StackSummary[] = [];

  do {
    const data = await cfnClient.send(new ListStacksCommand(params));
    params.NextToken = data.NextToken;
    for (const stack of data.StackSummaries ?? []) {
      result.push({
        id: stack.StackId as string,
        name: stack.StackName as string,
        status: stack.StackStatus as string,
        statusReason: stack.StackStatusReason as string,
      });
    }
  } while (params.NextToken);

  return result;
}

/**
 * Returns the stack information
 */
async function describeStack({ profile, stackName, region }: StackInput): Promise<Stack | undefined> {
  const cfnClient = new CloudFormationClient({
    region,
    credentials: fromIni({ profile }),
  });

  const params: DescribeStacksCommandInput = {
    StackName: stackName,
  };

  const data = await cfnClient.send(new DescribeStacksCommand(params));
  return first(data.Stacks);
}

/**
 * DANGER - this function will delete stack and all its buckets, exercise caution when using this function
 * Delete a stack, but it will first empty all buckets created by this stack before deleting the stack.
 */
export async function deleteStack({ profile, stackName, region }: StackInput): Promise<CleanupItems | void> {
  // First we check if the stack is there
  const stacks = await listStacks({ profile, region });
  const stack = find(stacks, ["name", stackName]);
  if (!stack) {
    console.log(`stack ${stackName} not found`);
    return;
  }

  if (stack.status === StackStatus.DELETE_COMPLETE) {
    console.log(`stack ${stackName} is already deleted`);
    return;
  }

  // Then we describe the stack resources to see if we have any buckets
  const resources = await describeStackResources({ profile, region, stackName });
  const buckets: string[] = [];
  const workgroups: string[] = [];
  const lambdas: string[] = [];
  const dbClusters: string[] = [];
  for (const resource of resources) {
    if (resource.PhysicalResourceId) {
      switch (resource.ResourceType) {
        case "AWS::S3::Bucket":
          // special case for the sf-logging bucket, it needs to be dealt with last
          if (resource.PhysicalResourceId.includes("sf-logging-")) {
            buckets.push(resource.PhysicalResourceId);
          } else {
            buckets.unshift(resource.PhysicalResourceId);
          }    
          break;

        case "AWS::Athena::WorkGroup":
          workgroups.push(resource.PhysicalResourceId);
          break;

        case "AWS::Lambda::Function":
          lambdas.push(resource.PhysicalResourceId);
          break;

        case "AWS::RDS::DBCluster":
          dbClusters.push(resource.PhysicalResourceId);
          break;

        default:
          break;
      }
    }
  }

  console.log(`stack ${stackName} is found`);
  if (buckets.length > 0) {
    console.log(`found ${buckets.length} buckets`);
  } else {
    console.log("No buckets are found, skipping the bucket emptying task");
  }

  if (buckets.length > 0) {
    await delay(5);
    // Empty all buckets
    await Promise.all(buckets.map((name) => emptyBucket({ profile, region, bucketName: name })));
    // Allow all events to arrive to logging bucket
    await delay(15);

    let loggingBucketIndex = buckets.findIndex((b) => b.includes('sf-logging-'));
    if (loggingBucketIndex >= 0) {
      await emptyBucket({ profile, region, bucketName: buckets[loggingBucketIndex] })
    }
  }

  if (workgroups.length > 0) {
    await delay(5);
    // Force delete workgroup because cloudformation fails since it is very difficult to "empty" a workgroup and it will most likely not be empty
    await Promise.all(workgroups.map((workgroup) => deleteWorkgroup({ profile, region, workgroup })));
    await delay(5);
  }

  if (dbClusters.length > 0) {
    const rdsClient = new RDSClient({ region, credentials: fromIni({ profile })});
    for (const dbCluster of dbClusters) {
      await rdsClient.send(new ModifyDBClusterCommand({ DBClusterIdentifier: dbCluster, DeletionProtection: false, ApplyImmediately: true }));
    }
  }

  // Trigger the deletion of the stack
  const cfnClient = new CloudFormationClient({
    region,
    credentials: fromIni({ profile }),
  });

  await cfnClient.send(new UpdateTerminationProtectionCommand({ EnableTerminationProtection: false, StackName: stackName }));

  console.log(`trigger deletion of ${stackName}`);
  await cfnClient.send(new DeleteStackCommand({ StackName: stackName }));

  // Wait for the status to change
  let status: string | undefined;
  let count = 0;
  do {
    const stackInfo = await describeStack({ profile, stackName: stack.id, region });
    status = stackInfo?.StackStatus;
    await delay(10);
    count++;
    if (count >= 3) count = 0;
    process.stdout.moveCursor(0, -1); // up one line
    process.stdout.clearLine(1); // from cursor to end
    console.log(status, stackInfo?.StackStatusReason || '.'.repeat(count + 1));
  } while (
    status !== StackStatus.DELETE_FAILED && 
    status !== StackStatus.DELETE_COMPLETE && 
    status !== StackStatus.UPDATE_COMPLETE && 
    status !== StackStatus.UPDATE_ROLLBACK_COMPLETE &&
    status !== StackStatus.UPDATE_ROLLBACK_FAILED &&
    status !== StackStatus.UPDATE_FAILED
  );

  if (status !== StackStatus.DELETE_COMPLETE) {
    throw new Error(`Deletion of stack ${stackName} failed`);
  }

  console.log(`stack ${stackName} was deleted successfully`);

  return {
    lambdas: lambdas,
    dbClusters: dbClusters,
  };
}
