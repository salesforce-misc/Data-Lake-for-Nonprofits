import keyBy from "lodash/keyBy";

interface IAWSRegion {
  name: string;
  label: string;
  default?: boolean;
}

export const awsRegions: IAWSRegion[] = [
  {
    name: "us-east-1",
    label: "US East (N. Virginia)",
    default: true,
  },
  {
    name: "us-west-2",
    label: "US West (Oregon)",
    default: false,
  },
  {
    name: "eu-west-1",
    label: "Europe (Ireland)",
    default: false,
  },
  {
    name: "us-east-2",
    label: "US East (Ohio)",
    default: false,
  },
  {
    name: "us-west-1",
    label: "US West (N. California)",
    default: false,
  },
];

export const awsRegionsMap = keyBy(awsRegions, "name");
