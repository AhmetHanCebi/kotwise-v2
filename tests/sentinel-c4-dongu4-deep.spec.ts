import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

// Helper: login
async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="E-posta"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

  if (await emailInput.isVisible()) {
    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }
}

// ===== RE-CHECK: Devam Eden 2 Bug =====

test('RC-1: Listing thumbnail fotoğrafları — siyah kare SVG kontrolü', async ({ page }) => {
  await login(page);

  // Check favorites
  await page.goto(`${BASE}/favorites`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-favorites.png`, fullPage: true });

  const favImgs = page.locator('img');
  const favImgCount = await favImgs.count();
  let svgPlaceholderCount = 0;
  let realPhotoCount = 0;

  for (let i = 0; i < favImgCount; i++) {
    const src = await favImgs.nth(i).getAttribute('src') || '';
    if (src.includes('data:image/svg+xml')) svgPlaceholderCount++;
    else if (src.startsWith('http') || src.startsWith('/')) realPhotoCount++;
  }

  console.log(`[FAVORITES] Total imgs: ${favImgCount}, SVG placeholder: ${svgPlaceholderCount}, Real photos: ${realPhotoCount}`);

  // Check compare
  await page.goto(`${BASE}/compare`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-compare.png`, fullPage: true });

  const compImgs = page.locator('img');
  const compImgCount = await compImgs.count();
  let compSvg = 0;
  for (let i = 0; i < compImgCount; i++) {
    const src = await compImgs.nth(i).getAttribute('src') || '';
    if (src.includes('data:image/svg+xml')) compSvg++;
  }
  console.log(`[COMPARE] Total imgs: ${compImgCount}, SVG placeholder: ${compSvg}`);

  // Check booking
  await page.goto(`${BASE}/booking`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-booking.png`, fullPage: true });

  const bookImgs = page.locator('img');
  const bookImgCount = await bookImgs.count();
  let bookSvg = 0;
  for (let i = 0; i < bookImgCount; i++) {
    const src = await bookImgs.nth(i).getAttribute('src') || '';
    if (src.includes('data:image/svg+xml')) bookSvg++;
  }
  console.log(`[BOOKING] Total imgs: ${bookImgCount}, SVG placeholder: ${bookSvg}`);

  // Check profile-bookings
  await page.goto(`${BASE}/profile/bookings`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-profile-bookings.png`, fullPage: true });

  const pbImgs = page.locator('img');
  const pbImgCount = await pbImgs.count();
  let pbSvg = 0;
  for (let i = 0; i < pbImgCount; i++) {
    const src = await pbImgs.nth(i).getAttribute('src') || '';
    if (src.includes('data:image/svg+xml')) pbSvg++;
  }
  console.log(`[PROFILE-BOOKINGS] Total imgs: ${pbImgCount}, SVG placeholder: ${pbSvg}`);
});

test('RC-2: Harita zoom level kontrolü', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search/map`);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-search-map.png`, fullPage: true });

  // Check zoom level from tile URLs
  const tiles = page.locator('img[src*="tile.openstreetmap"]');
  const tileCount = await tiles.count();
  let zoomLevels: string[] = [];

  for (let i = 0; i < Math.min(tileCount, 5); i++) {
    const src = await tiles.nth(i).getAttribute('src') || '';
    const match = src.match(/\/(\d+)\/\d+\/\d+\.png/);
    if (match) zoomLevels.push(match[1]);
  }

  console.log(`[MAP] Tiles: ${tileCount}, Zoom levels: ${[...new Set(zoomLevels)].join(',')}`);

  // Check markers and prices
  const markers = page.locator('.leaflet-marker-icon, .leaflet-marker-pane *');
  const markerCount = await markers.count();
  console.log(`[MAP] Markers: ${markerCount}`);

  // Get all text content for price check
  const mapText = await page.locator('.leaflet-marker-pane, .leaflet-popup-pane').textContent() || '';
  console.log(`[MAP] Marker text sample: ${mapText.substring(0, 200)}`);
});

// ===== DERİN TEST: Form Doldurma =====

test('DEEP-1: Listing New — form doldurma testi', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/listing/new`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-listing-new-step1.png`, fullPage: true });

  // Step 1: Try to fill basic info
  const titleInput = page.locator('input[name="title"], input[placeholder*="Başlık"], input[placeholder*="ilan"]').first();
  if (await titleInput.isVisible()) {
    await titleInput.fill('Test İlanı - Döngü 4');
    console.log('[LISTING-NEW] Title filled');
  }

  // Check city dropdown
  const citySelect = page.locator('select, [role="combobox"], [role="listbox"]').first();
  if (await citySelect.isVisible()) {
    console.log('[LISTING-NEW] City dropdown found');
    await citySelect.click();
    await page.waitForTimeout(500);
  }

  // Check university field — must be dropdown/autocomplete, NOT free text
  const uniField = page.locator('input[placeholder*="niversite"], input[name*="university"], [data-testid*="university"]').first();
  if (await uniField.isVisible()) {
    const uniRole = await uniField.getAttribute('role');
    const uniAutocomplete = await uniField.getAttribute('autocomplete');
    const uniReadonly = await uniField.getAttribute('readonly');
    console.log(`[LISTING-NEW] University field: role=${uniRole}, autocomplete=${uniAutocomplete}, readonly=${uniReadonly}`);
  }

  // Try "İleri" / "Next" button
  const nextBtn = page.locator('button:has-text("İleri"), button:has-text("Devam"), button:has-text("Next")').first();
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-listing-new-step2.png`, fullPage: true });
    console.log('[LISTING-NEW] Advanced to step 2');
  }
});

test('DEEP-2: Events New — etkinlik oluşturma formu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events/new`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-events-new.png`, fullPage: true });

  // Fill event form
  const nameInput = page.locator('input[name="title"], input[name="name"], input[placeholder*="Etkinlik"], input[placeholder*="etkinlik"]').first();
  if (await nameInput.isVisible()) {
    await nameInput.fill('Test Etkinliği Döngü 4');
    console.log('[EVENTS-NEW] Name filled');
  }

  const descArea = page.locator('textarea').first();
  if (await descArea.isVisible()) {
    await descArea.fill('Bu bir test etkinliğidir. Döngü 4 derin test.');
    console.log('[EVENTS-NEW] Description filled');
  }

  // Check all form elements
  const inputs = await page.locator('input, select, textarea').count();
  const buttons = await page.locator('button').count();
  console.log(`[EVENTS-NEW] Form elements: ${inputs} inputs, ${buttons} buttons`);
});

test('DEEP-3: Community New — gönderi oluşturma formu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/community/new`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-community-new.png`, fullPage: true });

  const contentArea = page.locator('textarea').first();
  if (await contentArea.isVisible()) {
    await contentArea.fill('Test gönderisi Döngü 4 — derin test kontrol.');
    console.log('[COMMUNITY-NEW] Content filled');
  }

  // Check submit button
  const submitBtn = page.locator('button:has-text("Paylaş"), button:has-text("Gönder"), button[type="submit"]').first();
  if (await submitBtn.isVisible()) {
    console.log('[COMMUNITY-NEW] Submit button found: ' + await submitBtn.textContent());
  }

  const formElements = await page.locator('input, select, textarea, button').count();
  console.log(`[COMMUNITY-NEW] Total form elements: ${formElements}`);
});

test('DEEP-4: Profile Edit — profil düzenleme formu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/edit`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-profile-edit.png`, fullPage: true });

  // Check all input fields
  const allInputs = page.locator('input, textarea, select');
  const inputCount = await allInputs.count();
  console.log(`[PROFILE-EDIT] Total inputs: ${inputCount}`);

  for (let i = 0; i < inputCount; i++) {
    const el = allInputs.nth(i);
    const tag = await el.evaluate(e => e.tagName.toLowerCase());
    const name = await el.getAttribute('name') || '';
    const placeholder = await el.getAttribute('placeholder') || '';
    const value = await el.inputValue().catch(() => '');
    console.log(`[PROFILE-EDIT] ${i}: <${tag}> name="${name}" placeholder="${placeholder}" value="${value.substring(0, 30)}"`);
  }

  // Try editing name
  const nameInput = page.locator('input[name="name"], input[name="fullName"], input[placeholder*="Ad"]').first();
  if (await nameInput.isVisible()) {
    const currentName = await nameInput.inputValue();
    console.log(`[PROFILE-EDIT] Current name: "${currentName}"`);
  }

  // Check university field type
  const uniField = page.locator('input[placeholder*="niversite"], select[name*="university"]').first();
  if (await uniField.isVisible()) {
    const tag = await uniField.evaluate(e => e.tagName.toLowerCase());
    const role = await uniField.getAttribute('role') || 'none';
    console.log(`[PROFILE-EDIT] University field: <${tag}> role=${role}`);
  }

  // Check interest tags
  const tags = page.locator('[class*="tag"], [class*="chip"], [class*="badge"]');
  const tagCount = await tags.count();
  console.log(`[PROFILE-EDIT] Interest tags/chips: ${tagCount}`);
});

// ===== DERİN TEST: Filtre & Etkileşim =====

test('DEEP-5: Search — filtreler ve sıralama', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForTimeout(2000);

  // Count initial listings
  const initialCards = page.locator('[class*="card"], [class*="listing"], [class*="Card"]');
  const initialCount = await initialCards.count();
  console.log(`[SEARCH] Initial listings: ${initialCount}`);

  // Try city filter
  const cityFilter = page.locator('select, [role="combobox"]').first();
  if (await cityFilter.isVisible()) {
    await cityFilter.click();
    await page.waitForTimeout(500);
    console.log('[SEARCH] City filter opened');
  }

  // Try price filter/slider
  const priceSlider = page.locator('input[type="range"], [class*="slider"], [class*="Slider"]').first();
  if (await priceSlider.isVisible()) {
    console.log('[SEARCH] Price slider found');
  }

  // Check for sort options
  const sortBtn = page.locator('button:has-text("Sırala"), button:has-text("Sort"), select[name*="sort"]').first();
  if (await sortBtn.isVisible()) {
    console.log('[SEARCH] Sort option found');
  }

  // Screenshot after interaction
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-search-filters.png`, fullPage: true });

  // Check prices are reasonable
  const priceTexts = await page.locator('text=/\\d+.*TL|₺.*\\d+/').allTextContents();
  console.log(`[SEARCH] Prices found: ${priceTexts.slice(0, 5).join(', ')}`);
});

test('DEEP-6: Events — filtre ve görünüm değiştirme', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events`);
  await page.waitForTimeout(2000);

  // Check category filters
  const categories = page.locator('button:has-text("Kahve"), button:has-text("Spor"), button:has-text("Dil"), button:has-text("Tur"), button:has-text("Tümü")');
  const catCount = await categories.count();
  console.log(`[EVENTS] Category filter buttons: ${catCount}`);

  // Click each category
  for (let i = 0; i < catCount; i++) {
    const cat = categories.nth(i);
    const text = await cat.textContent();
    await cat.click();
    await page.waitForTimeout(500);
    const eventCards = page.locator('[class*="card"], [class*="event"], [class*="Card"]');
    const count = await eventCards.count();
    console.log(`[EVENTS] Category "${text}": ${count} events`);
  }

  // Check view toggles (grid/list/takvim)
  const viewToggles = page.locator('button:has-text("Grid"), button:has-text("Liste"), button:has-text("Takvim"), [class*="toggle"], [class*="view"]');
  const toggleCount = await viewToggles.count();
  console.log(`[EVENTS] View toggles: ${toggleCount}`);

  // Try list view
  const listBtn = page.locator('button:has-text("Liste"), button[aria-label*="list"]').first();
  if (await listBtn.isVisible()) {
    await listBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-events-list.png`, fullPage: true });
    console.log('[EVENTS] List view activated');
  }

  // Try calendar view
  const calBtn = page.locator('button:has-text("Takvim"), button[aria-label*="calendar"]').first();
  if (await calBtn.isVisible()) {
    await calBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-events-calendar.png`, fullPage: true });
    console.log('[EVENTS] Calendar view activated');
  }
});

test('DEEP-7: Notifications — filtre ve okundu işaretleme', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/notifications`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-notifications.png`, fullPage: true });

  // Check content loaded (not stuck on spinner)
  const spinner = page.locator('text=/Yükleniyor|Loading/');
  const hasSpinner = await spinner.isVisible().catch(() => false);
  console.log(`[NOTIFICATIONS] Spinner visible: ${hasSpinner}`);

  // Count notifications
  const notifications = page.locator('[class*="notification"], [class*="Notification"], li, [class*="item"]');
  const notifCount = await notifications.count();
  console.log(`[NOTIFICATIONS] Items: ${notifCount}`);

  // Try "Okunmamış" filter
  const unreadFilter = page.locator('button:has-text("Okunmamış"), button:has-text("Unread")').first();
  if (await unreadFilter.isVisible()) {
    await unreadFilter.click();
    await page.waitForTimeout(500);
    console.log('[NOTIFICATIONS] Unread filter clicked');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-notifications-unread.png`, fullPage: true });
  }

  // Try "Tümünü Okundu İşaretle"
  const markAllBtn = page.locator('button:has-text("Tümünü Okundu"), button:has-text("Mark all")').first();
  if (await markAllBtn.isVisible()) {
    console.log('[NOTIFICATIONS] "Mark all read" button found');
  }
});

test('DEEP-8: Roommates — swipe etkileşimi', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-roommates.png`, fullPage: true });

  // Check swipe card content
  const matchPercent = page.locator('text=/%\\d+.*Uyum|Uyum.*%\\d+|\\d+%/');
  const percentTexts = await matchPercent.allTextContents();
  console.log(`[ROOMMATES] Match percentages: ${percentTexts.join(', ')}`);

  // Check action buttons (X, Message, Heart)
  const actionBtns = page.locator('button');
  const btnCount = await actionBtns.count();
  console.log(`[ROOMMATES] Buttons: ${btnCount}`);

  // Try swipe/X button
  const rejectBtn = page.locator('button:has-text("✕"), button:has-text("×"), button[aria-label*="reject"], button[aria-label*="skip"]').first();
  if (await rejectBtn.isVisible()) {
    await rejectBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-roommates-after-swipe.png`, fullPage: true });
    console.log('[ROOMMATES] Reject/skip clicked — new card should appear');
  }

  // Check interest tags on card
  const interests = page.locator('[class*="tag"], [class*="chip"], [class*="interest"]');
  const intCount = await interests.count();
  console.log(`[ROOMMATES] Interest tags: ${intCount}`);
});

test('DEEP-9: Budget calculator — slider etkileşimi', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/budget`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-budget.png`, fullPage: true });

  // Check sliders
  const sliders = page.locator('input[type="range"]');
  const sliderCount = await sliders.count();
  console.log(`[BUDGET] Sliders: ${sliderCount}`);

  // Try adjusting first slider
  if (sliderCount > 0) {
    const firstSlider = sliders.first();
    const min = await firstSlider.getAttribute('min') || '0';
    const max = await firstSlider.getAttribute('max') || '100';
    const val = await firstSlider.inputValue();
    console.log(`[BUDGET] First slider: min=${min}, max=${max}, value=${val}`);

    // Move slider to different value
    await firstSlider.fill(String(Math.floor(Number(max) * 0.7)));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-budget-adjusted.png`, fullPage: true });
    console.log('[BUDGET] Slider adjusted');
  }

  // Check total calculation
  const totalText = await page.locator('text=/toplam|Toplam|Total|₺|TL/i').allTextContents();
  console.log(`[BUDGET] Total texts: ${totalText.slice(0, 3).join(', ')}`);
});

test('DEEP-10: Settings — toggle etkileşimi', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/settings`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-settings.png`, fullPage: true });

  // Check toggles
  const toggles = page.locator('input[type="checkbox"], [role="switch"], [class*="toggle"], [class*="Toggle"]');
  const toggleCount = await toggles.count();
  console.log(`[SETTINGS] Toggles: ${toggleCount}`);

  // Try clicking first toggle
  if (toggleCount > 0) {
    const firstToggle = toggles.first();
    const wasBefore = await firstToggle.isChecked().catch(() => 'unknown');
    await firstToggle.click({ force: true });
    await page.waitForTimeout(500);
    const isAfter = await firstToggle.isChecked().catch(() => 'unknown');
    console.log(`[SETTINGS] Toggle before: ${wasBefore}, after: ${isAfter}`);
  }

  // Check dark mode toggle
  const darkMode = page.locator('text=/Karanlık|Dark/');
  if (await darkMode.isVisible()) {
    console.log('[SETTINGS] Dark mode option found');
  }

  // Check language selector
  const langSelector = page.locator('text=/Türkçe|English|Dil/');
  const langTexts = await langSelector.allTextContents();
  console.log(`[SETTINGS] Language: ${langTexts.join(', ')}`);
});

test('DEEP-11: Host Apply — başvuru formu doldurma', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/apply`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-host-apply.png`, fullPage: true });

  // Check form fields
  const allInputs = page.locator('input, textarea, select');
  const inputCount = await allInputs.count();
  console.log(`[HOST-APPLY] Form inputs: ${inputCount}`);

  for (let i = 0; i < Math.min(inputCount, 10); i++) {
    const el = allInputs.nth(i);
    const tag = await el.evaluate(e => e.tagName.toLowerCase());
    const name = await el.getAttribute('name') || '';
    const type = await el.getAttribute('type') || '';
    const placeholder = await el.getAttribute('placeholder') || '';
    console.log(`[HOST-APPLY] ${i}: <${tag}> type="${type}" name="${name}" placeholder="${placeholder}"`);
  }

  // Try filling address
  const addressInput = page.locator('input[name*="address"], textarea[name*="address"], input[placeholder*="Adres"]').first();
  if (await addressInput.isVisible()) {
    await addressInput.fill('Test Adresi, Barcelona, İspanya');
    console.log('[HOST-APPLY] Address filled');
  }
});

test('DEEP-12: Messages — konuşma detay + mesaj gönderme', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/messages`);
  await page.waitForTimeout(2000);

  // Click first conversation
  const conversations = page.locator('[class*="conversation"], [class*="chat"], [class*="message-item"], li').first();
  if (await conversations.isVisible()) {
    await conversations.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-messages-detail.png`, fullPage: true });

    // Check chat input
    const chatInput = page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"], textarea[placeholder*="Mesaj"]').first();
    if (await chatInput.isVisible()) {
      await chatInput.fill('Test mesajı Döngü 4');
      console.log('[MESSAGES] Chat input filled');

      // Check send button
      const sendBtn = page.locator('button:has-text("Gönder"), button[aria-label*="send"], button:has-text("✈"), button:has-text("➤")').first();
      if (await sendBtn.isVisible()) {
        console.log('[MESSAGES] Send button found');
      }
    } else {
      console.log('[MESSAGES] ❌ NO CHAT INPUT FOUND — bug may persist');
    }

    // Check chat bubbles
    const bubbles = page.locator('[class*="bubble"], [class*="message-content"], [class*="chat-message"]');
    const bubbleCount = await bubbles.count();
    console.log(`[MESSAGES] Chat bubbles: ${bubbleCount}`);
  }
});

test('DEEP-13: Empty State kontrolü — Host Bookings', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/bookings`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-host-bookings.png`, fullPage: true });

  // Check empty state
  const emptyState = page.locator('text=/henüz|boş|empty|Talep yok|Gelen talep/i');
  const emptyTexts = await emptyState.allTextContents();
  console.log(`[HOST-BOOKINGS] Empty state texts: ${emptyTexts.join(', ')}`);

  // Check if there's actually content or just empty
  const bodyText = await page.locator('main, [class*="content"], [class*="container"]').first().textContent() || '';
  console.log(`[HOST-BOOKINGS] Page content (first 200): ${bodyText.substring(0, 200)}`);
});

test('DEEP-14: Listing Detail — carousel + rezservasyon butonu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForTimeout(2000);

  // Click first listing
  const firstListing = page.locator('a[href*="/listing/"], [class*="card"] a, [class*="Card"] a').first();
  if (await firstListing.isVisible()) {
    await firstListing.click();
    await page.waitForTimeout(2000);
  } else {
    // Try direct navigation
    await page.goto(`${BASE}/listing/1`);
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-listing-detail.png`, fullPage: true });

  // Check carousel
  const carouselImgs = page.locator('[class*="carousel"] img, [class*="gallery"] img, [class*="slider"] img');
  const carouselCount = await carouselImgs.count();
  console.log(`[LISTING-DETAIL] Carousel images: ${carouselCount}`);

  // Check carousel nav (arrows or dots)
  const nextArrow = page.locator('button:has-text("›"), button:has-text(">"), button[aria-label*="next"]').first();
  if (await nextArrow.isVisible()) {
    await nextArrow.click();
    await page.waitForTimeout(500);
    console.log('[LISTING-DETAIL] Carousel next clicked');
  }

  // Check price
  const priceTexts = await page.locator('text=/\\d+.*TL|₺.*\\d+/').allTextContents();
  console.log(`[LISTING-DETAIL] Prices: ${priceTexts.slice(0, 3).join(', ')}`);

  // Check "Rezervasyon Yap" button
  const bookBtn = page.locator('button:has-text("Rezervasyon"), button:has-text("Book"), a:has-text("Rezervasyon")').first();
  if (await bookBtn.isVisible()) {
    console.log('[LISTING-DETAIL] "Rezervasyon Yap" button found');
  } else {
    console.log('[LISTING-DETAIL] ❌ NO BOOKING BUTTON');
  }

  // Check reviews
  const reviews = page.locator('[class*="review"], [class*="comment"], [class*="yorum"]');
  const reviewCount = await reviews.count();
  console.log(`[LISTING-DETAIL] Reviews: ${reviewCount}`);
});

test('DEEP-15: Placeholder / "Yakında" taraması — tüm sorunlu sayfalar', async ({ page }) => {
  await login(page);

  const pagesToCheck = [
    '/favorites', '/compare', '/booking', '/profile/bookings',
    '/search/map', '/messages', '/mentors', '/host/apply',
    '/listing/new', '/events/new', '/community/new', '/roommates',
    '/budget', '/host/bookings', '/host/calendar', '/host/earnings'
  ];

  let placeholderPages: string[] = [];

  for (const path of pagesToCheck) {
    await page.goto(`${BASE}${path}`);
    await page.waitForTimeout(1500);

    const bodyText = await page.locator('body').textContent() || '';
    const lowerText = bodyText.toLowerCase();

    const hasYakinda = lowerText.includes('yakında') || lowerText.includes('coming soon');
    const hasPlaceholder = lowerText.includes('placeholder') || lowerText.includes('lorem ipsum');
    const hasTodo = lowerText.includes('todo') || lowerText.includes('implement');

    if (hasYakinda || hasPlaceholder || hasTodo) {
      placeholderPages.push(path);
      console.log(`[PLACEHOLDER] ⚠️ ${path}: yakında=${hasYakinda}, placeholder=${hasPlaceholder}, todo=${hasTodo}`);
    }
  }

  if (placeholderPages.length === 0) {
    console.log('[PLACEHOLDER] ✅ Hiçbir sayfada yakında/placeholder/todo bulunamadı');
  } else {
    console.log(`[PLACEHOLDER] ⚠️ Sorunlu sayfalar: ${placeholderPages.join(', ')}`);
  }
});

test('DEEP-16: Search FAQ accordion etkileşimi', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/settings/faq`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-faq.png`, fullPage: true });

  // Click first accordion item
  const accordionItems = page.locator('[class*="accordion"], details, summary, [class*="faq-item"], button[class*="question"]');
  const accCount = await accordionItems.count();
  console.log(`[FAQ] Accordion items: ${accCount}`);

  if (accCount > 0) {
    await accordionItems.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-faq-open.png`, fullPage: true });
    console.log('[FAQ] First accordion opened');
  }
});

test('DEEP-17: Mentors — filtre etkileşimi ve "Mentor Ol"', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/mentors`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-mentors.png`, fullPage: true });

  // Count mentors
  const mentorCards = page.locator('[class*="card"], [class*="mentor"], [class*="Card"]');
  const mentorCount = await mentorCards.count();
  console.log(`[MENTORS] Mentor cards: ${mentorCount}`);

  // Try city filters
  const cityFilters = page.locator('button:has-text("Barcelona"), button:has-text("Berlin"), button:has-text("İstanbul"), button:has-text("Tümü")');
  const filterCount = await cityFilters.count();
  console.log(`[MENTORS] City filters: ${filterCount}`);

  for (let i = 0; i < filterCount; i++) {
    const btn = cityFilters.nth(i);
    const text = await btn.textContent();
    await btn.click();
    await page.waitForTimeout(500);
    const cards = page.locator('[class*="card"], [class*="mentor"], [class*="Card"]');
    const cnt = await cards.count();
    console.log(`[MENTORS] Filter "${text}": ${cnt} mentors`);
  }

  // Check "Mentor Ol" button
  const mentorOlBtn = page.locator('button:has-text("Mentor Ol"), a:has-text("Mentor Ol")').first();
  if (await mentorOlBtn.isVisible()) {
    console.log('[MENTORS] "Mentor Ol" button found');
    await mentorOlBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-mentor-ol.png`, fullPage: true });
    console.log('[MENTORS] "Mentor Ol" clicked — checking result');
  }
});

test('DEEP-18: City Detail — tab navigasyonu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/city`);
  await page.waitForTimeout(2000);

  // Click first city
  const firstCity = page.locator('a[href*="/city/"], [class*="card"] a, [class*="Card"]').first();
  if (await firstCity.isVisible()) {
    await firstCity.click();
    await page.waitForTimeout(2000);
  } else {
    await page.goto(`${BASE}/city/1`);
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-city-detail.png`, fullPage: true });

  // Check tabs
  const tabs = page.locator('button:has-text("Bilgi"), button:has-text("Mahalleler"), button:has-text("İlanlar"), button:has-text("Ulaşım"), [role="tab"]');
  const tabCount = await tabs.count();
  console.log(`[CITY-DETAIL] Tabs: ${tabCount}`);

  // Click each tab
  for (let i = 0; i < tabCount; i++) {
    const tab = tabs.nth(i);
    const text = await tab.textContent();
    await tab.click();
    await page.waitForTimeout(500);
    console.log(`[CITY-DETAIL] Tab "${text}" clicked`);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-city-detail-tabs.png`, fullPage: true });
});

test('DEEP-19: Booking sayfası — Stripe/ödeme kontrolü', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/booking`);
  await page.waitForTimeout(2000);

  // Check for payment button or Stripe elements
  const paymentBtn = page.locator('button:has-text("Öde"), button:has-text("Pay"), button:has-text("Ödeme"), [class*="stripe"], iframe[src*="stripe"]');
  const payCount = await paymentBtn.count();
  console.log(`[BOOKING] Payment elements: ${payCount}`);

  // Check for booking action buttons
  const actionBtns = page.locator('button:has-text("İptal"), button:has-text("Detay"), button:has-text("Mesaj")');
  const actionCount = await actionBtns.count();
  console.log(`[BOOKING] Action buttons: ${actionCount}`);

  // Get page text for analysis
  const bodyText = await page.locator('main, [class*="content"]').first().textContent() || '';
  const hasStripe = bodyText.toLowerCase().includes('stripe') || bodyText.toLowerCase().includes('ödeme yap');
  console.log(`[BOOKING] Has Stripe/payment text: ${hasStripe}`);
});

test('DEEP-20: Host Calendar — tarih etkileşimi', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/calendar`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-host-calendar.png`, fullPage: true });

  // Check month navigation
  const prevMonth = page.locator('button:has-text("<"), button:has-text("‹"), button[aria-label*="previous"]').first();
  const nextMonth = page.locator('button:has-text(">"), button:has-text("›"), button[aria-label*="next"]').first();

  if (await nextMonth.isVisible()) {
    await nextMonth.click();
    await page.waitForTimeout(500);
    console.log('[HOST-CALENDAR] Next month clicked');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-host-calendar-next.png`, fullPage: true });
  }

  // Check legend
  const legend = page.locator('text=/Müsait|Dolu|Beklemede/');
  const legendTexts = await legend.allTextContents();
  console.log(`[HOST-CALENDAR] Legend: ${legendTexts.join(', ')}`);

  // Try clicking a date cell
  const dateCells = page.locator('td, [class*="day"], [class*="cell"]');
  const cellCount = await dateCells.count();
  console.log(`[HOST-CALENDAR] Date cells: ${cellCount}`);
});
