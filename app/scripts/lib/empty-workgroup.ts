import { fromIni } from "@aws-sdk/credential-provider-ini";
import {
  AthenaClient, 
  DeleteWorkGroupCommand,
  DeleteWorkGroupCommandInput,
  ListWorkGroupsCommand,
  ListWorkGroupsCommandInput,
} from "@aws-sdk/client-athena";

export interface WorkgroupInput {
  profile: string;
  region: string;
  workgroup: string;
}

export async function deleteWorkgroup({ profile, region, workgroup }: WorkgroupInput): Promise<void> {
  const client = new AthenaClient({
      region,
      credentials: fromIni({ profile }),
  });

  const params: DeleteWorkGroupCommandInput = {
      WorkGroup: workgroup,
      RecursiveDeleteOption: true
  };

  await client.send(new DeleteWorkGroupCommand(params));
}

export interface ListWorkgroupInput {
  profile: string;
  region: string;
}

export async function listWorkgroups({ profile, region }: ListWorkgroupInput): Promise<string[]> {
  const client = new AthenaClient({
    region,
    credentials: fromIni({ profile })
  });

  const params: ListWorkGroupsCommandInput = {};

  let token: string | undefined;
  let workgroups: string[] = [];
  do {
    const response = await client.send(new ListWorkGroupsCommand(params));
    workgroups = workgroups.concat(response.WorkGroups?.map((w) => w.Name).filter((n): n is string => !!n) || []);
    token = response.NextToken;
  } while (token);

  return workgroups;
}