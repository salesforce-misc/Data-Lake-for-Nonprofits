import { Builder, By, Key, until, WebDriver } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome";
import * as firefox from "selenium-webdriver/firefox";
import * as safari from "selenium-webdriver/safari";
import * as edge from "selenium-webdriver/edge";
import * as edgedriver from "@sitespeed.io/edgedriver";

import { awsRegions } from "data/aws-regions";

const waitFor = async (s: number) => new Promise((r) => setTimeout(r, s));

// This is a local folder in your computer to save screenshots
// Leave blank to not take screenshots
const screenshotFolder = "/Users/smert/Desktop/";
const testTime = Date.now();

// Set timeout to 60 minutes since this is a long running test
const timeout = 4 * 60 * 60 * 1000;
jest.setTimeout(timeout);

// If a number greater than 100 is set then the timeout should be set high enough to complete the testing on line #18
const numberOfAdditionalObjects = 0;

const useChrome = (driver: WebDriver) => {
  let options = new chrome.Options();
  return new Builder().setChromeOptions(options).forBrowser("chrome").build();
};

const useFirefox = (driver: WebDriver) => {
  let options = new firefox.Options();
  return new Builder().setFirefoxOptions(options).forBrowser("firefox").build();
};

const useSafari = (driver: WebDriver) => {
  let options = new safari.Options();
  return new Builder().setSafariOptions(options).forBrowser("safari").build();
};

const useEdge = (driver: WebDriver) => {
  let options = new edge.Options();
  return new Builder()
    .setEdgeOptions(options)
    .forBrowser("MicrosoftEdge")
    .setEdgeService(new edge.ServiceBuilder(edgedriver.binPath("/usr/local/bin/msedgedriver")))
    .build();
};

describe("App", () => {
  const testUrl = "http://localhost:3000";

  let driver: WebDriver;

  beforeEach(async () => {
    driver = await useChrome(driver);
  });

  afterEach(async () => {
    await driver.quit();
  });

  test("e2e testing", async () => {
    const region = awsRegions[0].name; // You can use just the region name as us-east-1 as well.
    await AppTest(driver, testUrl, region);
  });
});

const AppTest = async (driver: WebDriver, testUrl: string, region: string) => {
  // Maximize the window
  driver.manage().window().maximize();

  // Go to home page
  await driver.get(testUrl);
  await driver.findElement(By.id("home")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();
  await driver.findElement(By.id("home-btn-lets-go")).isDisplayed();

  if (screenshotFolder) {
    // Take a screenshot
    await driver.takeScreenshot().then((image) => {
      require("fs").writeFileSync(screenshotFolder + testTime + " e2e home.png", image, "base64");
    });
  }

  await driver.findElement(By.id("home-btn-lets-go")).click();

  // Go to step1
  await driver.wait(() => until.urlIs(`${testUrl}/steps/1`));

  await driver.findElement(By.id("step1")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();
  await driver.findElement(By.id("step1-btn-need-assistance-no")).click();

  await waitFor(500);

  await driver.findElement(By.id("accessKeyId")).clear();
  await driver.findElement(By.id("accessKeyId")).sendKeys(process.env?.REACT_APP_ACCESS_KEY || "");
  await driver.findElement(By.id("secretAccessKey")).clear();
  await driver.findElement(By.id("secretAccessKey")).sendKeys(process.env?.REACT_APP_SECRET_KEY || "");

  // Select the region
  await driver.findElement(By.className(region)).click();

  if (screenshotFolder) {
    // Take a screenshot
    await driver.takeScreenshot().then((image) => {
      require("fs").writeFileSync(screenshotFolder + testTime + " e2e step1.png", image, "base64");
    });
  }

  await driver.findElement(By.id("step1-btn-next")).click();

  // Go to step2
  await driver.wait(until.urlIs(`${testUrl}/steps/2`));

  await driver.findElement(By.id("step2")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();
  await driver.findElement(By.id("step2-btn-appflow-created-yes")).click();

  await driver.wait(until.elementIsNotVisible(driver.findElement(By.id("appflow-connection-loader"))));

  await waitFor(2000);
  await driver.wait(until.elementIsVisible(driver.findElement(By.id("step2-h2-select-connection"))));

  // Reload connection
  await driver.findElement(By.id("step2-button-reload-connections")).click();

  // Select the connection
  // We use option[2] since the first one is not a connection
  await driver.findElement(By.xpath("//select[@id='appFlowConnectionName']/option[2]")).click();

  if (screenshotFolder) {
    // Take a screenshot
    await driver.takeScreenshot().then((image) => {
      require("fs").writeFileSync(screenshotFolder + testTime + " e2e step2.png", image, "base64");
    });
  }

  await driver.findElement(By.id("step2-btn-next")).click();

  // // Go to step3
  await driver.wait(until.urlIs(`${testUrl}/steps/3`));

  await driver.findElement(By.id("step3")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();

  await driver.wait(until.elementIsEnabled(driver.findElement(By.id("step3-btn-next"))));

  await waitFor(500);
  const radio3 = await driver.findElement(By.id("radio3"));
  await radio3.findElement(By.xpath("./..")).click();

  for (var i = 0; i < numberOfAdditionalObjects; i++) {
    await driver.findElement(By.xpath("//table[@id='objects-table']/tbody/tr[1]/td[1]/div")).click();
    await waitFor(1500);
  }

  await waitFor(500);

  if (screenshotFolder) {
    // Take a screenshot
    await driver.takeScreenshot().then((image) => {
      require("fs").writeFileSync(screenshotFolder + testTime + " e2e step3.png", image, "base64");
    });
  }

  await driver.findElement(By.id("step3-btn-next")).click();

  // Go to step4
  await driver.wait(until.urlIs(`${testUrl}/steps/4`));

  await driver.findElement(By.id("step4")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();

  await waitFor(1000);

  if (screenshotFolder) {
    // Take a screenshot
    await driver.takeScreenshot().then((image) => {
      require("fs").writeFileSync(screenshotFolder + testTime + " e2e step4.png", image, "base64");
    });
  }

  await driver.findElement(By.id("step4-btn-next")).click();

  // Go to step5
  await driver.wait(until.urlIs(`${testUrl}/steps/5`));

  await driver.findElement(By.id("step5")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();

  const provisionBox = await driver.findElement(By.id("step5-provision"));
  await driver.executeScript("arguments[0].scrollIntoView(true);", provisionBox);

  // Wait until either the provisioning is completed or 45 minutes
  await driver.wait(until.elementIsEnabled(driver.findElement(By.id("step5-btn-next"))), timeout);

  await waitFor(1000);

  if ((await driver.findElements(By.name("Try Again"))).keys.length > 0 && screenshotFolder) {
    // Take a screenshot for error page
    await driver.takeScreenshot().then((image) => {
      require("fs").writeFileSync(screenshotFolder + testTime + " e2e step5 error.png", image, "base64");
    });

    await driver.quit();
  }

  if (screenshotFolder) {
    // Take a screenshot
    await driver.takeScreenshot().then((image) => {
      require("fs").writeFileSync(screenshotFolder + testTime + " e2e step5.png", image, "base64");
    });
  }

  await driver.findElement(By.id("step5-btn-next")).click();

  // Go to step6
  await driver.wait(until.urlIs(`${testUrl}/steps/6`));

  await driver.findElement(By.id("step6")).isDisplayed();
  await driver.findElement(By.id("h2-title")).isDisplayed();

  // Expand the content
  await driver.findElement(By.id("step6-tableau-online")).click();

  const posgtresAccessInformation = await driver.findElement(By.id("step6-postgresql-access-information"));
  expect(await posgtresAccessInformation.getText()).toBe("PostgreSQL Access Information");

  await waitFor(1000);
  await driver.executeScript("arguments[0].scrollIntoView(true);", posgtresAccessInformation);

  if (screenshotFolder) {
    // Take a screenshot
    await driver.takeScreenshot().then((image) => {
      require("fs").writeFileSync(screenshotFolder + testTime + " e2e step6 tableau online.png", image, "base64");
    });
  }

  // Expand the content
  await driver.findElement(By.id("step6-tableau-desktop")).click();

  const athenaAccessInformation = await driver.findElement(By.id("step6-athena-access-information"));
  expect(await athenaAccessInformation.getText()).toBe("Amazon Athena Access Information");

  await waitFor(1000);
  await driver.executeScript("arguments[0].scrollIntoView(true);", athenaAccessInformation);

  if (screenshotFolder) {
    // Take a screenshot
    await driver.takeScreenshot().then((image) => {
      require("fs").writeFileSync(screenshotFolder + testTime + " e2e step6 tableau desktop.png", image, "base64");
    });
  }

  await waitFor(500);
};
