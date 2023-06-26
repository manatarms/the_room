const puppeteer = require("puppeteer");
const isDev = true;
const isMac = process.platform === 'darwin';
const metaKey = isMac ? 'Meta' : 'Control';

const startIndex = 0;

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
  // Wait for 6 seconds (guesstimate) to finish
  await page.waitForTimeout(6000);
  await page.bringToFront();

  // Create a room
  for (let i = 0; i < process.env.COUNT; i++) {
    await createRoom(page, `INCIDENTROOM-${i + startIndex} Please Rename This Room`);
    await addRT(page);
    await leaveRoom(page);
    console.log(`Made INCIDENTROOM-${i + startIndex}`);
  }

  console.log("Oh hi mark! I made some rooms");
  browser.close()
})();

const createRoom = async (page, roomName) => {
  await page.waitForTimeout(1000);

  // Refocus on chat
  await page.mouse.click(0, 0);

  await page.keyboard.down(metaKey);
  await page.keyboard.press("KeyI");
  await page.keyboard.up(metaKey);

  // Type a room name
  await page.waitForTimeout(1000);
  await page.waitForSelector("input");
  await page.type("input", roomName);

  // Add Everyone
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Everyone");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");

  // Set space access to 'All of Cloudflare'
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  // tab out of setting space access depth
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  // Click the create button
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");

  // Wait for room modal to close
  await page.waitForTimeout(1000);
};

const addRT = async (page) => {
  await page.waitForTimeout(3000);
  
  // Refocus on chat space
  await page.mouse.click(900, 400);
  
  // Add RespectTables
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);
  await page.waitForSelector("input");
  await page.type("input", "RespectTables");
  // Wait for list to load
  await page.waitForTimeout(1000);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);
};

const leaveRoom = async (page) => {
  await page.waitForTimeout(2000);
  
  // Refocus on top left of app window
  await page.mouse.click(0, 0);
  
  // Leave the room
  await page.keyboard.down(metaKey);
  await page.keyboard.press("KeyG");
  await page.keyboard.up(metaKey);
  await page.waitForTimeout(1000);
  for (let i = 0; i <= 8; i++) {
    await page.keyboard.press("ArrowDown");
  }
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
};
