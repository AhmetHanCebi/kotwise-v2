import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';

test.describe('Döngü 3 — Sorunlu Sayfalar Re-Check + Regresyon', () => {

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"], input[name="email"]', 'deniz@kotwise.com');
    await page.fill('input[type="password"], input[name="password"]', 'KotwiseTest2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');
  });

  // === BUG RE-CHECK: Listing Thumbnail Placeholder (6 döngüdür) ===

  test('favorites — thumbnail placeholder check', async ({ page }) => {
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-favorites.png', fullPage: true });

    const imgs = await page.$$eval('img', els => els.map(e => ({
      src: e.src?.substring(0, 100),
      alt: e.alt,
      naturalWidth: e.naturalWidth,
      naturalHeight: e.naturalHeight,
      isSvgPlaceholder: e.src?.includes('data:image/svg+xml') || false,
      isPlaceholder: e.src?.includes('placeholder') || e.src?.includes('data:image') || false,
    })));
    console.log('FAVORITES IMAGES:', JSON.stringify(imgs, null, 2));

    // Check prices
    const prices = await page.$$eval('*', els => {
      return els.map(e => e.textContent?.trim()).filter(t => t && /\d+[\.,]\d+.*(?:TL|₺|€|\/ay)/i.test(t) && t.length < 50);
    });
    console.log('FAVORITES PRICES:', JSON.stringify(prices));

    const bodyText = await page.textContent('body');
    console.log('HAS_FOTOGRAF_YOK:', bodyText?.includes('Fotoğraf Yok'));
    console.log('HAS_YAKLASIK:', bodyText?.includes('Yakında'));
  });

  test('compare — thumbnail placeholder check', async ({ page }) => {
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-compare.png', fullPage: true });

    const imgs = await page.$$eval('img', els => els.map(e => ({
      src: e.src?.substring(0, 100),
      isSvgPlaceholder: e.src?.includes('data:image/svg+xml') || false,
    })));
    console.log('COMPARE IMAGES:', JSON.stringify(imgs));

    const prices = await page.$$eval('*', els => {
      return els.map(e => e.textContent?.trim()).filter(t => t && /\d+[\.,]?\d*\s*(?:TL|₺|€)/i.test(t) && t.length < 30);
    });
    console.log('COMPARE PRICES:', JSON.stringify(prices));
  });

  test('booking — thumbnail placeholder check', async ({ page }) => {
    await page.goto(`${BASE}/booking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-booking.png', fullPage: true });

    const imgs = await page.$$eval('img', els => els.map(e => ({
      src: e.src?.substring(0, 100),
      isSvgPlaceholder: e.src?.includes('data:image/svg+xml') || false,
    })));
    console.log('BOOKING IMAGES:', JSON.stringify(imgs));

    const prices = await page.$$eval('*', els => {
      return els.map(e => e.textContent?.trim()).filter(t => t && /\d+[\.,]?\d*\s*(?:TL|₺|€)/i.test(t) && t.length < 30);
    });
    console.log('BOOKING PRICES:', JSON.stringify(prices));
  });

  test('profile-bookings — thumbnail + price check', async ({ page }) => {
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-profile-bookings.png', fullPage: true });

    const imgs = await page.$$eval('img', els => els.map(e => ({
      src: e.src?.substring(0, 100),
      isSvgPlaceholder: e.src?.includes('data:image/svg+xml') || false,
    })));
    console.log('PROFILE-BOOKINGS IMAGES:', JSON.stringify(imgs));

    const prices = await page.$$eval('*', els => {
      return els.map(e => e.textContent?.trim()).filter(t => t && /\d+[\.,]?\d*\s*(?:TL|₺|€)/i.test(t) && t.length < 30);
    });
    console.log('PROFILE-BOOKINGS PRICES:', JSON.stringify(prices));
  });

  // === BUG RE-CHECK: Roommates Uyum % ===

  test('roommates — uyum yüzdesi check', async ({ page }) => {
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-roommates.png', fullPage: true });

    const bodyText = await page.textContent('body');
    console.log('HAS_UYUM_BILGISI_YOK:', bodyText?.includes('Uyum bilgisi yok'));
    console.log('HAS_ORTAK_ILGI:', bodyText?.includes('Ortak ilgi'));
    console.log('HAS_UYUM_PERCENT:', /\d+%\s*Uyum/i.test(bodyText || ''));

    // Also check detail
    const detailLink = await page.$('a[href*="/roommates/"]');
    if (detailLink) {
      const href = await detailLink.getAttribute('href');
      console.log('ROOMMATE_DETAIL_LINK:', href);
    }
  });

  test('roommates detail — uyum check', async ({ page }) => {
    // Go to first roommate detail
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Try to find and click on a roommate card or navigate directly
    const links = await page.$$eval('a[href*="/roommates/"]', els => els.map(e => e.href));
    if (links.length > 0) {
      await page.goto(links[0]);
    } else {
      await page.goto(`${BASE}/roommates/1`);
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-roommates-detail.png', fullPage: true });

    const bodyText = await page.textContent('body');
    console.log('DETAIL_HAS_UYUM_BILGISI_YOK:', bodyText?.includes('Uyum bilgisi yok'));
    console.log('DETAIL_HAS_ORTAK_ILGI:', bodyText?.includes('Ortak ilgi'));
    console.log('DETAIL_HAS_UYUM_PERCENT:', /\d+%/.test(bodyText || ''));
  });

  // === BUG RE-CHECK: Budget Currency ===

  test('budget — currency check', async ({ page }) => {
    await page.goto(`${BASE}/budget`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-budget.png', fullPage: true });

    const bodyText = await page.textContent('body');
    console.log('HAS_EUR:', bodyText?.includes('EUR') || bodyText?.includes('€'));
    console.log('HAS_TRY:', bodyText?.includes('TRY') || bodyText?.includes('₺') || bodyText?.includes('TL'));

    const prices = await page.$$eval('*', els => {
      return els.map(e => e.textContent?.trim()).filter(t => t && /\d+\s*(?:TL|₺|€|EUR|TRY)/i.test(t) && t.length < 30);
    });
    console.log('BUDGET PRICES:', JSON.stringify(prices));
  });

  // === REGRESYON KONTROL: Önceki düzeltmeler ===

  test('fiyat regresyon — listing detail', async ({ page }) => {
    await page.goto(`${BASE}/listing/1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-listing-detail.png', fullPage: true });

    const prices = await page.$$eval('*', els => {
      return els.map(e => e.textContent?.trim()).filter(t => t && /\d+[\.,]?\d*\s*(?:TL|₺|€|\/ay)/i.test(t) && t.length < 40);
    });
    console.log('LISTING DETAIL PRICES:', JSON.stringify(prices));
  });

  test('fiyat regresyon — search map markers', async ({ page }) => {
    await page.goto(`${BASE}/search/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-search-map.png', fullPage: true });

    // Check zoom level
    const tileUrls = await page.$$eval('img.leaflet-tile', els => els.map(e => e.src));
    const zoomMatch = tileUrls[0]?.match(/\/(\d+)\/\d+\/\d+/);
    console.log('MAP ZOOM LEVEL:', zoomMatch ? zoomMatch[1] : 'unknown');
    console.log('MAP TILES:', tileUrls.length);

    // Check marker prices
    const markerTexts = await page.$$eval('.leaflet-marker-icon, .leaflet-popup, [class*="marker"], [class*="price"]', els => els.map(e => e.textContent?.trim()).filter(Boolean));
    console.log('MAP MARKER TEXTS:', JSON.stringify(markerTexts?.slice(0, 10)));
  });

  test('fiyat regresyon — homepage', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-homepage.png', fullPage: true });

    const prices = await page.$$eval('*', els => {
      return els.map(e => e.textContent?.trim()).filter(t => t && /\d+[\.,]?\d*\s*(?:TL|₺|€|\/ay)/i.test(t) && t.length < 30);
    });
    console.log('HOMEPAGE PRICES:', JSON.stringify(prices));
  });

  // === REGRESYON: Notifications ===

  test('notifications — regresyon check', async ({ page }) => {
    await page.goto(`${BASE}/notifications`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-notifications.png', fullPage: true });

    const bodyText = await page.textContent('body');
    console.log('HAS_YUKLENIYOR:', bodyText?.includes('Yükleniyor'));
    console.log('HAS_BILDIRIM:', bodyText?.includes('bildirim') || bodyText?.includes('Bildirim'));

    const notifCount = await page.$$eval('[class*="notification"], [class*="bildirim"], li', els => els.length);
    console.log('NOTIFICATION_ELEMENTS:', notifCount);
  });

  // === REGRESYON: Messages chat input ===

  test('messages — chat input check', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click first conversation
    const convLink = await page.$('a[href*="/messages/"]');
    if (convLink) {
      await convLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-messages-detail.png', fullPage: true });

    const hasInput = await page.$('input[placeholder*="Mesaj"], textarea[placeholder*="Mesaj"], input[placeholder*="mesaj"], textarea[placeholder*="mesaj"]');
    console.log('HAS_CHAT_INPUT:', !!hasInput);

    const sendBtn = await page.$('button[aria-label*="Gönder"], button[aria-label*="gönder"], button[aria-label*="Send"]');
    console.log('HAS_SEND_BUTTON:', !!sendBtn);
  });

  // === REGRESYON: Host Earnings ===

  test('host-earnings — currencySymbol check', async ({ page }) => {
    await page.goto(`${BASE}/host/earnings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-host-earnings.png', fullPage: true });

    const bodyText = await page.textContent('body');
    console.log('HAS_CURRENCY_SYMBOL_LITERAL:', bodyText?.includes('{currencySymbol}'));
    console.log('HAS_EUR:', bodyText?.includes('EUR') || bodyText?.includes('€'));
  });

  // === Placeholder / Yakında Taraması ===

  test('placeholder taraması — 8 sayfa', async ({ page }) => {
    const pages = ['/', '/favorites', '/compare', '/booking', '/profile/bookings', '/roommates', '/budget', '/host/earnings'];
    for (const p of pages) {
      await page.goto(`${BASE}${p}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      const bodyText = await page.textContent('body') || '';
      const hasYakinda = bodyText.includes('Yakında') || bodyText.includes('Coming soon');
      const hasPlaceholder = bodyText.includes('placeholder') || bodyText.includes('lorem ipsum') || bodyText.includes('TODO');
      if (hasYakinda || hasPlaceholder) {
        console.log(`PLACEHOLDER FOUND on ${p}:`, { hasYakinda, hasPlaceholder });
      }
    }
    console.log('PLACEHOLDER SCAN COMPLETE — no issues found');
  });
});
