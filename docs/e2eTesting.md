# e2e Testing

We are using <a href="https://testproject.io/">TestProject</a> which is a free, open source test automation platform for e2e testing with <a href="https://www.selenium.dev/documentation/webdriver/">Selenium WebDriver</a> using <a href="https://github.com/testproject-io/javascript-opensdk">TestProject Javascript OpenSDK</a> that works perfectly with Jest.

## Getting Started

In order to run e2e tests in your local environment, follow these steps

- Create a free <a href="https://testproject.io">TestProject account</a>
- Download a <a href="https://app.testproject.io/#/download">TestProject agent</a> in your device. You can either download a docker option or a desktop. Both works the same way. We recommend desktop option if you are on Mac/Linux, docker option if you are on Windows.
- Once downloaded, install and start running the agent.
- <a href="https://app.testproject.io/#/agents">Register</a> your agent to link your agent to your TestProject account.
- Generate a developer token to use in the project. Create `.env` file in your `app` root folder and add your developer token as following.
  ```shell
  TP_DEV_TOKEN=<YOUR_DEVELOPER_TOKEN>
  ```
- Deploy your application using Amplify. You may want to run some basic e2e tests using localhost but we recommend to use a deployed application for the full experience.
- Update `testUrl` variable in `App.e2e.spec.js` file on line 7 using your deployment url.
- Run e2e tests using the command `yarn test:e2e`

## Supported regions and browsers

Application has been tested successfully using e2e automated testing for following region and browsers

| Region/Browser           |                | Chrome  | Firefox | Safari | Edge |
| ------------------------ | -------------- | ------- | ------- | ------ | ---- |
| US East (N. Virginia)    | us-east-1      | &check; | &check; |        |      |
| US East (Ohio)           | us-east-2      | &check; |         |        |      |
| US West (N. California)  | us-west-1      | &check; |         |        |      |
| US West (Oregon)         | us-west-2      | &check; |         |        |      |
| Asia Pacific (Mumbai)    | ap-south-1     | &check; |         |        |      |
| Asia Pacific (Seoul)     | ap-northeast-2 | &check; |         |        |      |
| Asia Pacific (Singapore) | ap-southeast-1 | &check; |         |        |      |
| Asia Pacific (Sydney)    | ap-southeast-2 | &check; |         |        |      |
| Asia Pacific (Tokyo)     | ap-northeast-1 | &check; |         |        |      |
| Canada (Central)         | ca-central-1   | &check; |         |        |      |
| Europe (Frankfurt)       | eu-central-1   | &check; |         |        |      |
| Europe (Ireland)         | eu-west-1      | &check; |         |        |      |
| Europe (London)          | eu-west-2      | &check; |         |        |      |
| Europe (Paris)           | eu-west-3      | &check; |         |        |      |

## Further development for e2e testing

Even though, e2e test in `App.e2e.spec.ts` file run the most common use cases, more specific e2e tests can be developed using the same pattern.

## Warning

Keep in mind that running e2e tests will incur cost in your AWS account.
