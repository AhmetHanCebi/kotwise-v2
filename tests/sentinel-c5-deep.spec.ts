import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'deniz@kotwise.com');
  await page.fill('input[type="password"]', 'KotwiseTest2026!');
  await page.getByRole('button', { name: 'Giriş Yap', exact: true }).click();
  await page.waitForTimeout(3000);
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `tests/screenshots/sentinel-c5-${name}.png`, fullPage: true });
}

// =====================================================
// BÖLÜM 1: SVG PLACEHOLDER RE-CHECK (4 döngüdür devam eden bug)
// =====================================================

test('C5-01: favorites - thumbnail placeholder re-check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/favorites`);
  await page.waitForTimeout(2000);
  await screenshot(page, '01-favorites');

  const images = page.locator('img');
  const count = await images.count();
  let svgPlaceholders = 0;
  let realPhotos = 0;
  let brokenImages = 0;

  for (let i = 0; i < count; i++) {
    const src = await images.nth(i).getAttribute('src') || '';
    const naturalWidth = await images.nth(i).evaluate((el: HTMLImageElement) => el.naturalWidth);
    if (src.startsWith('data:image/svg+xml')) {
      svgPlaceholders++;
    } else if (src && naturalWidth > 0) {
      realPhotos++;
    } else {
      brokenImages++;
    }
  }

  console.log(`FAVORITES: ${count} imgs, ${svgPlaceholders} SVG placeholder, ${realPhotos} real, ${brokenImages} broken`);
});

test('C5-02: compare - thumbnail placeholder re-check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/compare`);
  await page.waitForTimeout(2000);
  await screenshot(page, '02-compare');

  const images = page.locator('img');
  const count = await images.count();
  let svgPlaceholders = 0;
  for (let i = 0; i < count; i++) {
    const src = await images.nth(i).getAttribute('src') || '';
    if (src.startsWith('data:image/svg+xml')) svgPlaceholders++;
  }
  console.log(`COMPARE: ${count} imgs, ${svgPlaceholders} SVG placeholder`);
});

test('C5-03: booking - thumbnail placeholder re-check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/booking`);
  await page.waitForTimeout(2000);
  await screenshot(page, '03-booking');

  const images = page.locator('img');
  const count = await images.count();
  let svgPlaceholders = 0;
  for (let i = 0; i < count; i++) {
    const src = await images.nth(i).getAttribute('src') || '';
    if (src.startsWith('data:image/svg+xml')) svgPlaceholders++;
  }
  console.log(`BOOKING: ${count} imgs, ${svgPlaceholders} SVG placeholder`);
});

test('C5-04: profile-bookings - thumbnail placeholder re-check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/bookings`);
  await page.waitForTimeout(2000);
  await screenshot(page, '04-profile-bookings');

  const images = page.locator('img');
  const count = await images.count();
  let svgPlaceholders = 0;
  for (let i = 0; i < count; i++) {
    const src = await images.nth(i).getAttribute('src') || '';
    if (src.startsWith('data:image/svg+xml')) svgPlaceholders++;
  }
  console.log(`PROFILE-BOOKINGS: ${count} imgs, ${svgPlaceholders} SVG placeholder`);
});

// =====================================================
// BÖLÜM 2: DAHA ÖNCE TEST EDİLMEMİŞ DETAY SAYFALARI
// =====================================================

test('C5-05: community detail page /community/[id]', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/community`);
  await page.waitForTimeout(1500);

  const postLinks = page.locator('a[href*="/community/"]').first();
  if (await postLinks.isVisible()) {
    await postLinks.click();
    await page.waitForTimeout(2000);
    await screenshot(page, '05-community-detail');

    const url = page.url();
    console.log(`COMMUNITY DETAIL URL: ${url}`);

    const bodyText = await page.locator('body').innerText();
    const hasContent = bodyText.length > 100;
    const hasLikeButton = await page.locator('button').filter({ hasText: /beğen|like/i }).count() > 0 ||
                          await page.locator('[aria-label*="like"], [aria-label*="beğen"]').count() > 0;
    const hasCommentSection = bodyText.includes('Yorum') || bodyText.includes('yorum') || bodyText.includes('comment');
    const hasError = bodyText.includes('Error') || bodyText.includes('404') || bodyText.includes('Hata');

    console.log(`COMMUNITY DETAIL: content=${hasContent}, like=${hasLikeButton}, comments=${hasCommentSection}, error=${hasError}`);
  } else {
    console.log('COMMUNITY: No post links found, checking direct URL');
    await page.goto(`${BASE}/community/1`);
    await page.waitForTimeout(2000);
    await screenshot(page, '05-community-detail-direct');
    const bodyText = await page.locator('body').innerText();
    console.log(`COMMUNITY DETAIL (direct): ${bodyText.substring(0, 200)}`);
  }
});

test('C5-06: events detail page /events/[id]', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events`);
  await page.waitForTimeout(1500);

  const eventLinks = page.locator('a[href*="/events/"]').first();
  if (await eventLinks.isVisible()) {
    await eventLinks.click();
    await page.waitForTimeout(2000);
    await screenshot(page, '06-events-detail');

    const url = page.url();
    console.log(`EVENTS DETAIL URL: ${url}`);

    const bodyText = await page.locator('body').innerText();
    const hasDate = /\d{1,2}[\./]\d{1,2}[\./]\d{2,4}/.test(bodyText) || bodyText.includes('2026');
    const hasLocation = bodyText.includes('Konum') || bodyText.includes('konum') || bodyText.includes('Barcelona') || bodyText.includes('Berlin');
    const hasJoinButton = await page.locator('button').filter({ hasText: /katıl|join|kayıt/i }).count() > 0;
    const hasOrganizer = bodyText.includes('Organizatör') || bodyText.includes('organizatör') || bodyText.includes('düzenleyen');
    const hasError = bodyText.includes('Error') || bodyText.includes('404') || bodyText.includes('Hata');

    console.log(`EVENTS DETAIL: date=${hasDate}, location=${hasLocation}, join=${hasJoinButton}, organizer=${hasOrganizer}, error=${hasError}`);
  } else {
    console.log('EVENTS: No event links found');
    await page.goto(`${BASE}/events/1`);
    await page.waitForTimeout(2000);
    await screenshot(page, '06-events-detail-direct');
  }
});

test('C5-07: mentors detail page /mentors/[id]', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/mentors`);
  await page.waitForTimeout(1500);

  const mentorLinks = page.locator('a[href*="/mentors/"]').first();
  if (await mentorLinks.isVisible()) {
    await mentorLinks.click();
    await page.waitForTimeout(2000);
    await screenshot(page, '07-mentors-detail');

    const url = page.url();
    console.log(`MENTORS DETAIL URL: ${url}`);

    const bodyText = await page.locator('body').innerText();
    const hasProfile = bodyText.includes('Maria') || bodyText.includes('Carlos');
    const hasExpertise = bodyText.includes('Uzmanlık') || bodyText.includes('uzmanlık') || bodyText.includes('expertise');
    const hasMessageButton = await page.locator('button').filter({ hasText: /mesaj|message/i }).count() > 0;
    const hasError = bodyText.includes('Error') || bodyText.includes('404') || bodyText.includes('Hata');

    console.log(`MENTORS DETAIL: profile=${hasProfile}, expertise=${hasExpertise}, message=${hasMessageButton}, error=${hasError}`);
  } else {
    console.log('MENTORS: No mentor links found');
    await page.goto(`${BASE}/mentors/1`);
    await page.waitForTimeout(2000);
    await screenshot(page, '07-mentors-detail-direct');
  }
});

test('C5-08: roommates detail page /roommates/[id]', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForTimeout(1500);
  await screenshot(page, '08-roommates-main');

  const roommateLinks = page.locator('a[href*="/roommates/"]').first();
  if (await roommateLinks.isVisible()) {
    await roommateLinks.click();
    await page.waitForTimeout(2000);
    await screenshot(page, '08-roommates-detail');
    const url = page.url();
    console.log(`ROOMMATES DETAIL URL: ${url}`);
    const bodyText = await page.locator('body').innerText();
    console.log(`ROOMMATES DETAIL: ${bodyText.substring(0, 300)}`);
  } else {
    await page.goto(`${BASE}/roommates/1`);
    await page.waitForTimeout(2000);
    await screenshot(page, '08-roommates-detail-direct');
    const bodyText = await page.locator('body').innerText();
    const hasError = bodyText.includes('Error') || bodyText.includes('404');
    console.log(`ROOMMATES DETAIL (direct): error=${hasError}, content=${bodyText.substring(0, 200)}`);
  }
});

test('C5-09: city chat page /city/[id]/chat', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/city`);
  await page.waitForTimeout(1500);

  const cityLinks = page.locator('a[href*="/city/"]').first();
  if (await cityLinks.isVisible()) {
    await cityLinks.click();
    await page.waitForTimeout(1500);

    const chatLink = page.locator('a[href*="/chat"]').first();
    if (await chatLink.isVisible()) {
      await chatLink.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '09-city-chat');
      const url = page.url();
      console.log(`CITY CHAT URL: ${url}`);
      const bodyText = await page.locator('body').innerText();
      const hasInput = await page.locator('input, textarea').count();
      console.log(`CITY CHAT: inputs=${hasInput}, content=${bodyText.substring(0, 300)}`);
    } else {
      const cityUrl = page.url();
      const cityId = cityUrl.split('/city/')[1]?.split('/')[0] || '1';
      await page.goto(`${BASE}/city/${cityId}/chat`);
      await page.waitForTimeout(2000);
      await screenshot(page, '09-city-chat-direct');
      const bodyText = await page.locator('body').innerText();
      console.log(`CITY CHAT (direct): ${bodyText.substring(0, 300)}`);
    }
  }
});

test('C5-10: booking success page /booking/success', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/booking/success`);
  await page.waitForTimeout(2000);
  await screenshot(page, '10-booking-success');

  const bodyText = await page.locator('body').innerText();
  const hasSuccess = bodyText.includes('Başarılı') || bodyText.includes('başarı') || bodyText.includes('success') || bodyText.includes('Tebrik') || bodyText.includes('Onay');
  const hasError = bodyText.includes('Error') || bodyText.includes('404') || bodyText.includes('Hata');
  const hasNextSteps = bodyText.includes('mesaj') || bodyText.includes('profi') || bodyText.includes('anasayfa');
  console.log(`BOOKING SUCCESS: success=${hasSuccess}, error=${hasError}, nextSteps=${hasNextSteps}`);
  console.log(`BOOKING SUCCESS TEXT: ${bodyText.substring(0, 500)}`);
});

// =====================================================
// BÖLÜM 3: FORM SUBMIT FLOW'LARI
// =====================================================

test('C5-11: listing-new form validation deep test', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/listing/new`);
  await page.waitForTimeout(1500);

  const continueBtn = page.locator('button').filter({ hasText: /devam|ileri|next|continue/i }).first();
  if (await continueBtn.isVisible()) {
    await continueBtn.click();
    await page.waitForTimeout(1000);
    await screenshot(page, '11-listing-new-validation');

    const bodyText = await page.locator('body').innerText();
    const validationErrors = bodyText.match(/(gerekli|zorunlu|required|hata|error)/gi) || [];
    console.log(`LISTING-NEW VALIDATION: ${validationErrors.length} error messages found: ${validationErrors.join(', ')}`);
  }

  const titleInput = page.locator('input').first();
  if (await titleInput.isVisible()) {
    await titleInput.fill('Test İlan Başlığı');
  }

  await screenshot(page, '11-listing-new-filled');
});

test('C5-12: community-new post creation flow', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/community/new`);
  await page.waitForTimeout(1500);

  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible()) {
    await textarea.fill('Bu bir test gönderisidir. Erasmus deneyimlerim harika geçiyor! #TestPost');
    await page.waitForTimeout(500);
    await screenshot(page, '12-community-new-filled');

    const hashtagButtons = page.locator('button, span').filter({ hasText: /#/ });
    const hashtagCount = await hashtagButtons.count();
    console.log(`COMMUNITY-NEW: ${hashtagCount} hashtag buttons found`);

    const submitBtn = page.locator('button').filter({ hasText: /paylaş|gönder|share|post/i }).first();
    if (await submitBtn.isVisible()) {
      console.log('COMMUNITY-NEW: Paylaş button found and visible');
    }
  }
});

test('C5-13: events-new event creation flow', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events/new`);
  await page.waitForTimeout(1500);

  const nameInput = page.locator('input[type="text"]').first();
  if (await nameInput.isVisible()) {
    await nameInput.fill('Test Etkinliği - Kahve Buluşması');
  }

  const inputs = page.locator('input, textarea, select');
  const inputCount = await inputs.count();
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();

  console.log(`EVENTS-NEW: ${inputCount} inputs, ${buttonCount} buttons`);

  await screenshot(page, '13-events-new-filled');

  const datePickers = page.locator('input[type="date"], input[type="datetime-local"], input[placeholder*="tarih"], input[placeholder*="dd"]');
  const datePickerCount = await datePickers.count();
  console.log(`EVENTS-NEW: ${datePickerCount} date pickers found`);
});

// =====================================================
// BÖLÜM 4: NAVIGATION FLOW TEST
// =====================================================

test('C5-14: search → listing detail → booking flow', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForTimeout(2000);

  const listingLink = page.locator('a[href*="/listing/"]').first();
  if (await listingLink.isVisible()) {
    await listingLink.click();
    await page.waitForTimeout(2000);
    await screenshot(page, '14-flow-listing-detail');

    const listingUrl = page.url();
    console.log(`FLOW: Listing URL = ${listingUrl}`);

    const reserveBtn = page.locator('button').filter({ hasText: /rezervasyon|book|kirala/i }).first();
    const hasReserveBtn = await reserveBtn.isVisible().catch(() => false);
    console.log(`FLOW: Reserve button visible = ${hasReserveBtn}`);

    if (hasReserveBtn) {
      await reserveBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '14-flow-after-reserve-click');
      const afterUrl = page.url();
      console.log(`FLOW: After reserve click URL = ${afterUrl}`);
      const bodyText = await page.locator('body').innerText();
      const hasPayment = bodyText.includes('Stripe') || bodyText.includes('ödeme') || bodyText.includes('payment') || bodyText.includes('kart');
      console.log(`FLOW: Payment/Stripe visible = ${hasPayment}`);
    }
  }
});

test('C5-15: search filters deep interaction', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForTimeout(2000);

  const initialLinks = await page.locator('a[href*="/listing/"]').count();
  console.log(`SEARCH: ${initialLinks} listing links initially`);

  const selectElements = page.locator('select');
  const selectCount = await selectElements.count();
  for (let i = 0; i < selectCount; i++) {
    const options = await selectElements.nth(i).locator('option').allInnerTexts();
    console.log(`SEARCH SELECT ${i}: options = ${options.join(', ')}`);
  }

  const sliders = page.locator('input[type="range"]');
  const sliderCount = await sliders.count();
  console.log(`SEARCH: ${sliderCount} range sliders`);

  await screenshot(page, '15-search-filters');
});

// =====================================================
// BÖLÜM 5: EDGE CASES & DETAY SAYFALAR
// =====================================================

test('C5-16: register page check', async ({ page }) => {
  await page.goto(`${BASE}/register`);
  await page.waitForTimeout(2000);
  await screenshot(page, '16-register');

  const bodyText = await page.locator('body').innerText();
  const inputs = await page.locator('input').count();
  const hasEmail = await page.locator('input[type="email"]').count();
  const hasPassword = await page.locator('input[type="password"]').count();
  const hasSubmit = await page.locator('button[type="submit"]').count();
  console.log(`REGISTER: ${inputs} inputs, email=${hasEmail}, password=${hasPassword}, submit=${hasSubmit}`);
  console.log(`REGISTER TEXT: ${bodyText.substring(0, 300)}`);
});

test('C5-17: forgot-password flow', async ({ page }) => {
  await page.goto(`${BASE}/forgot-password`);
  await page.waitForTimeout(2000);
  await screenshot(page, '17-forgot-password');

  const bodyText = await page.locator('body').innerText();
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.isVisible()) {
    await emailInput.fill('deniz@kotwise.com');
    await screenshot(page, '17-forgot-password-filled');
    console.log('FORGOT-PASSWORD: Email input present');
  }
  console.log(`FORGOT-PASSWORD TEXT: ${bodyText.substring(0, 300)}`);
});

test('C5-18: host-earnings page deep check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/earnings`);
  await page.waitForTimeout(2000);
  await screenshot(page, '18-host-earnings');

  const bodyText = await page.locator('body').innerText();
  const hasEarnings = bodyText.includes('Kazanç') || bodyText.includes('kazanç') || bodyText.includes('earnings');
  const hasGraph = await page.locator('canvas, svg, [class*="chart"], [class*="graph"]').count();
  const hasCurrency = /[\d.,]+\s*(₺|TL|EUR|€)/.test(bodyText) || /(₺|TL|EUR|€)\s*[\d.,]+/.test(bodyText);
  console.log(`HOST-EARNINGS: earnings=${hasEarnings}, graph=${hasGraph}, currency=${hasCurrency}`);
  console.log(`HOST-EARNINGS TEXT: ${bodyText.substring(0, 500)}`);
});

// =====================================================
// BÖLÜM 6: PLACEHOLDER TARAMASI
// =====================================================

test('C5-19: placeholder scan on new pages', async ({ page }) => {
  await login(page);

  const pagesToScan = [
    { name: 'booking-success', path: '/booking/success' },
    { name: 'host-earnings', path: '/host/earnings' },
    { name: 'community', path: '/community' },
    { name: 'events', path: '/events' },
    { name: 'roommates', path: '/roommates' },
    { name: 'mentors', path: '/mentors' },
    { name: 'search-map', path: '/search/map' },
    { name: 'budget', path: '/budget' },
  ];

  for (const p of pagesToScan) {
    await page.goto(`${BASE}${p.path}`);
    await page.waitForTimeout(1500);

    const bodyText = await page.locator('body').innerText();
    const hasYakinda = /yakında|coming soon/i.test(bodyText);
    const hasPlaceholder = /placeholder|lorem ipsum|todo/i.test(bodyText);
    const stuckLoading = bodyText.includes('Yükleniyor') && bodyText.length < 200;

    if (hasYakinda || hasPlaceholder || stuckLoading) {
      console.log(`⚠️ ${p.name}: yakinda=${hasYakinda}, placeholder=${hasPlaceholder}, stuckLoading=${stuckLoading}`);
    } else {
      console.log(`✅ ${p.name}: clean`);
    }
  }
});

// =====================================================
// BÖLÜM 7: REGRESYON KONTROLLERI
// =====================================================

test('C5-20: regression check - notifications', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/notifications`);
  await page.waitForTimeout(3000);
  await screenshot(page, '20-notifications-regression');

  const bodyText = await page.locator('body').innerText();
  const stuckLoading = bodyText.includes('Yükleniyor') && !bodyText.includes('beğeni') && !bodyText.includes('mesaj');
  const hasNotifications = bodyText.includes('beğeni') || bodyText.includes('mesaj') || bodyText.includes('etkinlik');
  console.log(`NOTIFICATIONS REGRESSION: stuck=${stuckLoading}, hasContent=${hasNotifications}`);
});

test('C5-21: regression check - messages chat input', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/messages`);
  await page.waitForTimeout(1500);

  const convLink = page.locator('a[href*="/messages/"]').first();
  if (await convLink.isVisible()) {
    await convLink.click();
    await page.waitForTimeout(2000);
    await screenshot(page, '21-messages-detail-regression');

    const hasInput = await page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"], textarea[placeholder*="Mesaj"]').count();
    const hasSendBtn = await page.locator('button[aria-label*="Gönder"], button[aria-label*="gönder"]').count();
    console.log(`MESSAGES REGRESSION: chatInput=${hasInput}, sendBtn=${hasSendBtn}`);
  }
});

test('C5-22: regression check - map zoom level', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search/map`);
  await page.waitForTimeout(3000);
  await screenshot(page, '22-map-zoom-regression');

  const tiles = await page.locator('img[src*="tile.openstreetmap"]').all();
  let zoomLevels: string[] = [];
  for (const tile of tiles) {
    const src = await tile.getAttribute('src') || '';
    const match = src.match(/\/(\d+)\/\d+\/\d+\.png/);
    if (match) zoomLevels.push(match[1]);
  }
  const uniqueZooms = [...new Set(zoomLevels)];
  console.log(`MAP REGRESSION: zoom levels = ${uniqueZooms.join(', ')}`);

  const bodyText = await page.locator('body').innerText();
  const prices = bodyText.match(/[\d.,]+\s*(₺|TL)/g) || [];
  console.log(`MAP REGRESSION: prices found = ${prices.slice(0, 5).join(', ')}`);
});

test('C5-23: regression check - profile bookings price', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/bookings`);
  await page.waitForTimeout(2000);

  const bodyText = await page.locator('body').innerText();
  const prices = bodyText.match(/[\d.,]+\s*(₺|TL)/g) || [];
  console.log(`PROFILE-BOOKINGS PRICES: ${prices.join(', ')}`);

  const highPrices = prices.filter(p => {
    const num = parseFloat(p.replace(/[^\d.,]/g, '').replace(',', '.'));
    return num > 10000;
  });
  if (highPrices.length > 0) {
    console.log(`⚠️ PROFILE-BOOKINGS: Possible 100x price error: ${highPrices.join(', ')}`);
  } else {
    console.log(`✅ PROFILE-BOOKINGS: Prices look correct`);
  }
});

// =====================================================
// BÖLÜM 8: CONSOLE ERROR CHECK
// =====================================================

test('C5-24: console errors scan on key pages', async ({ page }) => {
  const errors: { page: string; error: string }[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ page: page.url(), error: msg.text().substring(0, 200) });
    }
  });

  await login(page);

  const pagesToCheck = [
    '/favorites', '/compare', '/booking', '/profile/bookings',
    '/search/map', '/notifications', '/messages', '/community',
    '/events', '/roommates', '/mentors', '/host/earnings'
  ];

  for (const path of pagesToCheck) {
    await page.goto(`${BASE}${path}`);
    await page.waitForTimeout(1500);
  }

  console.log(`CONSOLE ERRORS: ${errors.length} total`);
  for (const e of errors.slice(0, 10)) {
    console.log(`  ERROR on ${e.page}: ${e.error}`);
  }
});

// =====================================================
// BÖLÜM 9: ACCESSIBILITY CHECK
// =====================================================

test('C5-25: accessibility - buttons without labels', async ({ page }) => {
  await login(page);

  const pagesToCheck = [
    { name: 'events', path: '/events' },
    { name: 'roommates', path: '/roommates' },
    { name: 'search', path: '/search' },
  ];

  for (const p of pagesToCheck) {
    await page.goto(`${BASE}${p.path}`);
    await page.waitForTimeout(1500);

    const buttons = page.locator('button');
    const btnCount = await buttons.count();
    let unlabeledCount = 0;

    for (let i = 0; i < btnCount; i++) {
      const btn = buttons.nth(i);
      const text = (await btn.innerText().catch(() => '')).trim();
      const ariaLabel = await btn.getAttribute('aria-label') || '';
      const title = await btn.getAttribute('title') || '';

      if (!text && !ariaLabel && !title) {
        unlabeledCount++;
      }
    }

    console.log(`A11Y ${p.name}: ${btnCount} buttons, ${unlabeledCount} unlabeled`);
  }
});
