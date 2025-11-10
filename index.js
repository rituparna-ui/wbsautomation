const { Builder, Browser, By, until } = require("selenium-webdriver");
require("chromedriver");

async function handleCookieBanner(driver) {
  try {
    // Try to remove cookie banner entirely
    await driver.executeScript(`
      const cookieBanner = document.querySelector('.cookie-notice');
      if (cookieBanner) {
        cookieBanner.style.display = 'none';
        console.log('Cookie banner hidden');
      }
    `);
    await driver.sleep(500);
  } catch (error) {
    console.log("Could not handle cookie banner");
  }
}

(async () => {
  let driver = await new Builder().forBrowser(Browser.CHROME).build();

  await driver.get("https://www.wbm.de/wohnungen-berlin/angebote/");
  await driver.manage().setTimeouts({ implicit: 500 });

  const details = await driver.findElements(By.css("a.immo-button-cta"));

  for (let index = 0; index < details.length; index++) {
    const element = details[index];
    const link = await element.getAttribute("href");
    if (
      link.includes("wbs") ||
      link.includes("lichtenberg") ||
      link.includes("spandau")
    ) {
      continue;
    }
    console.log("Filling form for: ", link);
    await driver.switchTo().newWindow("tab");
    await driver.get(link);

    const formData = {
      anrede: "Herr",
      vorname: "Rituparna",
      nachname: "Warwatkar",
      strasse: "Dannackerstr. 14",
      plz: "10245",
      ort: "Berlin",
      email: "rwarwatkar@gmail.com",
      telefon: "015227086183",
    };

    await handleCookieBanner(driver);

    console.log("Cookie banner accepted");
    await driver.sleep(500);

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

    await driver
      .findElement(
        By.css(
          "#c722 > div > div > form > div.powermail_fieldset.powermail_fieldset_2.row > div.powermail_fieldwrap.powermail_fieldwrap_type_check.powermail_fieldwrap_datenschutzhinweis.form-.form-group.col-md-6 > div > div > div.checkbox > label"
        )
      )
			.click();
		
		await driver
      .findElement(
        By.css(
          "#c722 > div > div > form > div.powermail_fieldset.powermail_fieldset_2.row > div.powermail_fieldwrap.powermail_fieldwrap_type_submit.powermail_fieldwrap_absenden.form-.form-group.col-md-6 > div > div > button"
        )
      )
      .click();

		
    break;
  }

  // await driver.quit();
})();
