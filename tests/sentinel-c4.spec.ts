import { test, expect, Page } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Login helper (matching verify-fixes pattern)
async function login(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

  await emailInput.fill('deniz@kotwise.com');
  await passwordInput.fill('KotwiseTest2026!');

  const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login"), button:has-text("giriş")').first();
  await submitBtn.click();

  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle').catch(() => {});
}

// ============================
// BÖLÜM 1: DEVAM EDEN BUG RE-CHECK
// ============================

test('C4-01: Listing thumbnail fotoğrafları — favorites', async ({ page }) => {
  await login(page);
  await page.goto('/favorites');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}\\sentinel-c4-favorites.png`, fullPage: true });

  // Check images
  const images = await page.$$eval('img', imgs => imgs.map(img => ({
    src: img.src.substring(0, 100),
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    complete: img.complete,
    isSvgPlaceholder: img.src.includes('data:image/svg+xml'),
    isBlobOrHttp: img.src.startsWith('http') || img.src.startsWith('blob'),
  })));

  console.log('FAVORITES IMAGES:', JSON.stringify(images, null, 2));

  const svgPlaceholders = images.filter(i => i.isSvgPlaceholder);
  console.log(`SVG placeholder count: ${svgPlaceholders.length} / ${images.length} total`);
});

test('C4-02: Listing thumbnail fotoğrafları — compare', async ({ page }) => {
  await login(page);
  await page.goto('/compare');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}\\sentinel-c4-compare.png`, fullPage: true });

  const images = await page.$$eval('img', imgs => imgs.map(img => ({
    src: img.src.substring(0, 100),
    isSvgPlaceholder: img.src.includes('data:image/svg+xml'),
  })));
  console.log('COMPARE IMAGES:', JSON.stringify(images, null, 2));
});

test('C4-03: Listing thumbnail fotoğrafları — booking', async ({ page }) => {
  await login(page);
  await page.goto('/booking');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}\\sentinel-c4-booking.png`, fullPage: true });

  const images = await page.$$eval('img', imgs => imgs.map(img => ({
    src: img.src.substring(0, 100),
    isSvgPlaceholder: img.src.includes('data:image/svg+xml'),
  })));
  console.log('BOOKING IMAGES:', JSON.stringify(images, null, 2));
});

test('C4-04: Listing thumbnail fotoğrafları — profile-bookings', async ({ page }) => {
  await login(page);
  await page.goto('/profile/bookings');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}\\sentinel-c4-profile-bookings.png`, fullPage: true });

  const images = await page.$$eval('img', imgs => imgs.map(img => ({
    src: img.src.substring(0, 100),
    isSvgPlaceholder: img.src.includes('data:image/svg+xml'),
  })));
  console.log('PROFILE-BOOKINGS IMAGES:', JSON.stringify(images, null, 2));
});

test('C4-05: Harita zoom level — search/map', async ({ page }) => {
  await login(page);
  await page.goto('/search/map');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}\\sentinel-c4-search-map.png`, fullPage: true });

  // Check zoom level from tile URLs
  const tileUrls = await page.$$eval('.leaflet-tile-pane img', imgs =>
    imgs.map(img => img.src).slice(0, 5)
  );
  console.log('MAP TILE URLs:', JSON.stringify(tileUrls, null, 2));

  // Extract zoom level from tile URL pattern: /{z}/{x}/{y}.png
  const zoomMatch = tileUrls[0]?.match(/\/(\d+)\/\d+\/\d+\.png/);
  const zoomLevel = zoomMatch ? parseInt(zoomMatch[1]) : -1;
  console.log(`MAP ZOOM LEVEL: ${zoomLevel} (should be 12+ for city)`);

  // Check marker prices
  const markerTexts = await page.$$eval('.leaflet-marker-pane *, .leaflet-overlay-pane *', els =>
    els.map(el => el.textContent?.trim()).filter(t => t && t.includes('₺') || t?.includes('TL'))
  );
  console.log('MAP MARKER PRICES:', JSON.stringify(markerTexts.slice(0, 10)));
});

// ============================
// BÖLÜM 2: NAVİGASYON TESTİ
// ============================

test('C4-06: BottomNav — tüm sekmelere tıklama', async ({ page }) => {
  await login(page);
  await page.goto('/');
  await page.waitForTimeout(1500);

  // Find bottom nav links
  const bottomNavLinks = await page.$$eval('nav a, nav button, [role="navigation"] a', els =>
    els.map(el => ({
      text: el.textContent?.trim().substring(0, 30),
      href: el.getAttribute('href'),
      ariaLabel: el.getAttribute('aria-label'),
    }))
  );
  console.log('BOTTOM NAV LINKS:', JSON.stringify(bottomNavLinks, null, 2));

  // Click each bottom nav item and verify navigation
  const navItems = await page.$$('nav a[href]');
  const results = [];

  for (const item of navItems) {
    const href = await item.getAttribute('href');
    if (!href) continue;

    await item.click();
    await page.waitForTimeout(1500);

    const currentUrl = page.url();
    const hasError = await page.$('.nextjs-toast-errors-parent, [id="__next-build-error"]');

    results.push({
      href,
      currentUrl,
      hasError: !!hasError,
    });
  }

  console.log('BOTTOMNAV CLICK RESULTS:', JSON.stringify(results, null, 2));
  await page.screenshot({ path: `${SCREENSHOT_DIR}\\sentinel-c4-bottomnav-test.png`, fullPage: true });
});

test('C4-07: Ana sayfadan tüm özelliklere erişim', async ({ page }) => {
  await login(page);
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}\\sentinel-c4-home.png`, fullPage: true });

  // Collect ALL links on homepage
  const allLinks = await page.$$eval('a[href]', els =>
    els.map(el => ({
      text: el.textContent?.trim().substring(0, 50),
      href: el.getAttribute('href'),
    }))
  );
  console.log('HOME PAGE ALL LINKS:', JSON.stringify(allLinks, null, 2));

  // Check for key features accessibility
  const keyFeatures = [
    { name: 'roommates', patterns: ['/roommates', 'oda arkadaşı', 'roommate'] },
    { name: 'mentors', patterns: ['/mentors', 'mentor', 'mentör'] },
    { name: 'events', patterns: ['/events', 'etkinlik'] },
    { name: 'city', patterns: ['/city', 'şehir'] },
    { name: 'community', patterns: ['/community', 'topluluk'] },
    { name: 'messages', patterns: ['/messages', 'mesaj'] },
    { name: 'search', patterns: ['/search', 'ara', 'ilan'] },
    { name: 'budget', patterns: ['/budget', 'bütçe'] },
    { name: 'host', patterns: ['/host', 'ev sahibi'] },
    { name: 'notifications', patterns: ['/notifications', 'bildirim'] },
  ];

  const accessibilityReport = keyFeatures.map(feature => {
    const found = allLinks.some(link =>
      feature.patterns.some(p =>
        link.href?.toLowerCase().includes(p) ||
        link.text?.toLowerCase().includes(p)
      )
    );
    return { feature: feature.name, accessibleFromHome: found };
  });

  console.log('FEATURE ACCESSIBILITY FROM HOME:', JSON.stringify(accessibilityReport, null, 2));
});

test('C4-08: Navigasyon — oda arkadaşı bulma yolculuğu', async ({ page }) => {
  await login(page);
  await page.goto('/');
  await page.waitForTimeout(1500);

  // Try to find roommates link/button
  const roommateLink = await page.$('a[href*="roommate"], a[href*="roommates"]');
  if (roommateLink) {
    await roommateLink.click();
    await page.waitForTimeout(1500);
    console.log('ROOMMATE NAV: Found direct link from home, navigated to:', page.url());
  } else {
    // Try bottom nav or menu
    const allTexts = await page.$$eval('a, button', els =>
      els.map(el => ({ text: el.textContent?.trim().substring(0, 30), tag: el.tagName, href: el.getAttribute('href') }))
        .filter(e => e.text?.toLowerCase().includes('arkadaş') || e.text?.toLowerCase().includes('roommate') || e.href?.includes('roommate'))
    );
    console.log('ROOMMATE NAV: No direct link found. Related elements:', JSON.stringify(allTexts));
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}\\sentinel-c4-roommate-nav.png`, fullPage: true });
});

// ============================
// BÖLÜM 3: ÜRÜN KALİTESİ
// ============================

test('C4-09: Search sayfası — listing kart tıklama → detay', async ({ page }) => {
  await login(page);
  await page.goto('/search');
  await page.waitForTimeout(2000);

  // Click first listing card
  const firstCard = await page.$('a[href*="/listing/"]');
  if (firstCard) {
    const href = await firstCard.getAttribute('href');
    console.log('FIRST LISTING LINK:', href);
    await firstCard.click();
    await page.waitForTimeout(2000);
    console.log('LISTING DETAIL URL:', page.url());
    await page.screenshot({ path: `${SCREENSHOT_DIR}\\sentinel-c4-listing-detail.png`, fullPage: true });

    // Check carousel
    const carouselImages = await page.$$eval('img', imgs => imgs.filter(i => !i.src.includes('svg+xml')).length);
    console.log('LISTING DETAIL REAL IMAGES:', carouselImages);

    // Check "Rezervasyon Yap" button
    const bookBtn = await page.$('button:has-text("Rezervasyon"), a:has-text("Rezervasyon")');
    console.log('BOOKING BUTTON EXISTS:', !!bookBtn);
  } else {
    console.log('SEARCH: No listing card links found!');
  }
});

test('C4-10: Events — takvim görünümü', async ({ page }) => {
  await login(page);
  await page.goto('/events');
  await page.waitForTimeout(2000);

  // Try to switch to calendar view
  const calendarBtn = await page.$('button:has-text("Takvim"), [aria-label*="calendar"], [aria-label*="takvim"]');
  if (calendarBtn) {
    await calendarBtn.click();
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: `${SCREENSHOT_DIR}\\sentinel-c4-events-calendar.png`, fullPage: true });

  // Check event cards
  const eventCount = await page.$$eval('a[href*="/events/"], [class*="event"]', els => els.length);
  console.log('EVENTS COUNT:', eventCount);
});

test('C4-11: Booking akışı — Stripe kontrol', async ({ page }) => {
  await login(page);

  // Go to a listing and try to book
  await page.goto('/search');
  await page.waitForTimeout(2000);

  const listingLink = await page.$('a[href*="/listing/"]');
  if (listingLink) {
    await listingLink.click();
    await page.waitForTimeout(2000);

    // Click "Rezervasyon Yap"
    const bookBtn = await page.$('button:has-text("Rezervasyon"), a:has-text("Rezervasyon")');
    if (bookBtn) {
      await bookBtn.click();
      await page.waitForTimeout(2000);
      console.log('AFTER BOOKING CLICK URL:', page.url());
      await page.screenshot({ path: `${SCREENSHOT_DIR}\\sentinel-c4-booking-flow.png`, fullPage: true });

      // Check for Stripe elements
      const stripeFrame = await page.$('iframe[src*="stripe"]');
      const stripeElement = await page.$('[class*="stripe"], [data-stripe]');
      console.log('STRIPE IFRAME:', !!stripeFrame);
      console.log('STRIPE ELEMENT:', !!stripeElement);
    }
  }
});

test('C4-12: "Yakında" / placeholder taraması', async ({ page }) => {
  await login(page);

  const pagesToCheck = [
    '/', '/search', '/favorites', '/booking', '/profile',
    '/events', '/community', '/roommates', '/mentors',
    '/messages', '/notifications', '/settings', '/budget',
    '/host', '/city'
  ];

  const results = [];

  for (const path of pagesToCheck) {
    await page.goto(path);
    await page.waitForTimeout(1500);

    const bodyText = await page.textContent('body') || '';
    const hasYakinda = bodyText.includes('Yakında') || bodyText.includes('yakında');
    const hasComingSoon = bodyText.toLowerCase().includes('coming soon');
    const hasPlaceholder = bodyText.toLowerCase().includes('placeholder');
    const hasLorem = bodyText.toLowerCase().includes('lorem ipsum');
    const hasTodo = bodyText.includes('TODO') || bodyText.includes('todo');

    if (hasYakinda || hasComingSoon || hasPlaceholder || hasLorem || hasTodo) {
      results.push({ path, hasYakinda, hasComingSoon, hasPlaceholder, hasLorem, hasTodo });
    }
  }

  console.log('PLACEHOLDER SCAN RESULTS:', results.length === 0 ? 'ALL CLEAR - No placeholders found' : JSON.stringify(results, null, 2));
});

test('C4-13: Console error kontrolü — kritik sayfalar', async ({ page }) => {
  await login(page);

  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[${msg.type()}] ${msg.text().substring(0, 150)}`);
    }
  });

  const pages = ['/favorites', '/compare', '/booking', '/profile/bookings', '/search/map', '/notifications', '/messages'];

  for (const path of pages) {
    errors.length = 0;
    await page.goto(path);
    await page.waitForTimeout(2000);

    if (errors.length > 0) {
      console.log(`CONSOLE ERRORS on ${path}:`, JSON.stringify(errors.slice(0, 5)));
    }
  }
});
