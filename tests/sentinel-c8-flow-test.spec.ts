import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const EMAIL = 'deniz@kotwise.com';
const PASS = 'KotwiseTest2026!';

async function login(page: any) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.getByRole('button', { name: 'Giriş Yap', exact: true }).click();
  await page.waitForTimeout(3000);
}

test.describe('Döngü 8 — AKIŞ TESTİ', () => {

  test('01 — Login', async ({ page }) => {
    await login(page);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-01-login.png', fullPage: true });
    expect(page.url()).not.toContain('/login');
    console.log(`Login → ${page.url()}`);
  });

  test('02 — Search: ilanları listele', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-02-search.png', fullPage: true });

    const listingLinks = await page.locator('a[href*="/listing/"]').count();
    console.log(`Search: ${listingLinks} listing link`);
    expect(listingLinks).toBeGreaterThan(0);

    const priceTexts = await page.locator('text=/\\d+.*₺|\\d+.*TL/').allTextContents();
    console.log(`Search prices: ${priceTexts.slice(0, 5).join(', ')}`);
    const has100x = priceTexts.some(p => parseInt(p.replace(/[^\d]/g, '')) > 5000);
    console.log(`Search 100x: ${has100x}`);
  });

  test('03 — Search → Detail: ilan detay', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });

    const firstListing = page.locator('a[href*="/listing/"]').first();
    const href = await firstListing.getAttribute('href');
    console.log(`First listing: ${href}`);
    await firstListing.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-03-listing-detail.png', fullPage: true });

    const imgs = await page.locator('img').count();
    const priceTexts = await page.locator('text=/\\d+.*₺|\\d+.*TL/').allTextContents();
    const bookBtn = await page.locator('text=/Rezervasyon Yap/i').count();
    console.log(`Detail: ${imgs} imgs, prices: ${priceTexts.slice(0, 3).join(', ')}, bookBtn: ${bookBtn}`);
  });

  test('04 — Favorile: detaydan favorilere ekle + favorites sayfası', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.locator('a[href*="/listing/"]').first().click();
    await page.waitForTimeout(3000);

    // Look for heart/favorite button (try various selectors)
    const heartBtns = await page.locator('button').evaluateAll(btns =>
      btns.map((b, i) => ({ i, text: b.textContent?.trim().substring(0, 30), ariaLabel: b.getAttribute('aria-label') }))
    );
    console.log(`Detail buttons: ${JSON.stringify(heartBtns.slice(0, 10))}`);

    // Try clicking any heart-like button
    const favBtn = page.locator('button[aria-label*="Favori"], button[aria-label*="favori"], button[aria-label*="favorite"], button[aria-label*="Kaydet"], button[aria-label*="kaydet"]');
    if (await favBtn.count() > 0) {
      await favBtn.first().click();
      await page.waitForTimeout(1000);
      console.log('Clicked favorite button');
    } else {
      console.log('No explicit favorite button found');
    }
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-04-favorile.png', fullPage: true });

    // Check favorites page
    await page.goto(`${BASE}/favorites`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-04b-favorites.png', fullPage: true });

    const svgPlaceholders = await page.locator('img[src*="data:image/svg"]').count();
    const realImages = await page.locator('img[src*="http"], img[src*="unsplash"], img[src*="supabase"]').count();
    const favPrices = await page.locator('text=/\\d+.*₺|\\d+.*TL/').allTextContents();
    console.log(`Favorites: ${svgPlaceholders} SVG, ${realImages} real, prices: ${favPrices.join(', ')}`);
  });

  test('05 — Booking akışı', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.locator('a[href*="/listing/"]').first().click();
    await page.waitForTimeout(3000);

    // Scroll down to find booking button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const bookBtn = page.locator('text=/Rezervasyon Yap/i');
    const bookBtnCount = await bookBtn.count();
    console.log(`Booking buttons: ${bookBtnCount}`);

    if (bookBtnCount > 0) {
      await bookBtn.first().click();
      await page.waitForTimeout(3000);
      console.log(`After booking click: ${page.url()}`);
      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-05-booking-click.png', fullPage: true });
    }

    // Check booking page
    await page.goto(`${BASE}/booking`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-05b-booking.png', fullPage: true });

    const bookingPrices = await page.locator('text=/\\d+.*₺|\\d+.*TL/').allTextContents();
    const bookingSvg = await page.locator('img[src*="data:image/svg"]').count();
    const stripeEl = await page.locator('[class*="stripe"], iframe[src*="stripe"], button:has-text("Ödeme"), button:has-text("Öde")').count();
    console.log(`Booking: prices=${bookingPrices.join(', ')}, SVG=${bookingSvg}, Stripe=${stripeEl}`);
  });

  test('06 — Mesaj gönder akışı', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-06-messages.png', fullPage: true });

    const convos = await page.locator('a[href*="/messages/"]').count();
    console.log(`Messages: ${convos} conversations`);

    if (convos > 0) {
      const convoHref = await page.locator('a[href*="/messages/"]').first().getAttribute('href');
      console.log(`First convo: ${convoHref}`);
      await page.locator('a[href*="/messages/"]').first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-06b-chat.png', fullPage: true });

      const chatInput = page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"], textarea[placeholder*="Mesaj"], textarea[placeholder*="mesaj"]');
      const inputCount = await chatInput.count();
      console.log(`Chat input: ${inputCount}`);

      if (inputCount > 0) {
        await chatInput.first().fill('Merhaba! İlanınızla ilgileniyorum. Döngü 8 test.');
        const sendBtn = page.locator('button[aria-label*="Gönder"], button[aria-label*="gönder"], button[aria-label*="send"]');
        const sendCount = await sendBtn.count();
        console.log(`Send button: ${sendCount}`);
        await page.screenshot({ path: 'tests/screenshots/sentinel-c8-06c-typed.png', fullPage: true });
      }

      // Check chat balloons
      const balloons = await page.locator('[class*="message"], [class*="bubble"], [class*="chat"]').count();
      console.log(`Chat balloons/elements: ${balloons}`);
    }
  });

  test('07 — Thumbnail SVG placeholder re-check', async ({ page }) => {
    await login(page);

    const checkPages = [
      { name: 'favorites', path: '/favorites' },
      { name: 'compare', path: '/compare' },
      { name: 'booking', path: '/booking' },
      { name: 'profile-bookings', path: '/profile/bookings' },
      { name: 'search', path: '/search' },
    ];

    for (const p of checkPages) {
      await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      const allImgs = await page.locator('img').count();
      const svgImgs = await page.locator('img[src*="data:image/svg"]').count();
      const realImgs = await page.locator('img[src*="http"], img[src*="unsplash"], img[src*="supabase"]').count();

      const imgSrcs = await page.locator('img').evaluateAll(imgs =>
        imgs.map(img => (img.getAttribute('src') || '').substring(0, 60))
      );

      console.log(`${p.name}: total=${allImgs}, SVG=${svgImgs}, real=${realImgs} | srcs: ${imgSrcs.join(' | ')}`);
      await page.screenshot({ path: `tests/screenshots/sentinel-c8-07-${p.name}.png`, fullPage: true });
    }
  });

  test('08 — Fiyat 100x regresyon (7 sayfa)', async ({ page }) => {
    await login(page);

    const pricePages = [
      { name: 'homepage', path: '/' },
      { name: 'favorites', path: '/favorites' },
      { name: 'compare', path: '/compare' },
      { name: 'booking', path: '/booking' },
      { name: 'profile-bookings', path: '/profile/bookings' },
      { name: 'search-map', path: '/search/map' },
    ];

    for (const p of pricePages) {
      await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      const prices = await page.locator('text=/\\d[\\d\\.]*\\s*₺|\\d[\\d\\.]*\\s*TL/').allTextContents();
      const has100x = prices.some(p => parseInt(p.replace(/[^\d]/g, '')) > 5000);
      console.log(`${p.name}: ${prices.slice(0, 5).join(', ')} | 100x=${has100x}`);
    }

    // listing detail
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.locator('a[href*="/listing/"]').first().click();
    await page.waitForTimeout(3000);
    const detailPrices = await page.locator('text=/\\d[\\d\\.]*\\s*₺|\\d[\\d\\.]*\\s*TL/').allTextContents();
    const detail100x = detailPrices.some(p => parseInt(p.replace(/[^\d]/g, '')) > 5000);
    console.log(`listing-detail: ${detailPrices.slice(0, 5).join(', ')} | 100x=${detail100x}`);
  });

  test('09 — Roommates uyum % kontrolü', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/roommates`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-09-roommates.png', fullPage: true });

    const uyumTexts = await page.locator('text=/Uyum|uyum/').allTextContents();
    const noUyum = await page.locator('text=/Uyum bilgisi yok/').count();
    console.log(`Roommates: uyum=${uyumTexts.join(', ')}, noUyum=${noUyum}`);

    // Try detail
    const roommateCards = await page.locator('a[href*="/roommates/"]').count();
    const swipeButtons = await page.locator('button').evaluateAll(btns =>
      btns.map(b => b.getAttribute('aria-label') || b.textContent?.trim().substring(0, 20))
    );
    console.log(`Roommates buttons: ${swipeButtons.slice(0, 5).join(', ')}`);

    // Navigate to detail by URL
    await page.goto(`${BASE}/roommates`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Check for any link to roommate detail
    const links = await page.locator('a[href*="/roommates/"]');
    if (await links.count() > 0) {
      await links.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-09b-roommate-detail.png', fullPage: true });
      const detailUyum = await page.locator('text=/Uyum|uyum|Farklı|Ortak/').allTextContents();
      console.log(`Roommate detail uyum: ${detailUyum.join(', ')}`);
    }
  });

  test('10 — E2E: Search → Detail → Favorites → Booking → Message', async ({ page }) => {
    await login(page);
    console.log(`E2E — Login OK: ${page.url()}`);

    // 1. Search
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });
    const listings = await page.locator('a[href*="/listing/"]').count();
    console.log(`E2E — Search: ${listings} listings`);

    // 2. Detail
    await page.locator('a[href*="/listing/"]').first().click();
    await page.waitForTimeout(3000);
    console.log(`E2E — Detail: ${page.url()}`);
    const detailImgs = await page.locator('img').count();
    const bookBtns = await page.locator('text=/Rezervasyon Yap/i').count();
    console.log(`E2E — Detail: ${detailImgs} imgs, ${bookBtns} book btns`);

    // 3. Favorites
    await page.goto(`${BASE}/favorites`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    const favItems = await page.locator('img').count();
    console.log(`E2E — Favorites: ${favItems} imgs`);

    // 4. Booking
    await page.goto(`${BASE}/booking`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    console.log(`E2E — Booking: ${page.url()}`);

    // 5. Profile bookings
    await page.goto(`${BASE}/profile/bookings`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    const bookItems = await page.locator('text=/₺|TL/').allTextContents();
    console.log(`E2E — Profile bookings: ${bookItems.join(', ')}`);

    // 6. Messages
    await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    const convos = await page.locator('a[href*="/messages/"]').count();
    console.log(`E2E — Messages: ${convos} convos`);

    if (convos > 0) {
      await page.locator('a[href*="/messages/"]').first().click();
      await page.waitForTimeout(2000);
      const chatInput = page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"], textarea[placeholder*="mesaj"]');
      console.log(`E2E — Chat input: ${await chatInput.count()}`);
    }

    // 7. Notifications
    await page.goto(`${BASE}/notifications`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const loadingStuck = await page.locator('text=/Yükleniyor/').count();
    console.log(`E2E — Notifications loading stuck: ${loadingStuck}`);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-10-e2e-final.png', fullPage: true });
  });

  test('11 — Placeholder + console error scan (15 sayfa)', async ({ page }) => {
    await login(page);

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text().substring(0, 100));
    });

    const scanPages = [
      '/', '/search', '/favorites', '/compare', '/booking', '/profile/bookings',
      '/messages', '/community', '/events', '/roommates', '/mentors',
      '/budget', '/host/earnings', '/notifications', '/settings'
    ];

    for (const path of scanPages) {
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);

      const yakinda = await page.locator('text=/Yakında|Coming soon|lorem ipsum|TODO/i').count();
      const tmplVars = await page.locator('text=/{\\w+}/').count();
      if (yakinda > 0) console.log(`PLACEHOLDER on ${path}: ${yakinda}`);
      if (tmplVars > 0) {
        const texts = await page.locator('text=/{\\w+}/').allTextContents();
        console.log(`TEMPLATE VAR on ${path}: ${texts.join(', ')}`);
      }
    }

    console.log(`Console errors: ${errors.length}`);
    if (errors.length > 0) console.log(`Errors: ${errors.slice(0, 5).join(' | ')}`);
  });

  test('12 — Harita zoom + marker fiyat', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search/map`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-12-map.png', fullPage: true });

    const tiles = await page.locator('img[src*="tile.openstreetmap"]').evaluateAll(imgs =>
      imgs.map(img => img.getAttribute('src'))
    );
    const zoomLevels = tiles.map(t => { const m = t?.match(/\/(\d+)\/\d+\/\d+/); return m ? parseInt(m[1]) : 0; });
    console.log(`Map zoom: ${Math.max(...zoomLevels, 0)} (${tiles.length} tiles)`);

    const markerPrices = await page.locator('text=/\\d+.*₺|\\d+.*TL/').allTextContents();
    const map100x = markerPrices.some(p => parseInt(p.replace(/[^\d]/g, '')) > 5000);
    console.log(`Map prices: ${markerPrices.slice(0, 6).join(', ')} | 100x=${map100x}`);
  });

  test('13 — Host earnings kontrol', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/host/earnings`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-13-earnings.png', fullPage: true });

    const tmplLiteral = await page.locator('text=/{currencySymbol}/').count();
    const currTexts = await page.locator('text=/₺|TL|EUR|€/').allTextContents();
    console.log(`Earnings: {currencySymbol}=${tmplLiteral}, currency=${currTexts.slice(0, 5).join(', ')}`);
  });
});
