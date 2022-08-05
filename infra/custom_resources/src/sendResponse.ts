import { Context, CloudFormationCustomResourceEvent } from 'aws-lambda';
import cfn from 'cfn-response';
import https from 'https';
import url from 'url';

// Copy of cfn.send function but converted to returning a promise instead in order to still function since
// other api calls above need to use promises.
export async function send(event: CloudFormationCustomResourceEvent, context: Context, responseStatus: cfn.ResponseStatus, responseData: any, physicalResourceId: string, noEcho: boolean = false) {
  return new Promise((resolve, reject) => {
    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
        PhysicalResourceId: physicalResourceId || context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        NoEcho: noEcho || false,
        Data: responseData
    });

    console.log("Response body:\n", responseBody);

    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
            "content-type": "",
            "content-length": responseBody.length
        }
    };

    var request = https.request(options, function(response) {
        console.log("Status code: " + response.statusCode);
        console.log("Status message: " + response.statusMessage);
        resolve(JSON.parse(responseBody));
        context.done();
    });

    request.on("error", function(error) {
        console.log("send(..) failed executing https.request(..): " + error);
        reject(error);
        context.done();
    });

    request.write(responseBody);
    request.end();
  });
}