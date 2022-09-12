import { Instance } from "mobx-state-tree";

import { putDashboard } from "api/put-dashboard";

import { Operation } from "./Operation";
import { OperationContext } from "./utils";

export const PutDashboard = Operation.named("PutDashboard")
  .props({
    type: "PutDashboard",
  })

  .views((self) => ({
    get notStartedMessage(): string {
      return `Create Dashboard. This might take a few seconds.`;
    },

    get inProgressMessage(): string {
      return `Creating Dashboard. This might take a few seconds.`;
    },

    get successMessage(): string {
      return `Successfully created the dashboard`;
    },

    get failureMessage(): string {
      return `Could not create the dashboard`;
    },
  }))

  .actions((self) => ({
    async doRun(context: OperationContext): Promise<void> {
      const installationId = context.id;
      const accessKey = context.credentials.accessKey;
      const secretKey = context.credentials.secretKey;
      const region = context.region;

      try {
        await putDashboard({
          accessKey,
          secretKey,
          region,
          name: `SalesforceImport-${installationId}`,
          dashboardJson: createDashboardJson(
            context.region,
            context.importWorkflowArn,
            context.clusterName,
            context.athenaPrimaryWorkGroup,
            context.athenaDataBucketName,
            context.importDataBucketName,
            context.importAlarmArns
          ),
        });
      } catch (error) {
        self.runInAction(() => {
          // This is in markdown
          self._errorDetail = `We attempted to create the dashboard by calling CloudWatch Put Dashboard API.
          However, we got the following error:
### ${error}
          `;
        });
        throw error;
      }
    },
  }));

export interface IPutDashboard extends Instance<typeof PutDashboard> {}

function createDashboardJson(
  region: string,
  workflowArn: string,
  clusterName: string,
  workGroup: string,
  athenaDataBucketName: string,
  importDataBucketName: string,
  importAlarmArns: string[]
) {
  return JSON.stringify({
    start: "-PT336H",
    widgets: [
      {
        height: 7,
        width: 8,
        y: 4,
        x: 16,
        type: "metric",
        properties: {
          metrics: [["Salesforce", "RecordsProcessed"]],
          view: "timeSeries",
          region: region,
          period: 86400,
          stat: "Sum",
          stacked: false,
          title: "Number of Records Imported",
          yAxis: {
            left: {
              min: 0,
              label: "Count",
            },
          },
        },
      },
      {
        height: 7,
        width: 12,
        y: 33,
        x: 0,
        type: "metric",
        properties: {
          metrics: [
            [
              {
                expression: "METRICS()/60",
                label: "RDS Uptime",
                id: "e1",
              },
            ],
            [
              "AWS/RDS",
              "EngineUptime",
              "DBClusterIdentifier",
              clusterName,
              {
                yAxis: "left",
                id: "m1",
                visible: false,
                label: "in Minutes",
              },
            ],
          ],
          view: "timeSeries",
          stacked: false,
          region: region,
          period: 86400,
          stat: "Average",
          title: "RDS Uptime",
        },
      },
      {
        height: 7,
        width: 8,
        y: 4,
        x: 0,
        type: "metric",
        properties: {
          metrics: [
            [
              "AWS/States",
              "ExecutionsSucceeded",
              "StateMachineArn",
              workflowArn,
              {
                label: "Import Success",
                color: "#2ca02c",
                id: "m1",
              },
            ],
            [
              {
                expression: "failed + aborted + timeout + throttled",
                label: "Import Failed",
                id: "e1",
                color: "#d62728",
              },
            ],
            [
              "AWS/States",
              "ExecutionsFailed",
              "StateMachineArn",
              workflowArn,
              {
                visible: false,
                id: "failed",
              },
            ],
            [
              ".",
              "ExecutionsAborted",
              ".",
              ".",
              {
                visible: false,
                id: "aborted",
              },
            ],
            [
              ".",
              "ExecutionsTimedOut",
              ".",
              ".",
              {
                visible: false,
                id: "timeout",
              },
            ],
            [
              ".",
              "ExecutionThrottled",
              ".",
              ".",
              {
                visible: false,
                id: "throttled",
              },
            ],
          ],
          view: "timeSeries",
          stacked: false,
          region: region,
          title: "Import Status",
          period: 86400,
          stat: "Maximum",
          yAxis: {
            left: {
              min: 0,
              showUnits: true,
              max: 1,
            },
          },
        },
      },
      {
        height: 4,
        width: 24,
        y: 0,
        x: 0,
        type: "text",
        properties: {
          markdown:
            '# Imports\nBelow are all metrics regarding regularly scheduled re-imports of the Salesforce data into RDS. Lack of any data points in any of the below graphs indicate that no import took place during that time.\n\nAn "Import Success" metric at value 1.0 indicates that the system completed importing the data whereas "Import Failure" metric at value 1.0 indicates that the system failed to import the data.\n\nTime to import shows the amount of real time spent from the start of the import until the end of the import is completed. It is important that the import does not continue when the next import will begin. For this reason the system will shut down the import when it takes too long. If the metric shows a trend towards this direction, help may be needed.\n\nNumber of records imported is the sum of the total record count in the system which was imported during the last import. This number growing will have an impact on the time it takes to complete an import.',
        },
      },
      {
        height: 7,
        width: 8,
        y: 4,
        x: 8,
        type: "metric",
        properties: {
          metrics: [
            [
              {
                expression: "METRICS()/60000",
                label: "Import Time",
                id: "e1",
              },
            ],
            [
              "AWS/States",
              "ExecutionTime",
              "StateMachineArn",
              workflowArn,
              {
                id: "m1",
                visible: false,
                label: "in Minutes",
              },
            ],
          ],
          view: "timeSeries",
          stacked: false,
          region: region,
          title: "Time to Perform Import",
          period: 86400,
          stat: "Average",
          yAxis: {
            left: {
              min: 0,
              showUnits: false,
            },
          },
        },
      },
      {
        height: 7,
        width: 8,
        y: 22,
        x: 8,
        type: "metric",
        properties: {
          metrics: [
            [
              {
                expression: "METRICS()/1000000000",
                label: "Athena Data Processing",
                id: "e1",
              },
            ],
            [
              "AWS/Athena",
              "ProcessedBytes",
              "WorkGroup",
              workGroup,
              {
                id: "m1",
                visible: false,
                label: "in GB",
              },
            ],
          ],
          view: "timeSeries",
          stacked: false,
          region: region,
          stat: "Sum",
          period: 86400,
          title: "Athena Data Processing in GB",
        },
      },
      {
        height: 7,
        width: 8,
        y: 11,
        x: 16,
        type: "alarm",
        properties: {
          title: "Import Status Alarms",
          alarms: importAlarmArns,
        },
      },
      {
        height: 4,
        width: 24,
        y: 18,
        x: 0,
        type: "text",
        properties: {
          markdown:
            "# Querying\nThese metrics appear or not based upon ad-hoc usage of the system. When a user is using Tableau to interface with Athena, metrics will be recorded here. Otherwise, when no one is using the system to run queries, no data will be shown on these graphs.",
        },
      },
      {
        height: 7,
        width: 12,
        y: 33,
        x: 12,
        type: "metric",
        properties: {
          metrics: [
            [
              {
                expression: "METRICS()/1000000000",
                label: "Storage in GB",
                id: "e1",
              },
            ],
            [
              "AWS/RDS",
              "TotalBackupStorageBilled",
              "DBClusterIdentifier",
              clusterName,
              {
                id: "m1",
                visible: false,
                label: "for Backup Storage",
              },
            ],
            [
              ".",
              "VolumeBytesUsed",
              ".",
              ".",
              {
                id: "m2",
                visible: false,
                label: "Used",
              },
            ],
          ],
          view: "timeSeries",
          stacked: false,
          region: region,
          period: 300,
          stat: "Maximum",
          title: "RDS Storage",
          yAxis: {
            left: {
              label: "GB",
              min: 0,
            },
          },
        },
      },
      {
        height: 7,
        width: 8,
        y: 22,
        x: 0,
        type: "metric",
        properties: {
          metrics: [
            [
              {
                expression: "METRICS()/1000",
                label: "Query TIme",
                id: "e1",
              },
            ],
            [
              "AWS/Athena",
              "TotalExecutionTime",
              "WorkGroup",
              workGroup,
              "QueryState",
              "SUCCEEDED",
              "QueryType",
              "DML",
              {
                id: "m1",
                visible: false,
                label: "Maximum",
              },
            ],
            [
              "...",
              {
                id: "m2",
                visible: false,
                stat: "p90",
                label: "90th percentile",
              },
            ],
            [
              "...",
              {
                id: "m3",
                visible: false,
                stat: "p75",
                label: "75th percentile",
              },
            ],
            [
              "...",
              {
                id: "m4",
                visible: false,
                stat: "p50",
                label: "50th percentile",
              },
            ],
          ],
          view: "timeSeries",
          stacked: false,
          region: region,
          stat: "Maximum",
          period: 86400,
          title: "Athena Query Time",
          yAxis: {
            left: {
              label: "Seconds",
              min: 0,
            },
          },
        },
      },
      {
        height: 7,
        width: 8,
        y: 22,
        x: 16,
        type: "metric",
        properties: {
          metrics: [
            [
              {
                expression: "METRICS()/1000000",
                label: "Athena Output Bucket Size",
                id: "e1",
              },
            ],
            [
              "AWS/S3",
              "BucketSizeBytes",
              "StorageType",
              "StandardStorage",
              "BucketName",
              athenaDataBucketName,
              {
                id: "m1",
                visible: false,
                label: "in MB",
              },
            ],
          ],
          view: "timeSeries",
          stacked: false,
          region: region,
          stat: "Sum",
          period: 86400,
          title: "Athena Output Bucket Size",
          yAxis: {
            left: {
              label: "MB",
              min: 0,
            },
          },
        },
      },
      {
        height: 7,
        width: 8,
        y: 11,
        x: 8,
        type: "metric",
        properties: {
          metrics: [
            [
              {
                expression: "METRICS()/1000000",
                label: "AppFlow Output Bucket Size",
                id: "e1",
                region: region,
              },
            ],
            [
              "AWS/S3",
              "BucketSizeBytes",
              "StorageType",
              "StandardStorage",
              "BucketName",
              importDataBucketName,
              {
                id: "m2",
                label: "in MB",
                visible: false,
              },
            ],
          ],
          view: "timeSeries",
          stacked: false,
          region: region,
          stat: "Sum",
          period: 86400,
          title: "AppFlow Output Bucket Size",
          yAxis: {
            left: {
              label: "MB",
              min: 0,
            },
          },
        },
      },
      {
        height: 7,
        width: 8,
        y: 11,
        x: 0,
        type: "text",
        properties: {
          markdown:
            "AppFlow will use S3 for temporary storage while the data is waiting to be ingested into RDS. This storage is setup to automatically expire the next day so should clean itself up automatically and not incur a lot of storage charges.",
        },
      },
      {
        height: 4,
        width: 24,
        y: 29,
        x: 0,
        type: "text",
        properties: {
          markdown:
            "# RDS\n\nAurora Serverless is configured to be able to shut itself down when not in use. This saves money on hardware when not in use (i.e. nights, weekends, holidays, etc.). Additionally, the system is setup with an aggressive shutdown timer so that more savings can be reaped. Repeated queries to the system, via Athena or directly to RDS by other means, will keep RDS up and running and will end up costing more.\n\nBelow shows the total average uptime for the day. This uptime will directly correlate with cost.\n\nAlso, total storage is broken down into two parts. Backup storage is the amount of storage being used to keep a backup of the data within the database. Used is the amount of data RDS is currently using, whether its on or off.",
        },
      },
    ],
  });
}
