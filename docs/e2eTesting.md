# e2e Testing

We use <a href="https://www.selenium.dev/">Selenium</a> web driver which is an open source test automation tool for e2e testing.

More details about the Selenim WebDriver can be found <a href="https://www.selenium.dev/documentation/webdriver/">here</a>.

If you are new to Selenium, you can get started <a href="https://www.selenium.dev/documentation/webdriver/getting_started/">here</a>.

## Getting Started

In order to run e2e tests in your local environment, follow these steps.

- Since e2e tests need the asset url, you need to deploy the application into AWS Amplify first.
- The application comes with <a href="https://yarnpkg.com/package/selenium-webdriver">Selenium WebDriver Javascript library</a>. So if you haven't done yet, go to `app` folder and run `yarn install`.
- Download browser driver(s) from <a href="https://www.selenium.dev/documentation/webdriver/getting_started/install_drivers/">here</a>. Installation may vary depending on your operating system. Please follow the instructions in this <a href="https://www.selenium.dev/documentation/webdriver/getting_started/install_drivers/">url</a> for your choice of browser.
- Create a `.env` file in the root folder with the following entries. Replace the values for your own environment.
  ```shell
  REACT_APP_ASSET_WEBSITE_URL=<AMPLIFY_HOST_URL>
  REACT_APP_ACCESS_KEY=<AWS_ACCESS_KEY>
  REACT_APP_SECRET_KEY=<AWS_SECRET_KEY>
  ```
- Run the application locally using the command `yarn start` under the `app` folder.
- Run e2e tests using the command `yarn test:e2e`

## Supported regions and browsers

Application has been tested successfully using e2e automated testing for following region and browsers

| Region/Browser           | Applied Qouta |                | Chrome  | Firefox | Safari  | Edge    |
| ------------------------ | ------------- | -------------- | ------- | ------- | ------- | ------- |
| US East (N. Virginia)    | 10            | us-east-1      | &check; | &check; | &check; | &check; |
| US East (Ohio)           | 1000          | us-east-2      | &check; | &check; | &check; | &check; |
| US West (N. California)  | 1000          | us-west-1      | &check; | &check; | &check; | &check; |
| US West (Oregon)         | 1000          | us-west-2      | &check; | &check; | &check; | &check; |
| Asia Pacific (Mumbai)    | 1000          | ap-south-1     | &check; | &check; | &check; | &check; |
| Asia Pacific (Seoul)     | 1000          | ap-northeast-2 | &check; | &check; | &check; | &check; |
| Asia Pacific (Singapore) | 1000          | ap-southeast-1 | &check; | &check; | &check; | &check; |
| Asia Pacific (Sydney)    | 1000          | ap-southeast-2 | &check; | &check; | &check; | &check; |
| Asia Pacific (Tokyo)     | 1000          | ap-northeast-1 | &check; | &check; | &check; | &check; |
| Canada (Central)         | 1000          | ca-central-1   | &check; | &check; | &check; | &check; |
| Europe (Frankfurt)       | 1000          | eu-central-1   | &check; | &check; | &check; | &check; |
| Europe (Ireland)         | 1000          | eu-west-1      | &check; | &check; | &check; | &check; |
| Europe (London)          | 1000          | eu-west-2      | &check; | &check; | &check; | &check; |
| Europe (Paris)           | 10            | eu-west-3      | &check; | &check; | &check; | &check; |

## Further development for e2e testing

Even though, e2e test in `App.e2e.spec.ts` file run the most common use cases, more specific e2e tests can be developed using the same pattern.

## Warning

Keep in mind that running e2e tests will incur cost in your AWS account.

## How to delete a datalake

To delete the datalake and all resources provisioned, run the following command in `app` folder.

`yarn delete-datalake`

You will have to select the AWS Region as well as the AWS profile to connect to your AWS account. Lastly, you will have to input the datalake installation ID to initiate deletion.

## Salesforce limits during Testing

During testing, certain limits may affect the application. One such limit is the refresh token limit per connected app which is 5. This results in AppFlow connectors to Salesforce needing to be refreshed/reconnected which may affect periodic data imports. In real use cases, this does not affect NPO Users since they are not expected to use more than 5 connectors. However, this limit could be exceeded during testing. More details on this can be read <a href="https://developer.salesforce.com/forums/?id=9060G000000UUjlQAG">here</a>
