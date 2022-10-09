export const yaml = `---
# Datastore network stack used to the whole solution.
AWSTemplateFormatVersion: "2010-09-09"
Description: "Salesforce VPC Stack"
Metadata:
  "AWS::CloudFormation::Interface":
    ParameterGroups:
      - Label:
          default: "** REQUIRED FIELDS **"
        Parameters:
          - InstallationId
Parameters:
  InstallationId:
    Description: "The unique name for this system such that it will not conflict globally with any other installation of this system. Must only contain alphanumeric characters (no special punctuation such as _ , _ . & ! + = etc.)"
    Type: String
    AllowedPattern: "[a-z0-9]{8,}"
  SSHAccess:
    Description: Enables networking components such that the last step to enable SSH is to have an instance in a security group which allows SSH access in the VPC.
    Type: String
    AllowedValues: ["true", "false"]
    Default: "true"
  ThirdAZ:
    Description: Enable/Disable the third availability zone within the region. This is here to allow for disabling the third AZ when the region does not support it.
    Type: String
    AllowedValues: ["Enable", "Disable"]
    Default: "Enable"
Conditions:
  IsSSHOpened: !Equals [!Ref SSHAccess, "true"]
  HasThirdAZ: !Equals [!Ref ThirdAZ, "Enable"]
  IsSSHOpenedThirdAZ: !And [!Condition IsSSHOpened, !Condition HasThirdAZ]
Resources:
  VPC:
    Type: "AWS::EC2::VPC"
    DeletionPolicy: Delete
    Properties:
      CidrBlock: !Sub "10.0.0.0/16"
      EnableDnsSupport: true
      EnableDnsHostnames: true
      InstanceTenancy: default
      Tags:
        - Key: Name
          Value: !Join
            - "-"
            - - "sf"
              - !Ref InstallationId
  InternetGateway:
    Type: "AWS::EC2::InternetGateway"
    Properties:
      Tags:
        - Key: Name
          Value: !Join
            - "-"
            - - "sf"
              - !Ref InstallationId
  VPCGatewayAttachment:
    Type: "AWS::EC2::VPCGatewayAttachment"
    Properties:
      VpcId: !Ref VPC
      InternetGatewayId: !Ref InternetGateway
  SubnetA:
    Type: "AWS::EC2::Subnet"
    Properties:
      AvailabilityZone: !Select [0, !GetAZs ""]
      CidrBlock: !Sub "10.0.16.0/20"
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Join
            - "-"
            - - "sf"
              - !Ref InstallationId
              - !If [IsSSHOpened, "public-a", "private-a"]
  SubnetB:
    Type: "AWS::EC2::Subnet"
    Properties:
      AvailabilityZone: !Select [1, !GetAZs ""]
      CidrBlock: !Sub "10.0.48.0/20"
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Join
            - "-"
            - - "sf"
              - !Ref InstallationId
              - !If [IsSSHOpened, "public-b", "private-b"]
  SubnetC:
    Type: "AWS::EC2::Subnet"
    Condition: HasThirdAZ
    Properties:
      AvailabilityZone: !Select [2, !GetAZs ""]
      CidrBlock: !Sub "10.0.80.0/20"
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Join
            - "-"
            - - "sf"
              - !Ref InstallationId
              - !If [IsSSHOpened, "public-c", "private-c"]
  RouteTableA:
    Type: "AWS::EC2::RouteTable"
    Properties:
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Join
            - "-"
            - - "sf"
              - !Ref InstallationId
              - "a"
  RouteEntryA:
    Type: "AWS::EC2::Route"
    Condition: IsSSHOpened
    Properties:
      GatewayId: !Ref InternetGateway
      RouteTableId: !Ref RouteTableA
      DestinationCidrBlock: "0.0.0.0/0"
  RouteTableB:
    Type: "AWS::EC2::RouteTable"
    Properties:
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Join
            - "-"
            - - "sf"
              - !Ref InstallationId
              - "b"
  RouteEntryB:
    Type: "AWS::EC2::Route"
    Condition: IsSSHOpened
    Properties:
      GatewayId: !Ref InternetGateway
      RouteTableId: !Ref RouteTableB
      DestinationCidrBlock: "0.0.0.0/0"
  RouteTableC:
    Type: "AWS::EC2::RouteTable"
    Condition: HasThirdAZ
    Properties:
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Join
            - "-"
            - - "sf"
              - !Ref InstallationId
              - "c"
  RouteEntryC:
    Type: "AWS::EC2::Route"
    Condition: IsSSHOpenedThirdAZ
    Properties:
      GatewayId: !Ref InternetGateway
      RouteTableId: !Ref RouteTableC
      DestinationCidrBlock: "0.0.0.0/0"
  RouteTableAssociationA:
    Type: "AWS::EC2::SubnetRouteTableAssociation"
    Properties:
      SubnetId: !Ref SubnetA
      RouteTableId: !Ref RouteTableA
  RouteTableAssociationB:
    Type: "AWS::EC2::SubnetRouteTableAssociation"
    Properties:
      SubnetId: !Ref SubnetB
      RouteTableId: !Ref RouteTableB
  RouteTableAssociationC:
    Type: "AWS::EC2::SubnetRouteTableAssociation"
    Condition: HasThirdAZ
    Properties:
      SubnetId: !Ref SubnetC
      RouteTableId: !Ref RouteTableC
  NetworkAcl:
    Type: "AWS::EC2::NetworkAcl"
    Properties:
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Join
            - "-"
            - - "sf"
              - !Ref InstallationId
  NetworkAclIngress:
    Type: "AWS::EC2::NetworkAclEntry"
    Properties:
      Egress: false
      NetworkAclId: !Ref NetworkAcl
      RuleAction: allow
      RuleNumber: 100
      Protocol: 6
      PortRange:
        From: 0
        To: 65535
      CidrBlock: "0.0.0.0/0"
    Metadata:
      cfn_nag:
        rules_to_suppress:
          - id: W67
            reason: Security controlled via security groups and not network ACL
  NetworkAclEgress:
    Type: "AWS::EC2::NetworkAclEntry"
    Properties:
      Egress: true
      NetworkAclId: !Ref NetworkAcl
      RuleAction: allow
      RuleNumber: 100
      PortRange:
        From: 0
        To: 65535
      Protocol: 6
      CidrBlock: "0.0.0.0/0"
    Metadata:
      cfn_nag:
        rules_to_suppress:
          - id: W67
            reason: Security controlled via security groups and not network ACL
  SubnetNetworkAclAssociationA:
    Type: "AWS::EC2::SubnetNetworkAclAssociation"
    Properties:
      SubnetId: !Ref SubnetA
      NetworkAclId: !Ref NetworkAcl
  SubnetNetworkAclAssociationB:
    Type: "AWS::EC2::SubnetNetworkAclAssociation"
    Properties:
      SubnetId: !Ref SubnetB
      NetworkAclId: !Ref NetworkAcl
  SubnetNetworkAclAssociationC:
    Type: "AWS::EC2::SubnetNetworkAclAssociation"
    Condition: HasThirdAZ
    Properties:
      SubnetId: !Ref SubnetC
      NetworkAclId: !Ref NetworkAcl
  SNSAlarmTopic:
    Type: AWS::SNS::Topic
    Properties:
      KmsMasterKeyId: !Ref SNSAlarmKey
      TopicName: !Join
        - "-"
        - - "sf"
          - "alarm"
          - !Ref InstallationId
  SNSAlarmKey:
    Type: "AWS::KMS::Key"
    DeletionPolicy: Delete
    Properties:
      Enabled: true
      EnableKeyRotation: true
      Description: "Key used for encrypting the SNS Topic"
      KeyPolicy:
        Version: "2012-10-17"
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
          - Sid: Allow SNS Usage
            Effect: Allow
            Principal:
              Service: sns.amazonaws.com
            Action:
              - kms:Encrypt
              - kms:Decrypt
              - kms:GenerateDataKey
            Resource: "*"
          - Sid: Allow Cloudwatch Usage
            Effect: Allow
            Principal:
              Service: cloudwatch.amazonaws.com
            Action:
              - kms:Encrypt
              - kms:Decrypt
              - kms:GenerateDataKey
            Resource: "*"
  SNSAlarmKeyAlias:
    Type: "AWS::KMS::Alias"
    Properties:
      AliasName: !Join
        - ""
        - - "alias/"
          - !Join
            - "-"
            - - "sf"
              - "sns-topic"
              - !Ref InstallationId
      TargetKeyId: !Ref SNSAlarmKey
  SNSAlarmTopicPolicy:
    Type: AWS::SNS::TopicPolicy
    Properties:
      Topics:
        - !Ref SNSAlarmTopic
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Sid: Publish
            Effect: Allow
            Principal:
              AWS: !Sub "\${AWS::AccountId}"
            Action:
              - sns:GetTopicAttributes
              - sns:SetTopicAttributes
              - sns:AddPermission
              - sns:RemovePermission
              - sns:DeleteTopic
              - sns:Subscribe
              - sns:ListSubscriptionsByTopic
              - sns:Publish
            Resource: !Ref SNSAlarmTopic
          - Sid: DenyUnencryptedConnections
            Action:
              - sns:Publish
              - sns:Subscribe
              - sns:GetTopicAttributes
              - sns:SetTopicAttributes
            Condition:
              Bool:
                "aws:SecureTransport": false
            Effect: Deny
            Principal: "*"
            Resource: !Ref SNSAlarmTopic
  VPCFlowLogs:
    Type: AWS::EC2::FlowLog
    Properties:
      DeliverLogsPermissionArn: !GetAtt VPCFlowLogsRole.Arn
      LogGroupName: !Join
        - "-"
        - - /aws/vpc/
          - "sf"
          - "flowlogs"
          - !Ref InstallationId
      ResourceId: !Ref VPC
      ResourceType: VPC
      TrafficType: ALL
      Tags:
        - Key: Name
          Value: !Join
            - "-"
            - - "sf"
              - "flowlogs"
              - !Ref InstallationId
  VPCFlowLogsRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service: "vpc-flow-logs.amazonaws.com"
            Action: "sts:AssumeRole"
      Policies:
        - PolicyName: "flowlogs-policy"
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow
                Action:
                  - "logs:CreateLogStream"
                  - "logs:PutLogEvents"
                  - "logs:DescribeLogGroups"
                  - "logs:DescribeLogStreams"
                Resource: !GetAtt VPCFlowLogsLogGroup.Arn
  VPCFlowLogsLogGroupKey:
    Type: "AWS::KMS::Key"
    DeletionPolicy: Delete
    Properties:
      Enabled: true
      EnableKeyRotation: true
      Description: "Key used for encrypting the SNS Topic"
      KeyPolicy:
        Version: "2012-10-17"
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
          - Sid: Allow Cloudwatch Usage
            Effect: Allow
            Principal:
              Service: logs.amazonaws.com
            Action:
              - kms:Encrypt
              - kms:Decrypt
              - kms:GenerateDataKey
            Resource: "*"
  VPCFlowLogsLogGroupKeyAlias:
    Type: "AWS::KMS::Alias"
    Properties:
      AliasName: !Join
        - ""
        - - "alias/"
          - !Join
            - "-"
            - - "sf"
              - "flow-logs"
              - !Ref InstallationId
      TargetKeyId: !Ref VPCFlowLogsLogGroupKey
  VPCFlowLogsLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      KmsKeyId: !GetAtt VPCFlowLogsLogGroupKey.Arn
      RetentionInDays: 365
      LogGroupName: !Join
        - "-"
        - - /aws/vpc/
          - "sf"
          - "flowlogs"
          - !Ref InstallationId
  VPCLambdaManagedPolicy:
    Type: "AWS::IAM::ManagedPolicy"
    Properties:
      Description: Policy for lambdas to run inside the VPC
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Sid: "VPCExecution"
            Action:
              - ec2:CreateNetworkInterface
              - ec2:DeleteNetworkInterface
            Effect: "Allow"
            Resource:
              - !Sub "arn:\${AWS::Partition}:ec2:\${AWS::Region}:\${AWS::AccountId}:*"
          - Sid: "VPCDescribe"
            Action:
              - ec2:DescribeNetworkInterfaces
            Effect: "Allow"
            Resource: "*" # Per AWS IAM console, nothing but * works here
    Metadata:
      cfn_nag:
        rules_to_suppress:
          - id: W13
            reason: Cannot use anything except * for ec2:DescribeNetworkInterfaces, AWS IAM console reports that an account specific ARN with * will affect no resources
  LambdaManagedPolicy:
    Type: "AWS::IAM::ManagedPolicy"
    Properties:
      Description: Policy for lambdas to write logs
      PolicyDocument:
        Version: "2012-10-17"
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
Outputs:
  StackName:
    Description: "Stack name."
    Value: !Sub "\${AWS::StackName}"
  NumberOfAZs:
    Description: "Number of AZs"
    Value: !If
      - HasThirdAZ
      - 3
      - 2
    Export:
      Name: !Sub "\${AWS::StackName}-NumberOfAZs"
  AZs:
    Description: "List of AZs"
    Value: !If
      - HasThirdAZ
      - !Join
        - ","
        - - !Select [0, !GetAZs ""]
          - !Select [1, !GetAZs ""]
          - !Select [2, !GetAZs ""]
      - !Join
        - ","
        - - !Select [0, !GetAZs ""]
          - !Select [1, !GetAZs ""]
    Export:
      Name: !Sub "\${AWS::StackName}-AZs"
  CidrBlock:
    Description: "The set of IP addresses for the VPC."
    Value: !GetAtt "VPC.CidrBlock"
    Export:
      Name: !Sub "\${AWS::StackName}-CidrBlock"
  VPC:
    Description: "VPC."
    Value: !Ref VPC
    Export:
      Name: !Sub "\${AWS::StackName}-VPC"
  InternetGateway:
    Description: "InternetGateway."
    Value: !Ref InternetGateway
    Export:
      Name: !Sub "\${AWS::StackName}-InternetGateway"
  Subnets:
    Description: "Subnets"
    Value: !If
      - HasThirdAZ
      - !Join [",", [!Ref SubnetA, !Ref SubnetB, !Ref SubnetC]]
      - !Join [",", [!Ref SubnetA, !Ref SubnetB]]
    Export:
      Name: !Sub "\${AWS::StackName}-Subnets"
  RouteTables:
    Description: "Route tables"
    Value: !If
      - HasThirdAZ
      - !Join [",", [!Ref RouteTableA, !Ref RouteTableB, !Ref RouteTableC]]
      - !Join [",", [!Ref RouteTableA, !Ref RouteTableB]]
    Export:
      Name: !Sub "\${AWS::StackName}-RouteTables"
  SNSAlarmTopic:
    Description: "SNS Alarm Topic for identifying issues with the system."
    Value: !Ref SNSAlarmTopic
    Export:
      Name: !Sub "\${AWS::StackName}-SNSAlarmTopic"
  SNSAlarmKey:
    Description: "SNS Alarm Topic key for SNS Topic"
    Value: !Ref SNSAlarmKey
    Export:
      Name: !Sub "\${AWS::StackName}-SNSAlarmKey"
  SNSAlarmTopicName:
    Description: "SNS Alarm Topic name."
    Value: !GetAtt SNSAlarmTopic.TopicName
    Export:
      Name: !Sub "\${AWS::StackName}-SNSAlarmTopicName"
  VPCLambdaManagedPolicy:
    Description: "VPC Lambda Managed Policy"
    Value: !Ref VPCLambdaManagedPolicy
    Export:
      Name: !Sub "\${AWS::StackName}-VPCLambdaManagedPolicy"
  LambdaManagedPolicy:
    Description: "Lambda Managed Policy"
    Value: !Ref LambdaManagedPolicy
    Export:
      Name: !Sub "\${AWS::StackName}-LambdaManagedPolicy"
`