import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

// Login helper
async function login(page) {
  await page.goto(`${BASE}/welcome`);
  await page.waitForTimeout(1000);

  // Try to find login button/link
  const loginLink = page.locator('text=Giriş Yap').first();
  if (await loginLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await loginLink.click();
    await page.waitForTimeout(1000);
  } else {
    await page.goto(`${BASE}/login`);
    await page.waitForTimeout(1000);
  }

  // Fill login form
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');

    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş")').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }
}

// Helper: check page basics
async function checkPage(page, path: string, name: string) {
  const result: any = { name, path, status: 'OK', issues: [] };

  const response = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(e => null);

  if (!response) {
    result.status = 'ERROR';
    result.issues.push('Page failed to load');
    return result;
  }

  result.httpStatus = response.status();
  if (response.status() >= 400) {
    result.status = 'ERROR';
    result.issues.push(`HTTP ${response.status()}`);
  }

  await page.waitForTimeout(2000);

  // Check for error overlays
  const errorOverlay = await page.locator('[data-nextjs-error], .error-boundary, [class*="error"]').first().isVisible({ timeout: 1000 }).catch(() => false);
  if (errorOverlay) {
    result.issues.push('Error overlay detected');
  }

  // Check for "Yakında" / placeholder texts
  const bodyText = await page.locator('body').innerText().catch(() => '');

  if (bodyText.includes('Yakında') || bodyText.includes('yakında aktif olacak')) {
    result.issues.push('PLACEHOLDER: "Yakında" text found');
  }

  if (bodyText.includes('Bu özellik yakında')) {
    result.issues.push('PLACEHOLDER: "Bu özellik yakında" text found');
  }

  // Check for "Fotoğraf Yok"
  const fotoYokCount = (bodyText.match(/Fotoğraf Yok/g) || []).length;
  if (fotoYokCount > 0) {
    result.issues.push(`"Fotoğraf Yok" placeholder: ${fotoYokCount} occurrences`);
  }

  // Check for console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Screenshot
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/sentinel-c2-${name}.png`,
    fullPage: true
  });

  if (result.issues.length > 0 && result.status === 'OK') {
    result.status = 'ISSUE';
  }

  return result;
}

test.describe('Sentinel Döngü 2 - Sorunlu Sayfa Re-Test + Kalite', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await login(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ========== SORUNLU SAYFALAR RE-TEST ==========

  test('RE-TEST: /search/map - Harita zoom kontrolü', async () => {
    await page.goto(`${BASE}/search/map`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-search-map.png`, fullPage: true });

    // Check if Leaflet map exists
    const mapContainer = page.locator('.leaflet-container, [class*="map"], #map');
    const mapVisible = await mapContainer.first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`Map container visible: ${mapVisible}`);

    // Check zoom level - if we can see zoom controls
    const zoomIn = page.locator('.leaflet-control-zoom-in, button[aria-label="Zoom in"]');
    const zoomVisible = await zoomIn.first().isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Zoom controls visible: ${zoomVisible}`);

    // Check if map tiles loaded
    const tiles = page.locator('.leaflet-tile-loaded');
    const tileCount = await tiles.count().catch(() => 0);
    console.log(`Map tiles loaded: ${tileCount}`);

    // Check body for city name
    const bodyText = await page.locator('body').innerText();
    const hasCity = bodyText.includes('Barcelona') || bodyText.includes('Berlin') || bodyText.includes('İstanbul');
    console.log(`City name in page: ${hasCity}`);
  });

  test('RE-TEST: /favorites - Fotoğraf kontrolü', async () => {
    const result = await checkPage(page, '/favorites', 'favorites');
    console.log(JSON.stringify(result, null, 2));

    // Check listing cards
    const cards = page.locator('[class*="card"], [class*="listing"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log(`Card count: ${cardCount}`);

    // Check for real images
    const images = page.locator('img[src]:not([src=""])');
    const imgCount = await images.count();
    console.log(`Images with src: ${imgCount}`);

    // Check for placeholder images
    const placeholderImgs = page.locator('img[src*="placeholder"], img[alt*="Fotoğraf Yok"]');
    const placeholderCount = await placeholderImgs.count();
    console.log(`Placeholder images: ${placeholderCount}`);
  });

  test('RE-TEST: /compare - Fotoğraf kontrolü', async () => {
    const result = await checkPage(page, '/compare', 'compare');
    console.log(JSON.stringify(result, null, 2));
  });

  test('RE-TEST: /booking - Fotoğraf + Stripe kontrolü', async () => {
    const result = await checkPage(page, '/booking', 'booking');
    console.log(JSON.stringify(result, null, 2));

    const bodyText = await page.locator('body').innerText();
    const hasStripe = bodyText.includes('Stripe') || bodyText.includes('Ödeme Yap') || bodyText.includes('Kredi Kartı');
    console.log(`Stripe/Payment: ${hasStripe}`);

    // Check for payment button
    const payBtn = page.locator('button:has-text("Öde"), button:has-text("Ödeme"), button:has-text("Pay")');
    const payVisible = await payBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`Payment button visible: ${payVisible}`);
  });

  test('RE-TEST: /profile/bookings - Fotoğraf kontrolü', async () => {
    const result = await checkPage(page, '/profile/bookings', 'profile-bookings');
    console.log(JSON.stringify(result, null, 2));
  });

  test('RE-TEST: /community - Fotoğraf kontrolü', async () => {
    const result = await checkPage(page, '/community', 'community');
    console.log(JSON.stringify(result, null, 2));

    // Check posts
    const posts = page.locator('[class*="post"], [class*="Post"], article');
    const postCount = await posts.count();
    console.log(`Post count: ${postCount}`);
  });

  // ========== ÜRÜN KALİTESİ KONTROL ==========

  test('KALİTE: /search - Fiyat formatı kontrolü', async () => {
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-search-prices.png`, fullPage: true });

    const bodyText = await page.locator('body').innerText();

    // Check for absurd prices (>5000€/month is suspicious for student housing)
    const priceMatches = bodyText.match(/€\s*[\d,.]+/g) || [];
    console.log('Prices found:', priceMatches);

    for (const price of priceMatches) {
      const num = parseFloat(price.replace('€', '').replace(/\s/g, '').replace('.', '').replace(',', '.'));
      if (num > 5000) {
        console.log(`SUSPICIOUS PRICE: ${price} (${num})`);
      }
    }
  });

  test('KALİTE: /listing/new - Üniversite dropdown kontrolü', async () => {
    await page.goto(`${BASE}/listing/new`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-listing-new.png`, fullPage: true });

    // Check for university field
    const uniField = page.locator('select, [class*="select"], [class*="dropdown"], [class*="autocomplete"], [role="combobox"], [role="listbox"]');
    const uniFieldCount = await uniField.count();
    console.log(`Select/dropdown elements: ${uniFieldCount}`);

    // Check for free text input for university
    const uniInput = page.locator('input[name*="universi"], input[placeholder*="Üniversite"], input[placeholder*="üniversite"]');
    const uniInputCount = await uniInput.count();
    console.log(`University input fields: ${uniInputCount}`);
  });

  test('KALİTE: /events - Gerçek data mı kontrol', async () => {
    await page.goto(`${BASE}/events`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-events.png`, fullPage: true });

    const bodyText = await page.locator('body').innerText();

    // Check for "Yakında" text
    if (bodyText.includes('Yakında')) {
      console.log('WARNING: "Yakında" placeholder found on events page');
    }

    // Check for event cards
    const eventCards = page.locator('[class*="card"], [class*="event"], [class*="Card"]');
    const cardCount = await eventCards.count();
    console.log(`Event cards/elements: ${cardCount}`);

    // Check calendar view toggle
    const calendarBtn = page.locator('button:has-text("Takvim"), [class*="calendar"]');
    const calendarVisible = await calendarBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`Calendar view toggle: ${calendarVisible}`);
  });

  test('KALİTE: /roommates - Swipe gerçekten çalışıyor mu', async () => {
    await page.goto(`${BASE}/roommates`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-roommates.png`, fullPage: true });

    // Check for swipe buttons
    const likeBtn = page.locator('button:has-text("Beğen"), button[class*="like"], button:has-text("✓"), button:has-text("❤")');
    const dislikeBtn = page.locator('button:has-text("Geç"), button[class*="dislike"], button:has-text("✗"), button:has-text("❌")');

    const likeBtnVisible = await likeBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
    const dislikeBtnVisible = await dislikeBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`Like button: ${likeBtnVisible}, Dislike button: ${dislikeBtnVisible}`);

    // Try clicking like/dislike to see if card changes
    if (likeBtnVisible) {
      const bodyTextBefore = await page.locator('body').innerText();
      await likeBtn.first().click();
      await page.waitForTimeout(1000);
      const bodyTextAfter = await page.locator('body').innerText();
      const cardChanged = bodyTextBefore !== bodyTextAfter;
      console.log(`Card changed after swipe: ${cardChanged}`);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-roommates-after-swipe.png`, fullPage: true });
    }
  });

  test('KALİTE: /mentors - İçerik yeterliliği', async () => {
    await page.goto(`${BASE}/mentors`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-mentors.png`, fullPage: true });

    const bodyText = await page.locator('body').innerText();

    // Count mentor cards
    const mentorCards = page.locator('[class*="card"], [class*="mentor"], [class*="Card"]');
    const cardCount = await mentorCards.count();
    console.log(`Mentor cards/elements: ${cardCount}`);

    // Check "Mesaj Gönder" button
    const msgBtn = page.locator('button:has-text("Mesaj"), button:has-text("İletişim")');
    const msgBtnCount = await msgBtn.count();
    console.log(`Message buttons: ${msgBtnCount}`);

    // Check "Mentor Ol" button
    const mentorBtn = page.locator('button:has-text("Mentor Ol"), a:has-text("Mentor Ol")');
    const mentorBtnVisible = await mentorBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`"Mentor Ol" button: ${mentorBtnVisible}`);
  });

  test('KALİTE: /city - Detay sayfaları çalışıyor mu', async () => {
    await page.goto(`${BASE}/city`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-city.png`, fullPage: true });

    // Click on first city card
    const cityCard = page.locator('[class*="card"], [class*="city"], a[href*="city"]').first();
    const cityCardVisible = await cityCard.isVisible({ timeout: 3000 }).catch(() => false);

    if (cityCardVisible) {
      await cityCard.click();
      await page.waitForTimeout(2000);

      const url = page.url();
      console.log(`Navigated to: ${url}`);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-city-detail.png`, fullPage: true });

      const bodyText = await page.locator('body').innerText();
      const hasContent = bodyText.length > 200;
      console.log(`City detail has content: ${hasContent}`);

      // Check for "Yakında" on city detail
      if (bodyText.includes('Yakında')) {
        console.log('WARNING: "Yakında" placeholder on city detail page');
      }
    }
  });

  test('KALİTE: /messages - Mesaj gönderme çalışıyor mu', async () => {
    await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-messages.png`, fullPage: true });

    // Try clicking on a conversation
    const conversation = page.locator('[class*="conversation"], [class*="message"], [class*="chat"]').first();
    const convVisible = await conversation.isVisible({ timeout: 3000 }).catch(() => false);

    if (convVisible) {
      await conversation.click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-messages-detail.png`, fullPage: true });

      // Check for message input
      const msgInput = page.locator('input[placeholder*="mesaj"], input[placeholder*="Mesaj"], textarea[placeholder*="mesaj"], textarea[placeholder*="Mesaj"]');
      const inputVisible = await msgInput.first().isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`Message input visible: ${inputVisible}`);

      // Check for send button
      const sendBtn = page.locator('button:has-text("Gönder"), button[type="submit"], button[aria-label*="send"]');
      const sendVisible = await sendBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`Send button visible: ${sendVisible}`);
    }
  });

  test('KALİTE: /settings - Toggle çalışıyor mu', async () => {
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-settings.png`, fullPage: true });

    // Check for toggle switches
    const toggles = page.locator('[class*="toggle"], [class*="switch"], [role="switch"], input[type="checkbox"]');
    const toggleCount = await toggles.count();
    console.log(`Toggle/switch elements: ${toggleCount}`);

    // Try toggling first one
    if (toggleCount > 0) {
      const firstToggle = toggles.first();
      await firstToggle.click().catch(() => {});
      await page.waitForTimeout(500);
      console.log('Toggle clicked');
    }

    // Check language/currency selectors
    const bodyText = await page.locator('body').innerText();
    const hasLang = bodyText.includes('Türkçe') || bodyText.includes('English') || bodyText.includes('Dil');
    const hasCurrency = bodyText.includes('EUR') || bodyText.includes('TRY') || bodyText.includes('Para');
    console.log(`Language selector: ${hasLang}, Currency selector: ${hasCurrency}`);
  });

  test('KALİTE: /notifications - Bildirim etkileşimi', async () => {
    await page.goto(`${BASE}/notifications`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-notifications.png`, fullPage: true });

    const bodyText = await page.locator('body').innerText();

    // Check notification items
    const notifItems = page.locator('[class*="notification"], [class*="Notification"], li, [class*="item"]');
    const notifCount = await notifItems.count();
    console.log(`Notification elements: ${notifCount}`);

    // Check for read/unread filter
    const filterBtns = page.locator('button:has-text("Okunmamış"), button:has-text("Tümü"), button:has-text("Okundu")');
    const filterCount = await filterBtns.count();
    console.log(`Filter buttons: ${filterCount}`);
  });

  test('KALİTE: /host/calendar - Takvim gerçek mi', async () => {
    await page.goto(`${BASE}/host/calendar`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-host-calendar.png`, fullPage: true });

    const bodyText = await page.locator('body').innerText();

    // Check for calendar grid
    const calendarGrid = page.locator('table, [class*="calendar"], [class*="grid"]');
    const gridVisible = await calendarGrid.first().isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Calendar grid visible: ${gridVisible}`);

    // Check for month navigation
    const monthNav = page.locator('button:has-text("<"), button:has-text(">"), button:has-text("Önceki"), button:has-text("Sonraki")');
    const navCount = await monthNav.count();
    console.log(`Month navigation buttons: ${navCount}`);

    // Check legend
    const hasLegend = bodyText.includes('Müsait') || bodyText.includes('Dolu') || bodyText.includes('Beklemede');
    console.log(`Calendar legend: ${hasLegend}`);
  });

  test('KALİTE: /search listing detail - İlan detayına erişim', async () => {
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Click first listing card
    const listingCard = page.locator('a[href*="listing"], [class*="card"] a, [class*="Card"]').first();
    const cardVisible = await listingCard.isVisible({ timeout: 3000 }).catch(() => false);

    if (cardVisible) {
      await listingCard.click();
      await page.waitForTimeout(2000);

      const url = page.url();
      console.log(`Listing detail URL: ${url}`);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-listing-detail.png`, fullPage: true });

      const bodyText = await page.locator('body').innerText();

      // Check for key listing details
      const hasPrice = bodyText.match(/€|TL|\/ay|\/month/);
      const hasLocation = bodyText.includes('Barcelona') || bodyText.includes('Berlin') || bodyText.includes('İstanbul') || bodyText.includes('Lizbon');
      const hasDescription = bodyText.length > 300;

      console.log(`Has price: ${!!hasPrice}, Has location: ${hasLocation}, Has description: ${hasDescription}`);

      // Check for photo carousel
      const carousel = page.locator('[class*="carousel"], [class*="slider"], [class*="swipe"], [class*="gallery"]');
      const carouselVisible = await carousel.first().isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`Photo carousel: ${carouselVisible}`);

      // Check for "Fotoğraf Yok"
      if (bodyText.includes('Fotoğraf Yok')) {
        console.log('BUG: "Fotoğraf Yok" on listing detail');
      }

      // Check for booking/contact button
      const bookBtn = page.locator('button:has-text("Rezerv"), button:has-text("İletişim"), button:has-text("Başvur")');
      const bookBtnVisible = await bookBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`Booking/contact button: ${bookBtnVisible}`);

      // Check price format (100x bug)
      const priceMatches = bodyText.match(/€\s*[\d,.]+/g) || [];
      for (const p of priceMatches) {
        const num = parseFloat(p.replace('€', '').replace(/\s/g, '').replace('.', '').replace(',', '.'));
        if (num > 5000) {
          console.log(`SUSPICIOUS PRICE on detail: ${p}`);
        }
      }
    } else {
      console.log('No clickable listing card found');
    }
  });
});
