const puppeteer = require("puppeteer");
const isDev = false;
const isMac = process.platform === 'darwin';
const metaKey = isMac ? 'Meta' : 'Control';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: isDev,
    defaultViewport: null,
    slowMo: isDev ? 20 : 0,
    args: ["--start-maximized"],
  });
  const page = await browser.newPage();
  await page.goto("https://chat.google.com");

  // Log into google account
  await page.type('[type="email"]', process.env.OKTA_EMAIL);
  (await page.$x('//*[@id="identifierNext"]/div/button'))[0].click();

  // Log into okta
  await page.waitForSelector("#okta-signin-username");
  await page.type("#okta-signin-username", process.env.OKTA_EMAIL);
  await page.type("#okta-signin-password", process.env.OKTA_PASS);
  await page.click("#okta-signin-submit");

  // Google chat hackery
  // Hack to wait for chat to finish booting
  await page.waitForSelector("[role='main']", {
    visible: true,
    timeout: 0,
  });

  // Chat is constantly doing things
  // Wait for 3 seconds (guesstimate) to finish
  await page.waitForTimeout(3000);
  await page.bringToFront();

  // We have to do a bunch of stuff manually
  // to trigger the PWA popup, so lets do that first
  await createRoom(page, "INCIDENTROOM-0");

  // Close the silly PWA pop up
  console.log("Don't touch anything, I'm waiting for a chat notification...");
  await page.waitForSelector(".promo-popup-header", { timeout: 0 });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");

  await addRT(page);
  await leaveRoom(page);

  // Create a room
  for (let i = 1; i < process.env.COUNT; i++) {
    await createRoom(page, `INCIDENTROOM-${i}`);
    await addRT(page);
    await leaveRoom(page);
    console.log(`Made INCIDENTROOM-${i}`);
  }

  console.log("Oh hi mark! I made some rooms");
})();

const createRoom = async (page, roomName) => {
  await page.waitForTimeout(2000);

  // Refocus on chat
  await page.mouse.click(0, 0);

  await page.keyboard.down(metaKey);
  await page.keyboard.press("KeyI");
  await page.keyboard.up(metaKey);

  // Type a room name
  await page.waitForTimeout(2000);
  await page.waitForSelector("input");
  await page.type("input", roomName);

  // Add Everyone
  await page.keyboard.press("Tab");
  await page.keyboard.type("Everyone");
  await page.waitForTimeout(2000);
  await page.keyboard.press("Enter");

  // Threaded replies
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");

  // Click the create button
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
};

const addRT = async (page) => {
  await page.waitForTimeout(4000);
  // Add RespectTables
  // Open room menu
  await page.keyboard.down(metaKey);
  await page.keyboard.press("KeyG");
  await page.keyboard.up(metaKey);
  await page.waitForTimeout(2000);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  // Add RT
  await page.waitForSelector("input");
  await page.waitForTimeout(2000);
  await page.type("input", "RespectTables");
  // Wait for list to load
  await page.waitForTimeout(2000);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);
};

const leaveRoom = async (page) => {
  await page.waitForTimeout(2000);
  // Leave the room
  await page.keyboard.down(metaKey);
  await page.keyboard.press("KeyG");
  await page.keyboard.up(metaKey);
  await page.waitForTimeout(2000);
  for (let i = 0; i <= 5; i++) {
    await page.keyboard.press("ArrowDown");
  }
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);
  await page.keyboard.press("Enter");
};

