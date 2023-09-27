export type TStepInfo = {
  title: string;
  desc: string;
};

export const steps: TStepInfo[] = [
  {
    title: "Connect to your AWS account",
    desc: `We need your AWS admin credentials so that we can connect to your AWS account and provision the resources for the data lake. We will
  guide you through the process of obtaining the needed credentials`,
  },
  {
    title: "Connect to your Amp Impact Salesforce organization",
    desc: `For AWS to access your Amp Impact Salesforce data, we will need your authorization. We will guide you through the steps of setting up Amazon AppFlow which
    is a service that allows AWS to connect to Salesforce, you will be creating a Salesforce connection, signing in to Salesforce and authorizing access`,
  },
  {
    title: "Select data import options",
    desc: `In this step, you can pick the standard Amp Impact import options for your Salesforce data or customize these options to fit your needs`,
  },
  {
    title: "Review and confirm",
    desc: `You get a chance to review and confirm the settings you have provided`,
  },
  {
    title: "Sit back and relax",
    desc: `In this step, we will do all the necessary provisioning and data importing. You can sit back and relax and watch the progress of the data import`,
  },
  {
    title: "Connect to Analytics",
    desc: "This is the final step, you can create users with credentials to access the data lake using Tableau",
  },
];
