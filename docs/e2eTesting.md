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

| Region/Browser           |                | Chrome  | Firefox | Safari | Edge |
| ------------------------ | -------------- | ------- | ------- | ------ | ---- |
| US East (N. Virginia)    | us-east-1      | &check; | &check; |        |      |
| US East (Ohio)           | us-east-2      | &check; | &check; |        |      |
| US West (N. California)  | us-west-1      | &check; | &check; |        |      |
| US West (Oregon)         | us-west-2      | &check; | &check; |        |      |
| Asia Pacific (Mumbai)    | ap-south-1     | &check; | &check; |        |      |
| Asia Pacific (Seoul)     | ap-northeast-2 | &check; | &check; |        |      |
| Asia Pacific (Singapore) | ap-southeast-1 | &check; | &check; |        |      |
| Asia Pacific (Sydney)    | ap-southeast-2 | &check; | &check; |        |      |
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
