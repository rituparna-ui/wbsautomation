const { Builder, Browser, By, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");
const { default: axios } = require("axios");
require("chromedriver");

// File to store submitted listings
const SUBMITTED_FILE = path.join(__dirname, "submitted_listings.json");

const sendSlack = async (link) => {
  await axios.post(
    "https://hooks.slack.com/triggers/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",
    {
      message: link,
    }
  );
};

// Load submitted listings from file
function loadSubmittedListings() {
  try {
    if (fs.existsSync(SUBMITTED_FILE)) {
      const data = fs.readFileSync(SUBMITTED_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading submitted listings:", error);
  }
  return [];
}

// Save submitted listings to file
function saveSubmittedListing(url) {
  try {
    let submitted = loadSubmittedListings();
    if (!submitted.includes(url)) {
      submitted.push(url);
      fs.writeFileSync(SUBMITTED_FILE, JSON.stringify(submitted, null, 2));
      console.log(`✓ Saved to submitted list: ${url}`);
    }
  } catch (error) {
    console.error("Error saving submitted listing:", error);
  }
}

async function handleCookieBanner(driver) {
  try {
    await driver.executeScript(`
      const cookieBanner = document.querySelector('.cookie-notice');
      if (cookieBanner) {
        cookieBanner.style.display = 'none';
      }
    `);
    await driver.sleep(500);
  } catch (error) {
    console.log("Could not handle cookie banner");
  }
}

async function fillAndSubmitForm(driver, link) {
  try {
    console.log(`\n📝 Filling form for: ${link}`);

    await driver.switchTo().newWindow("tab");
    await driver.get(link);

    const formDatas = {
      anrede: "Herr",
      vorname: "Rituparna",
      nachname: "Warwatkar",
      strasse: "Dannackerstr. 14",
      plz: "10245",
      ort: "Berlin",
      email: "rituw1610@gmail.com",
      telefon: "015227086183",
    };

    await handleCookieBanner(driver);
    await driver.sleep(500);

    // Fill form fields
    await driver
      .findElement(By.id("powermail_field_anrede"))
      .sendKeys(formData.anrede);
    await driver
      .findElement(By.id("powermail_field_name"))
      .sendKeys(formData.nachname);
    await driver
      .findElement(By.id("powermail_field_vorname"))
      .sendKeys(formData.vorname);
    await driver
      .findElement(By.id("powermail_field_strasse"))
      .sendKeys(formData.strasse);
    await driver
      .findElement(By.id("powermail_field_plz"))
      .sendKeys(formData.plz);
    await driver
      .findElement(By.id("powermail_field_ort"))
      .sendKeys(formData.ort);
    await driver
      .findElement(By.id("powermail_field_e_mail"))
      .sendKeys(formData.email);
    await driver
      .findElement(By.id("powermail_field_telefon"))
      .sendKeys(formData.telefon);

    // Click privacy checkbox
    await driver
      .findElement(
        By.css(
          "#c722 > div > div > form > div.powermail_fieldset.powermail_fieldset_2.row > div.powermail_fieldwrap.powermail_fieldwrap_type_check.powermail_fieldwrap_datenschutzhinweis.form-.form-group.col-md-6 > div > div > div.checkbox > label"
        )
      )
      .click();

    await driver.sleep(500);

    // Submit form
    await driver
      .findElement(
        By.css(
          "#c722 > div > div > form > div.powermail_fieldset.powermail_fieldset_2.row > div.powermail_fieldwrap.powermail_fieldwrap_type_submit.powermail_fieldwrap_absenden.form-.form-group.col-md-6 > div > div > button"
        )
      )
      .click();

    console.log("✅ Form submitted successfully!");
    await driver.sleep(2000);

    // Save to submitted list
    saveSubmittedListing(link);
    sendSlack(link);

    // Close current tab and switch back to main tab
    await driver.close();
    const handles = await driver.getAllWindowHandles();
    await driver.switchTo().window(handles[0]);

    return true;
  } catch (error) {
    console.error(`❌ Error filling form for ${link}:`, error.message);

    // Try to close tab and return to main window
    try {
      await driver.close();
      const handles = await driver.getAllWindowHandles();
      await driver.switchTo().window(handles[0]);
    } catch (e) {
      console.error("Could not close tab");
    }

    return false;
  }
}

async function checkAndApply(driver) {
  try {
    console.log("\n🔍 Checking for new listings...");
    console.log(`Time: ${new Date().toLocaleString()}`);

    await driver.get("https://www.wbm.de/wohnungen-berlin/angebote/");
    await driver.sleep(2000);

    const details = await driver.findElements(By.css("a.immo-button-cta"));
    const submittedListings = loadSubmittedListings();

    console.log(`Found ${details.length} total listings`);
    console.log(`Already submitted: ${submittedListings.length} listings`);

    let newListingsCount = 0;
    let appliedCount = 0;

    for (let index = 0; index < details.length; index++) {
      const element = details[index];
      const link = await element.getAttribute("href");

      // Skip if already submitted
      if (submittedListings.includes(link)) {
        console.log(`⏭️  Skipping (already submitted): ${link}`);
        continue;
      }

      // Skip unwanted locations
      if (
        link.includes("wbs") ||
        link.includes("lichtenberg") ||
        link.includes("spandau")
      ) {
        console.log(`⏭️  Skipping (filtered location): ${link}`);
        continue;
      }

      newListingsCount++;
      console.log(`\n🆕 New listing found! (${newListingsCount})`);

      const success = await fillAndSubmitForm(driver, link);
      if (success) {
        appliedCount++;
      }

      // Add delay between applications
      await driver.sleep(3000);
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✨ Check complete!`);
    console.log(`   New listings: ${newListingsCount}`);
    console.log(`   Successfully applied: ${appliedCount}`);
    console.log(
      `   Total submitted (all time): ${loadSubmittedListings().length}`
    );
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error during check:", error.message);
  }
}

async function main() {
  let driver = await new Builder().forBrowser(Browser.CHROME).build();

  try {
    console.log("🚀 Starting WBM Auto-Apply Bot");
    console.log(`📁 Submitted listings file: ${SUBMITTED_FILE}`);
    console.log(`⏰ Check interval: 2 minutes\n`);

    // Initial check
    await checkAndApply(driver);

    // Set up interval to check every 2 minutes (120000 ms)
    setInterval(async () => {
      await checkAndApply(driver);
    }, 2 * 60 * 1000); // 2 minutes

    console.log("\n⏳ Waiting for next check in 2 minutes...");
  } catch (error) {
    console.error("Fatal error:", error);
    await driver.quit();
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n👋 Shutting down gracefully...");
  process.exit(0);
});

main();
