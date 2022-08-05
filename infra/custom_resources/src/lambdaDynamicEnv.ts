import AWS from 'aws-sdk';
import { CloudFormationCustomResourceHandler, Context, CloudFormationCustomResourceEvent } from 'aws-lambda';
import cfn from 'cfn-response';
import { send } from './sendResponse';

export const handler: CloudFormationCustomResourceHandler = async function(event: CloudFormationCustomResourceEvent, context: Context): Promise<void> {
  var success: boolean = false;
  if (event.RequestType !== "Delete") {
    try {
      var valueFrom = event.ResourceProperties.CopyValueFrom;
      var keyName = event.ResourceProperties.SetKeyAs;
      var lambdaName = event.ResourceProperties.LambdaFunctionName;
      console.log("Going to write key:", keyName, "with value from existing env variable", valueFrom, "in lambda", lambdaName);

      const lambda = new AWS.Lambda();
      const lambdaConfig = await lambda.getFunctionConfiguration({ FunctionName: lambdaName }).promise();
      if (!lambdaConfig.Environment) {
        let message;
        if (lambdaConfig.$response.error) {
          message = lambdaConfig.$response.error.toString();
        } else {
          message = "No lambda information and no error received from API call."
        }
        throw new Error(message);
      }
      // For if no variables exist
      lambdaConfig.Environment.Variables = lambdaConfig.Environment.Variables || {};
      var value = lambdaConfig.Environment.Variables[valueFrom];
      console.log("Got lambda config info, will add Env Variable", keyName, "with value", value);
      await lambda.updateFunctionConfiguration({
        FunctionName: lambdaName,
        Environment: { 
          Variables: { 
            ...lambdaConfig.Environment.Variables,
            [keyName]: value,
          }
        },
      }).promise();
      console.log("Updating lambda env variables was successful! Reporting to cloudformation.");
      success = true;
    }  catch (e) {
      success = false;
      // Log exception and allow posting response to S3
      console.log("EXCEPTION:", e);
    }
  } else {
    // For delete, just return ok
    success = true;
  }
  // cnf.send does not seem to work in all conditions with an async handler
  await send(event, context, success ? cfn.SUCCESS : cfn.FAILED, { output: event.ResourceProperties.LambdaFunctionName }, event.ResourceProperties.LambdaFunctionName);
}
