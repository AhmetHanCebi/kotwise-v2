import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';

async function login(page: any) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"], input[placeholder*="mail"]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  }
}

test('C3-01: favorites thumbnail+price', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/favorites`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-favorites.png', fullPage: true });
  const imgs = await page.$$eval('img', (els: any[]) => els.map(e => ({ s: e.src?.substring(0, 80), svg: e.src?.startsWith('data:image/svg') })));
  console.log('IMGS:', JSON.stringify(imgs));
  const text = await page.textContent('body') || '';
  const pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
  console.log('PRICES:', JSON.stringify(pm.slice(0, 10)));
});

test('C3-02: compare thumbnail+price', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/compare`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-compare.png', fullPage: true });
  const imgs = await page.$$eval('img', (els: any[]) => els.map(e => ({ s: e.src?.substring(0, 80), svg: e.src?.startsWith('data:image/svg') })));
  console.log('IMGS:', JSON.stringify(imgs));
  const text = await page.textContent('body') || '';
  const pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
  console.log('PRICES:', JSON.stringify(pm.slice(0, 10)));
});

test('C3-03: booking+profile-bookings', async ({ page }) => {
  await login(page);
  // Booking
  await page.goto(`${BASE}/booking`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-booking.png', fullPage: true });
  let imgs = await page.$$eval('img', (els: any[]) => els.map(e => ({ s: e.src?.substring(0, 80), svg: e.src?.startsWith('data:image/svg') })));
  console.log('BOOKING_IMGS:', JSON.stringify(imgs));
  let text = await page.textContent('body') || '';
  let pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
  console.log('BOOKING_PRICES:', JSON.stringify(pm.slice(0, 10)));

  // Profile bookings
  await page.goto(`${BASE}/profile/bookings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-profile-bookings.png', fullPage: true });
  imgs = await page.$$eval('img', (els: any[]) => els.map(e => ({ s: e.src?.substring(0, 80), svg: e.src?.startsWith('data:image/svg') })));
  console.log('PB_IMGS:', JSON.stringify(imgs));
  text = await page.textContent('body') || '';
  pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
  console.log('PB_PRICES:', JSON.stringify(pm.slice(0, 10)));
});

test('C3-04: roommates+budget+host-earnings', async ({ page }) => {
  await login(page);
  // Roommates
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-roommates.png', fullPage: true });
  let text = await page.textContent('body') || '';
  console.log('UYUM_YOK:', text.includes('Uyum bilgisi yok'));
  console.log('ORTAK_ILGI:', text.includes('Ortak ilgi'));
  const pcts = text.match(/(\d+)%/g);
  console.log('PCTS:', JSON.stringify(pcts));

  // Budget
  await page.goto(`${BASE}/budget`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-budget.png', fullPage: true });
  text = await page.textContent('body') || '';
  console.log('BUDGET_EUR:', text.includes('€'));
  console.log('BUDGET_TL:', text.includes('₺') || text.includes('TL'));
  const bpm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
  console.log('BUDGET_PRICES:', JSON.stringify(bpm.slice(0, 10)));

  // Host earnings
  await page.goto(`${BASE}/host/earnings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-host-earnings.png', fullPage: true });
  text = await page.textContent('body') || '';
  console.log('CURRENCY_LITERAL:', text.includes('{currencySymbol}'));
  console.log('HAS_EUR:', text.includes('€') || text.includes('EUR'));
});

test('C3-05: listing-detail+map+homepage prices', async ({ page }) => {
  await login(page);
  // Listing detail
  await page.goto(`${BASE}/listing/1`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-listing-detail.png', fullPage: true });
  let text = await page.textContent('body') || '';
  let pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
  console.log('LISTING_PRICES:', JSON.stringify(pm.slice(0, 10)));

  // Map
  await page.goto(`${BASE}/search/map`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-search-map.png', fullPage: true });
  const tiles = await page.$$eval('img.leaflet-tile', (els: any[]) => els.map(e => e.src));
  const zm = tiles[0]?.match(/\/(\d+)\/\d+\/\d+/);
  console.log('ZOOM:', zm ? zm[1] : 'unknown');
  const markers = await page.$$eval('.leaflet-marker-icon, [class*="marker"], [class*="price"]', (els: any[]) => els.map(e => e.textContent?.trim()).filter(Boolean));
  console.log('MARKERS:', JSON.stringify(markers?.slice(0, 8)));

  // Homepage
  await page.goto(`${BASE}/`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-homepage.png', fullPage: true });
  text = await page.textContent('body') || '';
  pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
  console.log('HOME_PRICES:', JSON.stringify(pm.slice(0, 8)));
  console.log('NAV_ROOM:', text.includes('Oda Arkadaşı'));
  console.log('NAV_HOST:', text.includes('Ev Sahibi'));
});

test('C3-06: notifications+messages', async ({ page }) => {
  await login(page);
  // Notifications
  await page.goto(`${BASE}/notifications`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-notifications.png', fullPage: true });
  let text = await page.textContent('body') || '';
  console.log('NOTIF_STUCK:', text.includes('Yükleniyor'));
  console.log('NOTIF_LEN:', text.length);

  // Messages detail
  await page.goto(`${BASE}/messages`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const link = await page.$('a[href*="/messages/"]');
  if (link) { await link.click(); await page.waitForTimeout(2000); }
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-messages.png', fullPage: true });
  const input = await page.$('input[placeholder*="esaj"], textarea[placeholder*="esaj"]');
  console.log('CHAT_INPUT:', !!input);
});

test('C3-07: placeholder scan', async ({ page }) => {
  await login(page);
  const pages = ['/', '/favorites', '/compare', '/booking', '/profile/bookings', '/roommates', '/budget', '/host/earnings'];
  for (const p of pages) {
    await page.goto(`${BASE}${p}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const text = await page.textContent('body') || '';
    const bad = text.includes('Yakında') || text.includes('Coming soon') || text.includes('lorem ipsum') || text.includes('TODO');
    if (bad) console.log(`PLACEHOLDER on ${p}`);
  }
  console.log('SCAN_COMPLETE');
});
