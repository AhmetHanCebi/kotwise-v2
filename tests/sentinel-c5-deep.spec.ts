import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const ssDir = 'tests/screenshots';

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'deniz@kotwise.com');
  await page.fill('input[type="password"]', 'KotwiseTest2026!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');
  await page.waitForLoadState('networkidle');
}

// ====== REGRESYON KONTROL ======

test('C5-01: Fiyat regresyon - 7 sayfa', async ({ page }) => {
  await login(page);
  const results: any[] = [];

  for (const [name, path] of [
    ['homepage', '/'],
    ['favorites', '/favorites'],
    ['compare', '/compare'],
    ['booking', '/booking'],
    ['profile-bookings', '/profile/bookings'],
    ['search-map', '/search/map']
  ]) {
    await page.goto(`${BASE}${path}`);
    await page.waitForLoadState('networkidle');
    const text = await page.textContent('body') || '';
    const prices = text.match(/[\d.]+\s*[₺]/g) || [];
    const has100x = prices.some(p => parseInt(p.replace(/\./g, '')) > 5000);
    results.push({ page: name, prices: prices.slice(0, 4), has100x });
  }

  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  const link = await page.$('a[href*="/listing/"]');
  if (link) {
    const href = await link.getAttribute('href');
    await page.goto(`${BASE}${href}`);
    await page.waitForLoadState('networkidle');
    const text = await page.textContent('body') || '';
    const prices = text.match(/[\d.]+\s*[₺]/g) || [];
    results.push({ page: 'listing-detail', prices: prices.slice(0, 4) });
  }

  console.log('PRICE_RESULTS:', JSON.stringify(results));
  for (const r of results) {
    if (r.has100x) console.log('100x_BUG: ' + r.page + ' => ' + JSON.stringify(r.prices));
  }
});

test('C5-02: Thumbnail foto kontrol - 5 sayfa', async ({ page }) => {
  await login(page);

  for (const [name, path] of [
    ['favorites', '/favorites'],
    ['compare', '/compare'],
    ['booking', '/booking'],
    ['profile-bookings', '/profile/bookings'],
    ['search', '/search']
  ]) {
    await page.goto(`${BASE}${path}`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${ssDir}/sentinel-c5-${name}.png`, fullPage: true });

    const imgs = await page.$$eval('img', els => ({
      total: els.length,
      svg: els.filter(e => e.src.startsWith('data:image/svg')).length,
      real: els.filter(e => e.src.includes('unsplash')).length
    }));

    console.log('PHOTO_' + name + ': ' + JSON.stringify(imgs));
  }
});

test('C5-03: Harita zoom + marker', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search/map`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${ssDir}/sentinel-c5-map.png`, fullPage: true });

  const tiles = await page.$$eval('img[src*="tile.openstreetmap"]', els => els.map(e => e.src));
  const zooms = tiles.map(t => { const m = t.match(/\/(\d+)\/\d+\/\d+/); return m ? parseInt(m[1]) : 0; });
  const maxZoom = Math.max(...zooms, 0);
  console.log('MAP: zoom=' + maxZoom + ', tiles=' + tiles.length);
  expect(maxZoom).toBeGreaterThanOrEqual(10);
});

// ====== FORM DOLDURMA ======

test('C5-04: listing-new validasyon + form', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/listing/new`);
  await page.waitForLoadState('networkidle');

  const btn = await page.$('button:has-text("Devam"), button:has-text("Ileri"), button[type="submit"]');
  if (btn) await btn.click();
  await page.waitForTimeout(500);

  const body = await page.textContent('body') || '';
  const validation = body.includes('gerekli') || body.includes('zorunlu');
  const comboboxes = await page.$$('[role="combobox"], input[aria-autocomplete]');

  console.log('LISTING_NEW: validation=' + validation + ', comboboxes=' + comboboxes.length);
  await page.screenshot({ path: `${ssDir}/sentinel-c5-listing-new.png`, fullPage: true });
});

test('C5-05: profile-edit alanlar', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/edit`);
  await page.waitForLoadState('networkidle');

  const inputs = await page.$$('input, textarea');
  const comboboxes = await page.$$('[role="combobox"], input[aria-autocomplete]');
  const tags = await page.$$('[class*="tag"], [class*="chip"], [class*="badge"]');
  const body = await page.textContent('body') || '';

  console.log('PROFILE_EDIT: inputs=' + inputs.length + ', comboboxes=' + comboboxes.length + ', tags=' + tags.length + ', hasName=' + body.includes('Deniz'));
  await page.screenshot({ path: `${ssDir}/sentinel-c5-profile-edit.png`, fullPage: true });
});

test('C5-06: events-new form', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events/new`);
  await page.waitForLoadState('networkidle');

  const inputs = await page.$$('input, textarea, select');
  const buttons = await page.$$('button');
  console.log('EVENTS_NEW: inputs=' + inputs.length + ', buttons=' + buttons.length);
  await page.screenshot({ path: `${ssDir}/sentinel-c5-events-new.png`, fullPage: true });
});

// ====== FiLTRE ETKiLESiM ======

test('C5-07: events filtre', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events`);
  await page.waitForLoadState('networkidle');

  const filterBtns = await page.$$eval('button', btns => btns.map(b => b.textContent?.trim()).filter(t => t && t.length < 20));
  console.log('EVENTS: filters=' + JSON.stringify(filterBtns.slice(0, 15)));
  await page.screenshot({ path: `${ssDir}/sentinel-c5-events.png`, fullPage: true });
});

test('C5-08: search ilanlar', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');

  const listings = await page.$$('a[href*="/listing/"]');
  const imgs = await page.$$eval('img', els => ({
    total: els.length,
    svg: els.filter(e => e.src.startsWith('data:image/svg')).length,
    real: els.filter(e => e.src.includes('unsplash')).length
  }));

  console.log('SEARCH: listings=' + listings.length + ', imgs=' + JSON.stringify(imgs));
  await page.screenshot({ path: `${ssDir}/sentinel-c5-search-main.png`, fullPage: true });
});

test('C5-09: settings toggle', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/settings`);
  await page.waitForLoadState('networkidle');

  const body = await page.textContent('body') || '';
  const toggles = await page.$$('[role="switch"], input[type="checkbox"]');
  console.log('SETTINGS: toggles=' + toggles.length + ', TRY=' + body.includes('TRY'));
  await page.screenshot({ path: `${ssDir}/sentinel-c5-settings.png`, fullPage: true });
});

test('C5-10: budget slider + TRY', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/budget`);
  await page.waitForLoadState('networkidle');

  const sliders = await page.$$('input[type="range"]');
  const body = await page.textContent('body') || '';
  console.log('BUDGET: sliders=' + sliders.length + ', TL=' + body.includes('\u20BA') + ', EUR=' + body.includes('\u20AC'));
  await page.screenshot({ path: `${ssDir}/sentinel-c5-budget.png`, fullPage: true });
});

// ====== DETAY SAYFALARI ======

test('C5-11: roommates kart + detay', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');

  const body = await page.textContent('body') || '';
  const uyumMatch = body.match(/%(\d+)\s*Uyum/);
  const photo = await page.$$eval('img', els => els.some(e => e.src.includes('unsplash')));

  console.log('ROOMMATES: uyum=' + (uyumMatch ? uyumMatch[0] : 'none') + ', photo=' + photo);
  await page.screenshot({ path: `${ssDir}/sentinel-c5-roommates.png`, fullPage: true });
});

test('C5-12: mentors sayi + filtre', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/mentors`);
  await page.waitForLoadState('networkidle');

  const body = await page.textContent('body') || '';
  const msgBtns = await page.$$('button:has-text("Mesaj")');
  const names = body.match(/(Maria|Carlos|Fatma|Emre|Anna|Lena|Lucas)/g) || [];

  console.log('MENTORS: msgBtns=' + msgBtns.length + ', names=' + JSON.stringify([...new Set(names)]));
  await page.screenshot({ path: `${ssDir}/sentinel-c5-mentors.png`, fullPage: true });
});

test('C5-13: notifications regresyon', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/notifications`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const body = await page.textContent('body') || '';
  const stuck = body.includes('Y\u00FCkleniyor') && !body.includes('Coffee');
  const hasNotifs = body.includes('Coffee') || body.includes('be\u011Feni');

  console.log('NOTIFICATIONS: stuck=' + stuck + ', hasNotifs=' + hasNotifs);
  await page.screenshot({ path: `${ssDir}/sentinel-c5-notifications.png`, fullPage: true });
  expect(stuck).toBe(false);
});

// ====== PLACEHOLDER + CONSOLE ERROR ======

test('C5-14: placeholder tarama - 18 sayfa', async ({ page }) => {
  await login(page);
  const paths = ['/', '/search', '/favorites', '/compare', '/booking', '/profile/bookings',
    '/messages', '/community', '/events', '/roommates', '/mentors', '/budget', '/host/earnings',
    '/notifications', '/settings', '/search/map', '/host/bookings', '/host/calendar'];

  const found: string[] = [];
  for (const p of paths) {
    await page.goto(`${BASE}${p}`);
    await page.waitForLoadState('networkidle');
    const text = (await page.textContent('body') || '').toLowerCase();
    if (text.includes('yakinda') || text.includes('coming soon') || text.includes('lorem ipsum') ||
        text.includes('{currencysymbol}') || text.includes('{price}')) {
      found.push(p);
    }
  }

  console.log('PLACEHOLDER: found=' + (found.length > 0 ? JSON.stringify(found) : 'NONE'));
  expect(found.length).toBe(0);
});

test('C5-15: console error tarama - 10 sayfa', async ({ page }) => {
  await login(page);
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      errors.push(msg.text().substring(0, 80));
    }
  });

  for (const p of ['/favorites', '/compare', '/booking', '/notifications', '/messages',
    '/community', '/events', '/roommates', '/mentors', '/host/earnings']) {
    await page.goto(`${BASE}${p}`);
    await page.waitForLoadState('networkidle');
  }

  console.log('CONSOLE_ERRORS: ' + errors.length + ', ' + JSON.stringify(errors.slice(0, 3)));
});

// ====== EDGE CASE ======

test('C5-16: host-earnings template var', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/earnings`);
  await page.waitForLoadState('networkidle');

  const body = await page.textContent('body') || '';
  const hasTemplate = body.includes('{currencySymbol}') || body.includes('{currency}');
  console.log('HOST_EARNINGS: template=' + hasTemplate + ', lira=' + body.includes('\u20BA'));
  await page.screenshot({ path: `${ssDir}/sentinel-c5-host-earnings.png`, fullPage: true });
  expect(hasTemplate).toBe(false);
});

test('C5-17: messages chat detay', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/messages`);
  await page.waitForLoadState('networkidle');

  const convos = await page.$$('a[href*="/messages/"]');
  if (convos.length > 0) {
    await convos[0].click();
    await page.waitForLoadState('networkidle');
    const hasInput = await page.$('input[placeholder*="Mesaj"], textarea[placeholder*="Mesaj"]');
    console.log('MESSAGES: convos=' + convos.length + ', chatInput=' + !!hasInput);
    await page.screenshot({ path: `${ssDir}/sentinel-c5-messages-chat.png`, fullPage: true });
  }
});

test('C5-18: community-new hashtag', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/community/new`);
  await page.waitForLoadState('networkidle');

  const hashtags = await page.$$eval('button', btns => btns.filter(b => (b.textContent || '').includes('#')).length);
  const shareBtn = await page.$('button:has-text("Payla")');
  console.log('COMMUNITY_NEW: hashtags=' + hashtags + ', share=' + !!shareBtn);
  await page.screenshot({ path: `${ssDir}/sentinel-c5-community-new.png`, fullPage: true });
});

test('C5-19: listing-detail carousel + ozellikler', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');

  const link = await page.$('a[href*="/listing/"]');
  if (!link) return;
  const href = await link.getAttribute('href');
  await page.goto(`${BASE}${href}`);
  await page.waitForLoadState('networkidle');

  const body = await page.textContent('body') || '';
  const imgs = await page.$$eval('img', els => ({
    total: els.length,
    real: els.filter(e => e.src.includes('unsplash')).length,
    svg: els.filter(e => e.src.startsWith('data:image/svg')).length
  }));

  console.log('LISTING_DETAIL: imgs=' + JSON.stringify(imgs) + ', carousel=' + body.includes('1/') + ', superhost=' + body.includes('SUPERHOST') + ', rezervasyon=' + body.includes('Rezervasyon'));
  await page.screenshot({ path: `${ssDir}/sentinel-c5-listing-detail.png`, fullPage: true });
});

test('C5-20: BottomNav + homepage features', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/`);
  await page.waitForLoadState('networkidle');

  const body = await page.textContent('body') || '';
  const navLinks = await page.$$eval('a', els => els.map(e => e.getAttribute('href')).filter(h => h));
  const hasRoommate = navLinks.some(h => h!.includes('/roommates'));
  const hasHost = navLinks.some(h => h!.includes('/host'));

  console.log('HOMEPAGE: roommate=' + body.includes('Oda Arkada') + ', host=' + body.includes('Ev Sahibi') + ', roommateLink=' + hasRoommate + ', hostLink=' + hasHost);
  await page.screenshot({ path: `${ssDir}/sentinel-c5-homepage.png`, fullPage: true });
});

test('C5-21: empty state - host-bookings', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/bookings`);
  await page.waitForLoadState('networkidle');

  const body = await page.textContent('body') || '';
  console.log('HOST_BOOKINGS: empty=' + body.includes('talep yok') + ', tabs=' + body.includes('Bekleyen'));
  await page.screenshot({ path: `${ssDir}/sentinel-c5-host-bookings.png`, fullPage: true });
});

test('C5-22: city-detail tabs', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/city`);
  await page.waitForLoadState('networkidle');

  const cityLink = await page.$('a[href*="/city/"]');
  if (cityLink) {
    const href = await cityLink.getAttribute('href');
    await page.goto(`${BASE}${href}`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${ssDir}/sentinel-c5-city-detail.png`, fullPage: true });
    const body = await page.textContent('body') || '';
    console.log('CITY_DETAIL: bilgi=' + body.includes('Bilgi') + ', mahalleler=' + body.includes('Mahalleler'));
  }
});

test('C5-23: host-calendar', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/calendar`);
  await page.waitForLoadState('networkidle');

  const body = await page.textContent('body') || '';
  console.log('HOST_CALENDAR: legend=' + (body.includes('M\u00FCsait') || body.includes('Dolu')) + ', year=' + body.includes('2026'));
  await page.screenshot({ path: `${ssDir}/sentinel-c5-host-calendar.png`, fullPage: true });
});

test('C5-24: register sayfasi', async ({ page }) => {
  await page.goto(`${BASE}/register`);
  await page.waitForLoadState('networkidle');

  const body = await page.textContent('body') || '';
  const inputs = await page.$$('input');
  console.log('REGISTER: inputs=' + inputs.length + ', google=' + body.includes('Google') + ', apple=' + body.includes('Apple'));
  await page.screenshot({ path: `${ssDir}/sentinel-c5-register.png`, fullPage: true });
});

test('C5-25: host-apply form', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/apply`);
  await page.waitForLoadState('networkidle');

  const body = await page.textContent('body') || '';
  console.log('HOST_APPLY: upload=' + body.includes('Y\u00FCkle') + ', steps=' + (body.includes('1/4') || body.includes('Kimlik')));
  await page.screenshot({ path: `${ssDir}/sentinel-c5-host-apply.png`, fullPage: true });
});
