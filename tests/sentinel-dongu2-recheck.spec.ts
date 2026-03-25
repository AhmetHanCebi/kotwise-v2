import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';

// Login helper
async function login(page) {
  await page.goto(`${BASE}/welcome`);
  await page.waitForTimeout(1000);

  // Try to find login button/link
  const loginLink = page.locator('a[href*="login"], button:has-text("Giriş"), a:has-text("Giriş"), button:has-text("Login")').first();
  if (await loginLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await loginLink.click();
    await page.waitForTimeout(1000);
  } else {
    await page.goto(`${BASE}/login`);
    await page.waitForTimeout(1000);
  }

  // Fill login form
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passInput = page.locator('input[type="password"], input[name="password"]').first();

  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill('deniz@kotwise.com');
    await passInput.fill('KotwiseTest2026!');

    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }
}

// Screenshot helper
async function screenshot(page, name) {
  await page.screenshot({
    path: `tests/screenshots/sentinel-c2-${name}.png`,
    fullPage: true
  });
}

// ==========================================
// BÖLÜM 1: DEVAM EDEN BUG RE-CHECK
// ==========================================

test.describe('Bug Re-Check — Thumbnail Placeholder', () => {
  test.beforeAll(async ({ browser }) => {
    // Ensure screenshots dir
  });

  test('favorites — thumbnail check', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/favorites`);
    await page.waitForTimeout(2000);
    await screenshot(page, 'favorites');

    // Check images
    const images = page.locator('img');
    const count = await images.count();
    let svgCount = 0;
    let realCount = 0;
    let brokenCount = 0;

    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute('src') || '';
      if (src.includes('data:image/svg') || src === '') {
        svgCount++;
      } else {
        realCount++;
        const natural = await images.nth(i).evaluate(el => (el as HTMLImageElement).naturalWidth);
        if (natural === 0) brokenCount++;
      }
    }

    console.log(`FAVORITES: ${count} img total, ${svgCount} SVG placeholder, ${realCount} real, ${brokenCount} broken`);

    // Check prices
    const priceTexts = await page.locator('text=/\\d+.*TL|₺.*\\d+/').allTextContents();
    console.log(`FAVORITES prices: ${priceTexts.join(', ')}`);

    // Check for any price > 10000 (100x bug)
    for (const p of priceTexts) {
      const nums = p.match(/[\d.]+/g);
      if (nums) {
        for (const n of nums) {
          const val = parseFloat(n.replace('.', ''));
          if (val > 10000) {
            console.log(`⚠️ SUSPICIOUS PRICE: ${p} (value: ${val})`);
          }
        }
      }
    }
  });

  test('compare — thumbnail check', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/compare`);
    await page.waitForTimeout(2000);
    await screenshot(page, 'compare');

    const images = page.locator('img');
    const count = await images.count();
    let svgCount = 0;
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute('src') || '';
      if (src.includes('data:image/svg') || src === '') svgCount++;
    }
    console.log(`COMPARE: ${count} img total, ${svgCount} SVG placeholder`);

    const priceTexts = await page.locator('text=/\\d+.*TL|₺.*\\d+/').allTextContents();
    console.log(`COMPARE prices: ${priceTexts.join(', ')}`);
  });

  test('booking — thumbnail check', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/booking`);
    await page.waitForTimeout(2000);
    await screenshot(page, 'booking');

    const images = page.locator('img');
    const count = await images.count();
    let svgCount = 0;
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute('src') || '';
      if (src.includes('data:image/svg') || src === '') svgCount++;
    }
    console.log(`BOOKING: ${count} img total, ${svgCount} SVG placeholder`);

    const priceTexts = await page.locator('text=/\\d+.*TL|₺.*\\d+/').allTextContents();
    console.log(`BOOKING prices: ${priceTexts.join(', ')}`);
  });

  test('profile-bookings — thumbnail + price check', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForTimeout(2000);
    await screenshot(page, 'profile-bookings');

    const images = page.locator('img');
    const count = await images.count();
    let svgCount = 0;
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute('src') || '';
      if (src.includes('data:image/svg') || src === '') svgCount++;
    }
    console.log(`PROFILE-BOOKINGS: ${count} img total, ${svgCount} SVG placeholder`);

    const priceTexts = await page.locator('text=/\\d+.*TL|₺.*\\d+/').allTextContents();
    console.log(`PROFILE-BOOKINGS prices: ${priceTexts.join(', ')}`);

    for (const p of priceTexts) {
      const nums = p.match(/[\d.]+/g);
      if (nums) {
        for (const n of nums) {
          const val = parseFloat(n.replace('.', ''));
          if (val > 10000) {
            console.log(`⚠️ 100x PRICE BUG: ${p} (value: ${val})`);
          }
        }
      }
    }
  });
});

// ==========================================
// BÖLÜM 2: C5 PENDING BUG RE-CHECK
// ==========================================

test.describe('C5 Pending Bug Re-Check', () => {
  test('listing detail — price 100x regression check', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`);
    await page.waitForTimeout(2000);

    // Click first listing
    const listingLink = page.locator('a[href*="/listing/"]').first();
    if (await listingLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await listingLink.click();
      await page.waitForTimeout(2000);
    } else {
      // Fallback: go to a known listing
      await page.goto(`${BASE}/listing/1`);
      await page.waitForTimeout(2000);
    }

    await screenshot(page, 'listing-detail');

    const priceTexts = await page.locator('text=/\\d+.*TL|₺.*\\d+/').allTextContents();
    console.log(`LISTING-DETAIL prices: ${priceTexts.join(', ')}`);

    for (const p of priceTexts) {
      const nums = p.match(/[\d.]+/g);
      if (nums) {
        for (const n of nums) {
          const val = parseFloat(n.replace('.', ''));
          if (val > 10000) {
            console.log(`⚠️ 100x PRICE BUG in listing-detail: ${p}`);
          }
        }
      }
    }
  });

  test('search-map — marker prices + zoom', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search/map`);
    await page.waitForTimeout(3000);
    await screenshot(page, 'search-map');

    // Check zoom level via tile URLs
    const tiles = await page.locator('.leaflet-tile').all();
    let tileUrls: string[] = [];
    for (const tile of tiles.slice(0, 5)) {
      const src = await tile.getAttribute('src') || '';
      tileUrls.push(src);
    }
    console.log(`MAP tiles (first 5): ${tileUrls.join('\n')}`);

    // Extract zoom from tile URL pattern: /{z}/{x}/{y}.png
    const zoomMatch = tileUrls[0]?.match(/\/(\d+)\/\d+\/\d+/);
    const zoomLevel = zoomMatch ? parseInt(zoomMatch[1]) : -1;
    console.log(`MAP zoom level: ${zoomLevel}`);

    // Check marker prices
    const markers = await page.locator('.leaflet-marker-icon, .leaflet-marker-pane *').allTextContents();
    console.log(`MAP markers: ${markers.filter(m => m.trim()).join(', ')}`);

    // Also check div markers with prices
    const priceMarkers = await page.locator('text=/\\d+.*TL|₺.*\\d+/').allTextContents();
    console.log(`MAP price texts: ${priceMarkers.join(', ')}`);
  });

  test('events detail — join button check', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/events`);
    await page.waitForTimeout(2000);

    // Click first event
    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      const href = await eventLink.getAttribute('href');
      console.log(`EVENT link: ${href}`);
      await eventLink.click();
      await page.waitForTimeout(2000);
      await screenshot(page, 'event-detail');

      // Check for join/participate button
      const joinBtn = page.locator('button:has-text("Katıl"), button:has-text("Join"), button:has-text("Katılıyorum"), button:has-text("Katıl")');
      const joinVisible = await joinBtn.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`EVENT DETAIL join button: ${joinVisible ? 'MEVCUT' : 'YOK'}`);

      // Check page content
      const bodyText = await page.locator('body').textContent();
      console.log(`EVENT DETAIL has "Katıl" text: ${bodyText?.includes('Katıl')}`);
    } else {
      console.log('NO EVENT LINKS FOUND');
    }
  });

  test('host-earnings — currency bug check', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/host/earnings`);
    await page.waitForTimeout(2000);
    await screenshot(page, 'host-earnings');

    const bodyText = await page.locator('body').textContent() || '';

    // Check for currencySymbol literal text (bug)
    if (bodyText.includes('currencySymbol') || bodyText.includes('undefined')) {
      console.log('⚠️ HOST-EARNINGS: currencySymbol bug STILL PRESENT');
    } else {
      console.log('HOST-EARNINGS: No currencySymbol bug');
    }

    const priceTexts = await page.locator('text=/\\d+.*TL|₺.*\\d+|€.*\\d+/').allTextContents();
    console.log(`HOST-EARNINGS prices: ${priceTexts.join(', ')}`);
  });

  test('roommates detail — photo + uyum check', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/roommates`);
    await page.waitForTimeout(2000);
    await screenshot(page, 'roommates');

    // Check for uyum percentage
    const uyumText = await page.locator('text=/\\d+%.*Uyum|Uyum.*\\d+%/').allTextContents();
    console.log(`ROOMMATES uyum: ${uyumText.join(', ')}`);

    // Check for real photos vs placeholders
    const images = page.locator('img');
    const count = await images.count();
    let svgCount = 0;
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute('src') || '';
      if (src.includes('data:image/svg') || src === '') svgCount++;
    }
    console.log(`ROOMMATES: ${count} img total, ${svgCount} SVG placeholder`);

    // Check swipe buttons
    const buttons = await page.locator('button').allTextContents();
    console.log(`ROOMMATES buttons: ${buttons.filter(b => b.trim()).join(', ')}`);
  });
});

// ==========================================
// BÖLÜM 3: NAVİGASYON TESTİ
// ==========================================

test.describe('Navigation Tests', () => {
  test('homepage — all feature links', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(2000);
    await screenshot(page, 'homepage');

    // Collect ALL links on homepage
    const allLinks = await page.locator('a[href]').evaluateAll(els =>
      els.map(el => ({ href: el.getAttribute('href'), text: el.textContent?.trim().substring(0, 50) }))
    );

    console.log('HOMEPAGE links:');
    const uniqueHrefs = new Set<string>();
    for (const link of allLinks) {
      if (link.href && !uniqueHrefs.has(link.href)) {
        uniqueHrefs.add(link.href);
        console.log(`  ${link.href} — "${link.text}"`);
      }
    }

    // Check specific features
    const features = ['roommate', 'oda arkadaş', 'host', 'ev sahibi', 'mentor', 'event', 'etkinlik', 'city', 'şehir', 'budget', 'bütçe', 'community', 'topluluk'];
    const bodyText = (await page.locator('body').textContent() || '').toLowerCase();

    for (const f of features) {
      const found = bodyText.includes(f);
      const hasLink = allLinks.some(l => l.href?.toLowerCase().includes(f) || l.text?.toLowerCase().includes(f));
      console.log(`FEATURE "${f}": text=${found}, link=${hasLink}`);
    }
  });

  test('bottomnav — all tabs', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(2000);

    // Find bottom nav
    const navLinks = await page.locator('nav a[href], [role="navigation"] a[href], footer a[href]').evaluateAll(els =>
      els.map(el => ({ href: el.getAttribute('href'), text: el.textContent?.trim() }))
    );
    console.log('BOTTOMNAV links:', JSON.stringify(navLinks));

    // Check for roommates and host links specifically
    const hasRoommates = navLinks.some(l => l.href?.includes('roommate'));
    const hasHost = navLinks.some(l => l.href?.includes('host'));
    console.log(`BOTTOMNAV roommates: ${hasRoommates}, host: ${hasHost}`);
  });

  test('profile menu — feature links', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/profile`);
    await page.waitForTimeout(2000);
    await screenshot(page, 'profile-menu');

    const allLinks = await page.locator('a[href]').evaluateAll(els =>
      els.map(el => ({ href: el.getAttribute('href'), text: el.textContent?.trim().substring(0, 50) }))
    );

    console.log('PROFILE links:');
    for (const link of allLinks) {
      console.log(`  ${link.href} — "${link.text}"`);
    }

    const hasRoommates = allLinks.some(l => l.href?.includes('roommate'));
    const hasHost = allLinks.some(l => l.href?.includes('host'));
    console.log(`PROFILE roommates: ${hasRoommates}, host: ${hasHost}`);
  });
});

// ==========================================
// BÖLÜM 4: PLACEHOLDER / "YAKINDA" TARAMASI
// ==========================================

test.describe('Placeholder Scan', () => {
  test('scan all problematic pages for yakinda/placeholder', async ({ page }) => {
    await login(page);

    const pages = [
      '/favorites', '/compare', '/booking', '/profile/bookings',
      '/search/map', '/roommates', '/mentors', '/host/earnings',
      '/events', '/notifications', '/messages'
    ];

    const suspiciousTexts = ['yakında', 'coming soon', 'placeholder', 'lorem ipsum', 'todo', 'yakinda'];

    for (const p of pages) {
      await page.goto(`${BASE}${p}`);
      await page.waitForTimeout(1500);
      const bodyText = (await page.locator('body').textContent() || '').toLowerCase();

      const found: string[] = [];
      for (const s of suspiciousTexts) {
        if (bodyText.includes(s)) found.push(s);
      }

      if (found.length > 0) {
        console.log(`⚠️ ${p}: FOUND placeholder text: ${found.join(', ')}`);
      } else {
        console.log(`✅ ${p}: clean`);
      }
    }
  });
});

// ==========================================
// BÖLÜM 5: CONSOLE ERROR CHECK
// ==========================================

test.describe('Console Error Check', () => {
  test('check console errors on key pages', async ({ page }) => {
    await login(page);

    const errors: { page: string; error: string }[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({ page: page.url(), error: msg.text().substring(0, 200) });
      }
    });

    const pages = ['/favorites', '/compare', '/booking', '/profile/bookings', '/search/map', '/notifications', '/roommates'];

    for (const p of pages) {
      await page.goto(`${BASE}${p}`);
      await page.waitForTimeout(2000);
    }

    if (errors.length > 0) {
      console.log(`CONSOLE ERRORS (${errors.length}):`);
      for (const e of errors) {
        console.log(`  ${e.page}: ${e.error}`);
      }
    } else {
      console.log('NO CONSOLE ERRORS');
    }
  });
});
