import { prompt } from "inquirer";
import { awsRegionsMap } from "../src/data/aws-regions";
import { cleanup, consolidateCleanup, CleanupItems } from "./lib/cleanup";
import { deleteStack } from "./lib/delete-stack";


async function cli() {
  const answers = await prompt([
    { type: "list", name: "region", message: "AWS Region", choices: Object.keys(awsRegionsMap).sort(), default: "us-east-1"},
    { type: "input", name: "profile", message: "AWS Profile", default: "sforg" },
    { type: "input", name: "installationId", message: "Installation ID"}
  ]);

  const { region, profile, installationId } = answers;

  let cleanupItems: CleanupItems = { lambdas: [], dbClusters: [] };

  cleanupItems = consolidateCleanup(cleanupItems, await deleteStack({ region, profile, stackName: `sforg-stepfn-${installationId}` }));
  cleanupItems = consolidateCleanup(cleanupItems, await deleteStack({ region, profile, stackName: `sforg-athena-${installationId}` }));
  cleanupItems = consolidateCleanup(cleanupItems, await deleteStack({ region, profile, stackName: `sforg-datastore-${installationId}` }));
  cleanupItems = consolidateCleanup(cleanupItems, await deleteStack({ region, profile, stackName: `sforg-vpc-${installationId}` }));
  cleanupItems = consolidateCleanup(cleanupItems, await deleteStack({ region, profile, stackName: `sforg-buckets-${installationId}` }));

  await cleanup({ region, profile, cleanupItems, installationId });
}

cli();