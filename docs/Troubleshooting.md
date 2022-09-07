# Troubleshooting

You can find some general execution errors and possible solutions here. Keep in mind that the error you get may not be limited to these common use cases.

## Lambda rate exceeded.

    Service: AWS Lambda: Status Code: 429; Error Code: TooManyRequestsException)

Possible Solution:
https://aws.amazon.com/premiumsupport/knowledge-center/lambda-troubleshoot-throttling/

## Salesforce Connection Limit

Salesforce has a limit of 5 for the refresh token per connected app. This results in AppFlow connectors to Salesforce needing to be refreshed/reconnected which may affect periodic data imports.

In most cases, this does not affect the connection since most NPOs are not expected to use more than 5 connectors. However, this limit could be exceeded in some edge cases. More details on this can be read here: https://developer.salesforce.com/forums/?id=9060G000000UUjlQAG
