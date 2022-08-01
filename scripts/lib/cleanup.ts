import { fromIni } from "@aws-sdk/credential-provider-ini";
import {
  CloudWatchLogsClient, 
  DeleteLogGroupCommand, 
  DeleteLogGroupCommandInput,
  DescribeLogGroupsCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-cloudwatch-logs";
import { CloudWatchClient, DeleteDashboardsCommand } from "@aws-sdk/client-cloudwatch";
import {
  AppflowClient, DeleteFlowCommand, ListFlowsCommand, ListFlowsCommandInput,
} from "@aws-sdk/client-appflow";
import { AthenaClient, DeleteWorkGroupCommand } from "@aws-sdk/client-athena";
import { listWorkgroups } from "./empty-workgroup";

export interface CleanupItems {
  lambdas: string[];
  dbClusters: string[];
}

export interface CleanupInput {
  profile: string;
  region: string;
  cleanupItems: CleanupItems;
  installationId: string;
}

export async function cleanup({ profile, region, cleanupItems, installationId }: CleanupInput): Promise<void> {
  const cloudwatchLogs = new CloudWatchLogsClient({
    region,
    credentials: fromIni({ profile }),
  });
  await cleanupLogGroups(cloudwatchLogs, cleanupItems, installationId);
  
  const cloudwatch = new CloudWatchClient({
    region,
    credentials: fromIni({ profile }),
  })
  await cloudwatch.send(new DeleteDashboardsCommand({ DashboardNames: [`SalesforceImport-${installationId}`] }));
  
  const appflow = new AppflowClient({
    region,
    credentials: fromIni({ profile }),
  });
  await cleanupAppflow(appflow, installationId);

  const athena = new AthenaClient({
    region,
    credentials: fromIni({ profile })
  });
  await cleanupAthena(athena, { profile, region }, installationId);
}

async function cleanupLogGroups(client: CloudWatchLogsClient, cleanupItems: CleanupItems, installationId: string) {
  for (const lambda of cleanupItems.lambdas) {
    const params: DeleteLogGroupCommandInput = {
      logGroupName: `/aws/lambda/${lambda}`
    };
    console.log('Deleting Log Group:', params.logGroupName);
    try {
      await client.send(new DeleteLogGroupCommand(params));
    } catch (error: unknown) {
      if (error instanceof ResourceNotFoundException) {
        console.warn("Skipping log group because it was not found:", params.logGroupName);
      } else {
        throw error;
      }
    }
  }
  for (const db of cleanupItems.dbClusters) {
    const params: DeleteLogGroupCommandInput = {
      logGroupName: `/aws/rds/cluster/${db}/postgresql`
    };
    console.log('Deleting Log Group:', params.logGroupName);
    try {
      await client.send(new DeleteLogGroupCommand(params));
    } catch (error: unknown) {
      if (error instanceof ResourceNotFoundException) {
        console.warn("Skipping log group because it was not found:", params.logGroupName);
      } else {
        throw error;
      }
    }
  }

  let token: string | undefined;
  let logGroups: string[] = [];
  do {
    const logGroupList = await client.send(new DescribeLogGroupsCommand({ logGroupNamePrefix: '/aws/', nextToken: token }));
    logGroups = logGroups.concat(logGroupList.logGroups?.map((l) => l.logGroupName).filter((n): n is string => !!n) || []);
    token = logGroupList.nextToken;
  } while(token);

  for (const logGroup of logGroups) {
    if (logGroup.includes(`-${installationId}`) || logGroup.includes(`_${installationId}`)) {
      console.log('Deleting Log Group:', logGroup);
      // Should always exist because it was just found from the above list call
      await client.send(new DeleteLogGroupCommand({ logGroupName: logGroup }));
    }
  }
}

async function cleanupAppflow(client: AppflowClient, installationId: string) {
  let token: string | undefined = undefined;
  let flows: string[] = [];
  do {
    const listFlows: ListFlowsCommandInput = { nextToken: token };
    const flowList = await client.send(new ListFlowsCommand(listFlows));
    if (flowList && flowList.flows) {
      flows = flows.concat(flowList.flows.map((f) => f.flowName).filter((n): n is string => !!n));
    }
    token = flowList.nextToken;
  } while(token);

  for (const name of flows) {
    if (!name.endsWith(`-${installationId}`)) {
      continue;
    }
    console.log('Deleting AppFlow:', name);
    // Should always exist because it was just found from the above list call
    await client.send(new DeleteFlowCommand({ flowName: name, forceDelete: true }));
  }
}

async function cleanupAthena(client: AthenaClient, creds: { profile: string, region: string }, installationId: string) {
  const workgroups = await listWorkgroups(creds);

  for (const workgroup of workgroups) {
    if (workgroup.includes(`-${installationId}`)) {
      // Should always exist because it was just found from the above list call
      await client.send(new DeleteWorkGroupCommand({ WorkGroup: workgroup, RecursiveDeleteOption: true }));
    }
  }
}

export function consolidateCleanup(cleanup: CleanupItems, otherCleanup: CleanupItems | void): CleanupItems {
  if (otherCleanup) {
    return {
      lambdas: cleanup.lambdas.concat(otherCleanup.lambdas),
      dbClusters: cleanup.dbClusters.concat(otherCleanup.dbClusters),
    };
  } else {
    return cleanup;
  }
}