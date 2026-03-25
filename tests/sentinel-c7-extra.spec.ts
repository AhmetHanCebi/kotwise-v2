import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

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

test.describe('Döngü 7 — Ek Testler', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  // Listing detail — doğru ID ile test et
  test('Listing detail — gerçek ID bul ve test et', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get first listing link
    const listingLink = page.locator('a[href*="/listing/"]').first();
    const href = await listingLink.getAttribute('href');
    console.log(`First listing link: ${href}`);

    if (href) {
      await page.goto(`${BASE}${href}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-listing-detail-real.png`, fullPage: true });

      const priceTexts = await page.locator('text=/\\d+.*₺|\\d+.*TL/').allTextContents();
      const has100x = priceTexts.some(p => parseInt(p.replace(/[^\d]/g, '')) > 5000);
      console.log(`Listing detail prices: ${priceTexts.join(' | ')} | 100x: ${has100x}`);

      // Check carousel images
      const imgs = page.locator('img');
      const imgCount = await imgs.count();
      let realImgs = 0;
      for (let i = 0; i < imgCount; i++) {
        const src = await imgs.nth(i).getAttribute('src') || '';
        if (src.startsWith('http') && !src.includes('data:')) realImgs++;
      }
      console.log(`Listing detail: ${imgCount} img total, ${realImgs} real`);

      // Check features
      const bodyText = await page.locator('body').textContent() || '';
      const hasRezervasyon = bodyText.includes('Rezervasyon Yap');
      const hasSuperhost = bodyText.includes('SUPERHOST');
      console.log(`Listing detail: Rezervasyon Yap=${hasRezervasyon}, SUPERHOST=${hasSuperhost}`);
    }
  });

  // Roommates detail — doğru şekilde bekleyerek test et
  test('Roommates detail — spinner kontrolü', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find and click any profile link or detail button
    const detailLink = page.locator('a[href*="/roommates/"]').first();
    const profileBtn = page.locator('button:has-text("Profil"), button:has-text("Detay")').first();

    let navigated = false;
    if (await detailLink.count() > 0) {
      const href = await detailLink.getAttribute('href');
      console.log(`Roommates detail link: ${href}`);
      await detailLink.click();
      navigated = true;
    } else if (await profileBtn.count() > 0) {
      await profileBtn.click();
      navigated = true;
    }

    if (navigated) {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000); // Extra wait for detail page
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-roommates-detail-wait.png`, fullPage: true });

      const bodyText = await page.locator('body').textContent() || '';
      const hasSpinner = await page.locator('[class*="spin"], [class*="loading"], [class*="animate"]').count();
      const hasUyumYok = bodyText.includes('Uyum bilgisi yok');
      const hasOrtakYok = bodyText.includes('Ortak ilgi alanı yok');
      const hasCanOzkan = bodyText.includes('Can') || bodyText.includes('Özkan');
      console.log(`Roommates detail (5s wait): spinner=${hasSpinner}, "Uyum bilgisi yok"=${hasUyumYok}, "Ortak ilgi alanı yok"=${hasOrtakYok}, name visible=${hasCanOzkan}`);
    } else {
      console.log('No roommates detail link found — checking for alternative navigation');
      // Try clicking on the card itself
      const card = page.locator('[class*="card"]').first();
      if (await card.count() > 0) {
        await card.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-roommates-detail-card.png`, fullPage: true });
      }
    }
  });

  // Search-map marker fiyat detaylı kontrol
  test('Search-map — marker fiyat detaylı kontrol', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Get ALL marker price texts
    const allMarkers = await page.locator('.leaflet-marker-icon, [class*="marker"], [class*="popup"]').allTextContents();
    const priceTexts = await page.locator('text=/\\d+\\s*₺|\\d+\\s*TL/').allTextContents();

    // Check for any 100x prices
    let normalPrices = 0;
    let wrongPrices = 0;
    for (const p of priceTexts) {
      const num = parseInt(p.replace(/[^\d]/g, ''));
      if (num > 0 && num < 2000) normalPrices++;
      else if (num >= 5000) wrongPrices++;
    }

    console.log(`Map markers: ${priceTexts.length} prices found. Normal (<2000): ${normalPrices}, Wrong (>5000): ${wrongPrices}`);
    console.log(`Map all prices: ${priceTexts.join(', ')}`);
  });

  // Compare sayfası — karşılaştırma tablosu kontrol
  test('Compare — tablo etkileşim testi', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-compare-detail.png`, fullPage: true });

    const bodyText = await page.locator('body').textContent() || '';
    const hasKonum = bodyText.includes('Konum');
    const hasOdaTipi = bodyText.includes('Oda Tipi') || bodyText.includes('Oda');
    const hasWifi = bodyText.includes('WiFi') || bodyText.includes('Wi-Fi');
    const hasPuan = bodyText.includes('Puan') || bodyText.includes('puan');
    console.log(`Compare table: Konum=${hasKonum}, OdaTipi=${hasOdaTipi}, WiFi=${hasWifi}, Puan=${hasPuan}`);
  });

  // Host earnings — TL mi EUR mu kontrol
  test('Host earnings — para birimi detaylı', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/host/earnings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const bodyText = await page.locator('body').textContent() || '';
    // Check all currency symbols
    const hasTL = bodyText.includes('₺');
    const hasEUR = bodyText.includes('€');
    const hasUSD = bodyText.includes('$');
    const hasCurrencyVar = bodyText.includes('{currency');
    console.log(`Host earnings currency: ₺=${hasTL}, €=${hasEUR}, $=${hasUSD}, template var=${hasCurrencyVar}`);
  });

  // Profil bookings — detaylı fiyat kontrolü
  test('Profile bookings — fiyat + thumbnail', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-profile-bookings-detail.png`, fullPage: true });

    const priceTexts = await page.locator('text=/\\d+.*₺|\\d+.*TL/').allTextContents();
    const bodyText = await page.locator('body').textContent() || '';

    // Check filters
    const hasAktif = bodyText.includes('Aktif');
    const hasGecmis = bodyText.includes('Geçmiş');
    const hasIptal = bodyText.includes('İptal');

    console.log(`Profile bookings: prices=${priceTexts.join(', ')}, Aktif=${hasAktif}, Geçmiş=${hasGecmis}, İptal=${hasIptal}`);
  });
});
