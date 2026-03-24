const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1500);

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const visible = await emailInput.isVisible({ timeout: 3000 }).catch(() => false);

  if (visible) {
    await emailInput.fill('deniz@kotwise.com');
    await page.locator('input[type="password"]').first().fill('KotwiseTest2026!');
    await page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first().click();
    await page.waitForTimeout(2000);
    console.log('LOGIN: OK');
  } else {
    console.log('LOGIN: No form found, may already be logged in');
  }
}

async function testPage(page, name, pagePath) {
  console.log(`\n--- Testing ${name} (${pagePath}) ---`);

  try {
    await page.goto(`${BASE}${pagePath}`, { waitUntil: 'networkidle', timeout: 15000 });
  } catch(e) {
    await page.goto(`${BASE}${pagePath}`, { timeout: 15000 });
  }
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `sentinel-c3-${name}.png`), fullPage: true });

  const bodyText = await page.locator('body').innerText();
  const url = page.url();

  const has404 = bodyText.includes('404') || bodyText.includes('Not Found');
  const hasError = bodyText.includes('İlan bulunamadı') || bodyText.includes('bulunamadı') || bodyText.includes('Error');

  // Check bottom nav
  const navElements = await page.locator('nav').count();

  console.log(`URL: ${url}`);
  console.log(`404: ${has404}`);
  console.log(`Error text: ${hasError}`);
  console.log(`Nav elements: ${navElements}`);
  console.log(`Body length: ${bodyText.length}`);
  console.log(`Body preview: ${bodyText.substring(0, 200).replace(/\n/g, ' ')}`);

  return { name, pagePath, has404, hasError, navElements, bodyLength: bodyText.length, bodyPreview: bodyText.substring(0, 300) };
}

(async () => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
  });
  const page = await context.newPage();

  await login(page);

  const results = {};
  results.booking = await testPage(page, 'booking', '/booking');
  results.city = await testPage(page, 'city', '/city');

  await browser.close();

  console.log('\n\n=== SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
})();
