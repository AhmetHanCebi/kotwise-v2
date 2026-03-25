import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SS = 'tests/screenshots';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  await emailInput.fill('deniz@kotwise.com');
  await passwordInput.fill('KotwiseTest2026!');
  const loginBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
  await loginBtn.click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Döngü 3 — Bug Re-test', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('1-notifications — loading stuck', async ({ page }) => {
    await page.goto(`${BASE}/notifications`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${SS}/sentinel-c3-notifications.png`, fullPage: true });
    const body = await page.locator('body').innerText();
    const stuck = body.includes('Yükleniyor') && body.length < 200;
    console.log('NOTIFICATIONS stuck:', stuck);
    console.log('NOTIFICATIONS body:', body.substring(0, 600));
  });

  test('2-favorites — photos check', async ({ page }) => {
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c3-favorites.png`, fullPage: true });
    const imgs = page.locator('img');
    const count = await imgs.count();
    let broken = 0;
    for (let i = 0; i < count; i++) {
      const nw = await imgs.nth(i).evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (nw === 0) broken++;
    }
    const body = await page.locator('body').innerText();
    console.log(`FAVORITES imgs:${count} broken:${broken}`);
    console.log('FAVORITES body:', body.substring(0, 500));
  });

  test('3-compare — photos check', async ({ page }) => {
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c3-compare.png`, fullPage: true });
    const imgs = page.locator('img');
    const count = await imgs.count();
    let broken = 0;
    for (let i = 0; i < count; i++) {
      const nw = await imgs.nth(i).evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (nw === 0) broken++;
    }
    const body = await page.locator('body').innerText();
    console.log(`COMPARE imgs:${count} broken:${broken}`);
    console.log('COMPARE body:', body.substring(0, 500));
  });

  test('4-booking — photos + stripe', async ({ page }) => {
    await page.goto(`${BASE}/booking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c3-booking.png`, fullPage: true });
    const imgs = page.locator('img');
    const count = await imgs.count();
    let broken = 0;
    for (let i = 0; i < count; i++) {
      const nw = await imgs.nth(i).evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (nw === 0) broken++;
    }
    const body = await page.locator('body').innerText();
    const hasPayment = body.includes('Ödeme') || body.includes('Stripe') || body.includes('Kart');
    console.log(`BOOKING imgs:${count} broken:${broken} payment:${hasPayment}`);
    console.log('BOOKING body:', body.substring(0, 500));
  });

  test('5-profile-bookings — price 100x + photos', async ({ page }) => {
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c3-profile-bookings.png`, fullPage: true });
    const body = await page.locator('body').innerText();
    const prices = body.match(/[\d.,]+\s*[₺TL]/g) || [];
    const highPrices = prices.filter(p => parseFloat(p.replace(/[^\d]/g, '')) > 50000);
    const imgs = page.locator('img');
    const count = await imgs.count();
    let broken = 0;
    for (let i = 0; i < count; i++) {
      const nw = await imgs.nth(i).evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (nw === 0) broken++;
    }
    console.log(`PROFILE-BOOKINGS prices:`, prices, `high:`, highPrices, `imgs:${count} broken:${broken}`);
    console.log('PROFILE-BOOKINGS body:', body.substring(0, 600));
  });

  test('6-search-map — zoom + marker prices', async ({ page }) => {
    await page.goto(`${BASE}/search/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SS}/sentinel-c3-search-map.png`, fullPage: true });
    const body = await page.locator('body').innerText();
    const prices = body.match(/[\d.,]+\s*[₺TL]/g) || [];
    const highPrices = prices.filter(p => parseFloat(p.replace(/[^\d]/g, '')) > 10000);
    const tiles = await page.locator('.leaflet-tile').count();
    const markers = await page.locator('.leaflet-marker-icon, .leaflet-marker-pane *').count();
    console.log(`SEARCH-MAP prices:`, prices, `high:`, highPrices);
    console.log(`SEARCH-MAP tiles:${tiles} markers:${markers}`);
    console.log('SEARCH-MAP body:', body.substring(0, 500));
  });

  test('7-messages — chat input', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c3-messages-list.png`, fullPage: true });

    // Try to open a conversation
    const chatItems = page.locator('div[class*="cursor-pointer"], a[href*="messages/"]');
    const chatCount = await chatItems.count();
    console.log('MESSAGES conversations:', chatCount);

    if (chatCount > 0) {
      await chatItems.first().click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: `${SS}/sentinel-c3-messages-detail.png`, fullPage: true });
    const inputs = await page.locator('input[type="text"], textarea, [contenteditable="true"]').count();
    const sendBtns = await page.locator('button:has-text("Gönder"), button:has-text("Send"), button[type="submit"]').count();
    const body = await page.locator('body').innerText();
    console.log(`MESSAGES-DETAIL inputs:${inputs} sendBtns:${sendBtns}`);
    console.log('MESSAGES-DETAIL body:', body.substring(0, 500));
  });

  test('8-mentors — content richness', async ({ page }) => {
    await page.goto(`${BASE}/mentors`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c3-mentors.png`, fullPage: true });
    const body = await page.locator('body').innerText();
    // Count mentor names (look for cards with names)
    const mentorNames = body.match(/[A-ZÇĞİÖŞÜ][a-zçğıöşü]+ [A-ZÇĞİÖŞÜ][a-zçğıöşü]+/g) || [];
    console.log('MENTORS names found:', mentorNames);
    console.log('MENTORS body:', body.substring(0, 600));
  });

  test('9-listing-detail — mini map price', async ({ page }) => {
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const link = page.locator('a[href*="/listing/"]').first();
    if (await link.count() > 0) {
      await link.click();
    } else {
      await page.goto(`${BASE}/listing/1`);
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c3-listing-detail.png`, fullPage: true });
    const body = await page.locator('body').innerText();
    const prices = body.match(/[\d.,]+\s*[₺TL]/g) || [];
    const highPrices = prices.filter(p => parseFloat(p.replace(/[^\d]/g, '')) > 10000);
    console.log('LISTING-DETAIL prices:', prices, 'high:', highPrices);
    console.log('LISTING-DETAIL body:', body.substring(0, 600));
  });
});
