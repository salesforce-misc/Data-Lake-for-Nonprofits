# ­­

# Data Lake for Nonprofits, Powered by AWS

# User Guide

Prepared for Salesforce by AWS Professional Services Team

Aug 2022

## 1. Introduction

This document provides guidance for setting up a Datalake for Nonprofits Application.

## 2. Setting up the App

The Datalake for Nonprofits application has to be hosted in an AWS account. For this,

The app needs to be first deployed as a static website using AWS Amplify.

Sign in to the AWS Management Console and open the [Amplify console](https://us-east-1.console.aws.amazon.com/amplify/home?region=us-east-1#/). Manually deploy the app following the steps here:

[https://docs.aws.amazon.com/amplify/latest/userguide/manual-deploys.html#drag-and-drop](https://docs.aws.amazon.com/amplify/latest/userguide/manual-deploys.html#drag-and-drop)

The zip file to upload with the manual deployment should be generated with the build process. Alternatively, you can refer to instructions in the code on generating the build for manual deployment. This build should be made available to users in GitHub to download.

![](RackMultipart20220901-1-ish1lc_html_af51db180c152778.png) ![](RackMultipart20220901-1-ish1lc_html_2dbc0aeaddf25c53.png)

It typically takes a few minutes to deploy the app after which a URL to the Datalake app is presented. ­Click on the URL to load the 'Datalake for Nonprofits' app; set up the data lake and import data in 6 steps.

The image below shows the URL that was generated in this instance and the welcome screen showing the user what to expect with an outline of the 6 steps to be completed through the wizard like UI.

![](RackMultipart20220901-1-ish1lc_html_6b967e52f97a05d3.png)

Click on 'Lets Go' Button for first time setup. You could use the 'Resume' option if you have already configured the connections.

## 3. Datalake Setup in 6 Steps

## 3.1 Step 1

In Step 1, we connect to the NPO User's AWS Account. The Datalake App requires Access Key ID & Secret Access key for an IAM Admin user.

![](RackMultipart20220901-1-ish1lc_html_60a0f751b5f771dc.png)
![alt text](https://github.com/salesforce-misc/Data-Lake-for-Nonprofits/blob/main/app/src/images/appflow-connection-01.png)

If the user has never created these, the app shows guidance on how to login to AWS Console and use Identity and Access Management (IAM) to pick the IAM user with admin permissions. The UI then guides the user to create and download the access keys. Once created, the access key information is used to complete Step 1.

![](RackMultipart20220901-1-ish1lc_html_5d90535a6a66520b.png)

![](RackMultipart20220901-1-ish1lc_html_2b51fda3823ec46b.png)

At the bottom of Step 1, there is a drop-down box to select the region where the data lake should be provisioned. Make sure to choose the right region where you would like to create the connection.

![](RackMultipart20220901-1-ish1lc_html_47b3cae505cdde12.png)

## 3.2 Step 2

In Step 2, the 'Datalake for Nonprofits' app will gather credentials to connect to the NPO Salesforce Organization. For AWS to access the NPO's Salesforce data, we will need user authorization. For this, the app gives guidance to the user to create a dedicated Salesforce user with the necessary profile or permission set that provides:

- Access to the objects and fields in Salesforce that you plan to sync
- System Permission: API Enabled
- System Permission: Manage Connected Apps

This is likely a user with a System Administrator or similar profile. Additionally, the app guides the user to setup Amazon AppFlow which is a service that allows AWS to connect to Salesforce. The user is guided to create a Salesforce connection, sign in to Salesforce and authorize access. The image below shows this in-app guidance.

![](RackMultipart20220901-1-ish1lc_html_cedbbc903477c445.png)

Once the Salesforce connection is created through Amazon AppFlow, a drop-down box will populate the list of connections that can be selected for use. Connections are region-specific and the list will show only the connections that are created in the selected region. Once a connection is selected from the drop-down box, the NPO User can proceed to Step 3.

![](RackMultipart20220901-1-ish1lc_html_3ef72b934cb25ab.png)

## 3.3 Step 3

![](RackMultipart20220901-1-ish1lc_html_14f0dff4b0b6a6f0.png)

During step 3, Salesforce data schema is retrieved to show the NPSP data model. An NPO organization can have standard objects, core NPSP objects as well as custom objects. The retrieved schema is used to show the list of objects to the NPO user to be included or excluded as desired.

![](RackMultipart20220901-1-ish1lc_html_75e733780acaf75f.png) ![](RackMultipart20220901-1-ish1lc_html_74871983f94c5333.png)

In Step 3, the NPO User can click on default options to setup the datalake and periodic data import. A typical NPO User is expected to click on all default options to proceed to Step 4. However, an advanced NPO User can customize the objects and fields to be included or excluded in the data import. The image on the left below shows a custom object being added for import and the image on the right, shows fields being excluded from the Account object.

![](RackMultipart20220901-1-ish1lc_html_a08eb5ae7bcfe881.png) ![](RackMultipart20220901-1-ish1lc_html_df5609d7b26dceb4.png)

A default monthly sync is recommended. However, the user can select a weekly or even a daily sync and choose the date and the time of the sync. Note that we don't recommend a daily sync option for a large NPO Organization as this could incur additional costs.

## 3.4 Step 4

In Step 4, the user can review the data lake setup and data import options and confirm the changes they've done (if any). This step is where the NPO User is allowed to go back to previous step to make any other needed changes before confirming the setup of resources for the data lake.

![](RackMultipart20220901-1-ish1lc_html_b3445dff7111bf86.png) ![](RackMultipart20220901-1-ish1lc_html_a9d248613d8f836b.png)

Once review is complete, the NPO User can click "Next" to start provisioning the resources in Step 5.

## 3.5 Step 5

Step 5 is where the data lake is provisioned and the data is imported at the end. This can take several minutes to several hours depending on the size of the data in the NPO Organization. We caution the user to leave the EZ Datalake app running in the browser while the data lake is being provisioned. However, there is a resume feature described in Section 4.1 where a user can resume the data lake provisioning if the browser is accidentally closed.

![](RackMultipart20220901-1-ish1lc_html_b2c546d720df33d.png)

## 3.6 Step 6

Once the data lake is setup, in Step 6, the NPO Users can create and manage IAM users to grant them access to Tableau Desktop. These users will have _least privilege_ credentials to access only the data and resources they need. In Step 6, the user can also view the Data Lake access information and instructions for Tableau Desktop installation and access for Windows and Mac, access CloudWatch Dashboard and subscribe to systems notifications.

![](RackMultipart20220901-1-ish1lc_html_6c77ad9d9a9fe945.png) ![](RackMultipart20220901-1-ish1lc_html_5e21a66925371404.png)

Amazon CloudWatch dashboard can be used to monitor your resources in a single view. The screenshot below shows metrics for the user to monitor the scheduled data import to see how long it took to run and how many records were imported by clicking on 'Open CloudWatch Dashboard' button.

![](RackMultipart20220901-1-ish1lc_html_cd5570b2810014f3.png)

![](RackMultipart20220901-1-ish1lc_html_618f3f3754493fe0.png)

Additionally, users can subscribe to system notifications to be alerted if a problem arises.

## 4. Resume Feature

The resume feature allows an NPO System Administrator to continue deployment if the app was closed during any of the five initial steps. Additionally, the resume feature can also be used to retrieve the Data Lake provisioning information after deployment and also a start a new datalake deployment if that is desired.

## 4.1 Resume while deployment is in progress

During any of the six steps with the Datalake App, it is recommended that the NPO User keep the Nonprofits Datalake app in the browser running till the datalake is deployed. However, if the user does accidentally close the browser, the "resume" feature can help pick up where the deployment was left off. Note that depending on which step the user is in when the browser is closed, the app will resume in the same step.

## 4.2 Resume after deployment

Once the datalake is deployed, the "resume" feature can be used for the NPO User to retrieve details on the datalake that was setup earlier. Additionally, the NPO System Administrator can use the app to create and manage IAM users to grant them access to Tableau Desktop. These users will have _least privilege_ credentials to access only the data and resources they need. The screenshots below show how the NPO System Administrator can enter their IAM Admin Key ID and Secret Access Key to retrieve the details of the datalake from Step 6 and manage users for Tableau Desktop access, view Data Lake access information and retrieve instructions for Tableau Desktop, access CloudWatch Dashboard and subscribe to systems notifications in Step 6.

![](RackMultipart20220901-1-ish1lc_html_bb23b876b132150.png) ![](RackMultipart20220901-1-ish1lc_html_ba833a89b6c3385c.png)

##

![](RackMultipart20220901-1-ish1lc_html_ebd8c33565d132b8.png) ![](RackMultipart20220901-1-ish1lc_html_c6fa2a5c4911dfe4.png)

## 4.3 Resume another datalake

Typically, an NPO User is expected to setup a single datalake. If for any reason, a new datalake needs to be setup, the same app can be utilized to deploy another datalake. This can be useful perhaps if a datalake for a sandbox needs to be setup first before moving to production organization. The "resume" feature can then be used to view and manage the multiple datalake as show below in the screenshots.

![](RackMultipart20220901-1-ish1lc_html_aa14747fa97a739a.png) ![](RackMultipart20220901-1-ish1lc_html_b6e717d2062adb6.png)

## 5. Data Consistency / Data Deletion

Data can be deleted in Salesforce in multiple ways triggering soft deletes and hard deletes. The Datalake app ensures data consistency with the data in the Salesforce by performing full data import on each periodic sync operation.
