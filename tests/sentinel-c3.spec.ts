import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SS = 'tests/screenshots/sentinel-c3';

test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }
});

// ==========================================
// RE-CHECK: Open bugs from C2
// ==========================================

test('RE-CHECK: City Detail - EUR currency', async ({ page }) => {
  await page.goto(`${BASE}/city`);
  await page.waitForLoadState('networkidle');
  const cityLink = page.locator('a[href*="/city/"]').first();
  if (await cityLink.count() > 0) {
    await cityLink.click();
    await page.waitForLoadState('networkidle');
  } else {
    await page.goto(`${BASE}/city/1`);
    await page.waitForLoadState('networkidle');
  }
  await page.screenshot({ path: `${SS}-city-detail.png`, fullPage: true });
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasEUR = bodyText.includes('EUR') || bodyText.includes('€');
  const hasTL = bodyText.includes('TL') || bodyText.includes('₺');
  console.log(`CITY-DETAIL: EUR=${hasEUR} TL=${hasTL} URL=${page.url()}`);
  // Check "Ort. Kira" specifically
  const kiraMatch = bodyText.match(/(?:kira|Kira|rent|Rent)[^]*?(\d[\d.,]+)\s*(EUR|TL|TRY|₺|€)/i);
  if (kiraMatch) console.log(`CITY-DETAIL KIRA: ${kiraMatch[0]}`);
});

test('RE-CHECK: Listing Detail - TRY label', async ({ page }) => {
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  const listingLink = page.locator('a[href*="/listing/"]').first();
  if (await listingLink.count() > 0) {
    await listingLink.click();
    await page.waitForLoadState('networkidle');
  } else {
    await page.goto(`${BASE}/listing/1`);
    await page.waitForLoadState('networkidle');
  }
  await page.screenshot({ path: `${SS}-listing-detail.png`, fullPage: true });
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasTRY = bodyText.includes('TRY');
  const hasTL = /\bTL\b/.test(bodyText) || bodyText.includes('₺');
  console.log(`LISTING-DETAIL: TRY=${hasTRY} TL=${hasTL} URL=${page.url()}`);
  // Find price patterns
  const priceMatch = bodyText.match(/(\d[\d.,]+)\s*(TRY|TL|₺|EUR|€)/g);
  if (priceMatch) console.log(`LISTING-DETAIL PRICES: ${priceMatch.join(' | ')}`);
});

test('RE-CHECK: Host Earnings - Yakinda placeholder', async ({ page }) => {
  await page.goto(`${BASE}/host/earnings`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-host-earnings.png`, fullPage: true });
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasYakinda = bodyText.toLowerCase().includes('yakında') || bodyText.toLowerCase().includes('yakinda');
  const hasPlaceholder = bodyText.includes('Bu özellik') || bodyText.includes('aktif olacak');
  console.log(`HOST-EARNINGS: Yakında=${hasYakinda} Placeholder=${hasPlaceholder} Length=${bodyText.length}`);
  console.log(`HOST-EARNINGS preview: ${bodyText.substring(0, 300).replace(/\n/g, ' ')}`);
});

test('RE-CHECK: Profile Edit - University field', async ({ page }) => {
  await page.goto(`${BASE}/profile/edit`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-profile-edit.png`, fullPage: true });

  // Check all inputs for university-related fields
  const allInputs = page.locator('input');
  const inputCount = await allInputs.count();
  for (let i = 0; i < inputCount; i++) {
    const inp = allInputs.nth(i);
    const name = await inp.getAttribute('name').catch(() => '');
    const placeholder = await inp.getAttribute('placeholder').catch(() => '');
    const type = await inp.getAttribute('type').catch(() => '');
    if (name?.toLowerCase().includes('uni') || name?.toLowerCase().includes('okul') ||
        placeholder?.toLowerCase().includes('üni') || placeholder?.toLowerCase().includes('okul')) {
      const role = await inp.getAttribute('role').catch(() => '');
      const list = await inp.getAttribute('list').catch(() => '');
      console.log(`UNI-FIELD: name=${name} type=${type} role=${role} list=${list} placeholder=${placeholder}`);
    }
  }
  // Check for selects
  const selects = page.locator('select');
  const selectCount = await selects.count();
  console.log(`PROFILE-EDIT: inputs=${inputCount} selects=${selectCount}`);
});

test('RE-CHECK: Booking - TRY and Stripe', async ({ page }) => {
  await page.goto(`${BASE}/booking`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-booking.png`, fullPage: true });
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasTRY = bodyText.includes('TRY');
  const hasStripe = bodyText.toLowerCase().includes('stripe');
  const hasKart = bodyText.includes('kart') || bodyText.includes('Kart') || bodyText.includes('card');
  const hasOdeme = bodyText.includes('ödeme') || bodyText.includes('Ödeme');
  console.log(`BOOKING: TRY=${hasTRY} Stripe=${hasStripe} Kart=${hasKart} Ödeme=${hasOdeme}`);
  console.log(`BOOKING preview: ${bodyText.substring(0, 300).replace(/\n/g, ' ')}`);
});

// ==========================================
// NEW PAGES: Not tested in C1/C2
// ==========================================

const NEW_PAGES = [
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'forgot-password', path: '/forgot-password' },
  { name: 'listing-new', path: '/listing/new' },
  { name: 'messages-detail', path: '/messages/1' },
  { name: 'city-chat', path: '/city/1/chat' },
  { name: 'roommates-detail', path: '/roommates/1' },
  { name: 'booking-success', path: '/booking/success' },
];

for (const pg of NEW_PAGES) {
  test(`NEW: ${pg.name} (${pg.path})`, async ({ page }) => {
    const response = await page.goto(`${BASE}${pg.path}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SS}-${pg.name}.png`, fullPage: false });

    const status = response?.status() ?? 0;
    const url = page.url();
    const bodyText = await page.locator('body').innerText().catch(() => '');

    const is404 = status === 404 || bodyText.includes('404') || bodyText.includes('sayfa bulunamadı') || bodyText.includes('This page could not be found');
    const isBlank = bodyText.trim().length < 10;
    const hasYakinda = bodyText.toLowerCase().includes('yakında');
    const hasBottomNav = await page.locator('nav, [class*="bottom"], [class*="BottomNav"], [class*="tab-bar"]').count() > 0;

    console.log(`[${pg.name}] status=${status} url=${url} blank=${isBlank} 404=${is404} yakinda=${hasYakinda} nav=${hasBottomNav}`);
    console.log(`[${pg.name}] preview: ${bodyText.substring(0, 200).replace(/\n/g, ' ')}`);
  });
}

// ==========================================
// PRODUCT QUALITY CHECKS
// ==========================================

test('QUALITY: Roommates - placeholder or real content', async ({ page }) => {
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-roommates.png`, fullPage: true });
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasYakinda = bodyText.toLowerCase().includes('yakında');
  const hasCards = await page.locator('[class*="card"], [class*="Card"]').count();
  console.log(`ROOMMATES: Yakında=${hasYakinda} Cards=${hasCards} Length=${bodyText.length}`);
  console.log(`ROOMMATES preview: ${bodyText.substring(0, 300).replace(/\n/g, ' ')}`);
});

test('QUALITY: Messages - functional', async ({ page }) => {
  await page.goto(`${BASE}/messages`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-messages.png`, fullPage: true });
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasYakinda = bodyText.toLowerCase().includes('yakında');
  console.log(`MESSAGES: Yakında=${hasYakinda} Length=${bodyText.length}`);
  console.log(`MESSAGES preview: ${bodyText.substring(0, 300).replace(/\n/g, ' ')}`);
});

test('QUALITY: Favorites - functional', async ({ page }) => {
  await page.goto(`${BASE}/favorites`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-favorites.png`, fullPage: true });
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasYakinda = bodyText.toLowerCase().includes('yakında');
  console.log(`FAVORITES: Yakında=${hasYakinda} Length=${bodyText.length}`);
});

test('QUALITY: Compare - functional', async ({ page }) => {
  await page.goto(`${BASE}/compare`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-compare.png`, fullPage: true });
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasYakinda = bodyText.toLowerCase().includes('yakında');
  console.log(`COMPARE: Yakında=${hasYakinda} Length=${bodyText.length}`);
  console.log(`COMPARE preview: ${bodyText.substring(0, 300).replace(/\n/g, ' ')}`);
});

test('QUALITY: Notifications - functional', async ({ page }) => {
  await page.goto(`${BASE}/notifications`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-notifications.png`, fullPage: true });
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasYakinda = bodyText.toLowerCase().includes('yakında');
  console.log(`NOTIFICATIONS: Yakında=${hasYakinda} Length=${bodyText.length}`);
});

test('QUALITY: Host Calendar - functional', async ({ page }) => {
  await page.goto(`${BASE}/host/calendar`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-host-calendar.png`, fullPage: true });
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasYakinda = bodyText.toLowerCase().includes('yakında');
  const hasCalendar = await page.locator('[class*="calendar"], [class*="Calendar"], table').count();
  console.log(`HOST-CALENDAR: Yakında=${hasYakinda} Calendar=${hasCalendar} Length=${bodyText.length}`);
});

test('QUALITY: Host Bookings - functional', async ({ page }) => {
  await page.goto(`${BASE}/host/bookings`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-host-bookings.png`, fullPage: true });
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasYakinda = bodyText.toLowerCase().includes('yakında');
  console.log(`HOST-BOOKINGS: Yakında=${hasYakinda} Length=${bodyText.length}`);
});

test('QUALITY: Community New - form works', async ({ page }) => {
  await page.goto(`${BASE}/community/new`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-community-new.png`, fullPage: true });
  const inputs = await page.locator('input, textarea, select').count();
  const submitBtn = await page.locator('button[type="submit"]').count();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasYakinda = bodyText.toLowerCase().includes('yakında');
  console.log(`COMMUNITY-NEW: Inputs=${inputs} Submit=${submitBtn} Yakında=${hasYakinda}`);
});

test('QUALITY: Events New - form works', async ({ page }) => {
  await page.goto(`${BASE}/events/new`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-events-new.png`, fullPage: true });
  const inputs = await page.locator('input, textarea, select').count();
  const submitBtn = await page.locator('button[type="submit"]').count();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasYakinda = bodyText.toLowerCase().includes('yakında');
  console.log(`EVENTS-NEW: Inputs=${inputs} Submit=${submitBtn} Yakında=${hasYakinda}`);
});

test('QUALITY: Host Apply - form works', async ({ page }) => {
  await page.goto(`${BASE}/host/apply`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SS}-host-apply.png`, fullPage: true });
  const inputs = await page.locator('input, textarea, select').count();
  const submitBtn = await page.locator('button[type="submit"]').count();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasYakinda = bodyText.toLowerCase().includes('yakında');
  console.log(`HOST-APPLY: Inputs=${inputs} Submit=${submitBtn} Yakında=${hasYakinda}`);
});
