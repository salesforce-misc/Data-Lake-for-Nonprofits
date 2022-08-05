import { prompt } from "inquirer";
import { deleteStack } from "./lib/delete-stack";
import { awsRegionsMap } from '../src/data/aws-regions';


async function cli() {
  const answers = await prompt([
    { type: "list", name: "region", message: "AWS Region", choices: Object.keys(awsRegionsMap).sort(), default: "us-east-1"},
    { type: "input", name: "profile", message: "AWS Profile", default: "sforg" },
    { type: "input", name: "stackName", message: "Stack Name"}
  ]);

  await deleteStack({ ...answers });
}

cli();