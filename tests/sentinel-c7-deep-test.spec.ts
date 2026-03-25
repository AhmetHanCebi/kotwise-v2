import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const LOGIN_EMAIL = 'deniz@kotwise.com';
const LOGIN_PASS = 'KotwiseTest2026!';
const SCREENSHOT_DIR = 'tests/screenshots';

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', LOGIN_EMAIL);
  await page.fill('input[type="password"]', LOGIN_PASS);
  // Login button is not type="submit", it's a styled button with bold text
  const loginBtn = page.locator('button.font-bold').first();
  await loginBtn.click();
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
}

// ============================================================
// 1. DEVAM EDEN BUG RE-CHECK: Listing Thumbnail Placeholder
// ============================================================

test('C7-01: Favorites thumbnail re-check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/favorites`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const images = await page.$$eval('img', imgs => imgs.map(img => ({
    src: img.src?.substring(0, 100),
    alt: img.alt,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    complete: img.complete,
    isSVG: img.src?.includes('data:image/svg+xml'),
    isPlaceholder: img.src?.includes('data:image') || img.src?.includes('placeholder'),
  })));

  const prices = await page.$$eval('*', els =>
    els.map(el => el.textContent?.trim()).filter(t => t && /\d+[\.,]\d*\s*(TL|₺|€|EUR)/i.test(t) && t.length < 30)
  );

  console.log('FAVORITES IMAGES:', JSON.stringify(images, null, 2));
  console.log('FAVORITES PRICES:', JSON.stringify(prices));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-favorites.png`, fullPage: true });
});

test('C7-02: Compare thumbnail re-check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/compare`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const images = await page.$$eval('img', imgs => imgs.map(img => ({
    src: img.src?.substring(0, 100),
    isSVG: img.src?.includes('data:image/svg+xml'),
    isPlaceholder: img.src?.includes('data:image') || img.src?.includes('placeholder'),
  })));

  const prices = await page.$$eval('*', els =>
    els.map(el => el.textContent?.trim()).filter(t => t && /\d+[\.,]\d*\s*(TL|₺|€|EUR)/i.test(t) && t.length < 30)
  );

  console.log('COMPARE IMAGES:', JSON.stringify(images));
  console.log('COMPARE PRICES:', JSON.stringify(prices));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-compare.png`, fullPage: true });
});

test('C7-03: Booking thumbnail re-check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/booking`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const images = await page.$$eval('img', imgs => imgs.map(img => ({
    src: img.src?.substring(0, 100),
    isSVG: img.src?.includes('data:image/svg+xml'),
    isPlaceholder: img.src?.includes('data:image') || img.src?.includes('placeholder'),
  })));

  const prices = await page.$$eval('*', els =>
    els.map(el => el.textContent?.trim()).filter(t => t && /\d+[\.,]\d*\s*(TL|₺|€|EUR)/i.test(t) && t.length < 30)
  );

  console.log('BOOKING IMAGES:', JSON.stringify(images));
  console.log('BOOKING PRICES:', JSON.stringify(prices));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-booking.png`, fullPage: true });
});

test('C7-04: Profile-bookings thumbnail re-check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/bookings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const images = await page.$$eval('img', imgs => imgs.map(img => ({
    src: img.src?.substring(0, 100),
    isSVG: img.src?.includes('data:image/svg+xml'),
    isPlaceholder: img.src?.includes('data:image') || img.src?.includes('placeholder'),
  })));

  const prices = await page.$$eval('*', els =>
    els.map(el => el.textContent?.trim()).filter(t => t && /\d+[\.,]\d*\s*(TL|₺|€|EUR)/i.test(t) && t.length < 30)
  );

  console.log('PROFILE-BOOKINGS IMAGES:', JSON.stringify(images));
  console.log('PROFILE-BOOKINGS PRICES:', JSON.stringify(prices));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-profile-bookings.png`, fullPage: true });
});

// ============================================================
// 2. DEVAM EDEN BUG RE-CHECK: Roommates Uyum
// ============================================================

test('C7-05: Roommates uyum re-check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const uyumText = await page.$$eval('*', els =>
    els.map(el => el.textContent?.trim()).filter(t => t && (t.includes('Uyum') || t.includes('uyum') || t.includes('%')))
  );

  const cardContent = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText?.substring(0, 1500);
  });

  console.log('ROOMMATES UYUM TEXT:', JSON.stringify(uyumText));
  console.log('ROOMMATES CARD:', cardContent);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-roommates.png`, fullPage: true });
});

test('C7-06: Roommates detail uyum re-check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try clicking on card to go to detail
  const cardLink = await page.$('a[href*="/roommates/"]');
  if (cardLink) {
    await cardLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  } else {
    // Navigate directly to first roommate
    await page.goto(`${BASE}/roommates/1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  }

  const detailContent = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText?.substring(0, 2000);
  });

  console.log('ROOMMATES DETAIL:', detailContent);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-roommates-detail.png`, fullPage: true });
});

// ============================================================
// 3. FIYAT REGRESYON KONTROLÜ (6 sayfa)
// ============================================================

test('C7-07: Price regression check - all pages', async ({ page }) => {
  await login(page);

  const priceResults: Record<string, string[]> = {};

  // Homepage
  await page.goto(`${BASE}/`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  priceResults['homepage'] = await page.$$eval('*', els =>
    els.map(el => el.textContent?.trim()).filter(t => t && /\d{2,6}\s*(TL|₺)/i.test(t) && t.length < 40)
  );

  // Search
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  priceResults['search'] = await page.$$eval('*', els =>
    els.map(el => el.textContent?.trim()).filter(t => t && /\d{2,6}\s*(TL|₺)/i.test(t) && t.length < 40)
  );

  // Listing detail
  await page.goto(`${BASE}/listing/1`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  priceResults['listing-detail'] = await page.$$eval('*', els =>
    els.map(el => el.textContent?.trim()).filter(t => t && /\d{2,6}\s*(TL|₺)/i.test(t) && t.length < 40)
  );

  // Search map
  await page.goto(`${BASE}/search/map`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  priceResults['search-map'] = await page.$$eval('*', els =>
    els.map(el => el.textContent?.trim()).filter(t => t && /\d{2,6}\s*(TL|₺)/i.test(t) && t.length < 40)
  );

  // Check for 100x prices (anything above 5000 TL is suspicious)
  for (const [pageName, prices] of Object.entries(priceResults)) {
    const suspicious = prices.filter(p => {
      const num = parseInt(p.replace(/[^\d]/g, ''));
      return num > 5000;
    });
    console.log(`PRICES ${pageName}:`, JSON.stringify(prices.slice(0, 10)));
    if (suspicious.length > 0) {
      console.log(`!!! 100x SUSPICIOUS ${pageName}:`, JSON.stringify(suspicious));
    }
  }
});

// ============================================================
// 4. DERİN TEST: Form Submit Flowları
// ============================================================

test('C7-08: Listing-new form multi-step flow', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/listing/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Step 1: Fill basic info
  const titleInput = await page.$('input[name="title"], input[placeholder*="Başlık"], input[placeholder*="başlık"], input:first-of-type');
  if (titleInput) {
    await titleInput.fill('Test İlan Başlığı - Döngü 7');
  }

  const descInput = await page.$('textarea, input[name="description"]');
  if (descInput) {
    await descInput.fill('Bu bir test açıklamasıdır. Güzel bir daire, merkezi konumda.');
  }

  // Try city dropdown
  const citySelect = await page.$('select[name="city"], [role="combobox"]');
  if (citySelect) {
    await citySelect.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-listing-new-step1.png`, fullPage: true });

  // Try clicking Devam Et
  const continueBtn = await page.$('button:has-text("Devam"), button:has-text("devam"), button:has-text("İleri")');
  if (continueBtn) {
    await continueBtn.click();
    await page.waitForTimeout(1500);
  }

  const step1Content = await page.evaluate(() => document.body.innerText?.substring(0, 1500));
  console.log('LISTING-NEW STEP1:', step1Content);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-listing-new-step1-after.png`, fullPage: true });
});

test('C7-09: Events-new form submit attempt', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Fill event name
  const nameInput = await page.$('input[name="title"], input[name="name"], input[placeholder*="Etkinlik"], input[placeholder*="adı"]');
  if (nameInput) {
    await nameInput.fill('Test Etkinliği - Döngü 7');
  }

  // Try description
  const descInput = await page.$('textarea');
  if (descInput) {
    await descInput.fill('Bu bir test etkinliğidir. Kahve buluşması için herkesi bekliyoruz.');
  }

  // Try submit
  const submitBtn = await page.$('button:has-text("Oluştur"), button:has-text("oluştur"), button:has-text("Paylaş"), button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }

  // Check for validation errors or success
  const pageContent = await page.evaluate(() => document.body.innerText?.substring(0, 1500));
  console.log('EVENTS-NEW SUBMIT:', pageContent);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-events-new-submit.png`, fullPage: true });
});

test('C7-10: Community-new post attempt', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/community/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Fill content
  const textarea = await page.$('textarea');
  if (textarea) {
    await textarea.fill('Bu bir test gönderisidir! Barcelona harika bir şehir 🌞 #ErasmusHayati');
  }

  // Click a hashtag button
  const hashtagBtn = await page.$('button:has-text("#")');
  if (hashtagBtn) {
    await hashtagBtn.click();
    await page.waitForTimeout(500);
  }

  // Try Paylaş
  const shareBtn = await page.$('button:has-text("Paylaş"), button:has-text("paylaş"), button[type="submit"]');
  if (shareBtn) {
    await shareBtn.click();
    await page.waitForTimeout(2000);
  }

  const pageContent = await page.evaluate(() => document.body.innerText?.substring(0, 1500));
  console.log('COMMUNITY-NEW POST:', pageContent);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-community-new-post.png`, fullPage: true });
});

// ============================================================
// 5. DERİN TEST: Buton Etkileşimleri
// ============================================================

test('C7-11: Settings toggle interactions', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/settings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Get initial toggle states
  const initialToggles = await page.$$eval('button[role="switch"], input[type="checkbox"]', els =>
    els.map(el => ({
      checked: el.getAttribute('aria-checked') || (el as HTMLInputElement).checked,
      label: el.getAttribute('aria-label') || el.closest('label')?.textContent?.trim() || el.closest('div')?.textContent?.trim()?.substring(0, 50),
    }))
  );
  console.log('SETTINGS INITIAL TOGGLES:', JSON.stringify(initialToggles));

  // Try toggling dark theme
  const darkThemeToggle = await page.$('button[role="switch"]:near(:text("Karanlık")), button[role="switch"]:near(:text("Tema"))');
  if (darkThemeToggle) {
    await darkThemeToggle.click();
    await page.waitForTimeout(1000);
    console.log('DARK THEME TOGGLED');
  }

  // Try changing language
  const langSelect = await page.$('select:near(:text("Dil")), [role="combobox"]:near(:text("Dil"))');
  if (langSelect) {
    console.log('LANGUAGE SELECT FOUND');
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-settings-toggled.png`, fullPage: true });

  // Toggle back
  if (darkThemeToggle) {
    await darkThemeToggle.click();
    await page.waitForTimeout(500);
  }
});

test('C7-12: Notifications mark all read', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/notifications`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Count unread before
  const unreadBefore = await page.$$eval('.bg-orange-500, .bg-red-500, [class*="unread"]', els => els.length);
  console.log('UNREAD BEFORE:', unreadBefore);

  // Click "Tümünü Okundu İşaretle"
  const markAllBtn = await page.$('button:has-text("Tümünü Okundu"), button:has-text("Okundu İşaretle")');
  if (markAllBtn) {
    await markAllBtn.click();
    await page.waitForTimeout(1500);
  }

  // Count unread after
  const unreadAfter = await page.$$eval('.bg-orange-500, .bg-red-500, [class*="unread"]', els => els.length);
  console.log('UNREAD AFTER:', unreadAfter);

  // Test filter
  const unreadFilter = await page.$('button:has-text("Okunmamış")');
  if (unreadFilter) {
    await unreadFilter.click();
    await page.waitForTimeout(1000);
  }

  const pageContent = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText?.substring(0, 1000);
  });
  console.log('NOTIFICATIONS AFTER MARK ALL:', pageContent);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-notifications-marked.png`, fullPage: true });
});

test('C7-13: Favorites karşılaştır button flow', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/favorites`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Look for "Karşılaştır" button
  const compareBtn = await page.$('button:has-text("Karşılaştır"), a:has-text("Karşılaştır")');
  if (compareBtn) {
    console.log('KARSILASTIR BUTTON FOUND');
    await compareBtn.click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    const url = page.url();
    console.log('AFTER KARSILASTIR URL:', url);
  } else {
    console.log('KARSILASTIR BUTTON NOT FOUND');
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-favorites-compare-flow.png`, fullPage: true });
});

// ============================================================
// 6. DERİN TEST: Budget Para Birimi & Etkileşim
// ============================================================

test('C7-14: Budget currency and slider interaction', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/budget`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Check currency display
  const currencyTexts = await page.$$eval('*', els =>
    els.map(el => el.textContent?.trim()).filter(t => t && (t.includes('₺') || t.includes('TL') || t.includes('€') || t.includes('EUR') || t.includes('USD')) && t.length < 50)
  );
  console.log('BUDGET CURRENCIES:', JSON.stringify(currencyTexts.slice(0, 15)));

  // Check if city dropdown exists and what's selected
  const citySelect = await page.$('select, [role="combobox"]');
  if (citySelect) {
    const cityValue = await citySelect.textContent();
    console.log('BUDGET CITY:', cityValue);
  }

  // Check slider values
  const sliders = await page.$$eval('input[type="range"]', els =>
    els.map(el => ({
      min: el.min,
      max: el.max,
      value: el.value,
      name: el.name || el.getAttribute('aria-label'),
    }))
  );
  console.log('BUDGET SLIDERS:', JSON.stringify(sliders));

  // Check total
  const totalText = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText;
  });
  const totalMatch = totalText?.match(/Toplam.*?(\d[\d.,]+)/);
  console.log('BUDGET TOTAL:', totalMatch?.[0]);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-budget.png`, fullPage: true });
});

// ============================================================
// 7. DERİN TEST: Search Filtre Etkileşimi
// ============================================================

test('C7-15: Search filter deep interaction', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Count listings before filter
  const listingsBefore = await page.$$eval('a[href*="/listing/"]', els => els.length);
  console.log('LISTINGS BEFORE FILTER:', listingsBefore);

  // Try selecting a filter (room type)
  const selects = await page.$$('select');
  if (selects.length > 0) {
    const options = await selects[0].$$eval('option', opts => opts.map(o => ({ value: o.value, text: o.textContent })));
    console.log('FILTER OPTIONS:', JSON.stringify(options));

    if (options.length > 1) {
      await selects[0].selectOption(options[1].value);
      await page.waitForTimeout(1500);

      const listingsAfter = await page.$$eval('a[href*="/listing/"]', els => els.length);
      console.log('LISTINGS AFTER FILTER:', listingsAfter);
    }
  }

  // Check search input
  const searchInput = await page.$('input[type="search"], input[type="text"], input[placeholder*="Ara"]');
  if (searchInput) {
    await searchInput.fill('Berlin');
    await page.waitForTimeout(1500);

    const listingsAfterSearch = await page.$$eval('a[href*="/listing/"]', els => els.length);
    console.log('LISTINGS AFTER SEARCH:', listingsAfterSearch);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-search-filtered.png`, fullPage: true });
});

// ============================================================
// 8. DERİN TEST: Listing Detail Etkileşimler
// ============================================================

test('C7-16: Listing detail carousel and interactions', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/listing/1`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Check carousel counter
  const carouselCounter = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('*'));
    return els.map(el => el.textContent?.trim()).filter(t => t && /\d+\/\d+/.test(t) && t.length < 10);
  });
  console.log('CAROUSEL COUNTER:', JSON.stringify(carouselCounter));

  // Try next button on carousel
  const nextBtn = await page.$('button[aria-label*="next"], button[aria-label*="Next"], button:has-text(">"), button:has-text("›"), .carousel-next');
  if (nextBtn) {
    await nextBtn.click();
    await page.waitForTimeout(500);
    const counterAfter = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('*'));
      return els.map(el => el.textContent?.trim()).filter(t => t && /\d+\/\d+/.test(t) && t.length < 10);
    });
    console.log('CAROUSEL AFTER NEXT:', JSON.stringify(counterAfter));
  }

  // Check "Rezervasyon Yap" button
  const bookBtn = await page.$('button:has-text("Rezervasyon"), a:has-text("Rezervasyon")');
  console.log('REZERVASYON BUTTON:', bookBtn ? 'FOUND' : 'NOT FOUND');

  // Check reviews section
  const reviewCount = await page.$$eval('[class*="review"], [class*="yorum"], [class*="comment"]', els => els.length);
  console.log('REVIEW ELEMENTS:', reviewCount);

  // Check similar listings
  const similarListings = await page.$$eval('a[href*="/listing/"]:not([href="/listing/1"])', els => els.length);
  console.log('SIMILAR LISTINGS:', similarListings);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-listing-detail-interaction.png`, fullPage: true });
});

// ============================================================
// 9. DERİN TEST: Host Earnings Re-check
// ============================================================

test('C7-17: Host earnings currencySymbol re-check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/earnings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const pageContent = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText;
  });

  const hasCurrencySymbolBug = pageContent?.includes('{currencySymbol}');
  console.log('HOST EARNINGS CONTENT:', pageContent?.substring(0, 1000));
  console.log('HAS {currencySymbol} BUG:', hasCurrencySymbolBug);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-host-earnings.png`, fullPage: true });
});

// ============================================================
// 10. DERİN TEST: Events Detail Katıl/Ayrıl Butonu
// ============================================================

test('C7-18: Events detail join/leave button', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events/1`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const buttons = await page.$$eval('button', btns =>
    btns.map(b => ({
      text: b.textContent?.trim(),
      disabled: b.disabled,
      visible: b.offsetParent !== null,
    }))
  );

  const hasJoin = buttons.some(b => b.text?.includes('Katıl'));
  const hasLeave = buttons.some(b => b.text?.includes('Ayrıl'));

  console.log('EVENT BUTTONS:', JSON.stringify(buttons.filter(b => b.text && b.text.length < 30)));
  console.log('HAS JOIN:', hasJoin, 'HAS LEAVE:', hasLeave);

  // If "Ayrıl" exists, click it and check if "Katıl" appears
  if (hasLeave) {
    const leaveBtn = await page.$('button:has-text("Ayrıl")');
    if (leaveBtn) {
      await leaveBtn.click();
      await page.waitForTimeout(2000);

      const buttonsAfter = await page.$$eval('button', btns =>
        btns.map(b => b.textContent?.trim()).filter(t => t && t.length < 30)
      );
      console.log('BUTTONS AFTER LEAVE:', JSON.stringify(buttonsAfter));
    }
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-events-detail.png`, fullPage: true });
});

// ============================================================
// 11. DERİN TEST: Messages Mesaj Gönderme
// ============================================================

test('C7-19: Messages send message flow', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/messages`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Click first conversation
  const firstConv = await page.$('a[href*="/messages/"], div[class*="conversation"], li');
  if (firstConv) {
    await firstConv.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  }

  // Find message input
  const msgInput = await page.$('input[placeholder*="Mesaj"], textarea[placeholder*="Mesaj"], input[placeholder*="mesaj"]');
  if (msgInput) {
    await msgInput.fill('Test mesajı - Döngü 7 🎉');
    console.log('MESSAGE INPUT FILLED');

    // Find send button
    const sendBtn = await page.$('button[aria-label*="Gönder"], button[aria-label*="gönder"], button:has-text("Gönder")');
    if (sendBtn) {
      console.log('SEND BUTTON FOUND');
    }
  } else {
    console.log('MESSAGE INPUT NOT FOUND');
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-messages-send.png`, fullPage: true });
});

// ============================================================
// 12. DERİN TEST: Mentors Detail + Mesaj Gönder
// ============================================================

test('C7-20: Mentors detail and message button', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/mentors/1`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const pageContent = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText?.substring(0, 1500);
  });
  console.log('MENTOR DETAIL:', pageContent);

  // Check Mesaj Gönder button
  const msgBtn = await page.$('button:has-text("Mesaj"), a:has-text("Mesaj")');
  console.log('MESAJ GONDER BUTTON:', msgBtn ? 'FOUND' : 'NOT FOUND');

  if (msgBtn) {
    await msgBtn.click();
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    console.log('AFTER MESAJ CLICK URL:', urlAfter);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-mentors-detail.png`, fullPage: true });
});

// ============================================================
// 13. PLACEHOLDER / YAKIN DA TARAMASI
// ============================================================

test('C7-21: Placeholder scan all pages', async ({ page }) => {
  await login(page);

  const pagesToScan = [
    '/', '/search', '/community', '/events', '/roommates',
    '/mentors', '/budget', '/booking', '/favorites', '/compare',
    '/profile', '/settings', '/notifications', '/messages',
    '/host/bookings', '/host/calendar', '/host/earnings'
  ];

  const results: Record<string, string[]> = {};

  for (const path of pagesToScan) {
    await page.goto(`${BASE}${path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const suspiciousTexts = await page.$$eval('*', els =>
      els.map(el => el.textContent?.trim())
        .filter(t => t && t.length < 100 && (
          /yakında/i.test(t) ||
          /coming soon/i.test(t) ||
          /placeholder/i.test(t) ||
          /lorem ipsum/i.test(t) ||
          /TODO/i.test(t) ||
          /\{[a-zA-Z]+\}/.test(t) || // template variables like {currencySymbol}
          /undefined|null|NaN/.test(t)
        ))
    );

    if (suspiciousTexts.length > 0) {
      results[path] = suspiciousTexts;
    }
  }

  console.log('PLACEHOLDER SCAN RESULTS:', JSON.stringify(results, null, 2));

  if (Object.keys(results).length === 0) {
    console.log('ALL CLEAR — No placeholder/yakında/template text found');
  }
});

// ============================================================
// 14. CONSOLE ERROR TARAMASI
// ============================================================

test('C7-22: Console error scan', async ({ page }) => {
  await login(page);

  const errors: Record<string, string[]> = {};

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const url = page.url();
      const path = new URL(url).pathname;
      if (!errors[path]) errors[path] = [];
      errors[path].push(msg.text()?.substring(0, 200));
    }
  });

  const pagesToCheck = [
    '/favorites', '/compare', '/booking', '/profile/bookings',
    '/roommates', '/host/earnings', '/search/map', '/events/1',
    '/community', '/mentors', '/budget', '/notifications'
  ];

  for (const path of pagesToCheck) {
    await page.goto(`${BASE}${path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  }

  console.log('CONSOLE ERRORS:', JSON.stringify(errors, null, 2));

  if (Object.keys(errors).length === 0) {
    console.log('ALL CLEAR — No console errors');
  }
});

// ============================================================
// 15. DERİN TEST: Profile Menü Linkleri Çalışıyor mu?
// ============================================================

test('C7-23: Profile menu link verification', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const links = await page.$$eval('a', els =>
    els.map(el => ({
      href: el.href,
      text: el.textContent?.trim()?.substring(0, 50),
    })).filter(l => l.href && l.text)
  );

  console.log('PROFILE LINKS:', JSON.stringify(links));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-profile-menu.png`, fullPage: true });
});

// ============================================================
// 16. DERİN TEST: City Detail Tablar & Chat
// ============================================================

test('C7-24: City detail tabs interaction', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/city/1`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Get all tab buttons
  const tabs = await page.$$eval('button[role="tab"], [class*="tab"]', els =>
    els.map(el => ({
      text: el.textContent?.trim(),
      selected: el.getAttribute('aria-selected'),
    }))
  );
  console.log('CITY TABS:', JSON.stringify(tabs));

  // Click each tab
  const tabButtons = await page.$$('button[role="tab"], [class*="tab"]');
  for (let i = 0; i < Math.min(tabButtons.length, 4); i++) {
    await tabButtons[i].click();
    await page.waitForTimeout(500);
  }

  // Check for "Sohbet" or chat link
  const chatLink = await page.$('a[href*="/chat"], button:has-text("Sohbet")');
  console.log('CITY CHAT LINK:', chatLink ? 'FOUND' : 'NOT FOUND');

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-city-detail.png`, fullPage: true });
});

// ============================================================
// 17. DERİN TEST: Host Calendar Tarih Tıklama
// ============================================================

test('C7-25: Host calendar date interaction', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/calendar`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Check month navigation
  const prevBtn = await page.$('button:has-text("<"), button[aria-label*="önceki"], button[aria-label*="prev"]');
  const nextBtn = await page.$('button:has-text(">"), button[aria-label*="sonraki"], button[aria-label*="next"]');

  console.log('PREV BUTTON:', prevBtn ? 'FOUND' : 'NOT FOUND');
  console.log('NEXT BUTTON:', nextBtn ? 'FOUND' : 'NOT FOUND');

  // Click next month
  if (nextBtn) {
    await nextBtn.click();
    await page.waitForTimeout(1000);
  }

  // Check month title changed
  const monthTitle = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const monthMatch = main.innerText?.match(/(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s*\d{4}/);
    return monthMatch?.[0];
  });
  console.log('CURRENT MONTH:', monthTitle);

  // Try clicking a date cell
  const dateCells = await page.$$('td, [class*="day"], [class*="cell"]');
  if (dateCells.length > 10) {
    await dateCells[15].click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-host-calendar.png`, fullPage: true });
});
