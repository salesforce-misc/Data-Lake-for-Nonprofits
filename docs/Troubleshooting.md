# Troubleshooting

You can find some general execution errors and possible solutions here. Keep in mind that the error you get may not be limited to these common use cases.

## Lambda rate exceeded

    Service: AWS Lambda: Status Code: 429; Error Code: TooManyRequestsException)

- Possible Solution: Request quota increase for concurrent executions.

  You are most likely hitting the quota for concurrent executions. In this case, you can request a quota increase for concurrent executions using the following link. (The url varies based on your AWS Region)

  https://us-east-1.console.aws.amazon.com/servicequotas/home/services/lambda/quotas/L-B99A9384

- More Details for troubleshooting:

  https://aws.amazon.com/premiumsupport/knowledge-center/lambda-troubleshoot-throttling/

## VPC limit exceeded

Even though this is an edge case, if you run multiple deployments in the same region, you may hit the VPC limit of 5 per region. Given each AWS account has a default VPC, you can deploy a maximum of 4 data lakes in the same AWS Region. If you try to deploy the 5th data lake, you will hit the VPC limit and get an error.

## Salesforce connection limit

Salesforce has a limit of 5 for the refresh token per connected app. This results in AppFlow connectors to Salesforce needing to be refreshed/reconnected which may affect periodic data imports.

In most cases, this does not affect the connection since most NPOs are not expected to use more than 5 connectors. However, this limit could be exceeded in some edge cases. More details on this can be read here: https://developer.salesforce.com/forums/?id=9060G000000UUjlQAG
