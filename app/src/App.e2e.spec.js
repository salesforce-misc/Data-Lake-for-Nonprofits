import { By } from "selenium-webdriver";
import { Builder } from "@tpio/javascript-opensdk";

const waitFor3Seconds = async () => new Promise(r => setTimeout(r, 1000));

describe("App", () => {
  // const testUrl = "http://localhost:3000";
  const testUrl = "https://dev.d1nqubar29ak76.amplifyapp.com/";

  let driver;

  beforeEach(async () => {
    driver = await new Builder().forBrowser("chrome").withProjectName("Datalake for Nonprofits, Powered by AWS").withJobName("Run the Application").build();
  });

  afterEach(async () => {
    await driver.quit();
  });

  test("application runs properly", async () => {
    // Go to home page
    await driver.get(testUrl);
    await driver.findElement(By.css("#home")).isDisplayed();
    await driver.findElement(By.css("#h2-title")).isDisplayed();
    await waitFor3Seconds();
    await driver.findElement(By.css("#home-btn-lets-go")).isDisplayed();
    
    // await driver.findElement(By.css("#lastName")).sendKeys("Doe");
    await driver.findElement(By.css("#home-btn-lets-go")).click();
    await waitFor3Seconds();

    // Go to step1
    await driver.findElement(By.css("#step1")).isDisplayed();
    await driver.findElement(By.css("#h2-title")).isDisplayed();
    await waitFor3Seconds();
    await driver.findElement(By.css("#step1-btn-need-assistance-yes")).click();
    await waitFor3Seconds();
    await driver.findElement(By.css("#step1-btn-need-assistance-yes")).click();
    await waitFor3Seconds();
    await driver.findElement(By.css("#step1-btn-need-assistance-no")).click();
    await waitFor3Seconds();
    await driver.findElement(By.css("#accessKeyId")).sendKeys(process.env.AWS_ACCESS_KEY);
    await driver.findElement(By.css("#secretAccessKey")).sendKeys(process.env.AWS_SECRET_KEY);
    await waitFor3Seconds();
    await driver.findElement(By.css("#region")).click();
    await waitFor3Seconds();
    await driver.findElement(By.css("#region")).click();
    await waitFor3Seconds();
    await driver.findElement(By.css("#region"))
    await driver.findElement(By.className("us-east-1")).click();
    await waitFor3Seconds();
    await driver.findElement(By.css("#step1-btn-next")).click();

        // Go to step2
    await driver.findElement(By.css("#step2")).isDisplayed();
    await driver.findElement(By.css("#h2-title")).isDisplayed();
    await waitFor3Seconds();

    await new Promise(r => setTimeout(r, 15000));
  });
});
