import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const EMAIL = 'deniz@kotwise.com';
const PASSWORD = 'KotwiseTest2026!';
const SS = 'C:/Yerel_Disc_D/Atlat_V3/Project/kotwise-v2/tests/screenshots';

test.describe('C10 — Akış Testi: Ara → Favorile → Booking → Mesaj', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  async function login(page) {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
    const passInput = page.locator('input[type="password"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(EMAIL);
    await passInput.fill(PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Giriş")').first().click();
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  function imgStats(page) {
    return page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let svg = 0, real = 0, broken = 0;
      imgs.forEach(img => {
        if (img.src.includes('data:image/svg') || img.src.includes('placeholder')) svg++;
        else if (!img.complete || img.naturalWidth === 0) broken++;
        else if (img.src.length > 10) real++;
      });
      return { total: imgs.length, svg, real, broken };
    });
  }

  function priceCheck(text: string, label: string) {
    const prices = text.match(/[\d.]+\s*₺/g) || [];
    const results: string[] = [];
    let has100x = false;
    for (const p of prices) {
      const num = parseInt(p.replace(/[^0-9]/g, ''));
      if (num > 5000) { has100x = true; results.push(`100x_BUG:${p}`); }
      else results.push(p);
    }
    console.log(`${label} PRICES: ${results.slice(0, 8).join(', ')}`);
    if (has100x) console.log(`*** ${label} 100x PRICE BUG ***`);
    return { prices: results, has100x };
  }

  // ===== 1: SEARCH =====
  test('C10-01 Search: İlan listesi, fotoğraf, fiyat', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-search.png`, fullPage: true });

    const links = await page.locator('a[href*="/listing/"]').count();
    console.log(`SEARCH: ${links} listing links`);
    const imgs = await imgStats(page);
    console.log(`SEARCH IMAGES: ${imgs.real} real, ${imgs.svg} SVG, ${imgs.broken} broken`);
    const bodyText = await page.locator('body').textContent() || '';
    priceCheck(bodyText, 'SEARCH');
    expect(links).toBeGreaterThan(0);
  });

  // ===== 2: DETAIL =====
  test('C10-02 Detail: Carousel, fiyat, butonlar', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.locator('a[href*="/listing/"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-listing-detail.png`, fullPage: true });

    const bodyText = await page.locator('body').textContent() || '';
    priceCheck(bodyText, 'DETAIL');
    const imgs = await imgStats(page);
    console.log(`DETAIL IMAGES: ${imgs.real} real, ${imgs.svg} SVG`);

    const favBtn = await page.locator('[aria-label*="Favori"], [aria-label*="favori"]').count();
    const bookBtn = await page.locator('button:has-text("Rezervasyon"), a:has-text("Rezervasyon")').count();
    const msgBtn = await page.locator('button:has-text("Mesaj"), a:has-text("Mesaj")').count();
    console.log(`DETAIL BUTTONS: Favori=${favBtn > 0}, Rezervasyon=${bookBtn > 0}, Mesaj=${msgBtn > 0}`);

    const hasSuperhost = bodyText.includes('SUPERHOST') || bodyText.includes('Superhost');
    const carousel = bodyText.match(/\d+\/\d+/);
    console.log(`DETAIL: SUPERHOST=${hasSuperhost}, CAROUSEL=${carousel ? carousel[0] : 'yok'}`);
  });

  // ===== 3: FAVORITES =====
  test('C10-03 Favorites: Fotoğraf, fiyat', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-favorites.png`, fullPage: true });

    const imgs = await imgStats(page);
    console.log(`FAVORITES IMAGES: ${imgs.real} real, ${imgs.svg} SVG`);
    const bodyText = await page.locator('body').textContent() || '';
    priceCheck(bodyText, 'FAVORITES');
    const compareBtn = await page.locator('button:has-text("Karşılaştır"), a:has-text("Karşılaştır")').count();
    console.log(`FAVORITES KARSILASTIR: ${compareBtn > 0}`);
  });

  // ===== 4: COMPARE =====
  test('C10-04 Compare: Fotoğraf, tablo, fiyat', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-compare.png`, fullPage: true });

    const imgs = await imgStats(page);
    console.log(`COMPARE IMAGES: ${imgs.real} real, ${imgs.svg} SVG`);
    const bodyText = await page.locator('body').textContent() || '';
    priceCheck(bodyText, 'COMPARE');
    const hasTable = bodyText.includes('Fiyat') || bodyText.includes('WiFi') || bodyText.includes('Puan');
    console.log(`COMPARE TABLO: ${hasTable}`);
  });

  // ===== 5: BOOKING =====
  test('C10-05 Booking: Fiyat, durum, fotoğraf', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/booking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-booking.png`, fullPage: true });

    const imgs = await imgStats(page);
    console.log(`BOOKING IMAGES: ${imgs.real} real, ${imgs.svg} SVG`);
    const bodyText = await page.locator('body').textContent() || '';
    priceCheck(bodyText, 'BOOKING');
  });

  // ===== 6: PROFILE BOOKINGS =====
  test('C10-06 Profile Bookings: Fiyat, filtre, fotoğraf', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-profile-bookings.png`, fullPage: true });

    const imgs = await imgStats(page);
    console.log(`PROFILE-BOOKINGS IMAGES: ${imgs.real} real, ${imgs.svg} SVG`);
    const bodyText = await page.locator('body').textContent() || '';
    priceCheck(bodyText, 'PROFILE-BOOKINGS');
  });

  // ===== 7: MESSAGES =====
  test('C10-07 Messages: Konuşma listesi → Detay → Chat input', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-messages.png`, fullPage: true });

    const convLinks = page.locator('a[href*="/messages/"]');
    const count = await convLinks.count();
    console.log(`MESSAGES: ${count} konuşma`);

    if (count > 0) {
      await convLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS}/sentinel-c10-messages-detail.png`, fullPage: true });

      const chatInput = page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"], textarea[placeholder*="Mesaj"]');
      const hasInput = await chatInput.count() > 0;
      console.log(`MESSAGES-DETAIL CHAT INPUT: ${hasInput}`);

      if (hasInput) {
        await chatInput.first().fill('Merhaba, ilan hakkında bilgi almak istiyorum.');
        console.log('MESSAGES-DETAIL MESAJ YAZILDI');
      }

      const sendBtns = page.locator('button[aria-label*="önder"], button[aria-label*="Gönder"]');
      console.log(`MESSAGES-DETAIL GONDER: ${await sendBtns.count() > 0}`);
    }
  });

  // ===== 8: EV SAHİBİNE MESAJ (listing detail → mesaj) =====
  test('C10-08 Ev sahibine mesaj: Detail → Mesaj butonu', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.locator('a[href*="/listing/"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const msgBtn = page.locator('button:has-text("Mesaj"), a:has-text("Mesaj")').first();
    if (await msgBtn.count() > 0) {
      await msgBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS}/sentinel-c10-host-message.png`, fullPage: true });

      const url = page.url();
      console.log(`HOST-MESSAGE URL: ${url}`);
      const bodyText = await page.locator('body').textContent() || '';
      const hasEmpty = bodyText.includes('Henüz mesaj yok') || bodyText.includes('sohbeti başlatın');
      console.log(`HOST-MESSAGE EMPTY STATE: ${hasEmpty}`);

      const chatInput = page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"]');
      console.log(`HOST-MESSAGE CHAT INPUT: ${await chatInput.count() > 0}`);
    } else {
      console.log('HOST-MESSAGE: Mesaj butonu bulunamadı');
    }
  });

  // ===== 9: SEARCH MAP =====
  test('C10-09 Search Map: Zoom, marker fiyatları', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SS}/sentinel-c10-search-map.png`, fullPage: true });

    const zoomInfo = await page.evaluate(() => {
      const tiles = document.querySelectorAll('img[src*="tile.openstreetmap"]');
      let zoomLevels: string[] = [];
      tiles.forEach(t => {
        const match = (t as HTMLImageElement).src.match(/\/(\d+)\/\d+\/\d+\.png/);
        if (match) zoomLevels.push(match[1]);
      });
      return { tileCount: tiles.length, zoomLevels: [...new Set(zoomLevels)] };
    });
    console.log(`MAP TILES: ${zoomInfo.tileCount}, ZOOM: ${zoomInfo.zoomLevels.join(',')}`);

    const bodyText = await page.locator('body').textContent() || '';
    priceCheck(bodyText, 'MAP');
  });

  // ===== 10: HOMEPAGE =====
  test('C10-10 Homepage: Nav, fiyat', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-homepage.png`, fullPage: true });

    const bodyText = await page.locator('body').textContent() || '';
    priceCheck(bodyText, 'HOMEPAGE');

    const roomLink = await page.locator('a[href*="/roommates"]').count();
    const hostLink = await page.locator('a[href*="/host"]').count();
    console.log(`HOMEPAGE NAV: roommates=${roomLink}, host=${hostLink}`);
  });

  // ===== 11: NOTIFICATIONS =====
  test('C10-11 Notifications: İçerik yükleniyor mu?', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/notifications`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SS}/sentinel-c10-notifications.png`, fullPage: true });

    const bodyText = await page.locator('body').textContent() || '';
    const isStuck = bodyText.includes('Yükleniyor') && !bodyText.includes('Coffee') && !bodyText.includes('beğeni');
    console.log(`NOTIFICATIONS STUCK: ${isStuck}`);
    if (!isStuck) console.log(`NOTIFICATIONS OK: İçerik yüklendi`);
  });

  // ===== 12: ROOMMATES =====
  test('C10-12 Roommates: Uyum, fotoğraf', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-roommates.png`, fullPage: true });

    const bodyText = await page.locator('body').textContent() || '';
    const hasUyum = bodyText.includes('Uyum');
    const uyumMatch = bodyText.match(/%\s*\d+|\d+\s*%/);
    console.log(`ROOMMATES: Uyum=${hasUyum}, yüzde=${uyumMatch ? uyumMatch[0] : 'yok'}`);

    const imgs = await imgStats(page);
    console.log(`ROOMMATES IMAGES: ${imgs.real} real, ${imgs.svg} SVG`);
  });

  // ===== 13: HOST EARNINGS =====
  test('C10-13 Host Earnings: Template var kontrolü', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/host/earnings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-host-earnings.png`, fullPage: true });

    const bodyText = await page.locator('body').textContent() || '';
    const hasCurrencySymbol = bodyText.includes('{currencySymbol}');
    console.log(`HOST-EARNINGS TEMPLATE: ${hasCurrencySymbol ? 'BUG!' : 'TEMİZ'}`);
    const hasLira = bodyText.includes('₺') || bodyText.includes('TL');
    console.log(`HOST-EARNINGS PARA: ${hasLira ? '₺/TL' : 'BİLİNMİYOR'}`);
  });

  // ===== 14: BUDGET =====
  test('C10-14 Budget: Para birimi, slider', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/budget`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-budget.png`, fullPage: true });

    const bodyText = await page.locator('body').textContent() || '';
    const hasEUR = bodyText.includes('€') || bodyText.includes('EUR');
    const hasTRY = bodyText.includes('₺') || bodyText.includes('TL');
    console.log(`BUDGET PARA: EUR=${hasEUR}, TRY=${hasTRY}`);

    const sliders = await page.locator('input[type="range"]').count();
    console.log(`BUDGET SLIDERS: ${sliders}`);
  });

  // ===== 15: PLACEHOLDER + CONSOLE ERROR TARAMASI =====
  test('C10-15 Placeholder ve Console Error taraması (17 sayfa)', async ({ page }) => {
    await login(page);

    const paths = [
      '/', '/search', '/favorites', '/compare', '/booking', '/profile/bookings',
      '/messages', '/notifications', '/roommates', '/mentors', '/events',
      '/community', '/budget', '/host/earnings', '/host/bookings', '/host/calendar',
      '/settings'
    ];

    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(`[${msg.text().substring(0, 80)}]`);
    });

    const placeholderPages: string[] = [];
    const templateVarPages: string[] = [];

    for (const p of paths) {
      await page.goto(`${BASE}${p}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      const bodyText = await page.locator('body').textContent() || '';
      if (bodyText.includes('Yakında') || bodyText.includes('Coming soon') || bodyText.includes('lorem ipsum') || bodyText.includes('TODO')) {
        placeholderPages.push(p);
      }
      if (bodyText.includes('{currencySymbol}') || bodyText.includes('{price}') || bodyText.includes('{name}')) {
        templateVarPages.push(p);
      }
    }

    console.log(`PLACEHOLDER: ${placeholderPages.length === 0 ? 'ALL_CLEAR' : placeholderPages.join(', ')}`);
    console.log(`TEMPLATE_VAR: ${templateVarPages.length === 0 ? 'ALL_CLEAR' : templateVarPages.join(', ')}`);
    console.log(`CONSOLE_ERRORS: ${consoleErrors.length} — ${consoleErrors.slice(0, 5).join(' ')}`);
  });
});
