import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

// Helper: login
async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

  await emailInput.fill('deniz@kotwise.com');
  await passwordInput.fill('KotwiseTest2026!');

  const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
  await submitBtn.click();

  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

// Helper: collect page issues
async function collectPageIssues(page: Page, pageName: string) {
  const issues: string[] = [];

  // Check for "Yakında" / "Coming soon" toasts
  const yakinText = await page.locator('text=/yakında|coming soon|Bu özellik yakında/i').count();
  if (yakinText > 0) {
    issues.push(`"Yakında/Coming soon" placeholder text found (${yakinText} occurrences)`);
  }

  // Check for "Fotoğraf Yok"
  const noPhotoText = await page.locator('text=/Fotoğraf Yok|No Photo/i').count();
  if (noPhotoText > 0) {
    issues.push(`"Fotoğraf Yok" placeholder found (${noPhotoText} occurrences)`);
  }

  // Check for error overlays
  const errorOverlay = await page.locator('#__next-build-error, [class*="error-overlay"]').count();
  if (errorOverlay > 0) {
    issues.push('Next.js error overlay detected');
  }

  // Check console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  return { issues, consoleErrors };
}

test.describe('Döngü 2 — Sorunlu Sayfalar Re-Check + Ürün Kalitesi', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
  });

  // ========== BUG RE-CHECK: Kira Fiyatları ==========
  test('BUG-RECHECK: Kira fiyatları /search', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-search-prices.png`, fullPage: true });

    // Look for price elements - check if any price > 10000 (unreasonable monthly rent)
    const pageText = await page.textContent('body');
    const priceMatches = pageText?.match(/€\s*[\d.,]+/g) || [];
    const highPrices: string[] = [];

    for (const p of priceMatches) {
      const num = parseFloat(p.replace('€', '').replace(/\./g, '').replace(',', '.').trim());
      if (num > 10000) {
        highPrices.push(`${p} (parsed: ${num})`);
      }
    }

    if (highPrices.length > 0) {
      console.log(`BUG CONFIRMED: Unreasonable prices found: ${highPrices.join(', ')}`);
    } else {
      console.log('RENT PRICES: All prices look reasonable (under €10,000)');
    }

    // Check "Fotoğraf Yok"
    const noPhoto = await page.locator('text=/Fotoğraf Yok/i').count();
    console.log(`SEARCH - "Fotoğraf Yok" count: ${noPhoto}`);
  });

  // ========== BUG RE-CHECK: Favorites Fotoğrafları ==========
  test('BUG-RECHECK: Favorites fotoğrafları', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-favorites-recheck.png`, fullPage: true });

    const noPhoto = await page.locator('text=/Fotoğraf Yok/i').count();
    const imgCount = await page.locator('img[src*="http"], img[src*="supabase"], img[src*="unsplash"]').count();
    console.log(`FAVORITES - "Fotoğraf Yok": ${noPhoto}, Real images: ${imgCount}`);

    // Check for actual listing data
    const cardCount = await page.locator('[class*="card"], [class*="listing"], [class*="item"]').count();
    console.log(`FAVORITES - Card count: ${cardCount}`);
  });

  // ========== BUG RE-CHECK: Compare Fotoğrafları ==========
  test('BUG-RECHECK: Compare fotoğrafları', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-compare-recheck.png`, fullPage: true });

    const noPhoto = await page.locator('text=/Fotoğraf Yok/i').count();
    console.log(`COMPARE - "Fotoğraf Yok": ${noPhoto}`);
  });

  // ========== BUG RE-CHECK: Booking ==========
  test('BUG-RECHECK: Booking fotoğraf + Stripe', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/booking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-booking-recheck.png`, fullPage: true });

    const noPhoto = await page.locator('text=/Fotoğraf Yok/i').count();
    console.log(`BOOKING - "Fotoğraf Yok": ${noPhoto}`);

    // Check for Stripe elements
    const stripeElements = await page.locator('iframe[src*="stripe"], [class*="stripe"], text=/ödeme|payment|stripe/i').count();
    console.log(`BOOKING - Stripe elements: ${stripeElements}`);

    // Check for payment button
    const payBtn = await page.locator('button:has-text("Öde"), button:has-text("Pay"), button:has-text("Ödeme")').count();
    console.log(`BOOKING - Payment buttons: ${payBtn}`);
  });

  // ========== BUG RE-CHECK: Profile Bookings ==========
  test('BUG-RECHECK: Profile bookings fotoğraf', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-profile-bookings-recheck.png`, fullPage: true });

    const noPhoto = await page.locator('text=/Fotoğraf Yok/i').count();
    console.log(`PROFILE-BOOKINGS - "Fotoğraf Yok": ${noPhoto}`);
  });

  // ========== BUG RE-CHECK: Search Map Zoom ==========
  test('BUG-RECHECK: Search map zoom', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/search/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Extra wait for map tiles

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-search-map-recheck.png`, fullPage: true });

    // Check if Leaflet map exists
    const leafletMap = await page.locator('.leaflet-container, [class*="leaflet"]').count();
    console.log(`MAP - Leaflet container: ${leafletMap}`);

    // Check zoom level - if we can access it
    const zoomLevel = await page.evaluate(() => {
      const mapEl = document.querySelector('.leaflet-container');
      if (mapEl && (mapEl as any)._leaflet_id) {
        // Try to get Leaflet instance
        const maps = (window as any).L?.map;
        return 'leaflet found';
      }
      return 'no leaflet instance';
    }).catch(() => 'eval failed');
    console.log(`MAP - Zoom check: ${zoomLevel}`);

    // Check if specific city markers exist
    const markers = await page.locator('.leaflet-marker-icon, .leaflet-marker-pane img').count();
    console.log(`MAP - Markers: ${markers}`);
  });

  // ========== BUG RE-CHECK: Community Fotoğraf ==========
  test('BUG-RECHECK: Community fotoğrafları', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/community`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-community-recheck.png`, fullPage: true });

    const noPhoto = await page.locator('text=/Fotoğraf Yok/i').count();
    console.log(`COMMUNITY - "Fotoğraf Yok": ${noPhoto}`);

    // Count posts
    const postCount = await page.locator('[class*="post"], [class*="card"], article').count();
    console.log(`COMMUNITY - Post count: ${postCount}`);
  });

  // ========== ÜRÜN KALİTESİ: Mentors (sparse content) ==========
  test('QUALITY: Mentors içerik yoğunluğu', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/mentors`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-mentors-recheck.png`, fullPage: true });

    // Count mentor cards
    const mentorCards = await page.locator('[class*="card"], [class*="mentor"]').count();
    console.log(`MENTORS - Card count: ${mentorCards}`);

    // Check "Mentor Ol" button
    const mentorBtn = await page.locator('text=/Mentor Ol|Become/i').count();
    console.log(`MENTORS - "Mentor Ol" button: ${mentorBtn}`);

    // Check city filters
    const cityFilters = await page.locator('text=/Barcelona|Berlin|İstanbul|Lizbon/i').count();
    console.log(`MENTORS - City filters: ${cityFilters}`);
  });

  // ========== ÜRÜN KALİTESİ: Listing Detail (eğer varsa) ==========
  test('QUALITY: Listing detail page', async ({ page }) => {
    await login(page);

    // First go to search and click a listing
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Try to find and click the first listing card link
    const listingLink = page.locator('a[href*="/listing/"]').first();
    const linkExists = await listingLink.count();

    if (linkExists > 0) {
      const href = await listingLink.getAttribute('href');
      console.log(`LISTING DETAIL - Navigating to: ${href}`);
      await listingLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-listing-detail.png`, fullPage: true });

      // Check photo carousel
      const carousel = await page.locator('[class*="carousel"], [class*="slider"], [class*="swiper"]').count();
      console.log(`LISTING DETAIL - Carousel: ${carousel}`);

      // Check for real images
      const images = await page.locator('img[src*="http"]').count();
      console.log(`LISTING DETAIL - Real images: ${images}`);

      const noPhoto = await page.locator('text=/Fotoğraf Yok/i').count();
      console.log(`LISTING DETAIL - "Fotoğraf Yok": ${noPhoto}`);

      // Check price display
      const pageText = await page.textContent('body') || '';
      const priceMatches = pageText.match(/€\s*[\d.,]+/g) || [];
      console.log(`LISTING DETAIL - Prices found: ${priceMatches.join(', ')}`);

      // Check for "Yakında" placeholders
      const yakinda = await page.locator('text=/yakında|coming soon/i').count();
      console.log(`LISTING DETAIL - "Yakında" text: ${yakinda}`);
    } else {
      console.log('LISTING DETAIL - No listing links found on /search');
    }
  });

  // ========== ÜRÜN KALİTESİ: City Detail ==========
  test('QUALITY: City detail page', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/city`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click first city
    const cityLink = page.locator('a[href*="/city/"]').first();
    const linkExists = await cityLink.count();

    if (linkExists > 0) {
      const href = await cityLink.getAttribute('href');
      console.log(`CITY DETAIL - Navigating to: ${href}`);
      await cityLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-city-detail.png`, fullPage: true });

      const pageText = await page.textContent('body') || '';
      const yakinda = await page.locator('text=/yakında|coming soon/i').count();
      console.log(`CITY DETAIL - "Yakında" text: ${yakinda}`);

      // Is there actual content or just a placeholder?
      const contentLength = pageText.trim().length;
      console.log(`CITY DETAIL - Content length: ${contentLength}`);
    } else {
      console.log('CITY DETAIL - No city links found');
    }
  });

  // ========== ÜRÜN KALİTESİ: Events detail ==========
  test('QUALITY: Events detail page', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click first event
    const eventLink = page.locator('a[href*="/events/"]').first();
    const linkExists = await eventLink.count();

    if (linkExists > 0) {
      const href = await eventLink.getAttribute('href');
      console.log(`EVENT DETAIL - Navigating to: ${href}`);
      await eventLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-event-detail.png`, fullPage: true });

      const yakinda = await page.locator('text=/yakında|coming soon/i').count();
      console.log(`EVENT DETAIL - "Yakında" text: ${yakinda}`);

      const noPhoto = await page.locator('text=/Fotoğraf Yok/i').count();
      console.log(`EVENT DETAIL - "Fotoğraf Yok": ${noPhoto}`);
    } else {
      console.log('EVENT DETAIL - No event links found');
    }
  });

  // ========== ÜRÜN KALİTESİ: Roommates swipe ==========
  test('QUALITY: Roommates swipe gerçek çalışıyor mu', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-roommates-recheck.png`, fullPage: true });

    // Check for swipe buttons (like/dislike)
    const likeBtn = await page.locator('button:has-text("Beğen"), button[class*="like"], button:has(svg[class*="heart"]), button:has(svg[class*="check"])').count();
    const dislikeBtn = await page.locator('button:has-text("Geç"), button[class*="dislike"], button:has(svg[class*="x"])').count();
    console.log(`ROOMMATES - Like buttons: ${likeBtn}, Dislike buttons: ${dislikeBtn}`);

    // Check for match percentage
    const matchPercent = await page.locator('text=/%\\s*uyum|% match|% compat/i').count();
    console.log(`ROOMMATES - Match percentage visible: ${matchPercent}`);

    // Check for profile data
    const profileCards = await page.locator('[class*="card"], [class*="profile"]').count();
    console.log(`ROOMMATES - Profile cards: ${profileCards}`);
  });

  // ========== ÜRÜN KALİTESİ: Host earnings gerçek data ==========
  test('QUALITY: Host earnings data kontrolü', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/host/earnings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-host-earnings-recheck.png`, fullPage: true });

    const pageText = await page.textContent('body') || '';

    // Check for placeholder/zero data
    const zeroAmounts = (pageText.match(/€\s*0[.,]00/g) || []).length;
    console.log(`HOST EARNINGS - Zero amounts: ${zeroAmounts}`);

    // Check for graph area
    const graphArea = await page.locator('canvas, svg[class*="chart"], [class*="chart"], [class*="graph"]').count();
    console.log(`HOST EARNINGS - Graph elements: ${graphArea}`);

    const yakinda = await page.locator('text=/yakında|coming soon/i').count();
    console.log(`HOST EARNINGS - "Yakında" text: ${yakinda}`);
  });

  // ========== ÜRÜN KALİTESİ: Form quality checks ==========
  test('QUALITY: Listing new form - üniversite dropdown kontrolü', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/listing/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-listing-new-recheck.png`, fullPage: true });

    // Check university field type
    const selectEl = await page.locator('select[name*="university"], select[name*="üniversite"]').count();
    const autocomplete = await page.locator('[class*="autocomplete"], [class*="combobox"], [role="combobox"], [role="listbox"]').count();
    const freeText = await page.locator('input[name*="university"], input[name*="üniversite"]').count();

    console.log(`LISTING NEW - University select: ${selectEl}, Autocomplete: ${autocomplete}, Free text: ${freeText}`);

    // Check form steps
    const steps = await page.locator('[class*="step"], [class*="progress"]').count();
    console.log(`LISTING NEW - Step indicators: ${steps}`);
  });

  // ========== GENEL: "Yakında" tarama tüm sorunlu sayfalarda ==========
  test('SCAN: Tüm sorunlu sayfalarda "Yakında" kontrolü', async ({ page }) => {
    await login(page);

    const pagesToCheck = [
      { name: 'search', path: '/search' },
      { name: 'booking', path: '/booking' },
      { name: 'compare', path: '/compare' },
      { name: 'favorites', path: '/favorites' },
      { name: 'community', path: '/community' },
      { name: 'mentors', path: '/mentors' },
      { name: 'roommates', path: '/roommates' },
      { name: 'host-earnings', path: '/host/earnings' },
      { name: 'host-calendar', path: '/host/calendar' },
    ];

    for (const p of pagesToCheck) {
      await page.goto(`${BASE}${p.path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const yakinda = await page.locator('text=/yakında|coming soon|Bu özellik/i').count();
      const placeholder = await page.locator('text=/placeholder|lorem ipsum/i').count();

      if (yakinda > 0 || placeholder > 0) {
        console.log(`YAKINDA SCAN - ${p.name}: yakında=${yakinda}, placeholder=${placeholder}`);
      }
    }

    console.log('YAKINDA SCAN complete');
  });
});
