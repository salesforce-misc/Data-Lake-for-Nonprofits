import keyBy from "lodash/keyBy";

export const awsRegions: {name: string; label: string }[] = [
  {
    name: "us-east-1",
    label: "US East (Northern Virginia) Region",
  },
  {
    name: "us-west-2",
    label: "US West (Oregon) Region",
  },
  {
    name: "eu-west-1",
    label: "Europe (Ireland) Region"
  },

  // Keep at end, these regions are not preferred to above regions
  {
    name: "us-east-2",
    label: "US East (Ohio) Region",
  },
  {
    name: "us-west-1",
    label: "US West (Northern California) Region",
  },
  
];

export const awsRegionsMap = keyBy(awsRegions, "name");
