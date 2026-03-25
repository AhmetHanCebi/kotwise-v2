import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

// Login helper
async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.fill('deniz@kotwise.com');
  await passInput.fill('KotwiseTest2026!');
  const loginBtn = page.locator('button[type="submit"], button:has-text("Giriş")').first();
  await loginBtn.click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Döngü 7 — DERİN TEST', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14

  // ============================================================
  // DEVAM EDEN BUG #1: Listing thumbnail placeholder re-check
  // ============================================================
  test('BUG RE-CHECK — Favorites thumbnail placeholder', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-favorites.png`, fullPage: true });

    const imgs = page.locator('img');
    const imgCount = await imgs.count();
    let svgCount = 0;
    let realCount = 0;
    const prices: string[] = [];
    for (let i = 0; i < imgCount; i++) {
      const src = await imgs.nth(i).getAttribute('src') || '';
      if (src.includes('data:image/svg') || src.includes('placeholder')) svgCount++;
      else if (src.startsWith('http') || src.startsWith('/')) realCount++;
    }

    // Check prices
    const priceTexts = await page.locator('text=/\\d+.*TL|\\d+.*₺/').allTextContents();
    prices.push(...priceTexts);

    console.log(`Favorites: ${imgCount} img total, ${svgCount} SVG placeholder, ${realCount} real. Prices: ${prices.join(', ')}`);
    // Check if 100x price bug
    const has100x = prices.some(p => {
      const num = parseInt(p.replace(/[^\d]/g, ''));
      return num > 5000;
    });
    console.log(`Favorites 100x price bug: ${has100x}`);
  });

  test('BUG RE-CHECK — Compare thumbnail placeholder', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-compare.png`, fullPage: true });

    const imgs = page.locator('img');
    const imgCount = await imgs.count();
    let svgCount = 0;
    for (let i = 0; i < imgCount; i++) {
      const src = await imgs.nth(i).getAttribute('src') || '';
      if (src.includes('data:image/svg') || src.includes('placeholder')) svgCount++;
    }
    const priceTexts = await page.locator('text=/\\d+.*TL|\\d+.*₺/').allTextContents();
    console.log(`Compare: ${imgCount} img, ${svgCount} SVG placeholder. Prices: ${priceTexts.join(', ')}`);
  });

  test('BUG RE-CHECK — Booking thumbnail placeholder', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/booking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-booking.png`, fullPage: true });

    const imgs = page.locator('img');
    const imgCount = await imgs.count();
    let svgCount = 0;
    for (let i = 0; i < imgCount; i++) {
      const src = await imgs.nth(i).getAttribute('src') || '';
      if (src.includes('data:image/svg') || src.includes('placeholder')) svgCount++;
    }
    const priceTexts = await page.locator('text=/\\d+.*TL|\\d+.*₺/').allTextContents();
    console.log(`Booking: ${imgCount} img, ${svgCount} SVG placeholder. Prices: ${priceTexts.join(', ')}`);
  });

  test('BUG RE-CHECK — Profile bookings thumbnail placeholder', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-profile-bookings.png`, fullPage: true });

    const imgs = page.locator('img');
    const imgCount = await imgs.count();
    let svgCount = 0;
    for (let i = 0; i < imgCount; i++) {
      const src = await imgs.nth(i).getAttribute('src') || '';
      if (src.includes('data:image/svg') || src.includes('placeholder')) svgCount++;
    }
    const priceTexts = await page.locator('text=/\\d+.*TL|\\d+.*₺/').allTextContents();
    console.log(`Profile-bookings: ${imgCount} img, ${svgCount} SVG placeholder. Prices: ${priceTexts.join(', ')}`);
  });

  // ============================================================
  // DEVAM EDEN BUG #2: Roommates uyum yüzdesi
  // ============================================================
  test('BUG RE-CHECK — Roommates uyum yüzdesi', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-roommates.png`, fullPage: true });

    const uyumText = await page.locator('text=/Uyum/i').allTextContents();
    const percentText = await page.locator('text=/%/').allTextContents();
    const bodyText = await page.locator('body').textContent();
    const hasUyumYok = bodyText?.includes('Uyum bilgisi yok') || false;
    console.log(`Roommates uyum: ${uyumText.join(', ')} | percent: ${percentText.join(', ')} | "Uyum bilgisi yok": ${hasUyumYok}`);

    // Check roommates detail
    const detailLink = page.locator('a[href*="/roommates/"]').first();
    if (await detailLink.count() > 0) {
      await detailLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-roommates-detail.png`, fullPage: true });
      const detailBody = await page.locator('body').textContent();
      const detailUyumYok = detailBody?.includes('Uyum bilgisi yok') || false;
      const detailOrtakYok = detailBody?.includes('Ortak ilgi alanı yok') || false;
      console.log(`Roommates detail: "Uyum bilgisi yok": ${detailUyumYok}, "Ortak ilgi alanı yok": ${detailOrtakYok}`);
    }
  });

  // ============================================================
  // DEVAM EDEN BUG #3: Budget para birimi
  // ============================================================
  test('BUG RE-CHECK — Budget para birimi', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/budget`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-budget.png`, fullPage: true });

    const bodyText = await page.locator('body').textContent() || '';
    const hasEUR = bodyText.includes('EUR') || bodyText.includes('€');
    const hasTRY = bodyText.includes('TRY') || bodyText.includes('₺');
    const hasTL = bodyText.includes('TL');
    console.log(`Budget currency: EUR=${hasEUR}, TRY=${hasTRY}, TL=${hasTL}`);

    // Check slider values
    const sliders = page.locator('input[type="range"]');
    const sliderCount = await sliders.count();
    console.log(`Budget sliders: ${sliderCount}`);
  });

  // ============================================================
  // DERİN TEST — Fiyat regresyon kontrolü (6 sayfa)
  // ============================================================
  test('REGRESYON — Fiyat kontrolü (listing-detail)', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/listing/1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-listing-detail.png`, fullPage: true });

    const priceTexts = await page.locator('text=/\\d+.*TL|\\d+.*₺/').allTextContents();
    const has100x = priceTexts.some(p => parseInt(p.replace(/[^\d]/g, '')) > 5000);
    console.log(`Listing detail prices: ${priceTexts.join(' | ')} | 100x bug: ${has100x}`);

    // Check carousel
    const carouselImgs = page.locator('img[src*="http"], img[src^="/"]');
    const carouselCount = await carouselImgs.count();
    console.log(`Listing detail real images: ${carouselCount}`);
  });

  test('REGRESYON — Fiyat kontrolü (search-map)', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-search-map.png`, fullPage: true });

    // Check zoom level
    const tiles = page.locator('img[src*="tile.openstreetmap"]');
    const tileCount = await tiles.count();
    let zoomLevel = 'unknown';
    if (tileCount > 0) {
      const firstSrc = await tiles.first().getAttribute('src') || '';
      const match = firstSrc.match(/\/(\d+)\/\d+\/\d+/);
      if (match) zoomLevel = match[1];
    }

    // Marker prices
    const markerPrices = await page.locator('text=/\\d+.*TL|\\d+.*₺/').allTextContents();
    const has100x = markerPrices.some(p => parseInt(p.replace(/[^\d]/g, '')) > 5000);
    console.log(`Map: zoom=${zoomLevel}, tiles=${tileCount}, markers prices: ${markerPrices.slice(0, 5).join(', ')} | 100x: ${has100x}`);
  });

  test('REGRESYON — Fiyat kontrolü (homepage)', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-homepage.png`, fullPage: true });

    const priceTexts = await page.locator('text=/\\d+.*TL|\\d+.*₺/').allTextContents();
    const has100x = priceTexts.some(p => parseInt(p.replace(/[^\d]/g, '')) > 5000);
    console.log(`Homepage prices: ${priceTexts.slice(0, 5).join(' | ')} | 100x: ${has100x}`);
  });

  // ============================================================
  // DERİN TEST — Form doldurma ve submit
  // ============================================================
  test('DERİN TEST — Listing-new form validasyon', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/listing/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Try to submit without filling
    const devamBtn = page.locator('button:has-text("Devam"), button:has-text("İleri"), button[type="submit"]').first();
    if (await devamBtn.count() > 0) {
      await devamBtn.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-listing-new-validation.png`, fullPage: true });

    const bodyText = await page.locator('body').textContent() || '';
    const hasValidation = bodyText.includes('gerekli') || bodyText.includes('zorunlu') || bodyText.includes('required');
    console.log(`Listing-new validation: ${hasValidation}`);

    // Fill form step 1
    const titleInput = page.locator('input[name="title"], input[placeholder*="Başlık"], input').first();
    if (await titleInput.count() > 0) {
      await titleInput.fill('Test İlanı - Döngü 7');
    }

    // Check university field type
    const uniField = page.locator('input[name*="university"], input[name*="universite"], [role="combobox"]');
    const uniCount = await uniField.count();
    console.log(`University combobox count: ${uniCount}`);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-listing-new-filled.png`, fullPage: true });
  });

  test('DERİN TEST — Community-new form doldur', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/community/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-community-new.png`, fullPage: true });

    // Fill textarea
    const textarea = page.locator('textarea').first();
    if (await textarea.count() > 0) {
      await textarea.fill('Döngü 7 test gönderisi - Erasmus deneyimi harika!');
      await page.waitForTimeout(500);
    }

    // Check hashtag buttons
    const hashtagBtns = page.locator('button:has-text("#")');
    const hashCount = await hashtagBtns.count();
    console.log(`Community-new: ${hashCount} hashtag buttons`);

    // Click a hashtag
    if (hashCount > 0) {
      await hashtagBtns.first().click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-community-new-filled.png`, fullPage: true });
  });

  // ============================================================
  // DERİN TEST — Filtre ve etkileşim
  // ============================================================
  test('DERİN TEST — Search filtreler & listings', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-search.png`, fullPage: true });

    const listings = page.locator('a[href*="/listing/"]');
    const listingCount = await listings.count();

    // Check for filters
    const selects = page.locator('select');
    const selectCount = await selects.count();
    const sliders = page.locator('input[type="range"]');
    const sliderCount = await sliders.count();

    // Check images
    const imgs = page.locator('img');
    const imgCount = await imgs.count();
    let svgCount = 0;
    let realCount = 0;
    for (let i = 0; i < imgCount; i++) {
      const src = await imgs.nth(i).getAttribute('src') || '';
      if (src.includes('data:image/svg') || src.includes('placeholder')) svgCount++;
      else if (src.startsWith('http') || src.startsWith('/')) realCount++;
    }

    const priceTexts = await page.locator('text=/\\d+.*TL|\\d+.*₺/').allTextContents();
    console.log(`Search: ${listingCount} listings, ${selectCount} selects, ${sliderCount} sliders, ${imgCount} img (${svgCount} SVG, ${realCount} real). Prices: ${priceTexts.slice(0, 5).join(', ')}`);
  });

  test('DERİN TEST — Events filtreler & kategori', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-events.png`, fullPage: true });

    // Count category filter buttons
    const filterBtns = page.locator('button');
    const filterTexts = await filterBtns.allTextContents();
    const categories = filterTexts.filter(t => t.trim().length > 0 && t.trim().length < 20);
    console.log(`Events categories: ${categories.join(', ')}`);

    // Click "Kahve" filter
    const kahveBtn = page.locator('button:has-text("Kahve")').first();
    if (await kahveBtn.count() > 0) {
      await kahveBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-events-kahve-filter.png`, fullPage: true });
    }
  });

  test('DERİN TEST — Settings toggle etkileşim', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-settings.png`, fullPage: true });

    // Check toggles
    const toggles = page.locator('button[role="switch"], input[type="checkbox"]');
    const toggleCount = await toggles.count();
    console.log(`Settings: ${toggleCount} toggles`);

    // Check language/currency
    const bodyText = await page.locator('body').textContent() || '';
    const hasTurkce = bodyText.includes('Türkçe');
    const hasTRY = bodyText.includes('TRY');
    console.log(`Settings: Türkçe=${hasTurkce}, TRY=${hasTRY}`);
  });

  // ============================================================
  // DERİN TEST — Host earnings re-check
  // ============================================================
  test('BUG RE-CHECK — Host earnings currencySymbol', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/host/earnings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-host-earnings.png`, fullPage: true });

    const bodyText = await page.locator('body').textContent() || '';
    const hasCurrencySymbol = bodyText.includes('{currencySymbol}');
    const hasEUR = bodyText.includes('EUR');
    const hasEuroSign = bodyText.includes('€');
    console.log(`Host earnings: {currencySymbol} literal=${hasCurrencySymbol}, EUR=${hasEUR}, €=${hasEuroSign}`);
  });

  // ============================================================
  // DERİN TEST — Console error taraması
  // ============================================================
  test('CONSOLE ERRORS — 8 sayfa taraması', async ({ page }) => {
    await login(page);
    const errors: Record<string, string[]> = {};

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const url = page.url();
        if (!errors[url]) errors[url] = [];
        errors[url].push(msg.text().substring(0, 100));
      }
    });

    const pages = ['/favorites', '/compare', '/booking', '/profile/bookings', '/search/map', '/roommates', '/host/earnings', '/budget'];
    for (const p of pages) {
      await page.goto(`${BASE}${p}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    }

    for (const [url, msgs] of Object.entries(errors)) {
      console.log(`Console errors on ${url}: ${msgs.join(' | ')}`);
    }
    console.log(`Total pages with errors: ${Object.keys(errors).length}`);
  });

  // ============================================================
  // DERİN TEST — "Yakında" / placeholder taraması
  // ============================================================
  test('PLACEHOLDER — 10 sayfa taraması', async ({ page }) => {
    await login(page);

    const pages = ['/favorites', '/compare', '/booking', '/profile/bookings', '/roommates', '/mentors', '/host/apply', '/host/bookings', '/host/calendar', '/host/earnings'];
    const found: string[] = [];

    for (const p of pages) {
      await page.goto(`${BASE}${p}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const bodyText = await page.locator('body').textContent() || '';
      const checks = ['Yakında', 'Coming soon', 'lorem ipsum', 'TODO', '{currencySymbol}', '{currency}'];
      for (const check of checks) {
        if (bodyText.includes(check)) {
          found.push(`${p}: "${check}"`);
        }
      }
    }

    if (found.length > 0) {
      console.log(`Placeholder found: ${found.join(', ')}`);
    } else {
      console.log('Placeholder scan: ALL CLEAR — no placeholder text found');
    }
  });

  // ============================================================
  // DERİN TEST — Notifications, messages doğrulama
  // ============================================================
  test('DOĞRULAMA — Notifications & Messages', async ({ page }) => {
    await login(page);

    // Notifications
    await page.goto(`${BASE}/notifications`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-notifications.png`, fullPage: true });

    const bodyText = await page.locator('body').textContent() || '';
    const hasYukleniyor = bodyText.includes('Yükleniyor');
    const notifItems = page.locator('[class*="notification"], [class*="bildirim"], li, article');
    console.log(`Notifications: "Yükleniyor" stuck=${hasYukleniyor}`);

    // Messages
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-messages.png`, fullPage: true });

    // Go to first conversation
    const convLink = page.locator('a[href*="/messages/"]').first();
    if (await convLink.count() > 0) {
      await convLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-messages-detail.png`, fullPage: true });

      const chatInput = page.locator('input[placeholder*="Mesaj"], textarea[placeholder*="Mesaj"]');
      const hasInput = await chatInput.count() > 0;
      console.log(`Messages detail: chat input=${hasInput}`);
    }
  });

  // ============================================================
  // DERİN TEST — Mentors (içerik zenginliği)
  // ============================================================
  test('DERİN TEST — Mentors içerik', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/mentors`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-mentors.png`, fullPage: true });

    // Count mentor cards
    const mentorCards = page.locator('[class*="mentor"], [class*="card"]');
    const mentorCount = await mentorCards.count();

    const bodyText = await page.locator('body').textContent() || '';
    const mentorNames: string[] = [];
    if (bodyText.includes('Maria')) mentorNames.push('Maria Garcia');
    if (bodyText.includes('Carlos')) mentorNames.push('Carlos Martínez');

    // Check city filters
    const filterBtns = page.locator('button:has-text("Barcelona"), button:has-text("Berlin"), button:has-text("İstanbul"), button:has-text("Lizbon")');
    const filterCount = await filterBtns.count();

    console.log(`Mentors: ${mentorNames.length} mentors (${mentorNames.join(', ')}), ${filterCount} city filters`);
  });
});
