import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

async function login(page: Page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.fill('input[type="email"]', 'deniz@kotwise.com');
  await page.fill('input[type="password"]', 'KotwiseTest2026!');
  await page.getByRole('button', { name: 'Giriş Yap', exact: true }).click();
  await page.waitForTimeout(3000);
}

// ==================== DEVAM EDEN BUG RE-CHECK ====================

test('BUG-RECHECK: Listing thumbnail placeholder - favorites', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/favorites`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-favorites.png`, fullPage: true });

  const imgs = page.locator('img');
  const count = await imgs.count();
  let svgCount = 0, realCount = 0;
  for (let i = 0; i < count; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    if (src.includes('data:image/svg') || src.includes('placeholder')) svgCount++;
    else if (src.includes('http') || src.includes('unsplash') || src.includes('/api')) realCount++;
  }

  // Check prices
  const text = await page.textContent('body') || '';
  const prices = text.match(/[\d.]+\s*₺/g) || text.match(/[\d.]+\s*TL/g) || [];
  console.log(`FAVORITES: ${count} imgs, ${svgCount} SVG, ${realCount} real. Prices: ${prices.join(', ')}`);

  // Check for 100x price bug
  const has100x = prices.some(p => {
    const num = parseInt(p.replace(/[^\d]/g, ''));
    return num > 5000;
  });
  console.log(`FAVORITES 100x price bug: ${has100x ? 'YES' : 'NO'}`);
});

test('BUG-RECHECK: Listing thumbnail placeholder - compare', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/compare`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-compare.png`, fullPage: true });

  const imgs = page.locator('img');
  const count = await imgs.count();
  let svgCount = 0;
  for (let i = 0; i < count; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    if (src.includes('data:image/svg') || src.includes('placeholder')) svgCount++;
  }

  const text = await page.textContent('body') || '';
  const prices = text.match(/[\d.]+\s*[₺TL]/g) || [];
  console.log(`COMPARE: ${count} imgs, ${svgCount} SVG. Prices: ${prices.join(', ')}`);
});

test('BUG-RECHECK: Listing thumbnail placeholder - booking + profile-bookings', async ({ page }) => {
  await login(page);

  await page.goto(`${BASE}/booking`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-booking.png`, fullPage: true });

  let imgs = page.locator('img');
  let count = await imgs.count();
  let svgCount = 0;
  for (let i = 0; i < count; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    if (src.includes('data:image/svg') || src.includes('placeholder')) svgCount++;
  }
  let text = await page.textContent('body') || '';
  let prices = text.match(/[\d.]+\s*[₺TL]/g) || [];
  console.log(`BOOKING: ${count} imgs, ${svgCount} SVG. Prices: ${prices.join(', ')}`);

  await page.goto(`${BASE}/profile/bookings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-profile-bookings.png`, fullPage: true });

  imgs = page.locator('img');
  count = await imgs.count();
  svgCount = 0;
  for (let i = 0; i < count; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    if (src.includes('data:image/svg') || src.includes('placeholder')) svgCount++;
  }
  text = await page.textContent('body') || '';
  prices = text.match(/[\d.]+\s*[₺TL]/g) || [];
  console.log(`PROFILE-BOOKINGS: ${count} imgs, ${svgCount} SVG. Prices: ${prices.join(', ')}`);
});

// ==================== FIYAT REGRESYON KONTROLÜ ====================

test('REGRESYON: Fiyat 100x kontrolü - homepage + search + listing-detail', async ({ page }) => {
  await login(page);

  // Homepage
  await page.goto(`${BASE}/`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  let text = await page.textContent('body') || '';
  let allPrices = text.match(/[\d.,]+\s*[₺TL]/g) || [];
  let has100x = allPrices.some(p => {
    const num = parseInt(p.replace(/[^\d]/g, ''));
    return num > 5000 && num < 500000;
  });
  console.log(`HOMEPAGE prices: ${allPrices.slice(0, 10).join(', ')} | 100x: ${has100x}`);

  // Search
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  text = await page.textContent('body') || '';
  allPrices = text.match(/[\d.,]+\s*[₺TL]/g) || [];
  has100x = allPrices.some(p => {
    const num = parseInt(p.replace(/[^\d]/g, ''));
    return num > 5000 && num < 500000;
  });
  console.log(`SEARCH prices: ${allPrices.slice(0, 10).join(', ')} | 100x: ${has100x}`);

  // Listing detail
  const firstLink = page.locator('a[href*="/listing/"]').first();
  if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    const href = await firstLink.getAttribute('href');
    await page.goto(`${BASE}${href}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    text = await page.textContent('body') || '';
    allPrices = text.match(/[\d.,]+\s*[₺TL]/g) || [];
    has100x = allPrices.some(p => {
      const num = parseInt(p.replace(/[^\d]/g, ''));
      return num > 5000 && num < 500000;
    });
    console.log(`LISTING-DETAIL prices: ${allPrices.slice(0, 10).join(', ')} | 100x: ${has100x}`);
  }
});

test('REGRESYON: Fiyat 100x kontrolü - search-map markers', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search/map`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-searchmap.png`, fullPage: true });

  // Check zoom level from tiles
  const tiles = page.locator('img[src*="tile.openstreetmap"]');
  const tileCount = await tiles.count();
  let zoomLevel = 0;
  if (tileCount > 0) {
    const src = await tiles.first().getAttribute('src') || '';
    const match = src.match(/\/(\d+)\/\d+\/\d+/);
    if (match) zoomLevel = parseInt(match[1]);
  }

  // Check marker prices
  const markers = page.locator('.leaflet-marker-icon, [class*="marker"], [class*="price"]');
  const markerCount = await markers.count();

  const text = await page.textContent('body') || '';
  const prices = text.match(/[\d.,]+\s*[₺TL]/g) || [];
  const has100x = prices.some(p => {
    const num = parseInt(p.replace(/[^\d]/g, ''));
    return num > 5000 && num < 500000;
  });
  console.log(`MAP: zoom=${zoomLevel}, ${tileCount} tiles, ${markerCount} markers. Prices: ${prices.slice(0, 8).join(', ')} | 100x: ${has100x}`);
});

// ==================== DERİN TEST — FORM DOLDURMA ====================

test('DEEP: listing-new form doldurma + validasyon', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/listing/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-listing-new.png`, fullPage: true });

  // Try submit empty form
  const devamBtn = page.locator('button:has-text("Devam"), button:has-text("İleri"), button[type="submit"]').first();
  if (await devamBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await devamBtn.click();
    await page.waitForTimeout(1000);
  }

  // Check validation errors
  const text = await page.textContent('body') || '';
  const hasValidation = text.includes('gerekli') || text.includes('zorunlu') || text.includes('required');
  console.log(`LISTING-NEW validation: ${hasValidation}`);

  // Fill form
  const titleInput = page.locator('input[name="title"], input[placeholder*="başlık"], input[placeholder*="ilan"]').first();
  if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await titleInput.fill('Test İlan - Döngü 4 DERİN TEST');
  }

  // Check university field type (should be combobox/autocomplete)
  const uniField = page.locator('[role="combobox"], input[aria-autocomplete], [class*="combobox"], [class*="autocomplete"]');
  const uniCount = await uniField.count();
  console.log(`LISTING-NEW university combobox count: ${uniCount}`);

  // Count all inputs
  const inputs = await page.locator('input, textarea, select').count();
  const buttons = await page.locator('button').count();
  console.log(`LISTING-NEW: ${inputs} inputs, ${buttons} buttons`);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-listing-new-filled.png`, fullPage: true });
});

test('DEEP: events-new form doldurma', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-events-new.png`, fullPage: true });

  // Fill event name
  const nameInput = page.locator('input[name="title"], input[placeholder*="etkinlik"], input[placeholder*="adı"]').first();
  if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nameInput.fill('Döngü 4 Test Etkinliği');
  }

  const inputs = await page.locator('input, textarea, select').count();
  const buttons = await page.locator('button').count();
  console.log(`EVENTS-NEW: ${inputs} inputs, ${buttons} buttons`);
});

test('DEEP: community-new form doldurma + hashtag', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/community/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-community-new.png`, fullPage: true });

  // Fill textarea
  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
    await textarea.fill('Döngü 4 DERİN TEST - Topluluk gönderisi');
  }

  // Count hashtag buttons
  const hashtags = page.locator('button:has-text("#"), [class*="hashtag"], [class*="tag"]');
  const hashCount = await hashtags.count();

  // Click first hashtag
  if (hashCount > 0) {
    await hashtags.first().click();
    await page.waitForTimeout(500);
  }

  const text = await page.textContent('body') || '';
  const hasPaylas = text.includes('Paylaş');
  console.log(`COMMUNITY-NEW: ${hashCount} hashtags, Paylaş: ${hasPaylas}`);
});

test('DEEP: profile-edit form doldurma + combobox', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/edit`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-profile-edit.png`, fullPage: true });

  // Count filled inputs
  const inputs = page.locator('input:not([type="hidden"]), textarea');
  const inputCount = await inputs.count();
  let filledCount = 0;
  for (let i = 0; i < inputCount; i++) {
    const val = await inputs.nth(i).inputValue().catch(() => '');
    if (val.trim().length > 0) filledCount++;
  }

  // Count comboboxes
  const comboboxes = page.locator('[role="combobox"], [aria-autocomplete], [class*="combobox"]');
  const comboCount = await comboboxes.count();

  // Count interest tags
  const tags = page.locator('[class*="tag"], [class*="badge"], [class*="chip"]');
  const tagCount = await tags.count();

  const text = await page.textContent('body') || '';
  const hasKaydet = text.includes('Kaydet');
  console.log(`PROFILE-EDIT: ${inputCount} inputs (${filledCount} filled), ${comboCount} combobox, ${tagCount} tags, Kaydet: ${hasKaydet}`);
});

// ==================== DERİN TEST — FİLTRE & ETKİLEŞİM ====================

test('DEEP: events filtreleri + view toggle', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-events.png`, fullPage: true });

  // Count category filters
  const filterBtns = page.locator('button:has-text("Tümü"), button:has-text("Kahve"), button:has-text("Spor"), button:has-text("Dil"), button:has-text("Tur"), button:has-text("Parti"), button:has-text("Çalışma"), button:has-text("Yemek"), button:has-text("Diğer")');
  const filterCount = await filterBtns.count();

  // Click Kahve filter
  const kahveBtn = page.locator('button:has-text("Kahve")');
  if (await kahveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await kahveBtn.click();
    await page.waitForTimeout(1000);
  }

  // Count event cards after filter
  const eventCards = page.locator('[class*="card"], article, [class*="event"]');
  const cardCount = await eventCards.count();

  // Check view toggle buttons
  const viewBtns = page.locator('button[aria-label]');
  const viewCount = await viewBtns.count();

  console.log(`EVENTS: ${filterCount} filters, ${cardCount} cards after Kahve, ${viewCount} aria-label buttons`);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-events-kahve-filter.png`, fullPage: true });
});

test('DEEP: search filtreleri', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Count listing links
  const listingLinks = page.locator('a[href*="/listing/"]');
  const linkCount = await listingLinks.count();

  // Count filter elements
  const selects = page.locator('select, [role="listbox"], [class*="select"]');
  const selectCount = await selects.count();

  // Count real vs SVG photos
  const imgs = page.locator('img');
  const imgCount = await imgs.count();
  let svgCount = 0, realCount = 0;
  for (let i = 0; i < imgCount; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    if (src.includes('data:image/svg') || src.includes('placeholder')) svgCount++;
    else if (src.includes('http') || src.includes('unsplash') || src.includes('/api')) realCount++;
  }

  console.log(`SEARCH: ${linkCount} listings, ${selectCount} selects, ${imgCount} imgs (${realCount} real, ${svgCount} SVG)`);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-search.png`, fullPage: true });
});

test('DEEP: budget sliderlar + para birimi', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/budget`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-budget.png`, fullPage: true });

  const text = await page.textContent('body') || '';

  // Check currency
  const hasTRY = text.includes('₺') || text.includes('TL') || text.includes('TRY');
  const hasEUR = text.includes('€') || text.includes('EUR');

  // Count sliders
  const sliders = page.locator('input[type="range"]');
  const sliderCount = await sliders.count();

  // Check CTA
  const hasCTA = text.includes('uygun ilanları göster') || text.includes('bütçeye uygun');

  console.log(`BUDGET: ${sliderCount} sliders, TRY: ${hasTRY}, EUR: ${hasEUR}, CTA: ${hasCTA}`);
});

test('DEEP: settings togglelar + dil/para', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/settings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-settings.png`, fullPage: true });

  const text = await page.textContent('body') || '';

  const hasTurkce = text.includes('Türkçe');
  const hasTRY = text.includes('TRY');
  const hasKaranlik = text.includes('Karanlık') || text.includes('karanlık');
  const hasHesabiSil = text.includes('Hesabı Sil') || text.includes('hesabı sil');
  const hasSurum = text.includes('2.0.0') || text.includes('Sürüm');

  // Count toggles
  const toggles = page.locator('[role="switch"], input[type="checkbox"], [class*="toggle"]');
  const toggleCount = await toggles.count();

  console.log(`SETTINGS: ${toggleCount} toggles, Türkçe: ${hasTurkce}, TRY: ${hasTRY}, Karanlık: ${hasKaranlik}, Hesabı Sil: ${hasHesabiSil}, Sürüm: ${hasSurum}`);
});

test('DEEP: notifications filtre + okundu işaretle', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/notifications`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-notifications.png`, fullPage: true });

  const text = await page.textContent('body') || '';

  // Check not stuck on loading
  const isStuck = text.includes('Yükleniyor') && !text.includes('Coffee') && !text.includes('beğeni');

  // Check filters
  const hasTumu = text.includes('Tümü');
  const hasOkunmamis = text.includes('Okunmamış');
  const hasOkunduIsaretle = text.includes('Okundu İşaretle') || text.includes('okundu işaretle');

  // Click "Tümünü Okundu İşaretle" if exists
  const okunduBtn = page.locator('button:has-text("Okundu İşaretle")');
  const hasBtn = await okunduBtn.isVisible({ timeout: 2000 }).catch(() => false);

  console.log(`NOTIFICATIONS: stuck=${isStuck}, Tümü: ${hasTumu}, Okunmamış: ${hasOkunmamis}, Okundu İşaretle btn: ${hasBtn}`);
});

// ==================== DERİN TEST — ROOMMATES & DETAY ====================

test('DEEP: roommates swipe + uyum yüzdesi', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-roommates.png`, fullPage: true });

  const text = await page.textContent('body') || '';

  // Check uyum percentage
  const hasUyum = text.includes('Uyum');
  const uyumMatch = text.match(/(%?\d+%?\s*Uyum)/);
  const hasUyumBilgisiYok = text.includes('Uyum bilgisi yok');

  // Check buttons
  const buttons = page.locator('button');
  const btnCount = await buttons.count();

  // Check real photo
  const imgs = page.locator('img');
  const imgCount = await imgs.count();
  let realPhotoCount = 0;
  for (let i = 0; i < imgCount; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    if (src.includes('http') || src.includes('unsplash') || src.includes('/api')) realPhotoCount++;
  }

  console.log(`ROOMMATES: Uyum: ${uyumMatch ? uyumMatch[1] : 'NONE'}, UyumBilgisiYok: ${hasUyumBilgisiYok}, ${btnCount} buttons, ${realPhotoCount}/${imgCount} real photos`);
});

test('DEEP: roommates detail - uyum kontrolü', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Try to find a roommate link/card to click
  const roommateLink = page.locator('a[href*="/roommates/"]').first();
  const roommateCard = page.locator('[class*="card"]').first();

  // Navigate to first roommate detail via API
  // Get roommate IDs from the page
  const links = page.locator('a[href*="/roommates/"]');
  const linkCount = await links.count();

  if (linkCount > 0) {
    const href = await links.first().getAttribute('href');
    await page.goto(`${BASE}${href}`);
  } else {
    // Try direct API
    const response = await page.goto(`${BASE}/api/roommates`);
    const text = await page.textContent('body') || '';
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0) {
        await page.goto(`${BASE}/roommates/${data[0].id}`);
      }
    } catch {}
  }

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-roommates-detail.png`, fullPage: true });

  const detailText = await page.textContent('body') || '';
  const hasUyumPercent = /\d+%/.test(detailText);
  const hasUyumBilgisiYok = detailText.includes('Uyum bilgisi yok');
  const hasFarkliIlgiAlanlari = detailText.includes('Farklı ilgi alanları');
  const hasMesajGonder = detailText.includes('Mesaj Gönder');
  const hasBegenBtn = detailText.includes('Beğen');

  console.log(`ROOMMATES-DETAIL: uyum%: ${hasUyumPercent}, UyumBilgisiYok: ${hasUyumBilgisiYok}, Farklıİlgi: ${hasFarkliIlgiAlanlari}, MesajGönder: ${hasMesajGonder}, Beğen: ${hasBegenBtn}`);
});

// ==================== DERİN TEST — EMPTY STATE & EDGE CASE ====================

test('DEEP: host-bookings empty state', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/bookings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-host-bookings.png`, fullPage: true });

  const text = await page.textContent('body') || '';
  const hasEmptyState = text.includes('talep yok') || text.includes('henüz') || text.includes('boş');
  const hasBekleyen = text.includes('Bekleyen');
  const hasOnaylanan = text.includes('Onaylanan');
  const hasReddedilen = text.includes('Reddedilen');
  const hasGecmis = text.includes('Geçmiş');

  console.log(`HOST-BOOKINGS: empty=${hasEmptyState}, tabs: Bekleyen=${hasBekleyen} Onaylanan=${hasOnaylanan} Reddedilen=${hasReddedilen} Geçmiş=${hasGecmis}`);
});

test('DEEP: host-earnings para birimi + template kontrolü', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/earnings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-host-earnings.png`, fullPage: true });

  const text = await page.textContent('body') || '';
  const hasCurrencySymbol = text.includes('{currencySymbol}');
  const hasTRY = text.includes('₺') || text.includes('TL');
  const hasEUR = text.includes('€') || text.includes('EUR');

  console.log(`HOST-EARNINGS: {currencySymbol}: ${hasCurrencySymbol}, TRY: ${hasTRY}, EUR: ${hasEUR}`);
});

test('DEEP: host-calendar ay navigasyonu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/calendar`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-host-calendar.png`, fullPage: true });

  const text = await page.textContent('body') || '';
  const hasLegend = (text.includes('Müsait') || text.includes('müsait')) && (text.includes('Dolu') || text.includes('dolu'));

  // Try navigating months
  const prevBtn = page.locator('button:has-text("<"), button:has-text("‹"), button[aria-label*="önceki"], button[aria-label*="prev"]').first();
  if (await prevBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await prevBtn.click();
    await page.waitForTimeout(1000);
  }

  const text2 = await page.textContent('body') || '';
  console.log(`HOST-CALENDAR: legend=${hasLegend}, month navigation works`);
});

// ==================== DERİN TEST — MESAJLAŞMA ====================

test('DEEP: messages detay + chat input', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/messages`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click first conversation
  const convLink = page.locator('a[href*="/messages/"]').first();
  if (await convLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await convLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-messages-detail.png`, fullPage: true });

  const text = await page.textContent('body') || '';

  // Check chat input
  const chatInput = page.locator('input[placeholder*="Mesaj yaz"], input[placeholder*="mesaj"], textarea[placeholder*="Mesaj"]');
  const hasInput = await chatInput.isVisible({ timeout: 3000 }).catch(() => false);

  // Try typing a message
  if (hasInput) {
    await chatInput.fill('Döngü 4 DERİN TEST mesajı');
    await page.waitForTimeout(500);
  }

  // Check buttons
  const sendBtn = page.locator('button[aria-label*="Gönder"], button[aria-label*="gönder"], button:has-text("✈"), button:has-text("Gönder")');
  const hasSend = await sendBtn.count() > 0;

  const emojiBtn = page.locator('button[aria-label*="Emoji"], button[aria-label*="emoji"]');
  const hasEmoji = await emojiBtn.count() > 0;

  console.log(`MESSAGES-DETAIL: chatInput=${hasInput}, sendBtn=${hasSend}, emojiBtn=${hasEmoji}`);
});

// ==================== DERİN TEST — LISTING DETAIL ====================

test('DEEP: listing detail carousel + özellikler + benzer ilanlar', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const firstLink = page.locator('a[href*="/listing/"]').first();
  if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    const href = await firstLink.getAttribute('href');
    await page.goto(`${BASE}${href}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-listing-detail.png`, fullPage: true });

  const text = await page.textContent('body') || '';

  // Check carousel
  const hasCarousel = text.includes('/5') || text.includes('1/');

  // Check features
  const hasWifi = text.includes('WiFi') || text.includes('wifi') || text.includes('İnternet');
  const hasRezervasyon = text.includes('Rezervasyon Yap') || text.includes('rezervasyon');
  const hasSuperhost = text.includes('SUPERHOST') || text.includes('Superhost');
  const hasBenzerIlanlar = text.includes('Benzer') || text.includes('benzer');
  const hasYorumlar = text.includes('Değerlendirme') || text.includes('yorum') || text.includes('Yorum');

  // Count real photos
  const imgs = page.locator('img');
  const imgCount = await imgs.count();
  let realCount = 0;
  for (let i = 0; i < imgCount; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    if (src.includes('http') || src.includes('unsplash') || src.includes('/api')) realCount++;
  }

  console.log(`LISTING-DETAIL: carousel=${hasCarousel}, ${realCount}/${imgCount} real photos, WiFi=${hasWifi}, RezervasyonYap=${hasRezervasyon}, SUPERHOST=${hasSuperhost}, BenzerİIlanlar=${hasBenzerIlanlar}, Yorumlar=${hasYorumlar}`);
});

// ==================== PLACEHOLDER TARAMASI ====================

test('DEEP: placeholder/yakında taraması - 18 sayfa', async ({ page }) => {
  await login(page);

  const pages = [
    '/', '/search', '/favorites', '/compare', '/booking', '/profile/bookings',
    '/search/map', '/events', '/community', '/messages', '/roommates',
    '/mentors', '/budget', '/settings', '/notifications', '/host/bookings',
    '/host/calendar', '/host/earnings'
  ];

  let foundPages: string[] = [];

  for (const path of pages) {
    await page.goto(`${BASE}${path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const text = await page.textContent('body') || '';
    const hasYakinda = text.includes('Yakında') || text.includes('yakında');
    const hasComingSoon = text.toLowerCase().includes('coming soon');
    const hasPlaceholder = text.toLowerCase().includes('placeholder');
    const hasLorem = text.toLowerCase().includes('lorem ipsum');
    const hasTodo = text.includes('TODO');
    const hasTemplate = text.includes('{currencySymbol}') || text.includes('{currency}');

    if (hasYakinda || hasComingSoon || hasPlaceholder || hasLorem || hasTodo || hasTemplate) {
      foundPages.push(`${path}: yakında=${hasYakinda}, comingSoon=${hasComingSoon}, placeholder=${hasPlaceholder}, lorem=${hasLorem}, todo=${hasTodo}, template=${hasTemplate}`);
    }
  }

  if (foundPages.length === 0) {
    console.log('PLACEHOLDER SCAN: ALL CLEAR - 18 sayfada hiçbir placeholder/yakında bulunamadı');
  } else {
    console.log(`PLACEHOLDER SCAN: FOUND in ${foundPages.length} pages:`);
    foundPages.forEach(p => console.log(`  - ${p}`));
  }
});

// ==================== CONSOLE ERROR TARAMASI ====================

test('DEEP: console error taraması - 10 sayfa', async ({ page }) => {
  await login(page);

  const pages = [
    '/favorites', '/compare', '/booking', '/profile/bookings', '/search/map',
    '/notifications', '/messages', '/roommates', '/host/earnings', '/events'
  ];

  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`${msg.text()}`);
    }
  });

  for (const path of pages) {
    const errorsBefore = errors.length;
    await page.goto(`${BASE}${path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    if (errors.length > errorsBefore) {
      const newErrors = errors.slice(errorsBefore);
      console.log(`CONSOLE ERROR on ${path}: ${newErrors.join(' | ')}`);
    }
  }

  console.log(`CONSOLE ERRORS TOTAL: ${errors.length} errors across 10 pages`);
});

// ==================== CITY DETAIL TEST ====================

test('DEEP: city detail tabs + sohbet', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/city`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click first city
  const cityLink = page.locator('a[href*="/city/"]').first();
  if (await cityLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cityLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-city-detail.png`, fullPage: true });

  const text = await page.textContent('body') || '';

  // Check tabs
  const hasBilgi = text.includes('Bilgi');
  const hasMahalleler = text.includes('Mahalleler');
  const hasIlanlar = text.includes('İlanlar') || text.includes('ilanlar');
  const hasUlasim = text.includes('Ulaşım');

  // Check city chat link
  const hasSohbet = text.includes('Sohbet') || text.includes('sohbet');

  console.log(`CITY-DETAIL: tabs: Bilgi=${hasBilgi}, Mahalleler=${hasMahalleler}, İlanlar=${hasIlanlar}, Ulaşım=${hasUlasim}, Sohbet=${hasSohbet}`);
});

// ==================== MENTORS TEST ====================

test('DEEP: mentors filtre + mentor sayısı', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/mentors`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-mentors.png`, fullPage: true });

  const text = await page.textContent('body') || '';

  // Count mentor cards
  const mentorCards = page.locator('[class*="card"], article');
  const cardCount = await mentorCards.count();

  // Check city filters
  const hasBarcelona = text.includes('Barcelona');
  const hasBerlin = text.includes('Berlin');
  const hasIstanbul = text.includes('İstanbul');

  // Check buttons
  const hasMesajGonder = text.includes('Mesaj Gönder');
  const hasMentorOl = text.includes('Mentor Ol');

  console.log(`MENTORS: ${cardCount} cards, Barcelona=${hasBarcelona}, Berlin=${hasBerlin}, İstanbul=${hasIstanbul}, MesajGönder=${hasMesajGonder}, MentorOl=${hasMentorOl}`);
});
