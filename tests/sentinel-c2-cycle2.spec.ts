import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

// Login helper
async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
  await emailInput.fill('deniz@kotwise.com');

  const passInput = page.locator('input[type="password"], input[name="password"]').first();
  await passInput.fill('KotwiseTest2026!');

  const loginBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login"), button:has-text("giriş")').first();
  await loginBtn.click();

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

// Helper: check page loaded
async function checkPage(page: Page, path: string, name: string) {
  await page.goto(`${BASE}${path}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const currentUrl = page.url();
  const redirectedToLogin = currentUrl.includes('/login') || currentUrl.includes('/welcome');
  const bodyText = await page.locator('body').innerText();

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-${name}.png`, fullPage: true });

  return { url: currentUrl, redirectedToLogin, bodyText };
}

// ============================================================
// PART 1: Login + AuthGuard pages (19 pages from Cycle 1 LOGIN REDIRECT)
// ============================================================
test.describe('C2 - AuthGuard Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  const authPages = [
    { path: '/roommates', name: 'roommates' },
    { path: '/messages', name: 'messages' },
    { path: '/messages/new', name: 'messages-new' },
    { path: '/community/new', name: 'community-new' },
    { path: '/events/new', name: 'events-new' },
    { path: '/profile', name: 'profile' },
    { path: '/profile/edit', name: 'profile-edit' },
    { path: '/profile/bookings', name: 'profile-bookings' },
    { path: '/host', name: 'host' },
    { path: '/host/apply', name: 'host-apply' },
    { path: '/host/bookings', name: 'host-bookings' },
    { path: '/host/calendar', name: 'host-calendar' },
    { path: '/host/earnings', name: 'host-earnings' },
    { path: '/favorites', name: 'favorites' },
    { path: '/compare', name: 'compare' },
    { path: '/notifications', name: 'notifications' },
    { path: '/settings', name: 'settings-main' },
    { path: '/booking', name: 'booking' },
    { path: '/listing/new', name: 'listing-new' },
  ];

  for (const pg of authPages) {
    test(`${pg.name} - ${pg.path}`, async ({ page }) => {
      const result = await checkPage(page, pg.path, pg.name);

      expect(result.redirectedToLogin, `${pg.name} still redirects to login`).toBe(false);

      const hasYakinda = /yakında|coming soon|bu özellik|çok yakında/i.test(result.bodyText);
      if (hasYakinda) {
        console.log(`YAKINDA: ${pg.name} has placeholder text`);
      }

      const hasContent = result.bodyText.trim().length > 50;
      console.log(`${pg.name}: loaded=${!result.redirectedToLogin}, content=${hasContent}, yakinda=${hasYakinda}, url=${result.url}`);
    });
  }
});

// ============================================================
// PART 2: Re-test UYARI pages
// ============================================================
test.describe('C2 - UYARI Re-check', () => {

  test('Community - Fotograf Yok placeholder', async ({ page }) => {
    await page.goto(`${BASE}/community`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const noPhotoCount = await page.locator('text=/fotoğraf yok/i').count();
    const imgPlaceholders = await page.locator('img[src*="placeholder"], img[alt*="placeholder"]').count();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-community-recheck.png`, fullPage: true });

    console.log(`Community: fotograf_yok=${noPhotoCount}, img_placeholders=${imgPlaceholders}`);
  });

  test('Mentors - Turkish encoding', async ({ page }) => {
    await page.goto(`${BASE}/mentors`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bodyText = await page.locator('body').innerText();
    const encodingBroken = /Ã|â€/.test(bodyText);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-mentors-recheck.png`, fullPage: true });

    console.log(`Mentors: encoding_broken=${encodingBroken}`);
  });

  test('City Detail - EUR currency', async ({ page }) => {
    await page.goto(`${BASE}/city`);
    await page.waitForLoadState('networkidle');

    const cityLink = page.locator('a[href*="/city/"]').first();
    if (await cityLink.count() > 0) {
      await cityLink.click();
    } else {
      await page.goto(`${BASE}/city/1`);
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bodyText = await page.locator('body').innerText();
    const hasEUR = bodyText.includes('EUR') || bodyText.includes('\u20AC');
    const hasTL = bodyText.includes('TL') || bodyText.includes('\u20BA');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-city-detail-recheck.png`, fullPage: true });

    console.log(`City Detail: EUR=${hasEUR}, TL=${hasTL}`);
  });

  test('Listing Detail - TRY label', async ({ page }) => {
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');

    const listingLink = page.locator('a[href*="/listing/"]').first();
    if (await listingLink.count() > 0) {
      await listingLink.click();
    } else {
      await page.goto(`${BASE}/listing/1`);
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bodyText = await page.locator('body').innerText();
    const hasTRY = bodyText.includes('TRY');
    const hasTL = bodyText.includes('TL') || bodyText.includes('\u20BA');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-listing-detail-recheck.png`, fullPage: true });

    console.log(`Listing Detail: TRY_label=${hasTRY}, TL=${hasTL}`);
  });

  test('Budget - EUR currency', async ({ page }) => {
    await page.goto(`${BASE}/budget`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bodyText = await page.locator('body').innerText();
    const hasEUR = bodyText.includes('EUR') || bodyText.includes('\u20AC');
    const hasTL = bodyText.includes('TL') || bodyText.includes('\u20BA');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-budget-recheck.png`, fullPage: true });

    console.log(`Budget: EUR=${hasEUR}, TL=${hasTL}`);
  });
});

// ============================================================
// PART 3: Product Quality Checks
// ============================================================
test.describe('C2 - Product Quality', () => {

  test('Search - carousel swipe check', async ({ page }) => {
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const swiperEl = await page.locator('.swiper, [class*="carousel"], [class*="slider"], [class*="Swiper"]').count();
    const imgs = await page.locator('img').count();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-search-carousel.png`, fullPage: true });

    console.log(`Search: swiper_elements=${swiperEl}, total_images=${imgs}`);
  });

  test('Profile Edit - university field type', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/profile/edit`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bodyText = await page.locator('body').innerText();
    const hasUniField = /üniversite|university/i.test(bodyText);

    const selects = await page.locator('select').count();
    const comboboxes = await page.locator('[role="combobox"], [role="listbox"], [class*="autocomplete"], [class*="Autocomplete"]').count();
    const textInputs = await page.locator('input[type="text"]').count();

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-profile-edit-uni.png`, fullPage: true });
    console.log(`Profile Edit: uni_field=${hasUniField}, selects=${selects}, comboboxes=${comboboxes}, text_inputs=${textInputs}`);
  });

  test('Yakinda placeholder pages check', async ({ page }) => {
    await login(page);

    const pagesCheck = [
      '/roommates', '/compare', '/booking', '/host',
      '/favorites', '/notifications', '/host/calendar',
      '/host/earnings', '/host/bookings',
    ];

    const yakindaFound: string[] = [];

    for (const p of pagesCheck) {
      await page.goto(`${BASE}${p}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      const bodyText = await page.locator('body').innerText();
      if (/yakında|coming soon|bu özellik|çok yakında|henüz|boş/i.test(bodyText)) {
        yakindaFound.push(p);
        const safeName = p.replace(/\//g, '-').slice(1);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-yakinda-${safeName}.png`, fullPage: true });
      }
    }

    console.log(`YAKINDA/PLACEHOLDER PAGES: ${yakindaFound.length > 0 ? yakindaFound.join(', ') : 'NONE'}`);
  });

  test('Booking - Stripe integration check', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/booking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bodyText = await page.locator('body').innerText();
    const hasStripe = await page.locator('iframe[src*="stripe"], [class*="stripe"], [id*="stripe"]').count();
    const hasPaymentForm = await page.locator('input[name*="card"], [class*="payment"], [class*="Payment"]').count();

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-booking-stripe.png`, fullPage: true });
    console.log(`Booking: stripe_elements=${hasStripe}, payment_form=${hasPaymentForm}`);
    console.log(`Booking body preview: ${bodyText.substring(0, 300)}`);
  });
});
