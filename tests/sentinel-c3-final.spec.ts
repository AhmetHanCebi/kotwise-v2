import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';

test.describe('Döngü 3 — Re-Check', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForTimeout(3000);
    await page.fill('input[type="email"]', 'deniz@kotwise.com');
    await page.fill('input[type="password"]', 'KotwiseTest2026!');
    await page.locator('button[type="submit"]:has-text("Giriş")').click();
    await page.waitForURL('**/', { timeout: 15000 });
    await page.waitForTimeout(2000);
  });

  test('01-favorites', async ({ page }) => {
    await page.goto(`${BASE}/favorites`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-favorites.png', fullPage: true });
    const imgs = await page.$$eval('img', els => els.map(e => ({ s: e.src?.substring(0, 80), svg: e.src?.startsWith('data:image/svg') })));
    console.log('IMGS:', JSON.stringify(imgs));
    const text = await page.textContent('body') || '';
    const pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
    console.log('PRICES:', JSON.stringify(pm.slice(0, 10)));
  });

  test('02-compare', async ({ page }) => {
    await page.goto(`${BASE}/compare`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-compare.png', fullPage: true });
    const imgs = await page.$$eval('img', els => els.map(e => ({ s: e.src?.substring(0, 80), svg: e.src?.startsWith('data:image/svg') })));
    console.log('IMGS:', JSON.stringify(imgs));
    const text = await page.textContent('body') || '';
    const pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
    console.log('PRICES:', JSON.stringify(pm.slice(0, 10)));
  });

  test('03-booking', async ({ page }) => {
    await page.goto(`${BASE}/booking`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-booking.png', fullPage: true });
    const imgs = await page.$$eval('img', els => els.map(e => ({ s: e.src?.substring(0, 80), svg: e.src?.startsWith('data:image/svg') })));
    console.log('IMGS:', JSON.stringify(imgs));
    const text = await page.textContent('body') || '';
    const pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
    console.log('PRICES:', JSON.stringify(pm.slice(0, 10)));
  });

  test('04-profile-bookings', async ({ page }) => {
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-profile-bookings.png', fullPage: true });
    const imgs = await page.$$eval('img', els => els.map(e => ({ s: e.src?.substring(0, 80), svg: e.src?.startsWith('data:image/svg') })));
    console.log('IMGS:', JSON.stringify(imgs));
    const text = await page.textContent('body') || '';
    const pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
    console.log('PRICES:', JSON.stringify(pm.slice(0, 10)));
  });

  test('05-roommates-uyum', async ({ page }) => {
    await page.goto(`${BASE}/roommates`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-roommates.png', fullPage: true });
    const text = await page.textContent('body') || '';
    console.log('UYUM_YOK:', text.includes('Uyum bilgisi yok'));
    console.log('ORTAK_ILGI:', text.includes('Ortak ilgi'));
    console.log('UYUM_PCT:', /\d+%\s*Uyum/i.test(text));
    const pcts = text.match(/(\d+)%/g);
    console.log('PCTS:', JSON.stringify(pcts));
  });

  test('06-budget', async ({ page }) => {
    await page.goto(`${BASE}/budget`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-budget.png', fullPage: true });
    const text = await page.textContent('body') || '';
    console.log('HAS_EUR:', text.includes('€'));
    console.log('HAS_TL:', text.includes('₺') || text.includes('TL'));
    const pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
    console.log('BUDGET:', JSON.stringify(pm.slice(0, 10)));
  });

  test('07-listing-detail', async ({ page }) => {
    await page.goto(`${BASE}/listing/1`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-listing-detail.png', fullPage: true });
    const text = await page.textContent('body') || '';
    const pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
    console.log('LISTING_PRICES:', JSON.stringify(pm.slice(0, 10)));
  });

  test('08-search-map', async ({ page }) => {
    await page.goto(`${BASE}/search/map`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-search-map.png', fullPage: true });
    const tiles = await page.$$eval('img.leaflet-tile', els => els.map(e => e.src));
    const zm = tiles[0]?.match(/\/(\d+)\/\d+\/\d+/);
    console.log('ZOOM:', zm ? zm[1] : 'unknown');
    const markers = await page.$$eval('.leaflet-marker-icon, [class*="marker"], [class*="price"]', els => els.map(e => e.textContent?.trim()).filter(Boolean));
    console.log('MARKERS:', JSON.stringify(markers?.slice(0, 8)));
  });

  test('09-notifications', async ({ page }) => {
    await page.goto(`${BASE}/notifications`);
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-notifications.png', fullPage: true });
    const text = await page.textContent('body') || '';
    console.log('STUCK:', text.includes('Yükleniyor'));
    console.log('LEN:', text.length);
  });

  test('10-host-earnings', async ({ page }) => {
    await page.goto(`${BASE}/host/earnings`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-host-earnings.png', fullPage: true });
    const text = await page.textContent('body') || '';
    console.log('CURRENCY_LITERAL:', text.includes('{currencySymbol}'));
    console.log('HAS_EUR:', text.includes('€') || text.includes('EUR'));
  });

  test('11-messages-chat', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await page.waitForTimeout(2000);
    const link = await page.$('a[href*="/messages/"]');
    if (link) { await link.click(); await page.waitForTimeout(2000); }
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-messages.png', fullPage: true });
    const input = await page.$('input[placeholder*="esaj"], textarea[placeholder*="esaj"]');
    console.log('CHAT_INPUT:', !!input);
  });

  test('12-homepage', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-homepage.png', fullPage: true });
    const text = await page.textContent('body') || '';
    const pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
    console.log('HOME_PRICES:', JSON.stringify(pm.slice(0, 8)));
    console.log('NAV_ROOM:', text.includes('Oda Arkadaşı'));
    console.log('NAV_HOST:', text.includes('Ev Sahibi'));
  });
});
