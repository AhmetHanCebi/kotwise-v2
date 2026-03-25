import { test, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.fill('deniz@kotwise.com');
  await passInput.fill('KotwiseTest2026!');
  await page.locator('button[type="submit"], button:has-text("Giriş")').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

// Price check across all pages
test('PRICE-CHECK: All pages price validation', async ({ page }) => {
  await login(page);

  const pricePages = [
    { name: 'homepage', path: '/' },
    { name: 'search', path: '/search' },
    { name: 'favorites', path: '/favorites' },
    { name: 'compare', path: '/compare' },
    { name: 'booking', path: '/booking' },
    { name: 'profile-bookings', path: '/profile/bookings' },
    { name: 'search-map', path: '/search/map' },
  ];

  for (const p of pricePages) {
    await page.goto(`${BASE}${p.path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const text = await page.textContent('body');
    // Match all number patterns near currency symbols
    const allPrices = text?.match(/[\d.]+\s*(?:₺|TL|EUR|€|lira)/g);
    const bigPrices = text?.match(/\d{4,}\s*(?:₺|TL)/g);
    console.log(`${p.name}: all=${JSON.stringify(allPrices?.slice(0, 8))}, big=${JSON.stringify(bigPrices)}`);
  }
});

// Listing detail price + booking button
test('LISTING-DETAIL: Price and booking button', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const listingLinks = page.locator('a[href*="/listing/"]');
  if (await listingLinks.count() > 0) {
    await listingLinks.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const text = await page.textContent('body');
    const prices = text?.match(/[\d.]+\s*(?:₺|TL|EUR|€)/g);
    console.log(`DETAIL: prices=${JSON.stringify(prices)}`);

    // Check booking button
    const bookBtn = page.locator('button:has-text("Rezervasyon"), a:has-text("Rezervasyon")');
    console.log(`DETAIL: booking button=${await bookBtn.count()}`);

    // Scroll down and check
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    const afterScrollText = await page.textContent('body');
    const scrollPrices = afterScrollText?.match(/[\d.]+\s*(?:₺|TL|EUR|€)/g);
    console.log(`DETAIL after scroll: prices=${JSON.stringify(scrollPrices)}`);
  }
});

// Favorite button with force click
test('FAVORITE: Force click test', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const listingLinks = page.locator('a[href*="/listing/"]');
  if (await listingLinks.count() > 0) {
    await listingLinks.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const favBtn = page.locator('button[aria-label*="Favori"]');
    if (await favBtn.count() > 0) {
      await favBtn.first().click({ force: true });
      await page.waitForTimeout(1000);
      console.log('FAVORITE: Force clicked!');

      // Check if state changed
      const newAria = await favBtn.first().getAttribute('aria-label');
      console.log(`FAVORITE: After click aria: ${newAria}`);
      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-favorite-clicked.png', fullPage: true });
    }
  }
});

// Booking button with force click
test('BOOKING: Force click Rezervasyon Yap', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const listingLinks = page.locator('a[href*="/listing/"]');
  if (await listingLinks.count() > 0) {
    await listingLinks.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Scroll to booking button
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    const bookBtn = page.locator('button:has-text("Rezervasyon"), a:has-text("Rezervasyon")');
    console.log(`BOOKING: Button count: ${await bookBtn.count()}`);

    if (await bookBtn.count() > 0) {
      await bookBtn.first().click({ force: true });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log(`BOOKING: URL: ${page.url()}`);
      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-booking-after-click.png', fullPage: true });

      const text = await page.textContent('body');
      console.log(`BOOKING: Has date: ${text?.includes('Tarih') || text?.includes('tarih')}`);
      console.log(`BOOKING: Has payment: ${text?.includes('deme') || text?.includes('Stripe') || text?.includes('Kart')}`);
      console.log(`BOOKING: Has confirm: ${text?.includes('Onayla') || text?.includes('Tamamla') || text?.includes('Devam')}`);

      // All buttons
      const btns = page.locator('button');
      const btnTexts: string[] = [];
      for (let i = 0; i < Math.min(await btns.count(), 15); i++) {
        btnTexts.push((await btns.nth(i).textContent())?.trim() || '');
      }
      console.log(`BOOKING: Buttons: ${JSON.stringify(btnTexts)}`);

      // Form elements
      const inputs = page.locator('input, select, textarea');
      console.log(`BOOKING: Inputs: ${await inputs.count()}`);
    }
  }
});

// Host earnings check
test('HOST-EARNINGS: Currency check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/earnings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c8-host-earnings.png', fullPage: true });

  const text = await page.textContent('body');
  console.log(`EARNINGS: Has {currencySymbol}: ${text?.includes('{currencySymbol}')}`);
  console.log(`EARNINGS: Has EUR: ${text?.includes('EUR')}`);
  console.log(`EARNINGS: Has TL: ${text?.includes('TL') || text?.includes('₺')}`);
  const prices = text?.match(/[\d.]+\s*(?:₺|TL|EUR|€)/g);
  console.log(`EARNINGS: Prices: ${JSON.stringify(prices)}`);
});
