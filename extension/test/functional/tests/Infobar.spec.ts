/* eslint-env node, mocha */

import { assert } from "chai";
import { setupWebdriver } from "../utils/setupWebdriver";
import {
  lookForBrowserElement,
  lookForPageElement,
} from "../utils/lookForElement";
import { navigateToURL } from "../utils/navigateToURL";
import { defaultTestPreferences } from "../config";
import { By } from "selenium-webdriver";
import {
  assertElementDoesNotExist,
  assertElementExists,
} from "../utils/assertElement";

async function lookForInfobar(driver) {
  return lookForBrowserElement(driver, By.css, "notification");
}

async function lookForInfobarTranslateButton(driver) {
  return lookForBrowserElement(
    driver,
    By.css,
    "notification hbox.translate-offer-box button.notification-button.primary",
  );
}

async function lookForFixturePageOriginalContent(driver) {
  return lookForPageElement(
    driver,
    By.xpath,
    "//*[contains(text(),'Bienvenidos')]",
  );
}

async function lookForFixturePageTranslatedContent(driver, timeout) {
  return lookForPageElement(
    driver,
    By.xpath,
    "//*[contains(text(),'Welcome')]",
    timeout,
  );
}

if (process.env.UI === "native-ui") {
  describe("Infobar interactions", function() {
    // This gives Firefox time to start, and us a bit longer during some of the tests.
    this.timeout((15 + 60) * 1000);

    let driver;

    before(async () => {
      driver = await setupWebdriver.launchBrowser(defaultTestPreferences);
      await setupWebdriver.installExtension(driver);
      // Allow our extension some time to set up the initial ui
      await driver.sleep(1000);
    });

    after(async () => {
      await driver.quit();
    });

    it("The translation infobar is not shown on eg about:debugging", async () => {
      await navigateToURL(driver, "about:debugging");
      const infobarElement = await lookForInfobar(driver);
      assertElementDoesNotExist(infobarElement, "infobarElement");
    });

    it("The translation infobar is shown on a web-page with Spanish content", async () => {
      await navigateToURL(
        driver,
        "http://0.0.0.0:4001/es.wikipedia.org-2021-01-20-welcome-box.html",
      );
      const infobarElement = await lookForInfobar(driver);
      assertElementExists(infobarElement, "infobarElement");
      const valueAttribute = await infobarElement.getAttribute("value");
      assert.equal(valueAttribute, "translation");
      const translateButtonElement = await lookForInfobarTranslateButton(
        driver,
      );
      assertElementExists(translateButtonElement, "translateButtonElement");
    });

    it("Translation via the infobar works", async () => {
      await navigateToURL(
        driver,
        "http://0.0.0.0:4001/es.wikipedia.org-2021-01-20-welcome-box.html",
      );
      const originalPageElement = await lookForFixturePageOriginalContent(
        driver,
      );
      assertElementExists(originalPageElement, "originalPageElement");
      const infobarElement = await lookForInfobar(driver);
      assertElementExists(infobarElement, "infobarElement");
      const valueAttribute = await infobarElement.getAttribute("value");
      assert.equal(valueAttribute, "translation");
      const translateButtonElement = await lookForInfobarTranslateButton(
        driver,
      );
      assertElementExists(translateButtonElement, "translateButtonElement");
      await translateButtonElement.click();
      const translatedPageElement = await lookForFixturePageTranslatedContent(
        driver,
        60 * 1000,
      );
      assertElementExists(translatedPageElement, "translatedPageElement");
    });
  });
}
