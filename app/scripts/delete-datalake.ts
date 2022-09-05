import { prompt } from "inquirer";
import { awsRegionsMap } from "../src/data/aws-regions";
import { getProfiles } from "./get-credentials";
import { cleanup, consolidateCleanup, CleanupItems } from "./lib/cleanup";
import { deleteStack } from "./lib/delete-stack";

interface IAnswers {
  region: string;
  profile: string;
  installationId: string;
}

export const prompts = async (): Promise<IAnswers> => {
  return await prompt([
    { type: "list", name: "region", message: "AWS Region", choices: Object.keys(awsRegionsMap).sort(), default: "us-east-1" },
    { type: "list", name: "profile", message: "AWS Profile", choices: await getProfiles() },
    { type: "input", name: "installationId", message: "Installation ID" },
  ]);
};

export const cli = async (answers: IAnswers) => {
  const { region, profile, installationId } = answers;

  let cleanupItems: CleanupItems = { lambdas: [], dbClusters: [] };

  cleanupItems = consolidateCleanup(cleanupItems, await deleteStack({ region, profile, stackName: `sforg-stepfn-${installationId}` }));
  cleanupItems = consolidateCleanup(cleanupItems, await deleteStack({ region, profile, stackName: `sforg-athena-${installationId}` }));
  cleanupItems = consolidateCleanup(cleanupItems, await deleteStack({ region, profile, stackName: `sforg-datastore-${installationId}` }));
  cleanupItems = consolidateCleanup(cleanupItems, await deleteStack({ region, profile, stackName: `sforg-vpc-${installationId}` }));
  cleanupItems = consolidateCleanup(cleanupItems, await deleteStack({ region, profile, stackName: `sforg-buckets-${installationId}` }));

  await cleanup({ region, profile, cleanupItems, installationId });
};

prompts().then((a) => cli(a));
