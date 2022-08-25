import { By, until } from "selenium-webdriver";
import { Builder } from "@tpio/javascript-opensdk";
import BaseDriver from "@tpio/javascript-opensdk/dist/src/sdk/drivers/web/base/baseDriver";

describe("App", () => {
  const testUrl = "http://localhost:3000";

  let driver: BaseDriver;

  beforeEach(async () => {
    driver = await new Builder()
      .forBrowser("chrome")
      .withToken(process.env?.TP_DEV_TOKEN || "")
      .withProjectName("Datalake for Nonprofits, Powered by AWS")
      .withJobName("Run the Application")
      .build();
  });

  afterEach(async () => {
    await driver.quit();
  });

  test("application runs in us-east-1", async () => {
    // Go to home page
    await driver.get(testUrl);
    await driver.findElement(By.css("#home")).isDisplayed();
    await driver.findElement(By.css("#h2-title")).isDisplayed();
    await driver.findElement(By.css("#home-btn-lets-go")).isDisplayed();

    await driver.findElement(By.css("#home-btn-lets-go")).click();

    // Go to step1
    try {
      await driver.wait(until.urlIs(`${testUrl}/steps/1`), 30000);
    } catch (e) {
      console.log(e);
    }

    await driver.findElement(By.css("#step1")).isDisplayed();
    await driver.findElement(By.css("#h2-title")).isDisplayed();
    await driver.findElement(By.css("#step1-btn-need-assistance-yes")).click();
    await driver.findElement(By.css("#step1-btn-need-assistance-yes")).click();
    await driver.findElement(By.css("#step1-btn-need-assistance-no")).click();

    if (!process.env?.REACT_APP_ACCESS_KEY) {
      await driver.findElement(By.css("#accessKeyId")).sendKeys(process.env?.AWS_ACCESS_KEY || "");
    }
    if (!process.env?.REACT_APP_SECRET_KEY) {
      await driver.findElement(By.css("#secretAccessKey")).sendKeys(process.env?.AWS_SECRET_KEY || "");
    }

    await driver.findElement(By.css("#region")).click();
    await driver.findElement(By.css("#region")).click();
    await driver.findElement(By.css("#region"));
    await driver.findElement(By.className("us-east-1")).click();
    await driver.findElement(By.css("#step1-btn-next")).click();

    // Go to step2
    try {
      await driver.wait(until.urlIs(`${testUrl}/steps/2`), 30000);
    } catch (e) {
      console.log(e);
    }

    await driver.findElement(By.css("#step2")).isDisplayed();
    await driver.findElement(By.css("#h2-title")).isDisplayed();
    await driver.findElement(By.css("#step2-btn-appflow-created-yes")).click();
    await driver.findElement(By.css("#step2-h2-select-connection")).isDisplayed();
    await driver.findElement(By.css("#step2-button-reload-connections")).click();
    await driver.findElement(By.css("#step2-btn-next")).click();

    // Go to step3
    try {
      await driver.wait(until.urlIs(`${testUrl}/steps/3`), 30000);
    } catch (e) {
      console.log(e);
    }

    await driver.findElement(By.css("#step3")).isDisplayed();
    await driver.findElement(By.css("#h2-title")).isDisplayed();

    try {
      const statusText = await driver.findElement(By.css("#step3-store-status-info"));
      await driver.wait(until.elementTextContains(statusText, "100"));
      const step3Next = await driver.findElement(By.css("#step3-btn-next"));
      await driver.wait(until.elementIsEnabled(step3Next));
    } catch (e) {
      console.log(e);
    }

    await driver.findElement(By.css("#step3-btn-next")).click();

    // Go to step4
    try {
      await driver.wait(until.urlIs(`${testUrl}/steps/4`), 30000);
    } catch (e) {
      console.log(e);
    }

    await driver.findElement(By.css("#step4")).isDisplayed();
    await driver.findElement(By.css("#h2-title")).isDisplayed();
  });
});
