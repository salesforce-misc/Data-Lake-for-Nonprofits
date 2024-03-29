export const yaml = `---
# Datastore buckets for storing assets, data change history, logging and other metadata the system needs to run.
###                  WARNING                       ###
###    This file cannot grow beyond 51 KB or the   ###
###  system will fail to create the infrastructure ###
AWSTemplateFormatVersion: "2010-09-09"
Description: "Salesforce Datastore Buckets"
Metadata:
  "AWS::CloudFormation::Interface":
    ParameterGroups:
      - Label:
          default: "** REQUIRED FIELDS **"
        Parameters:
          - InstallationId
          - WebURLOrigin
          - AssetWebsiteURL
Parameters:
  # HistoryAllowOverrideDelete:
  #   Description: "Specifies within a given time frame if data should have a minimum retention and if an override can update/delete files. If so, data will be protected but still allowed to be deleted (Enabled) via a special permission. Disallowing override delete states data cannot be deleted at all within the timeframe (Disabled). Otherwise, no additional rules can be applied and just normal (delete/update) permissions can be used (None). 'None' disables any minimum retention and ignores HistoryMinimumRetention. See S3 Object Lock Governance/Compliance modes for more information: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock-overview.html"
  #   Type: String
  #   AllowedValues: ["Enabled", "Disabled", "None"]
  #   Default: "Enabled"
  # HistoryMinimumRetention:
  #   Description: "The number of days (or years depending upon HistoryMinimumRetentionType) in which elevated permissions are required to overwrite or delete data. For example, with a value of 90 days, to delete data prior to 90 days would require the permission s3:BypassGovernanceRetention with HistoryAllowOverrideDelete turned on. After 90 days regular update/delete permissions would succeed without this permission."
  #   Type: Number
  #   MinValue: 1
  #   MaxValue: 365
  #   Default: 90
  # HistoryMinimumRetentionType:
  #   Description: "See HistoryMinimumRetention for details. This identifies that number value as either a number of days or a number of years."
  #   Type: String
  #   AllowedValues: ["Days", "Years"]
  #   Default: "Days"
  IntelligentTierGlacierDays:
    Description: "The number of days after which the system will move change history data to Glacier. Glacier access will be slower and more costly to access so this should be far enough back that it is an unusual or occasional event. Set -1 to disable."
    Type: Number
    MinValue: -1
    Default: 365
  IntelligentTierDeepGlacierDays:
    Description: "The number of days after which the system will move data to Deep Archive Glacier. Deep Archive Glacier access will take potentially hours to revive and is more costly to access than regular Glacier so this should be set much greater than Glacier. Set -1 to disable."
    Type: Number
    MinValue: -1
    Default: 730
  WebURLOrigin:
    Description: "The URL Origin of the Web UI which CORS can be accessed from."
    Type: String
  AssetWebsiteURL:
    Description: "The URL for the website that contains the deployment assets. Should be the same as WebURLOrigin for production, but might be different during development."
    Type: String
  InstallationId:
    Description: "The unique name for this system such that it will not conflict globally with any other installation of this system. Must only contain alphanumeric characters (no special punctuation such as _ , _ . & ! + = etc.)"
    Type: String
    AllowedPattern: "[a-z0-9]{8,}"
Conditions:
  # IsHistoryRetentionDays: !Equals [!Ref HistoryMinimumRetentionType, "Days"]
  # IsHistoryRetentionYears: !Equals [!Ref HistoryMinimumRetentionType, "Years"]
  # IsHistoryAllowOverrideDelete:
  #   !Equals [!Ref HistoryAllowOverrideDelete, "Enabled"]
  # IsHistoryObjectLockEnabled:
  #   !Not [!Equals [!Ref HistoryAllowOverrideDelete, "None"]]
  IsIntelligentTierGlacierEnabled:
    !Not [!Equals [!Ref IntelligentTierGlacierDays, -1]]
  IsIntelligentTierDeepGlacierEnabled: !And
    - !Condition IsIntelligentTierGlacierEnabled
    - !Not [!Equals [!Ref IntelligentTierDeepGlacierDays, -1]]
Resources:
  # HistoryDataBucketKey:
  #   Type: "AWS::KMS::Key"
  #   DeletionPolicy: Delete
  #   Properties:
  #     Enabled: true
  #     EnableKeyRotation: true
  #     Description: "Key used for encrypting the History data bucket"
  #     KeyPolicy:
  #       Version: "2012-10-17"
  #       Id: key-s3
  #       Statement:
  #         - Sid: Enable IAM User Permissions
  #           Effect: Allow
  #           Principal:
  #             AWS: !Join
  #               - ""
  #               - - "arn:aws:iam::"
  #                 - !Ref "AWS::AccountId"
  #                 - ":root"
  #           Action: "kms:*"
  #           Resource: "*"
  # HistoryDataBucketKeyAlias:
  #   Type: "AWS::KMS::Alias"
  #   Properties:
  #     AliasName: !Join
  #       - ""
  #       - - "alias/"
  #         - !Join
  #           - "-"
  #           - - Fn::ImportValue: !Sub "\${ParentVPCStack}-SalesforceName"
  #             - "history"
  #             - Fn::ImportValue: !Sub "\${ParentVPCStack}-StageName"
  #     TargetKeyId: !Ref HistoryDataBucketKey
  # HistoryDataBucket:
  #   Type: "AWS::S3::Bucket"
  #   DeletionPolicy: Delete # When torn down needs to remove everything completely and leave no charges billed
  #   Properties:
  #     BucketName: !Join
  #       - "-"
  #       - - Fn::ImportValue: !Sub "\${ParentVPCStack}-SalesforceName"
  #         - "history"
  #         - Fn::ImportValue: !Sub "\${ParentVPCStack}-StageName"
  #     BucketEncryption:
  #       ServerSideEncryptionConfiguration:
  #         - ServerSideEncryptionByDefault:
  #             SSEAlgorithm: "aws:kms"
  #             KMSMasterKeyID: !Ref HistoryDataBucketKey
  #     VersioningConfiguration:
  #       Status: Enabled
  #     AccessControl: Private
  #     LoggingConfiguration:
  #       DestinationBucketName: !Ref LoggingBucket
  #       LogFilePrefix: !Join
  #         - ""
  #         - - !Join
  #             - "-"
  #             - - Fn::ImportValue: !Sub "\${ParentVPCStack}-SalesforceName"
  #               - "history"
  #               - Fn::ImportValue: !Sub "\${ParentVPCStack}-StageName"
  #           - "/"
  #     IntelligentTieringConfigurations:
  #       - Id: IntelligentTierAccess
  #         Prefix: "history"
  #         Status: Enabled
  #         Tierings: !If
  #           - IsIntelligentTierDeepGlacierEnabled # Deep Glacier enabled means Glacier is also enabled
  #           - - AccessTier: ARCHIVE_ACCESS
  #               Days: !Ref IntelligentTierGlacierDays
  #             - AccessTier: DEEP_ARCHIVE_ACCESS
  #               Days: !Ref IntelligentTierDeepGlacierDays
  #           - !If
  #             - IsIntelligentTierGlacierEnabled
  #             - - AccessTier: ARCHIVE_ACCESS
  #                 Days: !Ref IntelligentTierGlacierDays
  #             - !Ref "AWS::NoValue"
  #     ObjectLockConfiguration:
  #       ObjectLockEnabled:
  #         !If [IsHistoryObjectLockEnabled, "Enabled", !Ref "AWS::NoValue"]
  #       Rule:
  #         DefaultRetention:
  #           Mode: !If [IsHistoryAllowOverrideDelete, "GOVERNANCE", "COMPLIANCE"]
  #           Days: !If
  #             - IsHistoryRetentionDays
  #             - !Ref HistoryMinimumRetention
  #             - !Ref "AWS::NoValue"
  #           Years: !If
  #             - IsHistoryRetentionYears
  #             - !Ref HistoryMinimumRetention
  #             - !Ref "AWS::NoValue"
  #     ObjectLockEnabled: !If [IsHistoryObjectLockEnabled, true, false]
  #     LifecycleConfiguration:
  #       Rules:
  #         - Id: CleanAbortedHistoryUploads
  #           Prefix: "history/"
  #           Status: Enabled
  #           AbortIncompleteMultipartUpload:
  #             DaysAfterInitiation: 7
  #         - Id: CleanOtherPrefixes
  #           Prefix: "/"
  #           Status: Enabled
  #           AbortIncompleteMultipartUpload:
  #             DaysAfterInitiation: 7
  #     PublicAccessBlockConfiguration:
  #       BlockPublicAcls: true
  #       BlockPublicPolicy: true
  #       IgnorePublicAcls: true
  #       RestrictPublicBuckets: true
  # HistoryDataBucketPolicy:
  #   Type: "AWS::S3::BucketPolicy"
  #   Properties:
  #     Bucket: !Ref HistoryDataBucket
  #     PolicyDocument:
  #       Version: "2012-10-17"
  #       Statement:
  #         - Sid: "DenyIncorrectEncryptionHeader"
  #           Effect: "Deny"
  #           Principal: "*"
  #           Action: "s3:PutObject"
  #           Resource: !Join ["/", [!GetAtt HistoryDataBucket.Arn, "*"]]
  #           Condition:
  #             StringNotEquals:
  #               "s3:x-amz-server-side-encryption": "aws:kms"
  #         - Sid: DenyPublishingUnencryptedResources
  #           Action: "s3:PutObject"
  #           Condition:
  #             "Null":
  #               "s3:x-amz-server-side-encryption": true
  #           Effect: Deny
  #           Principal: "*"
  #           Resource: !Join ["/", [!GetAtt HistoryDataBucket.Arn, "*"]]
  #         - Sid: DenyUnencryptedConnections
  #           Action:
  #             - "s3:GetObject"
  #             - "s3:PutObject"
  #           Condition:
  #             Bool:
  #               "aws:SecureTransport": false
  #           Effect: Deny
  #           Principal: "*"
  #           Resource: !Join ["/", [!GetAtt HistoryDataBucket.Arn, "*"]]
  AssetsBucketKey:
    Type: "AWS::KMS::Key"
    DeletionPolicy: Delete
    Properties:
      Enabled: true
      EnableKeyRotation: true
      Description: "Key used for encrypting the History data bucket"
      KeyPolicy:
        Version: "2012-10-17"
        Id: key-s3
        Statement:
          - Sid: Enable IAM User Permissions
            Effect: Allow
            Principal:
              AWS: !Join
                - ""
                - - "arn:aws:iam::"
                  - !Ref "AWS::AccountId"
                  - ":root"
            Action: "kms:*"
            Resource: "*"
  AssetsBucketKeyAlias:
    Type: "AWS::KMS::Alias"
    Properties:
      AliasName: !Join
        - ""
        - - "alias/"
          - !Join
            - "-"
            - - "sf"
              - "assets"
              - !Ref InstallationId
      TargetKeyId: !Ref AssetsBucketKey
  AssetsBucket:
    Type: "AWS::S3::Bucket"
    DeletionPolicy: Delete # When torn down needs to remove everything completely and leave no charges billed
    Properties:
      BucketName: !Join
        - "-"
        - - "sf"
          - "assets"
          - !Ref InstallationId
      OwnershipControls:
        Rules:
          - ObjectOwnership: BucketOwnerPreferred
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: "aws:kms"
              KMSMasterKeyID: !Ref AssetsBucketKey
      VersioningConfiguration:
        Status: Enabled
      AccessControl: Private
      LoggingConfiguration:
        DestinationBucketName: !Ref LoggingBucket
        LogFilePrefix: !Join
          - ""
          - - !Join
              - "-"
              - - "sf"
                - "assets"
                - !Ref InstallationId
            - "/"
      LifecycleConfiguration:
        Rules:
          - Id: CleanOtherPrefixes
            Prefix: "/"
            Status: Enabled
            AbortIncompleteMultipartUpload:
              DaysAfterInitiation: 7
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
  AssetsBucketPolicy:
    Type: "AWS::S3::BucketPolicy"
    Properties:
      Bucket: !Ref AssetsBucket
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Sid: "DenyIncorrectEncryptionHeader"
            Effect: "Deny"
            Principal: "*"
            Action: "s3:PutObject"
            Resource: !Join ["/", [!GetAtt AssetsBucket.Arn, "*"]]
            Condition:
              StringNotEquals:
                "s3:x-amz-server-side-encryption": "aws:kms"
          - Sid: DenyPublishingUnencryptedResources
            Action: "s3:PutObject"
            Condition:
              "Null":
                "s3:x-amz-server-side-encryption": true
            Effect: Deny
            Principal: "*"
            Resource: !Join ["/", [!GetAtt AssetsBucket.Arn, "*"]]
          - Sid: DenyUnencryptedConnections
            Action:
              - "s3:GetObject"
              - "s3:PutObject"
            Condition:
              Bool:
                "aws:SecureTransport": false
            Effect: Deny
            Principal: "*"
            Resource: !Join ["/", [!GetAtt AssetsBucket.Arn, "*"]]
  MetadataBucketKey:
    Type: "AWS::KMS::Key"
    DeletionPolicy: Delete
    Properties:
      Enabled: true
      EnableKeyRotation: true
      Description: "Key used for encrypting the History data bucket"
      KeyPolicy:
        Version: "2012-10-17"
        Id: key-s3
        Statement:
          - Sid: Enable IAM User Permissions
            Effect: Allow
            Principal:
              AWS: !Join
                - ""
                - - "arn:aws:iam::"
                  - !Ref "AWS::AccountId"
                  - ":root"
            Action: "kms:*"
            Resource: "*"
  MetadataBucketKeyAlias:
    Type: "AWS::KMS::Alias"
    Properties:
      AliasName: !Join
        - ""
        - - "alias/"
          - !Join
            - "-"
            - - "sf"
              - "metadata"
              - !Ref InstallationId
      TargetKeyId: !Ref MetadataBucketKey
  MetadataBucket:
    Type: "AWS::S3::Bucket"
    DeletionPolicy: Delete # When torn down needs to remove everything completely and leave no charges billed
    Properties:
      BucketName: !Join
        - "-"
        - - "sf"
          - "metadata"
          - !Ref InstallationId
      OwnershipControls:
        Rules:
          - ObjectOwnership: BucketOwnerPreferred
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: "aws:kms"
              KMSMasterKeyID: !Ref MetadataBucketKey
      VersioningConfiguration:
        Status: Enabled
      AccessControl: Private
      LoggingConfiguration:
        DestinationBucketName: !Ref LoggingBucket
        LogFilePrefix: !Join
          - ""
          - - !Join
              - "-"
              - - "sf"
                - "metadata"
                - !Ref InstallationId
            - "/"
      LifecycleConfiguration:
        Rules:
          - Id: CleanOtherPrefixes
            Prefix: "/"
            Status: Enabled
            AbortIncompleteMultipartUpload:
              DaysAfterInitiation: 7
          - Id: ExpireMetadata
            Prefix: "schemas/"
            Status: Enabled
            AbortIncompleteMultipartUpload:
              DaysAfterInitiation: 7
            NoncurrentVersionExpiration:
              NoncurrentDays: 30
          - Id: ExpireStepfnRuns
            Prefix: "state/runs/"
            Status: Enabled
            ExpirationInDays: 60
            AbortIncompleteMultipartUpload:
              DaysAfterInitiation: 7
            NoncurrentVersionExpiration:
              NoncurrentDays: 30
          - Id: ExpireState
            Prefix: "state/"
            Status: Enabled
            AbortIncompleteMultipartUpload:
              DaysAfterInitiation: 7
            NoncurrentVersionExpiration:
              NoncurrentDays: 30
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      CorsConfiguration:
        CorsRules:
          - AllowedHeaders:
              - "*"
            AllowedMethods:
              - GET
              - HEAD
              - PUT
              - POST
            AllowedOrigins:
              - !Ref WebURLOrigin
            MaxAge: "3600"
  MetadataBucketPolicy:
    Type: "AWS::S3::BucketPolicy"
    Properties:
      Bucket: !Ref MetadataBucket
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Sid: "DenyIncorrectEncryptionHeader"
            Effect: "Deny"
            Principal: "*"
            Action: "s3:PutObject"
            Resource: !Join ["/", [!GetAtt MetadataBucket.Arn, "*"]]
            Condition:
              StringNotEquals:
                "s3:x-amz-server-side-encryption": "aws:kms"
          - Sid: DenyPublishingUnencryptedResources
            Action: "s3:PutObject"
            Condition:
              "Null":
                "s3:x-amz-server-side-encryption": true
            Effect: Deny
            Principal: "*"
            Resource: !Join ["/", [!GetAtt MetadataBucket.Arn, "*"]]
          - Sid: DenyUnencryptedConnections
            Action:
              - "s3:GetObject"
              - "s3:PutObject"
            Condition:
              Bool:
                "aws:SecureTransport": false
            Effect: Deny
            Principal: "*"
            Resource: !Join ["/", [!GetAtt MetadataBucket.Arn, "*"]]
  AthenaDataBucketKey:
    Type: "AWS::KMS::Key"
    DeletionPolicy: Delete
    Properties:
      Enabled: true
      EnableKeyRotation: true
      Description: "Key used for encrypting the Athena data bucket"
      KeyPolicy:
        Version: "2012-10-17"
        Id: key-s3
        Statement:
          - Sid: Enable IAM User Permissions
            Effect: Allow
            Principal:
              AWS: !Join
                - ""
                - - "arn:aws:iam::"
                  - !Ref "AWS::AccountId"
                  - ":root"
            Action: "kms:*"
            Resource: "*"
  AthenaDataBucketKeyAlias:
    Type: "AWS::KMS::Alias"
    Properties:
      AliasName: !Join
        - ""
        - - "alias/"
          - !Join
            - "-"
            - - "sf"
              - "athena-data"
              - !Ref InstallationId
      TargetKeyId: !Ref AthenaDataBucketKey
  AthenaDataBucket:
    Type: "AWS::S3::Bucket"
    DeletionPolicy: Delete
    Properties:
      BucketName: !Join
        - "-"
        - - "sf"
          - "athena-data"
          - !Ref InstallationId
      OwnershipControls:
        Rules:
          - ObjectOwnership: BucketOwnerPreferred
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: "aws:kms"
              KMSMasterKeyID: !Ref AthenaDataBucketKey
      VersioningConfiguration:
        Status: Enabled
      AccessControl: Private
      LifecycleConfiguration:
        Rules:
          - Id: ExpireOutput
            Prefix: "athena/output/"
            Status: Enabled
            ExpirationInDays: 30
            AbortIncompleteMultipartUpload:
              DaysAfterInitiation: 7
            NoncurrentVersionExpiration:
              NoncurrentDays: 60
          - Id: ExpireSpill
            Prefix: "athena/spill/"
            Status: Enabled
            ExpirationInDays: 30
            AbortIncompleteMultipartUpload:
              DaysAfterInitiation: 7
            NoncurrentVersionExpiration:
              NoncurrentDays: 60
          - Id: CleanOtherPrefixes
            Prefix: "/"
            Status: Enabled
            AbortIncompleteMultipartUpload:
              DaysAfterInitiation: 7
      LoggingConfiguration:
        DestinationBucketName: !Ref LoggingBucket
        LogFilePrefix: !Join
          - ""
          - - !Join
              - "-"
              - - "sf"
                - "athena-data"
                - !Ref InstallationId
            - "/"
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
  AthenaDataBucketPolicy:
    Type: "AWS::S3::BucketPolicy"
    Properties:
      Bucket: !Ref AthenaDataBucket
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Sid: DenyUnencryptedConnections
            Action:
              - "s3:GetObject"
              - "s3:PutObject"
            Condition:
              Bool:
                "aws:SecureTransport": false
            Effect: Deny
            Principal: "*"
            Resource: !Join ["/", [!GetAtt AthenaDataBucket.Arn, "*"]]
  LoggingBucket:
    Type: "AWS::S3::Bucket"
    DeletionPolicy: Delete # When torn down needs to remove everything completely and leave no charges billed
    Properties:
      BucketName: !Join
        - "-"
        - - "sf"
          - "logging"
          - !Ref InstallationId
      OwnershipControls:
        Rules:
          - ObjectOwnership: BucketOwnerPreferred
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: "AES256" # Can't use a CM KMS key with a logging bucket
      AccessControl: LogDeliveryWrite
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
    Metadata:
      cfn_nag:
        rules_to_suppress:
          - id: W51
            reason: No bucket policy necessary for logging buckets since AccessControl is set to LogDeliveryWrite
          - id: W35
            reason: Logging buckets cannot be designated to have logging configured
  CopyAssetsLambda:
    DependsOn: AssetsBucket
    Type: "AWS::Lambda::Function"
    Properties:
      Code:
        ZipFile: |
          const AWS = require('aws-sdk');
          const s3 = new AWS.S3();
          const cfn = require('cfn-response');
          const https = require('https');
          const fs = require('fs');
          const FILES = [
            'assets/athena-rds-connector.zip', 
            'assets/cloudformation-custom-resources.zip', 
            'assets/step-function-lambdas.zip',
            'assets/SecretsManagerRDSPostgreSQLRotationSingleUser.zip',
            'cf/athena.yaml',
            'cf/datastore.yaml',
            'cf/step_function.yaml',
            'cf/vpc.yaml'
          ];
          const TEMP = '/tmp/';

          exports.handler = async function(event, context) {
            var success = false;
            if (event.RequestType !== "Delete") {
              // Already has https://
              const websiteUrl = new URL(event.ResourceProperties.WebsiteUrl);
              const bucketName = event.ResourceProperties.AssetsBucket;
              const kmsKeyId = event.ResourceProperties.AssetsBucketKey;
              console.log("Moving assets from", websiteUrl, "to", bucketName, "with key", kmsKeyId);
              try {
                for (var i = 0; i < FILES.length; i++) {
                  console.log("GET", websiteUrl.hostname + "/" + FILES[i]);
                  const request = {
                    hostname: websiteUrl.hostname,
                    port: websiteUrl.port || undefined,
                    path: "/" + FILES[i],
                    method: 'GET',
                  };
                  await httpRequest(request, localFileName(FILES[i]));
                  console.log("Downloaded file", FILES[i]);
                  const fileContent = fs.readFileSync(TEMP + localFileName(FILES[i]));

                  // Setting up S3 upload parameters
                  const params = {
                      Bucket: bucketName,
                      Key: FILES[i],
                      Body: fileContent,
                      ServerSideEncryption: "aws:kms",
                      SSEKMSKeyId: kmsKeyId,
                  };
                  console.log("Uploading file", FILES[i]);
                  var uploadResp = await s3.upload(params, undefined).promise();
                  console.log("Upload complete", uploadResp);
                }
                success = true;
              }  catch (e) {
                success = false;
                // Log exception and allow posting response to S3
                console.log("EXCEPTION:", e);
              }
            } else {
              console.log("Ignoring DELETE request...");
              // For delete, just return ok
              success = true;
            }
            console.log("Success", success, "sending information to CloudFormation...");
            // cnf.send does not seem to work in all conditions with an async handler
            return await send(event, context, success ? cfn.SUCCESS : cfn.FAILED, { }, event.ResourceProperties.WebsiteUrl);
          }

          function localFileName(filename) {
            return filename.replace('assets/', '').replace('cf/', '');
          }

          function httpRequest(params, filename) {
            return new Promise(function(resolve, reject) {
                var req = https.request(params, function(res) {
                    // reject on bad status
                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        return reject(new Error('File download ' + filename + ' failed with statusCode=' + res.statusCode));
                    }
                    var write = fs.createWriteStream('/tmp/' + filename);
                    var piped = res.pipe(write);
                    
                    res.on('end', () => {
                      write.end();
                      write.close();
                    });
                    piped.on('finish', () => {
                      resolve();
                    });
                });
                req.on('error', reject);
                
                // IMPORTANT
                req.end();
            });
          }

          // Copy of cfn.send function but converted to returning a promise instead in order to still function since
          // other api calls above need to use promises.
          async function send(event, context, responseStatus, responseData, physicalResourceId, noEcho) {
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

              console.log("Response body:\\n", responseBody);

              var https = require("https");
              var url = require("url");

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
      Runtime: nodejs14.x
      Role: !GetAtt CopyAssetsLambdaRole.Arn
      Handler: index.handler
      Description: "Copies assets to the assets bucket"
      Timeout: 900 # Don't want timing out because then cloudformation hangs for 1 hour (plus 1 hour rollback)
      MemorySize: 512
      FunctionName: !Join
        - "_"
        - - "sf"
          - "asset_upload"
          - !Ref InstallationId
    Metadata:
      cfn_nag:
        rules_to_suppress:
          - id: W89
            reason: Deploying inside of a VPC would require VPC Endpoints to talk to AWS which would incur more monthly cost
          - id: W92
            reason: Not using ReservedConcurrentExecutions because this is only executed once, so unreserved concurrency should be used
          - id: W58
            reason: Permissions to write logs is in managed policy
  CopyAssetsLambdaRole:
    Type: "AWS::IAM::Role"
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: "Allow"
            Principal:
              Service: "lambda.amazonaws.com"
            Action: "sts:AssumeRole"
      Policies:
        - PolicyName: "S3Access"
          PolicyDocument:
            Statement:
              - Action:
                  - s3:PutObject
                  - s3:AbortMultipartUpload
                  - s3:ListBucketMultipartUploads
                  - s3:ListMultipartUploadParts
                Effect: "Allow"
                Resource:
                  - !Join
                    - "/"
                    - - !GetAtt AssetsBucket.Arn
                      - "assets/*"
                  - !Join
                    - "/"
                    - - !GetAtt AssetsBucket.Arn
                      - "cf/*"
              - Action:
                  - kms:Encrypt
                  - kms:Decrypt
                  - kms:GenerateDataKey
                Effect: Allow
                Resource:
                  - !Sub
                    - "arn:\${AWS::Partition}:kms:\${AWS::Region}:\${AWS::AccountId}:key/\${KeyName}"
                    - KeyName: !Ref AssetsBucketKey
        - PolicyName: "CloudWatch" # Cannot use VPC managed policy because it does not exist yet
          PolicyDocument:
            Statement:
              - Sid: "CreateLogGroup"
                Action:
                  - logs:CreateLogGroup
                Effect: "Allow"
                Resource:
                  - !Sub "arn:\${AWS::Partition}:logs:\${AWS::Region}:\${AWS::AccountId}:*"
              - Sid: "WriteLogs"
                Action:
                  - logs:CreateLogStream
                  - logs:PutLogEvents
                Effect: "Allow"
                Resource:
                  - !Sub "arn:\${AWS::Partition}:logs:\${AWS::Region}:\${AWS::AccountId}:log-group:/aws/lambda/*:*"
  CopyAssetsLambdaCustomResource:
    Type: "Custom::AssetsUpload"
    DependsOn: CopyAssetsLambda
    Properties:
      ServiceToken: !GetAtt
        - CopyAssetsLambda
        - Arn
      Region: !Ref "AWS::Region"
      WebsiteUrl: !Ref AssetWebsiteURL
      AssetsBucket: !Ref AssetsBucket
      AssetsBucketKey: !Ref AssetsBucketKey
Outputs:
  StackName:
    Description: "Stack name."
    Value: !Sub "\${AWS::StackName}"
  # HistoryDataBucketName:
  #   Description: "The name of the history data bucket."
  #   Value: !Ref HistoryDataBucket
  #   Export:
  #     Name: !Sub "\${AWS::StackName}-HistoryDataBucket"
  # HistoryDataBucketKey:
  #   Description: "The KMS key of the history data bucket."
  #   Value: !Ref HistoryDataBucketKey
  #   Export:
  #     Name: !Sub "\${AWS::StackName}-HistoryDataBucketKey"
  AssetsBucket:
    Description: "The name of the assets bucket."
    Value: !Ref AssetsBucket
    Export:
      Name: !Sub "\${AWS::StackName}-AssetsBucket"
  AssetsBucketKey:
    Description: "The KMS key of the assets bucket."
    Value: !Ref AssetsBucketKey
    Export:
      Name: !Sub "\${AWS::StackName}-AssetsBucketKey"
  MetadataBucket:
    Description: "The name of the metadata bucket."
    Value: !Ref MetadataBucket
    Export:
      Name: !Sub "\${AWS::StackName}-MetadataBucket"
  MetadataBucketKey:
    Description: "The KMS key of the metadata bucket."
    Value: !Ref MetadataBucketKey
    Export:
      Name: !Sub "\${AWS::StackName}-MetadataBucketKey"
  AthenaDataBucket:
    Description: "The name of the athena data bucket."
    Value: !Ref AthenaDataBucket
    Export:
      Name: !Sub "\${AWS::StackName}-AthenaDataBucket"
  AthenaDataBucketKey:
    Description: "The KMS key of the athena data bucket."
    Value: !Ref AthenaDataBucketKey
    Export:
      Name: !Sub "\${AWS::StackName}-AthenaDataBucketKey"
  LoggingBucket:
    Description: "The name of the logging bucket for the whole system."
    Value: !Ref LoggingBucket
    Export:
      Name: !Sub "\${AWS::StackName}-LoggingBucket"
`