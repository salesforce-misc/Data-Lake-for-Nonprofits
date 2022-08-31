export const yaml = `---
# Datastore stack used to house (live and historical) information synchronized from the Salesforce API
# This stack contains the Aurora serverless setup which can be queried through individually or via
# Athena if desired.
AWSTemplateFormatVersion: "2010-09-09"
Description: "Salesforce Datastore Stack (PiD:'921792788236')"
Metadata:
  "AWS::CloudFormation::Interface":
    ParameterGroups:
      - Label:
          default: "** REQUIRED FIELDS **"
        Parameters:
          - ParentVPCStack
          - ParentBucketStack
          - InstallationId
      - Label:
          default: "RDS Parameters"
        Parameters:
          - EngineVersion
          - DBSnapshotIdentifier
          - DBName
          - DBBackupRetentionPeriod
          - DBMasterUsername
          - PreferredBackupWindow
          - PreferredMaintenanceWindow
          - EnableDataApi
          - SecretRotationAssetZip
      - Label:
          default: "Serverless Parameters"
        Parameters:
          - AutoPause
          - MaxCapacity
          - MinCapacity
          - SecondsUntilAutoPause
Parameters:
  ParentVPCStack:
    Description: "Stack name of parent VPC stack."
    Type: String
    AllowedPattern: ".{3,}"
  ParentBucketStack:
    Description: "The name of the bucket stack."
    Type: String
    AllowedPattern: ".{3,}"
  InstallationId:
    Description: "The unique name for this system such that it will not conflict globally with any other installation of this system. Must only contain alphanumeric characters (no special punctuation such as _ , _ . & ! + = etc.)"
    Type: String
    AllowedPattern: "[a-z0-9]{8,}"
  SecretRotationAssetZip:
    Description: "The source code for the Step Function Lambda zip file."
    Type: String
    Default: "assets/SecretsManagerRDSPostgreSQLRotationSingleUser.zip"
  DBSnapshotIdentifier:
    Description: "Optional identifier for the DB cluster snapshot from which you want to restore (leave blank to create an empty cluster)."
    Type: String
    Default: ""
  DBName:
    Description: "Name of the database (ignored when DBSnapshotIdentifier is set, value used from snapshot)."
    Type: String
    Default: db
  DBBackupRetentionPeriod:
    Description: "The number of days to keep snapshots of the cluster."
    Type: Number
    MinValue: 1
    MaxValue: 35
    Default: 7
  DBMasterUsername:
    Description: "The master user name for the DB instance (ignored when DBSnapshotIdentifier is set, value used from snapshot)."
    Type: "String"
    Default: sfadmin
  PreferredBackupWindow:
    Description: "The daily time range in UTC during which you want to create automated backups."
    Type: String
    Default: "09:54-10:24"
  PreferredMaintenanceWindow:
    Description: "The weekly time range (in UTC) during which system maintenance can occur."
    Type: String
    Default: "sat:07:00-sat:07:30"
  EnableDataApi:
    Description: "Enable the Data API (https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html)."
    Type: String
    AllowedValues: ["true", "false"]
    Default: "false"
  AutoPause:
    Description: "Shuts down all servers to cut cost. Enables automatic pause for a Serverless Aurora cluster. A cluster can be paused only when it has no connections. If a cluster is paused for more than seven days, the cluster might be backed up with a snapshot. In this case, the cluster is restored when there is a request to connect to it."
    Type: String
    AllowedValues: ["true", "false"]
    Default: "true"
  MaxCapacity:
    Description: "The maximum capacity units for a Serverless Aurora cluster. Set this to put a cap on cost by limiting performance."
    Type: String
    AllowedValues: [2, 4, 8, 16, 32, 64, 192, 384]
    Default: 2
  MinCapacity:
    Description: "The minimum capacity units for a Serverless Aurora cluster. Set this to put a minimum performance level to boot to when starting up, reducing cold/fresh start scaling times."
    Type: String
    AllowedValues: [2, 4, 8, 16, 32, 64, 192, 384]
    Default: 2
  SecondsUntilAutoPause:
    Description: "The time, in seconds, before a Serverless Aurora cluster is paused. The longer it runs when idle the more it will cost, however this may alleviate frequent cold start issues if access is infrequent but heavily concentrated within a small time window. For example, if the database is queried hourly on Mondays, set this to > 1 hour (3,600+) and the server will stay up all day Monday but shut down ever other day of the week."
    Type: Number
    MinValue: 300
    MaxValue: 86400
    Default: 300
  EngineVersion:
    Description: "Aurora Serverless PostgreSQL version."
    Type: String
    Default: "10.14"
    AllowedValues: ["10.14"] # aws rds describe-db-engine-versions --engine aurora-postgresql --query 'DBEngineVersions[?contains(SupportedEngineModes,\`serverless\`)]'
  SSHAccessPrefixList:
    Description: Enables SSH access to the VPC by a prefix list. Must have an instance running in order to connect. Must have set "SSHAccess" to true in the VPC stack.
    Type: String
    Default: ""
Mappings:
  EngineVersionMap:
    "10.14":
      ClusterParameterGroupFamily: "aurora-postgresql10"
Conditions:
  HasDBSnapshotIdentifier: !Not [!Equals [!Ref DBSnapshotIdentifier, ""]]
  HasSSHPrefixList: !Not [!Equals [!Ref SSHAccessPrefixList, ""]]
Resources:
  SecretKey:
    Type: "AWS::KMS::Key"
    DeletionPolicy: Delete
    Properties:
      Enabled: true
      EnableKeyRotation: true
      Description: "Key used for encrypting RDS Secret credentials"
      KeyPolicy:
        Version: "2012-10-17"
        Id: key-rds
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
  SecretKeyAlias:
    Type: "AWS::KMS::Alias"
    Properties:
      AliasName: !Join
        - "-"
        - - "alias/"
          - "sf"
          - "dbadmin-secret"
          - !Ref InstallationId
      TargetKeyId: !Ref SecretKey
  Secret:
    Type: "AWS::SecretsManager::Secret"
    DeletionPolicy: Delete
    Properties:
      KmsKeyId: !Ref SecretKey
      Name: !Join
        - "-"
        - - "sf"
          - "dbadmin"
          - !Ref InstallationId
      GenerateSecretString:
        SecretStringTemplate:
          !Join ["", ['{"username": "', !Ref DBMasterUsername, '"}']]
        GenerateStringKey: password
        PasswordLength: 32 # Same as default
        RequireEachIncludedType: true
        ExcludeCharacters: " %+:;{}/\\\\@\\"'"
  SecretRotation:
    Type: AWS::SecretsManager::RotationSchedule
    DependsOn: SecretRotationLambda
    Properties:
      RotateImmediatelyOnUpdate: false
      RotationLambdaARN: !GetAtt SecretRotationLambda.Arn
      RotationRules:
        AutomaticallyAfterDays: 30
      SecretId: !Ref Secret
  SecretRotationPermission:
    Type: "AWS::Lambda::Permission"
    Properties:
      Action: "lambda:InvokeFunction"
      FunctionName: !GetAtt SecretRotationLambda.Arn
      Principal: secretsmanager.amazonaws.com
  SecretRotationLambda:
    Type: "AWS::Lambda::Function"
    Properties:
      Code:
        # To update this code to the latest, go to the secrets manager console and enable rotation on RDS credentials (may need to disable it)
        # and allow it to create a new lambda function for you. This will create two new stacks and in one of them you will see a CodeUri with
        # an S3 path containing the source code.
        S3Bucket:
          Fn::ImportValue: !Sub "\${ParentBucketStack}-AssetsBucket"
        S3Key: !Ref SecretRotationAssetZip
      Description: Rotates a Secrets Manager secret for Amazon RDS PostgreSQL credentials using the single user rotation strategy.
      FunctionName: !Join
        - "_"
        - - "sf"
          - "db"
          - "rotate"
          - "creds"
          - !Ref InstallationId
      Handler: lambda_function.lambda_handler
      MemorySize: 128
      Role: !GetAtt SecretRotationLambdaRole.Arn
      Runtime: python3.7
      Timeout: 30
      VpcConfig:
        SecurityGroupIds:
          - !Ref LambdaSecurityGroup
        SubnetIds: !Split
          - ","
          - Fn::ImportValue: !Sub "\${ParentVPCStack}-Subnets"
      Environment:
        Variables:
          SECRETS_MANAGER_ENDPOINT: !Sub "https://secretsmanager.\${AWS::Region}.\${AWS::URLSuffix}"
          EXCLUDE_CHARACTERS: ":/@\\"'\\\\"
    Metadata:
      cfn_nag:
        rules_to_suppress:
          - id: W92
            reason: ReservedConcurrentExecutions cannot be used because maximum invocations cannot be determined
          - id: W58
            reason: Permissions to write logs is in managed policy
  SecretRotationLambdaRole:
    Type: "AWS::IAM::Role"
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Action:
              - "sts:AssumeRole"
            Effect: "Allow"
            Principal:
              Service:
                - "lambda.amazonaws.com"
      ManagedPolicyArns:
        - Fn::ImportValue: !Sub "\${ParentVPCStack}-LambdaManagedPolicy"
        - Fn::ImportValue: !Sub "\${ParentVPCStack}-VPCLambdaManagedPolicy"
      Policies:
        - PolicyName: "AccessSecretsManager"
          PolicyDocument:
            Statement:
              - Sid: "SecretManagerAccess"
                Action:
                  - "secretsmanager:GetSecretValue"
                Effect: "Allow"
                Resource: !Sub
                  - "arn:\${AWS::Partition}:secretsmanager:\${AWS::Region}:\${AWS::AccountId}:secret:\${SecretNamePrefix}*"
                  - SecretNamePrefix: !Ref Secret
              - Sid: "KMS"
                Action:
                  - "kms:Encrypt"
                  - "kms:Decrypt"
                  - "kms:GenerateDataKey"
                Effect: "Allow"
                Resource:
                  - !Sub
                    - "arn:\${AWS::Partition}:kms:\${AWS::Region}:\${AWS::AccountId}:key/\${KeyName}"
                    - KeyName: !Ref SecretKey
  SecretTargetAttachment:
    Type: "AWS::SecretsManager::SecretTargetAttachment"
    Properties:
      TargetId: !Ref DBCluster
      SecretId: !Ref Secret
      TargetType: "AWS::RDS::DBCluster"
  ClusterSecurityGroup:
    Type: "AWS::EC2::SecurityGroup"
    Properties:
      GroupDescription: !Join
        - "-"
        - - "sf"
          - "db"
          - !Ref InstallationId
      VpcId:
        Fn::ImportValue: !Sub "\${ParentVPCStack}-VPC"
    Metadata:
      cfn_nag:
        rules_to_suppress:
          - id: W5
            reason: Outbound connections are unrestricted
          - id: W29
            reason: Outbound connections are unrestricted
  ClusterSecurityGroupIngress:
    Type: "AWS::EC2::SecurityGroupIngress"
    Properties:
      GroupId: !Ref ClusterSecurityGroup
      IpProtocol: tcp
      FromPort: !GetAtt "DBCluster.Endpoint.Port"
      ToPort: !GetAtt "DBCluster.Endpoint.Port"
      SourceSecurityGroupId: !Ref ClusterSecurityGroup
      Description: !Join
        - "-"
        - - "sf"
          - "db"
          - !Ref InstallationId
  ClusterSecurityGroupEgress:
    Type: AWS::EC2::SecurityGroupEgress
    Properties:
      GroupId: !Ref ClusterSecurityGroup
      IpProtocol: tcp
      FromPort: 0
      ToPort: 65535
      CidrIp: 0.0.0.0/0
      Description: !Join
        - "-"
        - - "sf"
          - "db"
          - !Ref InstallationId
  DBSubnetGroup:
    Type: "AWS::RDS::DBSubnetGroup"
    Properties:
      DBSubnetGroupDescription: !Join
        - "-"
        - - "sf"
          - "db"
          - !Ref InstallationId
      SubnetIds: !Split
        - ","
        - Fn::ImportValue: !Sub "\${ParentVPCStack}-Subnets"
  DBClusterParameterGroup:
    Type: "AWS::RDS::DBClusterParameterGroup"
    Properties:
      Description: !Join
        - "-"
        - - "sf"
          - "db"
          - !Ref InstallationId
      Family: !FindInMap
        - EngineVersionMap
        - !Ref EngineVersion
        - ClusterParameterGroupFamily
      Parameters:
        client_encoding: "UTF8"
  DBClusterKey:
    Type: "AWS::KMS::Key"
    DeletionPolicy: Delete
    Properties:
      Enabled: true
      EnableKeyRotation: true
      Description: "Key used for encrypting RDS data"
      KeyPolicy:
        Version: "2012-10-17"
        Id: key-rds
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
  DBClusterKeyAlias:
    Type: "AWS::KMS::Alias"
    Properties:
      AliasName: !Join
        - ""
        - - "alias/"
          - !Join
            - "-"
            - - "sf"
              - "db"
              - !Ref InstallationId
      TargetKeyId: !Ref DBClusterKey
  DBCluster:
    DeletionPolicy: Snapshot # default
    UpdateReplacePolicy: Snapshot
    Type: "AWS::RDS::DBCluster"
    Properties:
      BackupRetentionPeriod: !Ref DBBackupRetentionPeriod
      DatabaseName: !If
        - HasDBSnapshotIdentifier
        - !Ref "AWS::NoValue"
        - !Join
          - ""
          - - "sf"
            - !Ref DBName
            - !Ref InstallationId
      DeletionProtection: true
      DBClusterParameterGroupName: !Ref DBClusterParameterGroup
      DBSubnetGroupName: !Ref DBSubnetGroup
      EnableHttpEndpoint: !Ref EnableDataApi
      Engine: aurora-postgresql
      EngineMode: serverless
      EngineVersion: !Ref EngineVersion
      KmsKeyId:
        !If [HasDBSnapshotIdentifier, !Ref "AWS::NoValue", !Ref DBClusterKey]
      MasterUsername: !If
        - HasDBSnapshotIdentifier
        - !Ref "AWS::NoValue"
        - !Ref DBMasterUsername
      MasterUserPassword: !If
        - HasDBSnapshotIdentifier
        - !Ref "AWS::NoValue"
        - !Join
          - ""
          - - "{{resolve:secretsmanager:"
            - !Ref Secret
            - ":SecretString:password}}"
      PreferredBackupWindow: !Ref PreferredBackupWindow
      PreferredMaintenanceWindow: !Ref PreferredMaintenanceWindow
      ScalingConfiguration:
        AutoPause: !Ref AutoPause
        MaxCapacity: !Ref MaxCapacity
        MinCapacity: !Ref MinCapacity
        SecondsUntilAutoPause: !Ref SecondsUntilAutoPause
      SnapshotIdentifier: !If
        - HasDBSnapshotIdentifier
        - !Ref DBSnapshotIdentifier
        - !Ref "AWS::NoValue"
      StorageEncrypted: true
      VpcSecurityGroupIds:
        - !Ref ClusterSecurityGroup
  DatabaseClusterEventSubscription:
    Type: "AWS::RDS::EventSubscription"
    Properties:
      EventCategories:
        - failover
        - failure
        - maintenance
      SnsTopicArn:
        Fn::ImportValue: !Sub "\${ParentVPCStack}-SNSAlarmTopic"
      SourceIds: [!Ref DBCluster]
      SourceType: "db-cluster"
  LambdaSecurityGroup:
    Type: "AWS::EC2::SecurityGroup"
    Properties:
      GroupDescription: !Sub "\${AWS::StackName} Lambda for connecting to RDS security group"
      VpcId:
        Fn::ImportValue: !Sub "\${ParentVPCStack}-VPC"
    Metadata:
      cfn_nag:
        rules_to_suppress:
          - id: W5
            reason: Outbound connections are unrestricted
          - id: W29
            reason: Outbound connections are unrestricted
  LambdaSecurityGroupIngress:
    Type: "AWS::EC2::SecurityGroupIngress"
    Condition: HasSSHPrefixList
    Properties:
      FromPort: 22
      ToPort: 22
      IpProtocol: tcp
      Description: "Allows for SSH (port 22) access from the given prefix list"
      SourcePrefixListId: !Ref SSHAccessPrefixList
      GroupId: !Ref LambdaSecurityGroup
  LambdaSecurityGroupEgress:
    Type: AWS::EC2::SecurityGroupEgress
    Properties:
      GroupId: !Ref LambdaSecurityGroup
      IpProtocol: tcp
      FromPort: 0
      ToPort: 65535
      CidrIp: 0.0.0.0/0
      Description: !Join
        - "-"
        - - "sf"
          - "lambda"
          - !Ref InstallationId
  ClusterSecurityGroupIngressForLambda:
    Type: "AWS::EC2::SecurityGroupIngress"
    Properties:
      Description: !Sub "\${AWS::StackName} Allows Lambdas to access the DB"
      GroupId: !Ref ClusterSecurityGroup
      IpProtocol: tcp
      FromPort: !GetAtt "DBCluster.Endpoint.Port"
      ToPort: !GetAtt "DBCluster.Endpoint.Port"
      SourceSecurityGroupId: !Ref LambdaSecurityGroup
Outputs:
  StackName:
    Description: "Stack name."
    Value: !Sub "\${AWS::StackName}"
  ClusterName:
    Description: "The name of the cluster."
    Value: !Ref DBCluster
    Export:
      Name: !Sub "\${AWS::StackName}-ClusterName"
  ClusterDbName:
    Description: "The name of the database in the cluster"
    Value: !Join
      - ""
      - - "sf"
        - !Ref DBName
        - !Ref InstallationId
    Export:
      Name: !Sub "\${AWS::StackName}-ClusterDbName"
  ClusterAddress:
    Description: "The connection endpoint of the DB cluster."
    Value: !GetAtt "DBCluster.Endpoint.Address"
    Export:
      Name: !Sub "\${AWS::StackName}-ClusterAddress"
  ClusterPort:
    Description: "The connection endpoint port for the DB cluster."
    Value: !GetAtt "DBCluster.Endpoint.Port"
    Export:
      Name: !Sub "\${AWS::StackName}-ClusterPort"
  ClusterSecurityGroup:
    Description: "The security group used to manage access to RDS Aurora Serverless Postgres."
    Value: !Ref ClusterSecurityGroup
    Export:
      Name: !Sub "\${AWS::StackName}-ClusterSecurityGroup"
  Secret:
    Description: "The name of the SecretsManager secret for accessing the database"
    Value: !Join
      - "-"
      - - "sf"
        - "dbadmin"
        - !Ref InstallationId
    Export:
      Name: !Sub "\${AWS::StackName}-Secret"
  SecretArn:
    Description: "The ARN of the SecretsManager secret for accessing the database"
    Value: !Ref Secret
    Export:
      Name: !Sub "\${AWS::StackName}-SecretArn"
  SecretKey:
    Description: "The key of the SecretsManager secret for accessing the database"
    Value: !Ref SecretKey
    Export:
      Name: !Sub "\${AWS::StackName}-SecretKey"
  LambdaSecurityGroup:
    Description: "Security group for lambdas that connect to RDS"
    Value: !Ref LambdaSecurityGroup
    Export:
      Name: !Sub "\${AWS::StackName}-LambdaSecurityGroup"
  DBMasterUsername:
    Description: The user name for the admin of the database
    Value: !Ref DBMasterUsername
    Export:
      Name: !Sub "\${AWS::StackName}-DBMasterUsername"
`