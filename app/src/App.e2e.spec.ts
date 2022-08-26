import { Builder, By, Key, until, WebDriver } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome";
// const chrome = require("selenium-webdriver/chrome");

const waitFor = async (s: number) => new Promise((r) => setTimeout(r, s));

// Set timeout to 60 minutes since this is a long running test
jest.setTimeout(60 * 60 * 1000);

describe("App", () => {
  const testUrl = "http://localhost:3000";

  let driver: WebDriver;

  beforeEach(async () => {
    let options = new chrome.Options();
    driver = await new Builder().setChromeOptions(options).forBrowser("chrome").build();
  });

  afterEach(async () => {
    await driver.quit();
  });

  test("e2e testing", async () => {
    await AppTest(driver, testUrl, "us-east-1");
  });
});

const AppTest = async (driver: WebDriver, testUrl: string, region: string) => {
  // Go to home page
  await driver.get(testUrl);
  await driver.findElement(By.id("home")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();
  await driver.findElement(By.id("home-btn-lets-go")).isDisplayed();

  await driver.findElement(By.id("home-btn-lets-go")).click();

  // Go to step1
  await driver.wait(() => until.urlIs(`${testUrl}/steps/1`));

  await driver.findElement(By.id("step1")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();
  await driver.findElement(By.id("step1-btn-need-assistance-no")).click();

  await waitFor(500);

  await driver.findElement(By.id("accessKeyId")).clear();
  await driver.findElement(By.id("accessKeyId")).sendKeys(process.env?.AWS_ACCESS_KEY || "");
  await driver.findElement(By.id("secretAccessKey")).clear();
  await driver.findElement(By.id("secretAccessKey")).sendKeys(process.env?.AWS_SECRET_KEY || "");

  // Select the region
  await driver.findElement(By.className(region)).click();
  await driver.findElement(By.id("step1-btn-next")).click();

  // Go to step2
  await driver.wait(until.urlIs(`${testUrl}/steps/2`));

  await driver.findElement(By.id("step2")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();
  await driver.findElement(By.id("step2-btn-appflow-created-yes")).click();

  await waitFor(500);
  await driver.wait(until.elementIsVisible(driver.findElement(By.id("step2-h2-select-connection"))));

  // Reload connection
  await driver.findElement(By.id("step2-button-reload-connections")).click();

  // Select the connection
  // We use option[2] since the first one is not a connection
  await driver.findElement(By.xpath("//select[@id='appFlowConnectionName']/option[2]")).click();
  await driver.findElement(By.id("step2-btn-next")).click();

  // // Go to step3
  await driver.wait(until.urlIs(`${testUrl}/steps/3`));

  await driver.findElement(By.id("step3")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();

  await driver.wait(until.elementIsEnabled(driver.findElement(By.id("step3-btn-next"))));

  await waitFor(500);
  await driver.findElement(By.id("step3-btn-next")).click();

  // Go to step4
  await driver.wait(until.urlIs(`${testUrl}/steps/4`));

  await driver.findElement(By.id("step4")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();

  await waitFor(1000);
  await driver.findElement(By.id("step4-btn-next")).click();

  // Go to step5
  await driver.wait(until.urlIs(`${testUrl}/steps/5`));

  await driver.findElement(By.id("step5")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();

  await driver.wait(until.elementIsEnabled(driver.findElement(By.id("step5-btn-next"))));
  await driver.findElement(By.id("step5-btn-next")).click();

  // Go to step6
  await driver.wait(until.urlIs(`${testUrl}/steps/6`));

  await driver.findElement(By.id("step6")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();

  await waitFor(500);
};
