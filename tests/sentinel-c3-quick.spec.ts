import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';

test.describe('Döngü 3 — Quick Re-Check', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"], input[name="email"]', 'deniz@kotwise.com');
    await page.fill('input[type="password"], input[name="password"]', 'KotwiseTest2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');
  });

  test('1-favorites thumbnails+prices', async ({ page }) => {
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-favorites.png', fullPage: true });
    const imgs = await page.$$eval('img', els => els.map(e => ({ src: e.src?.substring(0, 80), svg: e.src?.includes('data:image/svg') })));
    console.log('IMGS:', JSON.stringify(imgs));
    const text = await page.textContent('body') || '';
    const priceMatches = text.match(/[\d.]+\s*(?:TL|₺|€)[\/ay]*/gi) || [];
    console.log('PRICES:', JSON.stringify(priceMatches));
  });

  test('2-compare thumbnails+prices', async ({ page }) => {
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-compare.png', fullPage: true });
    const imgs = await page.$$eval('img', els => els.map(e => ({ src: e.src?.substring(0, 80), svg: e.src?.includes('data:image/svg') })));
    console.log('IMGS:', JSON.stringify(imgs));
    const text = await page.textContent('body') || '';
    const priceMatches = text.match(/[\d.]+\s*(?:TL|₺|€)[\/ay]*/gi) || [];
    console.log('PRICES:', JSON.stringify(priceMatches));
  });

  test('3-booking thumbnail+price', async ({ page }) => {
    await page.goto(`${BASE}/booking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-booking.png', fullPage: true });
    const imgs = await page.$$eval('img', els => els.map(e => ({ src: e.src?.substring(0, 80), svg: e.src?.includes('data:image/svg') })));
    console.log('IMGS:', JSON.stringify(imgs));
    const text = await page.textContent('body') || '';
    const priceMatches = text.match(/[\d.]+\s*(?:TL|₺|€)[\/ay]*/gi) || [];
    console.log('PRICES:', JSON.stringify(priceMatches));
  });

  test('4-profile-bookings thumbnail+price', async ({ page }) => {
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-profile-bookings.png', fullPage: true });
    const imgs = await page.$$eval('img', els => els.map(e => ({ src: e.src?.substring(0, 80), svg: e.src?.includes('data:image/svg') })));
    console.log('IMGS:', JSON.stringify(imgs));
    const text = await page.textContent('body') || '';
    const priceMatches = text.match(/[\d.]+\s*(?:TL|₺|€)[\/ay]*/gi) || [];
    console.log('PRICES:', JSON.stringify(priceMatches));
  });

  test('5-roommates uyum', async ({ page }) => {
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-roommates.png', fullPage: true });
    const text = await page.textContent('body') || '';
    console.log('UYUM_YOK:', text.includes('Uyum bilgisi yok'));
    console.log('ORTAK_ILGI:', text.includes('Ortak ilgi'));
    console.log('UYUM_PCT:', /\d+%\s*Uyum/i.test(text));
    const uyumMatch = text.match(/(\d+)%/g);
    console.log('PCT_VALUES:', JSON.stringify(uyumMatch));
  });

  test('6-budget currency', async ({ page }) => {
    await page.goto(`${BASE}/budget`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-budget.png', fullPage: true });
    const text = await page.textContent('body') || '';
    console.log('HAS_EUR:', text.includes('EUR') || text.includes('€'));
    console.log('HAS_TL:', text.includes('TL') || text.includes('₺'));
    const priceMatches = text.match(/[\d.]+\s*(?:TL|₺|€|EUR|TRY)/gi) || [];
    console.log('BUDGET_PRICES:', JSON.stringify(priceMatches.slice(0, 10)));
  });

  test('7-listing-detail prices', async ({ page }) => {
    await page.goto(`${BASE}/listing/1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-listing-detail.png', fullPage: true });
    const text = await page.textContent('body') || '';
    const priceMatches = text.match(/[\d.]+\s*(?:TL|₺|€)[\/ay]*/gi) || [];
    console.log('LISTING_PRICES:', JSON.stringify(priceMatches));
  });

  test('8-search-map zoom+prices', async ({ page }) => {
    await page.goto(`${BASE}/search/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-search-map.png', fullPage: true });
    const tileUrls = await page.$$eval('img.leaflet-tile', els => els.map(e => e.src));
    const zoomMatch = tileUrls[0]?.match(/\/(\d+)\/\d+\/\d+/);
    console.log('ZOOM:', zoomMatch ? zoomMatch[1] : 'unknown');
    const markerTexts = await page.$$eval('.leaflet-marker-icon, [class*="marker"], [class*="price"]', els => els.map(e => e.textContent?.trim()).filter(Boolean));
    console.log('MARKERS:', JSON.stringify(markerTexts?.slice(0, 8)));
  });

  test('9-notifications', async ({ page }) => {
    await page.goto(`${BASE}/notifications`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-notifications.png', fullPage: true });
    const text = await page.textContent('body') || '';
    console.log('STUCK_LOADING:', text.includes('Yükleniyor'));
    console.log('HAS_CONTENT:', text.length > 200);
  });

  test('10-host-earnings', async ({ page }) => {
    await page.goto(`${BASE}/host/earnings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-host-earnings.png', fullPage: true });
    const text = await page.textContent('body') || '';
    console.log('CURRENCY_LITERAL:', text.includes('{currencySymbol}'));
    console.log('HAS_EUR:', text.includes('EUR') || text.includes('€'));
  });

  test('11-messages-chat', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const convLink = await page.$('a[href*="/messages/"]');
    if (convLink) { await convLink.click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(1500); }
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-messages-detail.png', fullPage: true });
    const hasInput = await page.$('input[placeholder*="esaj"], textarea[placeholder*="esaj"]');
    console.log('CHAT_INPUT:', !!hasInput);
  });

  test('12-homepage prices+nav', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-homepage.png', fullPage: true });
    const text = await page.textContent('body') || '';
    const priceMatches = text.match(/[\d.]+\s*(?:TL|₺|€)[\/ay]*/gi) || [];
    console.log('HOME_PRICES:', JSON.stringify(priceMatches.slice(0, 8)));
    const hasRoommate = text.includes('Oda Arkadaşı') || text.includes('roommate');
    const hasHost = text.includes('Ev Sahibi');
    console.log('NAV_ROOMMATES:', hasRoommate);
    console.log('NAV_HOST:', hasHost);
  });
});
