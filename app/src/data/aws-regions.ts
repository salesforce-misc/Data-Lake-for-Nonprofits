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
    name: "us-east-2",
    label: "US East (Ohio)",
    default: false,
  },
  {
    name: "us-west-1",
    label: "US West (N. California)",
    default: false,
  },
  {
    name: "us-west-2",
    label: "US West (Oregon)",
    default: false,
  },
  {
    name: "ap-south-1",
    label: "Asia Pacific (Mumbai)",
    default: false,
  },
  {
    name: "ap-northeast-2",
    label: "Asia Pacific (Seoul)",
    default: false,
  },
  {
    name: "ap-southeast-1",
    label: "Asia Pacific (Singapore)",
    default: false,
  },
  {
    name: "ap-southeast-2",
    label: "Asia Pacific (Sydney)",
    default: false,
  },
  {
    name: "ap-northeast-1",
    label: "Asia Pacific (Tokyo)",
    default: false,
  },
  {
    name: "ca-central-1",
    label: "Canada (Central)",
    default: false,
  },
  {
    name: "eu-central-1",
    label: "Europe (Frankfurt)",
    default: false,
  },
  {
    name: "eu-west-1",
    label: "Europe (Ireland)",
    default: false,
  },
  {
    name: "eu-west-2",
    label: "Europe (London)",
    default: false,
  },
  {
    name: "eu-west-3",
    label: "Europe (Paris)",
    default: false,
  },
];

export const awsRegionsMap = keyBy(awsRegions, "name");
