import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const EMAIL = 'deniz@kotwise.com';
const PASSWORD = 'KotwiseTest2026!';
const SS = 'C:/Yerel_Disc_D/Atlat_V3/tests/screenshots';

test.describe('C9 — Akış Testi: Ara → Favorile → Booking → Mesaj', () => {
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

  // ===== 1: SEARCH → İlan Ara =====
  test('1-Search: İlan listesi ve fiyat kontrolü', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c9-search.png`, fullPage: true });

    const listingLinks = page.locator('a[href*="/listing/"]');
    const count = await listingLinks.count();
    console.log(`SEARCH: ${count} listing links`);

    // Fiyat kontrolü
    const allText = await page.locator('body').textContent() || '';
    const priceMatches = allText.match(/\d[\d.]*\s*₺/g) || [];
    console.log(`SEARCH PRICES: ${priceMatches.slice(0, 6).join(', ')}`);
    for (const p of priceMatches) {
      const num = parseInt(p.replace(/[^0-9]/g, ''));
      if (num > 5000) console.log(`SEARCH 100x BUG: ${p}`);
    }

    // Resim kontrolü
    const imgInfo = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let svg = 0, real = 0;
      imgs.forEach(img => {
        if (img.src.includes('data:image/svg') || img.src.includes('placeholder')) svg++;
        else if (img.src.length > 10) real++;
      });
      return { total: imgs.length, svg, real };
    });
    console.log(`SEARCH IMAGES: ${imgInfo.real} real, ${imgInfo.svg} SVG placeholder, ${imgInfo.total} total`);
  });

  // ===== 2: SEARCH → DETAIL =====
  test('2-Detail: İlan detay sayfası', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const listingLinks = page.locator('a[href*="/listing/"]');
    if (await listingLinks.count() > 0) {
      await listingLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS}/sentinel-c9-listing-detail.png`, fullPage: true });

      const url = page.url();
      console.log(`DETAIL URL: ${url}`);

      // Fiyat
      const allText = await page.locator('body').textContent() || '';
      const prices = allText.match(/\d[\d.]*\s*₺/g) || [];
      console.log(`DETAIL PRICES: ${prices.slice(0, 5).join(', ')}`);
      for (const p of prices) {
        const num = parseInt(p.replace(/[^0-9]/g, ''));
        if (num > 5000) console.log(`DETAIL 100x BUG: ${p}`);
      }

      // Carousel
      const carouselImgs = await page.evaluate(() => {
        const imgs = document.querySelectorAll('img');
        let real = 0;
        imgs.forEach(img => { if (img.src.includes('http') && !img.src.includes('data:')) real++; });
        return real;
      });
      console.log(`DETAIL REAL IMAGES: ${carouselImgs}`);

      // Favori butonu
      const favBtn = page.locator('button[aria-label*="Favori"], button[aria-label*="favori"], [aria-label*="Favorilere"]');
      console.log(`FAVORITE BTN: ${await favBtn.count()}`);

      // Rezervasyon Yap butonu
      const bookBtn = page.locator('button:has-text("Rezervasyon"), a:has-text("Rezervasyon")');
      console.log(`BOOKING BTN: ${await bookBtn.count()}`);

      // Mesaj butonu
      const msgBtn = page.locator('button:has-text("Mesaj"), a:has-text("Mesaj")');
      console.log(`MESSAGE BTN: ${await msgBtn.count()}`);

      // Carousel counter
      const counter = page.locator('text=/\\d+\\/\\d+/');
      console.log(`CAROUSEL COUNTER: ${await counter.count()}`);

      // SUPERHOST badge
      const superhost = page.locator('text=/SUPERHOST|Superhost|superhost/');
      console.log(`SUPERHOST: ${await superhost.count()}`);
    }
  });

  // ===== 3: FAVORİLER =====
  test('3-Favorites: Favori listesi ve thumbnail', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c9-favorites.png`, fullPage: true });

    // Fiyat
    const allText = await page.locator('body').textContent() || '';
    const prices = allText.match(/\d[\d.]*\s*₺/g) || [];
    console.log(`FAVORITES PRICES: ${prices.join(', ')}`);
    for (const p of prices) {
      const num = parseInt(p.replace(/[^0-9]/g, ''));
      if (num > 5000) console.log(`FAVORITES 100x BUG: ${p}`);
    }

    // Thumbnail kontrolü
    const imgInfo = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let svg = 0, real = 0;
      const srcs: string[] = [];
      imgs.forEach(img => {
        if (img.src.includes('data:image/svg') || img.src.includes('placeholder')) { svg++; srcs.push('SVG'); }
        else if (img.src.length > 10) { real++; srcs.push(img.src.substring(0, 80)); }
      });
      return { total: imgs.length, svg, real, srcs: srcs.slice(0, 5) };
    });
    console.log(`FAVORITES IMAGES: ${imgInfo.real} real, ${imgInfo.svg} SVG, total=${imgInfo.total}`);
    console.log(`FAVORITES IMG SRC: ${imgInfo.srcs.join(' | ')}`);

    // Karşılaştır butonu
    const compareBtn = page.locator('button:has-text("Karşılaştır"), a:has-text("Karşılaştır")');
    console.log(`COMPARE BTN: ${await compareBtn.count()}`);
  });

  // ===== 4: COMPARE =====
  test('4-Compare: Karşılaştırma', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c9-compare.png`, fullPage: true });

    const allText = await page.locator('body').textContent() || '';
    const prices = allText.match(/\d[\d.]*\s*₺/g) || [];
    console.log(`COMPARE PRICES: ${prices.join(', ')}`);

    const imgInfo = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let svg = 0, real = 0;
      imgs.forEach(img => {
        if (img.src.includes('data:image/svg') || img.src.includes('placeholder')) svg++;
        else if (img.src.length > 10) real++;
      });
      return { total: imgs.length, svg, real };
    });
    console.log(`COMPARE IMAGES: ${imgInfo.real} real, ${imgInfo.svg} SVG`);
  });

  // ===== 5: BOOKING =====
  test('5-Booking: Rezervasyon sayfası', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/booking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c9-booking.png`, fullPage: true });

    const allText = await page.locator('body').textContent() || '';
    const prices = allText.match(/\d[\d.]*\s*₺/g) || [];
    console.log(`BOOKING PRICES: ${prices.join(', ')}`);
    for (const p of prices) {
      const num = parseInt(p.replace(/[^0-9]/g, ''));
      if (num > 5000) console.log(`BOOKING 100x BUG: ${p}`);
    }

    const imgInfo = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let svg = 0;
      imgs.forEach(img => { if (img.src.includes('data:image/svg') || img.src.includes('placeholder')) svg++; });
      return { total: imgs.length, svg };
    });
    console.log(`BOOKING IMAGES: ${imgInfo.svg} SVG of ${imgInfo.total}`);

    // Stripe
    const stripe = page.locator('[class*="stripe"], iframe[src*="stripe"], button:has-text("Ödeme"), button:has-text("Öde")');
    console.log(`STRIPE: ${await stripe.count()}`);
  });

  // ===== 6: PROFILE BOOKINGS =====
  test('6-ProfileBookings: Rezervasyonlarım', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c9-profile-bookings.png`, fullPage: true });

    const allText = await page.locator('body').textContent() || '';
    const prices = allText.match(/\d[\d.]*\s*₺/g) || [];
    console.log(`PROFILE-BOOKINGS PRICES: ${prices.join(', ')}`);
    for (const p of prices) {
      const num = parseInt(p.replace(/[^0-9]/g, ''));
      if (num > 5000) console.log(`PROFILE-BOOKINGS 100x BUG: ${p}`);
    }

    const imgInfo = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let svg = 0;
      imgs.forEach(img => { if (img.src.includes('data:image/svg') || img.src.includes('placeholder')) svg++; });
      return { total: imgs.length, svg };
    });
    console.log(`PROFILE-BOOKINGS IMAGES: ${imgInfo.svg} SVG of ${imgInfo.total}`);
  });

  // ===== 7: MESAJ GÖNDER =====
  test('7-Messages: Mesaj listesi ve chat', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c9-messages-list.png`, fullPage: true });

    const convLinks = page.locator('a[href*="/messages/"]');
    const convCount = await convLinks.count();
    console.log(`MESSAGES: ${convCount} conversations`);

    // Filtreler
    const filters = page.locator('button:has-text("Tümü"), button:has-text("Okunmamış"), button:has-text("İlan"), button:has-text("Grup")');
    console.log(`MESSAGES FILTERS: ${await filters.count()}`);

    if (convCount > 0) {
      await convLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS}/sentinel-c9-messages-detail.png`, fullPage: true });

      // Chat input
      const chatInput = page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"], textarea[placeholder*="Mesaj"]');
      console.log(`CHAT INPUT: ${await chatInput.count()}`);

      if (await chatInput.count() > 0) {
        await chatInput.first().fill('Merhaba, ilan hakkında bilgi almak istiyorum.');
        console.log('CHAT: Message typed');
      }

      // Gönder butonu
      const sendBtns = page.locator('button[aria-label*="Gönder"], button[aria-label*="gönder"]');
      console.log(`SEND BTN: ${await sendBtns.count()}`);

      // Emoji / kamera
      const emojiBtn = page.locator('button[aria-label*="Emoji"], button[aria-label*="emoji"]');
      const cameraBtn = page.locator('button[aria-label*="Fotoğraf"], button[aria-label*="Dosya"]');
      console.log(`EMOJI: ${await emojiBtn.count()}, CAMERA: ${await cameraBtn.count()}`);
    }
  });

  // ===== 8: SEARCH → DETAIL → HOST'A MESAJ =====
  test('8-HostMessage: İlan detaydan ev sahibine mesaj', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const listingLinks = page.locator('a[href*="/listing/"]');
    if (await listingLinks.count() > 0) {
      await listingLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Mesaj butonu
      const msgBtn = page.locator('button:has-text("Mesaj"), a:has-text("Mesaj")').first();
      if (await msgBtn.count() > 0) {
        await msgBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${SS}/sentinel-c9-host-message.png`, fullPage: true });

        const url = page.url();
        console.log(`HOST MESSAGE URL: ${url}`);

        const chatInput = page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"]');
        console.log(`HOST CHAT INPUT: ${await chatInput.count()}`);

        // Empty state check
        const emptyState = page.locator('text=/Henüz mesaj yok|Merhaba diyerek/');
        console.log(`HOST EMPTY STATE: ${await emptyState.count()}`);
      } else {
        console.log('HOST MSG BTN: NOT FOUND');
      }
    }
  });

  // ===== 9: HARİTA =====
  test('9-Map: Harita zoom ve marker fiyatları', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SS}/sentinel-c9-search-map.png`, fullPage: true });

    // Zoom level
    const tiles = page.locator('img[src*="tile.openstreetmap"]');
    const tileCount = await tiles.count();
    if (tileCount > 0) {
      const src = await tiles.first().getAttribute('src') || '';
      const zoom = src.match(/\/(\d+)\/\d+\/\d+/);
      if (zoom) console.log(`MAP ZOOM: ${zoom[1]}`);
    }

    // Marker fiyatları
    const allText = await page.locator('body').textContent() || '';
    const prices = allText.match(/\d[\d.]*\s*₺/g) || [];
    console.log(`MAP PRICES: ${prices.slice(0, 6).join(', ')}`);
    for (const p of prices) {
      const num = parseInt(p.replace(/[^0-9]/g, ''));
      if (num > 5000) console.log(`MAP 100x BUG: ${p}`);
    }
  });

  // ===== 10: ROOMMATES =====
  test('10-Roommates: Uyum ve fotoğraf', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c9-roommates.png`, fullPage: true });

    // Uyum
    const uyum = await page.locator('text=/\\d+%.*Uyum|%\\d+/').allTextContents();
    console.log(`ROOMMATES UYUM: ${uyum.join(', ') || 'NOT FOUND'}`);

    const noUyum = await page.locator('text=/Uyum bilgisi yok/').count();
    console.log(`ROOMMATES "Uyum bilgisi yok": ${noUyum}`);

    // Fotoğraf
    const imgInfo = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let real = 0, svg = 0;
      imgs.forEach(img => {
        if (img.src.includes('data:image/svg') || img.src.includes('placeholder')) svg++;
        else if (img.src.includes('http')) real++;
      });
      return { real, svg, total: imgs.length };
    });
    console.log(`ROOMMATES IMGS: ${imgInfo.real} real, ${imgInfo.svg} SVG`);
  });

  // ===== 11: HOMEPAGE FİYAT + NAVİGASYON =====
  test('11-Homepage: Fiyat ve navigasyon', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c9-homepage.png`, fullPage: true });

    const allText = await page.locator('body').textContent() || '';
    const prices = allText.match(/\d[\d.]*\s*₺/g) || [];
    console.log(`HOMEPAGE PRICES: ${prices.slice(0, 6).join(', ')}`);
    for (const p of prices) {
      const num = parseInt(p.replace(/[^0-9]/g, ''));
      if (num > 5000 && !allText.includes('nüfus')) console.log(`HOMEPAGE 100x BUG: ${p}`);
    }

    // Nav links
    const roomLink = page.locator('a[href*="/roommates"]');
    const hostLink = page.locator('a[href*="/host"]');
    console.log(`NAV: roommates=${await roomLink.count()}, host=${await hostLink.count()}`);
  });

  // ===== 12: HOST EARNINGS =====
  test('12-HostEarnings: Para birimi ve template', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/host/earnings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c9-host-earnings.png`, fullPage: true });

    const templateVar = await page.locator('text=/\\{currencySymbol\\}/').count();
    console.log(`HOST-EARNINGS {currencySymbol}: ${templateVar}`);

    const allText = await page.locator('body').textContent() || '';
    console.log(`HOST-EARNINGS has EUR: ${allText.includes('EUR')}, has €: ${allText.includes('€')}, has ₺: ${allText.includes('₺')}, has TL: ${allText.includes('TL')}`);
  });

  // ===== 13: BUDGET =====
  test('13-Budget: Para birimi ve sliders', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/budget`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c9-budget.png`, fullPage: true });

    const allText = await page.locator('body').textContent() || '';
    console.log(`BUDGET has EUR: ${allText.includes('EUR')}, has €: ${allText.includes('€')}, has ₺: ${allText.includes('₺')}, has TL: ${allText.includes('TL')}`);

    const sliders = page.locator('input[type="range"]');
    console.log(`BUDGET SLIDERS: ${await sliders.count()}`);
  });

  // ===== 14: NOTIFICATIONS =====
  test('14-Notifications: Yükleniyor kontrolü', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/notifications`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SS}/sentinel-c9-notifications.png`, fullPage: true });

    const loadingText = await page.locator('text=/Yükleniyor/').count();
    console.log(`NOTIFICATIONS "Yükleniyor": ${loadingText}`);

    const allText = await page.locator('body').textContent() || '';
    console.log(`NOTIFICATIONS has content: ${allText.length > 200}`);
  });

  // ===== 15: PLACEHOLDER + CONSOLE ERROR TARAMASI =====
  test('15-Scan: Placeholder ve console error', async ({ page }) => {
    await login(page);

    const scanPages = [
      '/favorites', '/compare', '/booking', '/profile/bookings',
      '/search', '/search/map', '/roommates', '/messages',
      '/notifications', '/events', '/community', '/mentors',
      '/budget', '/host/earnings', '/host/bookings', '/settings', '/'
    ];

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(`${msg.text().substring(0, 120)}`);
    });

    let placeholderFound = 0;
    for (const p of scanPages) {
      await page.goto(`${BASE}${p}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);

      const yakinda = await page.locator('text=/Yakında|Coming soon|lorem ipsum|TODO|\\{currencySymbol\\}/i').count();
      if (yakinda > 0) {
        console.log(`PLACEHOLDER on ${p}: ${yakinda}`);
        placeholderFound += yakinda;
      }
    }

    console.log(`PLACEHOLDER TOTAL: ${placeholderFound} across ${scanPages.length} pages`);
    console.log(`CONSOLE ERRORS: ${errors.length}`);
    errors.slice(0, 5).forEach(e => console.log(`  ERR: ${e}`));
  });
});
