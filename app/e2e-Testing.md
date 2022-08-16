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

## Further development for e2e testing

Even though, e2e tests in `App.e2e.spec.js` file run the most common use cases, more specific e2e test cases can be developed using the same pattern.