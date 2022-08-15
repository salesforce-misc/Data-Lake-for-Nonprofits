import { By } from "selenium-webdriver";
import { Builder } from "@tpio/javascript-opensdk";

const waitFor3Seconds = async () => new Promise(r => setTimeout(r, 3000));

describe("App", () => {
  const testUrl = "http://localhost:3000";

  let driver;

  beforeEach(async () => {
    driver = await new Builder().forBrowser("chrome").withProjectName("Datalake for Nonprofits, Powered by AWS").withJobName("Run the Application").build();
  });

  afterEach(async () => {
    await driver.quit();
  });

  it("application runs properly", async () => {
    // Go to home page
    await driver.get(testUrl);
    await driver.findElement(By.css("#h2-title")).isDisplayed();
    await waitFor3Seconds();
    await driver.findElement(By.css("#home-btn-lets-go")).isDisplayed();
    
    // await driver.findElement(By.css("#lastName")).sendKeys("Doe");
    await driver.findElement(By.css("#home-btn-lets-go")).click();
    await waitFor3Seconds();

    // Go to step1
    await driver.get(`${testUrl}/steps/1`);
    await driver.findElement(By.css("#h2-title")).isDisplayed();
    await waitFor3Seconds();
    await driver.findElement(By.css("#step1-btn-need-assistance-yes")).click();
    await waitFor3Seconds();
    await driver.findElement(By.css("#step1-btn-need-assistance-yes")).click();
    await waitFor3Seconds();
    await driver.findElement(By.css("#step1-btn-need-assistance-no")).click();
    await new Promise(r => setTimeout(r, 30000));
  });
});
