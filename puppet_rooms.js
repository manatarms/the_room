const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto("https://chat.google.com");

  // Log into google account
  await page.type('[type="email"]', process.env.OKTA_EMAIL);
  (await page.$x('//*[@id="identifierNext"]/div/button'))[0].click();

  // Log into okta
  await page.waitForSelector("#okta-signin-username");
  await page.type("#okta-signin-username", process.env.OKTA_EMAIL);
  await page.type("#okta-signin-password", process.env.OKTA_PASS);
  await page.click("#okta-signin-submit");
  // const [response] = await Promise.all([
  //   // page.waitForNavigation(),
  //   page.click('[arial-label="Create or find a room"]')
  // ]);
  // await page.waitForFunction(
  //   selector => !!document.querySelector(selector),
  //   { timeout: 0 },
  //   '[title="Chat"]'
  // );
  // Google chat hackery
  await page.waitForNavigation({
    waitUntil: "networkidle2"
  });
  // Hack to wait for chat to finish booting
  await page.waitForSelector("[role='main']", {
    visible: true,
    timeout: 0
  });
  await page.bringToFront();
  await page.keyboard.down("Meta");
  await page.keyboard.press("KeyI");

  console.log("Typed");
  await page.waitForSelector('[aria-label="Enter room name."]');
  await page.type('[aria-label="Enter room name."]', "INCIDENTROOM-01");

  // await page.waitForSelector(
  //   'aria-label="Enter name or email of person or group"'
  // );
  await page.type(
    'aria-label="Enter name or email of person or group"',
    "Everyone"
  );
  // await page.waitForTimeout(10000);
  // await page.keyboard.press("h", { delay: 50 });
  // await page.keyboard.press("r", { delay: 50 });
  for (let i = 0; i < 20; i++) {
    // await page.keyboard.press("MetaLeft", { delay: 50 });
    // await page.keyboard.press("KeyI", { delay: 50 });
  }

  // await page.keyboard.up("i");
  // await page.keyboard.up("Meta");

  // await page.waitForSelector('[data-option-id="createroom"]', {
  //   visible: true
  // });

  // await page.waitForTimeout(5000);
  // await page.click('[data-option-id="createroom"]');

  console.log("HERE");
  // await browser.close();
})();
