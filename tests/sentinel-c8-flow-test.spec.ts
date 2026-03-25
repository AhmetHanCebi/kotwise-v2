import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const EMAIL = 'deniz@kotwise.com';
const PASS = 'KotwiseTest2026!';

test.describe('Döngü 8 — AKIŞ TESTİ: Uçtan Uca Kullanıcı Yolculuğu', () => {

  // ─── LOGIN ───
  test('01 — Login', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-01-login.png', fullPage: true });
    // Should redirect somewhere after login
    expect(page.url()).not.toContain('/login');
  });

  // ─── FLOW 1: Arama → İlan Detay → Favorile → Booking ───
  test('02 — Search: ilanları listele', async ({ page }) => {
    // Login first
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Go to search
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-02-search.png', fullPage: true });

    // Count listings
    const listingLinks = await page.locator('a[href*="/listing/"]').count();
    console.log(`Search: ${listingLinks} listing link`);
    expect(listingLinks).toBeGreaterThan(0);

    // Check prices - are they still correct (no 100x bug)?
    const priceTexts = await page.locator('text=/\\d+.*₺|\\d+.*TL/').allTextContents();
    console.log(`Search prices: ${priceTexts.slice(0, 5).join(', ')}`);

    // Check for 100x bug
    const has100xBug = priceTexts.some(p => {
      const num = parseInt(p.replace(/[^\d]/g, ''));
      return num > 5000; // Normal prices should be < 5000 TL
    });
    console.log(`Search 100x bug: ${has100xBug}`);
  });

  test('03 — Search → Listing detail: ilan detayına git', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });

    // Click first listing
    const firstListing = page.locator('a[href*="/listing/"]').first();
    const href = await firstListing.getAttribute('href');
    console.log(`First listing href: ${href}`);
    await firstListing.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-03-listing-detail.png', fullPage: true });

    // Check listing detail elements
    const hasCarousel = await page.locator('img').count();
    console.log(`Listing detail: ${hasCarousel} images`);

    // Check price
    const priceTexts = await page.locator('text=/\\d+.*₺|\\d+.*TL/').allTextContents();
    console.log(`Listing detail prices: ${priceTexts.slice(0, 3).join(', ')}`);

    // Check Rezervasyon Yap button
    const bookingBtn = await page.locator('text=/Rezervasyon|Booking|Book/i').count();
    console.log(`Booking button count: ${bookingBtn}`);
  });

  test('04 — Favorile: ilan detaydan favorilere ekle', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });

    // Click first listing
    await page.locator('a[href*="/listing/"]').first().click();
    await page.waitForTimeout(3000);

    // Look for heart/favorite button
    const heartBtn = page.locator('button:has(svg), [aria-label*="favori"], [aria-label*="Favori"], [aria-label*="favorite"], button:has-text("♥"), button:has-text("❤")');
    const heartCount = await heartBtn.count();
    console.log(`Heart/favorite buttons: ${heartCount}`);

    if (heartCount > 0) {
      await heartBtn.first().click();
      await page.waitForTimeout(1000);
      console.log('Clicked favorite button');
    }

    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-04-favorile.png', fullPage: true });

    // Go to favorites page and check
    await page.goto(`${BASE}/favorites`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-04b-favorites-page.png', fullPage: true });

    const favListings = await page.locator('a[href*="/listing/"], img, [class*="card"]').count();
    console.log(`Favorites page elements: ${favListings}`);

    // Check for SVG placeholder (ongoing bug)
    const svgPlaceholders = await page.locator('img[src*="data:image/svg"]').count();
    const realImages = await page.locator('img[src*="http"], img[src*="unsplash"]').count();
    console.log(`Favorites: ${svgPlaceholders} SVG placeholder, ${realImages} real images`);

    // Check prices
    const favPrices = await page.locator('text=/\\d+.*₺|\\d+.*TL/').allTextContents();
    console.log(`Favorites prices: ${favPrices.join(', ')}`);
  });

  test('05 — Booking akışı: Rezervasyon Yap tıkla', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });

    // Click first listing
    await page.locator('a[href*="/listing/"]').first().click();
    await page.waitForTimeout(3000);

    // Scroll to booking button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    // Find and click Rezervasyon Yap
    const bookBtn = page.locator('text=/Rezervasyon Yap/i, button:has-text("Rezervasyon"), a:has-text("Rezervasyon")');
    const bookBtnCount = await bookBtn.count();
    console.log(`Booking buttons: ${bookBtnCount}`);

    if (bookBtnCount > 0) {
      await bookBtn.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-05-booking-flow.png', fullPage: true });
      console.log(`After booking click URL: ${page.url()}`);

      // Check what happened — is there a date picker? confirmation? Stripe?
      const dateInputs = await page.locator('input[type="date"], [class*="date"], [class*="calendar"]').count();
      const stripeElements = await page.locator('[class*="stripe"], iframe[src*="stripe"], button:has-text("Ödeme")').count();
      console.log(`Date inputs: ${dateInputs}, Stripe elements: ${stripeElements}`);
    }

    // Also check /booking page
    await page.goto(`${BASE}/booking`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-05b-booking-page.png', fullPage: true });

    const bookingPrices = await page.locator('text=/\\d+.*₺|\\d+.*TL/').allTextContents();
    console.log(`Booking page prices: ${bookingPrices.join(', ')}`);

    const bookingSvg = await page.locator('img[src*="data:image/svg"]').count();
    console.log(`Booking SVG placeholders: ${bookingSvg}`);
  });

  // ─── FLOW 2: Mesaj Gönder ───
  test('06 — Messages: mesaj gönder akışı', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Go to messages
    await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-06-messages-list.png', fullPage: true });

    // Count conversations
    const conversations = await page.locator('a[href*="/messages/"], [class*="conversation"], [class*="chat"]').count();
    console.log(`Messages: ${conversations} conversation elements`);

    // Click first conversation
    const firstConvo = page.locator('a[href*="/messages/"]').first();
    if (await firstConvo.count() > 0) {
      const convoHref = await firstConvo.getAttribute('href');
      console.log(`First conversation: ${convoHref}`);
      await firstConvo.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-06b-message-detail.png', fullPage: true });

      // Check chat input
      const chatInput = page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"], textarea[placeholder*="Mesaj"], textarea[placeholder*="mesaj"]');
      const chatInputCount = await chatInput.count();
      console.log(`Chat input count: ${chatInputCount}`);

      if (chatInputCount > 0) {
        // Type a message
        await chatInput.first().fill('Test mesajı - Döngü 8 akış testi');
        console.log('Typed message in chat input');

        // Find send button
        const sendBtn = page.locator('button[aria-label*="Gönder"], button[aria-label*="gönder"], button:has-text("Gönder"), button[type="submit"]');
        const sendBtnCount = await sendBtn.count();
        console.log(`Send buttons: ${sendBtnCount}`);

        await page.screenshot({ path: 'tests/screenshots/sentinel-c8-06c-message-typed.png', fullPage: true });
      }
    }
  });

  // ─── DEVAM EDEN BUG RE-CHECK ───
  test('07 — Bug re-check: thumbnail SVG placeholder', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Check 4 affected pages
    const pages = [
      { name: 'favorites', path: '/favorites' },
      { name: 'compare', path: '/compare' },
      { name: 'booking', path: '/booking' },
      { name: 'profile-bookings', path: '/profile/bookings' },
    ];

    for (const p of pages) {
      await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      const svgCount = await page.locator('img[src*="data:image/svg"]').count();
      const realImgCount = await page.locator('img[src*="http"], img[src*="unsplash"], img[src*="supabase"]').count();
      const allImgs = await page.locator('img').count();

      // Get img sources for debugging
      const imgSrcs = await page.locator('img').evaluateAll(imgs =>
        imgs.map(img => {
          const src = img.getAttribute('src') || '';
          return src.substring(0, 80);
        })
      );

      console.log(`${p.name}: ${allImgs} total imgs, ${svgCount} SVG placeholder, ${realImgCount} real — srcs: ${imgSrcs.join(' | ')}`);

      await page.screenshot({ path: `tests/screenshots/sentinel-c8-07-${p.name}.png`, fullPage: true });
    }
  });

  // ─── FIYAT REGRESYON KONTROLÜ ───
  test('08 — Regresyon: fiyat 100x kontrolü (7 sayfa)', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const pricePagesCheck = [
      { name: 'homepage', path: '/' },
      { name: 'favorites', path: '/favorites' },
      { name: 'compare', path: '/compare' },
      { name: 'booking', path: '/booking' },
      { name: 'profile-bookings', path: '/profile/bookings' },
      { name: 'search-map', path: '/search/map' },
    ];

    for (const p of pricePagesCheck) {
      await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      const priceTexts = await page.locator('text=/\\d[\\d\\.]*\\s*₺|\\d[\\d\\.]*\\s*TL/').allTextContents();
      const has100x = priceTexts.some(p => {
        const num = parseInt(p.replace(/[^\d]/g, ''));
        return num > 5000;
      });

      console.log(`${p.name} prices: ${priceTexts.slice(0, 5).join(', ')} | 100x: ${has100x}`);
    }

    // Also check listing detail
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    const listingLink = page.locator('a[href*="/listing/"]').first();
    if (await listingLink.count() > 0) {
      await listingLink.click();
      await page.waitForTimeout(3000);
      const detailPrices = await page.locator('text=/\\d[\\d\\.]*\\s*₺|\\d[\\d\\.]*\\s*TL/').allTextContents();
      const detail100x = detailPrices.some(p => {
        const num = parseInt(p.replace(/[^\d]/g, ''));
        return num > 5000;
      });
      console.log(`listing-detail prices: ${detailPrices.slice(0, 5).join(', ')} | 100x: ${detail100x}`);
    }
  });

  // ─── ROOMMATES UYUM % KONTROLÜ ───
  test('09 — Bug re-check: roommates uyum yüzdesi', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Roommates list
    await page.goto(`${BASE}/roommates`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-09-roommates.png', fullPage: true });

    const uyumText = await page.locator('text=/Uyum|uyum/').allTextContents();
    console.log(`Roommates uyum texts: ${uyumText.join(', ')}`);

    const noUyum = await page.locator('text=/Uyum bilgisi yok/').count();
    console.log(`"Uyum bilgisi yok" count: ${noUyum}`);

    // Click to detail
    const roommateLink = page.locator('a[href*="/roommates/"]');
    if (await roommateLink.count() > 0) {
      await roommateLink.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-09b-roommate-detail.png', fullPage: true });

      const detailUyum = await page.locator('text=/Uyum|uyum|Farklı|Ortak/').allTextContents();
      console.log(`Roommate detail uyum: ${detailUyum.join(', ')}`);

      const detailPhoto = await page.locator('img[src*="http"], img[src*="unsplash"]').count();
      console.log(`Roommate detail real photos: ${detailPhoto}`);
    }
  });

  // ─── FULL E2E FLOW: Search → Detail → Fav → Booking → Message ───
  test('10 — E2E Flow: arama → detay → favorile → booking → mesaj', async ({ page }) => {
    // Login
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    const loginUrl = page.url();
    console.log(`FLOW — Login redirect: ${loginUrl}`);

    // Step 1: Search
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });
    const searchListings = await page.locator('a[href*="/listing/"]').count();
    console.log(`FLOW — Search: ${searchListings} listings`);

    // Step 2: Click listing
    const firstHref = await page.locator('a[href*="/listing/"]').first().getAttribute('href');
    await page.locator('a[href*="/listing/"]').first().click();
    await page.waitForTimeout(3000);
    console.log(`FLOW — Listing detail: ${page.url()}`);

    // Step 3: Check detail page elements
    const detailImages = await page.locator('img').count();
    const bookBtn = await page.locator('text=/Rezervasyon Yap/i').count();
    const hostInfo = await page.locator('text=/SUPERHOST|Ev Sahibi|Host/i').count();
    console.log(`FLOW — Detail: ${detailImages} imgs, ${bookBtn} book btn, ${hostInfo} host info`);

    // Step 4: Try to favorite
    const allButtons = await page.locator('button').count();
    console.log(`FLOW — Detail page buttons: ${allButtons}`);

    // Step 5: Go to favorites
    await page.goto(`${BASE}/favorites`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const favCount = await page.locator('a[href*="/listing/"], [class*="card"]').count();
    console.log(`FLOW — Favorites: ${favCount} items`);

    // Step 6: Go to booking page
    await page.goto(`${BASE}/booking`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log(`FLOW — Booking page: ${page.url()}`);

    // Step 7: Check profile bookings
    await page.goto(`${BASE}/profile/bookings`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const bookingItems = await page.locator('[class*="card"], [class*="booking"], a[href*="booking"]').count();
    console.log(`FLOW — Profile bookings: ${bookingItems} items`);

    // Step 8: Send message
    await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const msgConvos = await page.locator('a[href*="/messages/"]').count();
    console.log(`FLOW — Messages: ${msgConvos} conversations`);

    if (msgConvos > 0) {
      await page.locator('a[href*="/messages/"]').first().click();
      await page.waitForTimeout(2000);

      const chatInput = page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"], textarea[placeholder*="mesaj"]');
      if (await chatInput.count() > 0) {
        await chatInput.first().fill('Merhaba! İlanınızla ilgileniyorum.');
        console.log('FLOW — Message typed');
        await page.screenshot({ path: 'tests/screenshots/sentinel-c8-10-e2e-message.png', fullPage: true });
      }
    }

    // Step 9: Check notifications
    await page.goto(`${BASE}/notifications`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const notifCount = await page.locator('[class*="notification"], [class*="notif"]').count();
    const loadingText = await page.locator('text=/Yükleniyor/').count();
    console.log(`FLOW — Notifications: ${notifCount} items, loading: ${loadingText}`);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-10-e2e-notifications.png', fullPage: true });
  });

  // ─── PLACEHOLDER & CONSOLE ERROR SCAN ───
  test('11 — Placeholder ve console error taraması', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const scanPages = [
      '/', '/search', '/favorites', '/compare', '/booking', '/profile/bookings',
      '/messages', '/community', '/events', '/roommates', '/mentors',
      '/budget', '/host/earnings', '/notifications', '/settings'
    ];

    for (const path of scanPages) {
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);

      // Check for placeholder/coming soon text
      const yakinda = await page.locator('text=/Yakında|Coming soon|placeholder|lorem ipsum|TODO/i').count();
      if (yakinda > 0) {
        const texts = await page.locator('text=/Yakında|Coming soon|placeholder|lorem ipsum|TODO/i').allTextContents();
        console.log(`PLACEHOLDER found on ${path}: ${texts.join(', ')}`);
      }

      // Check for template variables
      const templateVars = await page.locator('text=/{\\w+}/').count();
      if (templateVars > 0) {
        const tTexts = await page.locator('text=/{\\w+}/').allTextContents();
        console.log(`TEMPLATE VAR on ${path}: ${tTexts.join(', ')}`);
      }
    }

    console.log(`Console errors total: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log(`Errors: ${consoleErrors.slice(0, 5).join(' | ')}`);
    }
  });

  // ─── HARITA ZOOM + MARKER FİYAT ───
  test('12 — Harita: zoom level ve marker fiyatları', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await page.goto(`${BASE}/search/map`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-12-search-map.png', fullPage: true });

    // Check zoom level from tile URLs
    const tiles = await page.locator('img[src*="tile.openstreetmap"]').evaluateAll(imgs =>
      imgs.map(img => img.getAttribute('src'))
    );
    const zoomLevels = tiles.map(t => {
      const match = t?.match(/\/(\d+)\/\d+\/\d+/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxZoom = Math.max(...zoomLevels, 0);
    console.log(`Map zoom level: ${maxZoom} (tiles: ${tiles.length})`);

    // Check marker prices
    const markerPrices = await page.locator('text=/\\d+.*₺|\\d+.*TL/').allTextContents();
    console.log(`Map marker prices: ${markerPrices.slice(0, 6).join(', ')}`);

    const mapHas100x = markerPrices.some(p => {
      const num = parseInt(p.replace(/[^\d]/g, ''));
      return num > 5000;
    });
    console.log(`Map 100x bug: ${mapHas100x}`);
  });

  // ─── HOST EARNINGS KONTROLÜ ───
  test('13 — Host earnings: currencySymbol kontrolü', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await page.goto(`${BASE}/host/earnings`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-13-host-earnings.png', fullPage: true });

    // Check for {currencySymbol} literal
    const templateLiteral = await page.locator('text=/{currencySymbol}/').count();
    console.log(`Host earnings {currencySymbol} literal: ${templateLiteral}`);

    // Check currency display
    const currencyTexts = await page.locator('text=/₺|TL|EUR|€/').allTextContents();
    console.log(`Host earnings currency: ${currencyTexts.slice(0, 5).join(', ')}`);
  });
});
