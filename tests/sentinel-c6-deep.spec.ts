import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

// Login helper
async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("giriş"), button:has-text("Login")').first();
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }
}

// =====================================================
// GRUP 1: KRİTİK REGRESYON — FİYAT 100x KONTROLÜ
// =====================================================

test('C6-01: Favorites fiyat 100x regresyon + thumbnail', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/favorites`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-favorites.png`, fullPage: true });

  const pageText = await page.textContent('body');
  const priceMatches = pageText?.match(/[\d.,]+\s*(TL|₺|€)/g) || [];
  console.log('FAVORITES - Fiyatlar:', JSON.stringify(priceMatches));

  const has100x = priceMatches.some(p => {
    const num = parseFloat(p.replace(/[^\d]/g, ''));
    return num >= 10000;
  });
  console.log('FAVORITES - 100x bug var mi:', has100x);

  const imgs = page.locator('img');
  const imgCount = await imgs.count();
  let svgPlaceholderCount = 0;
  let realPhotoCount = 0;
  for (let i = 0; i < imgCount; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    if (src.includes('data:image/svg+xml') || src.includes('placeholder')) {
      svgPlaceholderCount++;
    } else if (src.startsWith('http') || src.startsWith('/')) {
      realPhotoCount++;
    }
  }
  console.log(`FAVORITES - Images: ${imgCount} total, ${svgPlaceholderCount} SVG placeholder, ${realPhotoCount} real`);
});

test('C6-02: Compare fiyat 100x regresyon + thumbnail', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/compare`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-compare.png`, fullPage: true });

  const pageText = await page.textContent('body');
  const priceMatches = pageText?.match(/[\d.,]+\s*(TL|₺|€)/g) || [];
  console.log('COMPARE - Fiyatlar:', JSON.stringify(priceMatches));

  const has100x = priceMatches.some(p => {
    const num = parseFloat(p.replace(/[^\d]/g, ''));
    return num >= 10000;
  });
  console.log('COMPARE - 100x bug var mi:', has100x);

  const imgs = page.locator('img');
  const imgCount = await imgs.count();
  let svgCount = 0;
  for (let i = 0; i < imgCount; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    if (src.includes('data:image/svg+xml') || src.includes('placeholder')) svgCount++;
  }
  console.log(`COMPARE - SVG placeholders: ${svgCount}/${imgCount}`);
});

test('C6-03: Listing detail fiyat 100x + benzer ilanlar', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const listingLink = page.locator('a[href*="/listing/"]').first();
  if (await listingLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    const href = await listingLink.getAttribute('href');
    await page.goto(`${BASE}${href}`);
  } else {
    await page.goto(`${BASE}/listing/1`);
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-listing-detail.png`, fullPage: true });

  const pageText = await page.textContent('body');
  const priceMatches = pageText?.match(/[\d.,]+\s*(TL|₺|€|\/ay)/g) || [];
  console.log('LISTING DETAIL - Fiyatlar:', JSON.stringify(priceMatches));

  const has100x = priceMatches.some(p => {
    const num = parseFloat(p.replace(/[^\d]/g, ''));
    return num >= 10000;
  });
  console.log('LISTING DETAIL - 100x bug var mi:', has100x);

  const imgs = page.locator('img');
  const imgCount = await imgs.count();
  let realCount = 0;
  for (let i = 0; i < imgCount; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    if (src.startsWith('http') && !src.includes('svg+xml')) realCount++;
  }
  console.log(`LISTING DETAIL - Gercek fotograf: ${realCount}/${imgCount}`);
});

test('C6-04: Booking fiyat 100x + thumbnail', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/booking`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-booking.png`, fullPage: true });

  const pageText = await page.textContent('body');
  const priceMatches = pageText?.match(/[\d.,]+\s*(TL|₺|€)/g) || [];
  console.log('BOOKING - Fiyatlar:', JSON.stringify(priceMatches));

  const has100x = priceMatches.some(p => {
    const num = parseFloat(p.replace(/[^\d]/g, ''));
    return num >= 10000;
  });
  console.log('BOOKING - 100x bug var mi:', has100x);
});

test('C6-05: Profile bookings fiyat 100x', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/bookings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-profile-bookings.png`, fullPage: true });

  const pageText = await page.textContent('body');
  const priceMatches = pageText?.match(/[\d.,]+\s*(TL|₺|€)/g) || [];
  console.log('PROFILE BOOKINGS - Fiyatlar:', JSON.stringify(priceMatches));

  const has100x = priceMatches.some(p => {
    const num = parseFloat(p.replace(/[^\d]/g, ''));
    return num >= 10000;
  });
  console.log('PROFILE BOOKINGS - 100x bug var mi:', has100x);
});

test('C6-06: Search map marker fiyat 100x + zoom level', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search/map`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-search-map.png`, fullPage: true });

  const pageText = await page.textContent('body');
  const priceMatches = pageText?.match(/[\d.,]+\s*(TL|₺|€)/g) || [];
  console.log('SEARCH MAP - Marker fiyatlar:', JSON.stringify(priceMatches));

  const has100x = priceMatches.some(p => {
    const num = parseFloat(p.replace(/[^\d]/g, ''));
    return num >= 10000;
  });
  console.log('SEARCH MAP - 100x bug var mi:', has100x);

  const tiles = page.locator('img[src*="tile.openstreetmap"]');
  const tileCount = await tiles.count();
  if (tileCount > 0) {
    const firstTileSrc = await tiles.first().getAttribute('src') || '';
    console.log('MAP - Tile URL sample:', firstTileSrc);
    const zoomMatch = firstTileSrc.match(/\/(\d+)\/\d+\/\d+/);
    if (zoomMatch) console.log('MAP - Zoom level:', zoomMatch[1]);
  }

  const markers = page.locator('.leaflet-marker-icon, .leaflet-marker-pane img, [class*="marker"]');
  const markerCount = await markers.count();
  console.log('MAP - Marker sayisi:', markerCount);
});

// =====================================================
// GRUP 2: DEVAM EDEN BUGLAR
// =====================================================

test('C6-07: Host earnings currencySymbol bug', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/earnings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-host-earnings.png`, fullPage: true });

  const pageText = await page.textContent('body') || '';
  const hasCurrencySymbolBug = pageText.includes('{currencySymbol}');
  console.log('HOST EARNINGS - currencySymbol bug:', hasCurrencySymbolBug);
  console.log('HOST EARNINGS - EUR/€ var mi:', pageText.includes('€') || pageText.includes('EUR'));
  console.log('HOST EARNINGS - TL var mi:', pageText.includes('₺') || pageText.includes('TL'));
});

test('C6-08: Roommates detail foto + uyum kontrolu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const mainText = await page.textContent('body') || '';
  const uyumMatch = mainText.match(/(\d+)%\s*Uyum/);
  console.log('ROOMMATES MAIN - Uyum:', uyumMatch ? uyumMatch[0] : 'Bulunamadi');

  const detailLink = page.locator('a[href*="/roommates/"]').first();
  if (await detailLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await detailLink.click();
    await page.waitForLoadState('networkidle');
  } else {
    await page.goto(`${BASE}/roommates/1`);
    await page.waitForLoadState('networkidle');
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-roommates-detail.png`, fullPage: true });

  const detailText = await page.textContent('body') || '';
  const hasUyumBilgisiYok = detailText.includes('Uyum bilgisi yok');
  const hasUyumPercent = /\d+%\s*Uyum/.test(detailText);
  console.log('ROOMMATES DETAIL - Uyum bilgisi yok:', hasUyumBilgisiYok);
  console.log('ROOMMATES DETAIL - Uyum % var mi:', hasUyumPercent);

  const imgs = page.locator('img');
  const imgCount = await imgs.count();
  let realPhotos = 0;
  let placeholders = 0;
  for (let i = 0; i < imgCount; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    if (src.includes('data:image/svg+xml') || src.includes('placeholder') || src.length < 10) {
      placeholders++;
    } else if (src.startsWith('http') || src.startsWith('/')) {
      realPhotos++;
    }
  }
  console.log(`ROOMMATES DETAIL - Photos: ${realPhotos} real, ${placeholders} placeholder`);
});

test('C6-09: Events detail Katil butonu kontrolu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const eventLink = page.locator('a[href*="/events/"]').first();
  if (await eventLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    const href = await eventLink.getAttribute('href');
    await page.goto(`${BASE}${href}`);
  } else {
    await page.goto(`${BASE}/events/1`);
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-events-detail.png`, fullPage: true });

  const pageText = await page.textContent('body') || '';
  const hasKatil = pageText.includes('Katıl');
  const hasAyril = pageText.includes('Ayrıl');
  console.log('EVENTS DETAIL - Katil butonu:', hasKatil);
  console.log('EVENTS DETAIL - Ayril butonu:', hasAyril);

  const buttons = page.locator('button');
  const btnCount = await buttons.count();
  const btnTexts: string[] = [];
  for (let i = 0; i < btnCount; i++) {
    const t = await buttons.nth(i).textContent();
    if (t && t.trim()) btnTexts.push(t.trim());
  }
  console.log('EVENTS DETAIL - Butonlar:', JSON.stringify(btnTexts));
});

// =====================================================
// GRUP 3: NAVİGASYON BOŞLUKLARI
// =====================================================

test('C6-10: Ana sayfa roommates & host navigasyon kontrolu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-home.png`, fullPage: true });

  const pageText = await page.textContent('body') || '';

  const roommateLinks = page.locator('a[href*="roommate"], a[href*="/roommates"]');
  const roommateCount = await roommateLinks.count();
  console.log('HOME - Roommate link sayisi:', roommateCount);

  const hasRoommateText = pageText.includes('Oda Arkadaşı') || pageText.includes('oda arkadaşı') || pageText.includes('Roommate');
  console.log('HOME - Roommate text var mi:', hasRoommateText);

  const hostLinks = page.locator('a[href*="/host"]');
  const hostCount = await hostLinks.count();
  console.log('HOME - Host link sayisi:', hostCount);

  const hasHostText = pageText.includes('Ev Sahibi') || pageText.includes('ev sahibi') || pageText.includes('Host');
  console.log('HOME - Host text var mi:', hasHostText);

  await page.goto(`${BASE}/profile`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-profile.png`, fullPage: true });

  const profileRoommate = page.locator('a[href*="roommate"]');
  const profileHost = page.locator('a[href*="/host"]');
  console.log('PROFILE - Roommate link:', await profileRoommate.count());
  console.log('PROFILE - Host link:', await profileHost.count());
});

// =====================================================
// GRUP 4: DERİN TEST — Form Doldurma & Submit
// =====================================================

test('C6-11: Listing new tam form doldurma flow', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/listing/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const titleInput = page.locator('input[name="title"], input[placeholder*="Başlık"], input[placeholder*="başlık"]').first();
  if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await titleInput.fill('Test Ilani - Dongu 6');
  }

  const descInput = page.locator('textarea[name="description"], textarea[placeholder*="Açıklama"], textarea').first();
  if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await descInput.fill('Bu bir test ilanidir. Dongu 6 deep test.');
  }

  const citySelect = page.locator('select[name="city"], [role="combobox"]').first();
  if (await citySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
    try {
      await citySelect.selectOption({ index: 1 });
    } catch {
      await citySelect.click();
      await page.waitForTimeout(500);
      const option = page.locator('[role="option"], li').first();
      if (await option.isVisible({ timeout: 1000 }).catch(() => false)) {
        await option.click();
      }
    }
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-listing-new-filled.png`, fullPage: true });

  const continueBtn = page.locator('button:has-text("Devam"), button:has-text("devam"), button:has-text("İleri")').first();
  if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await continueBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-listing-new-step2.png`, fullPage: true });
    console.log('LISTING NEW - Adim 2 gecildi');
  }
  console.log('LISTING NEW - Form doldurma testi tamamlandi');
});

test('C6-12: Community new gonderi olusturma flow', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/community/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
    await textarea.fill('Dongu 6 test gonderisi! Barcelona harika bir sehir');
  }

  const hashtagBtns = page.locator('button:has-text("#")');
  const hashtagCount = await hashtagBtns.count();
  console.log('COMMUNITY NEW - Hashtag buton sayisi:', hashtagCount);

  if (hashtagCount > 0) {
    await hashtagBtns.first().click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-community-new-filled.png`, fullPage: true });

  const shareBtn = page.locator('button:has-text("Paylaş"), button:has-text("paylaş")').first();
  const shareVisible = await shareBtn.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('COMMUNITY NEW - Paylas butonu gorunur:', shareVisible);
});

test('C6-13: Events new etkinlik olusturma flow', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const nameInput = page.locator('input[name="title"], input[placeholder*="Etkinlik"], input[placeholder*="adı"]').first();
  if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nameInput.fill('Dongu 6 Test Etkinligi');
  }

  const inputs = page.locator('input:visible, select:visible, textarea:visible');
  const inputCount = await inputs.count();
  console.log('EVENTS NEW - Input sayisi:', inputCount);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-events-new-filled.png`, fullPage: true });

  const submitBtn = page.locator('button:has-text("Oluştur"), button:has-text("oluştur"), button[type="submit"]').first();
  const submitVisible = await submitBtn.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('EVENTS NEW - Olustur butonu:', submitVisible);
});

// =====================================================
// GRUP 5: FİLTRE & ETKİLEŞİM DERİN TEST
// =====================================================

test('C6-14: Search filtre degistirme + sonuc kontrolu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const listingLinks = page.locator('a[href*="/listing/"]');
  const initialCount = await listingLinks.count();
  console.log('SEARCH - Ilk ilan sayisi:', initialCount);

  const pageText = await page.textContent('body') || '';
  const priceMatches = pageText.match(/[\d.,]+\s*(TL|₺)/g) || [];
  console.log('SEARCH - Fiyatlar:', JSON.stringify(priceMatches.slice(0, 10)));

  const has100x = priceMatches.some(p => {
    const num = parseFloat(p.replace(/[^\d]/g, ''));
    return num >= 10000;
  });
  console.log('SEARCH - 100x bug var mi:', has100x);

  const filterSelect = page.locator('select').first();
  if (await filterSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
    const options = await filterSelect.locator('option').allTextContents();
    console.log('SEARCH - Filtre secenekleri:', JSON.stringify(options));

    if (options.length > 1) {
      await filterSelect.selectOption({ index: 1 });
      await page.waitForTimeout(1500);
      const newCount = await listingLinks.count();
      console.log('SEARCH - Filtre sonrasi ilan sayisi:', newCount);
    }
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-search-filtered.png`, fullPage: true });
});

test('C6-15: Events kategori filtre + gorunum degistirme', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const categoryBtns = page.locator('button:has-text("Kahve"), button:has-text("Spor"), button:has-text("Dil"), button:has-text("Tur"), button:has-text("Tümü"), button:has-text("Parti"), button:has-text("Yemek")');
  const catCount = await categoryBtns.count();
  console.log('EVENTS - Kategori buton sayisi:', catCount);

  const kahveBtn = page.locator('button:has-text("Kahve")').first();
  if (await kahveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await kahveBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-events-filtered.png`, fullPage: true });

  const tumuBtn = page.locator('button:has-text("Tümü")').first();
  if (await tumuBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await tumuBtn.click();
    await page.waitForTimeout(1000);
  }
});

test('C6-16: Budget slider degistirme + toplam guncelleme', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/budget`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const sliders = page.locator('input[type="range"]');
  const sliderCount = await sliders.count();
  console.log('BUDGET - Slider sayisi:', sliderCount);

  const pageText1 = await page.textContent('body') || '';
  const totalMatch1 = pageText1.match(/Toplam[:\s]*[\d.,]+/);
  console.log('BUDGET - Ilk toplam:', totalMatch1 ? totalMatch1[0] : 'Bulunamadi');

  if (sliderCount > 1) {
    const kiraSlider = sliders.nth(1);
    try {
      await kiraSlider.fill('800');
      await page.waitForTimeout(1000);
    } catch {
      // ignore
    }
  }

  const pageText2 = await page.textContent('body') || '';
  const totalMatch2 = pageText2.match(/Toplam[:\s]*[\d.,]+/);
  console.log('BUDGET - Degisiklik sonrasi toplam:', totalMatch2 ? totalMatch2[0] : 'Bulunamadi');

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-budget.png`, fullPage: true });
});

test('C6-17: Settings toggle degistirme', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/settings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const toggles = page.locator('[role="switch"], input[type="checkbox"], button[class*="toggle"]');
  const toggleCount = await toggles.count();
  console.log('SETTINGS - Toggle sayisi:', toggleCount);

  if (toggleCount > 0) {
    const firstToggle = toggles.first();
    try {
      const beforeState = await firstToggle.getAttribute('aria-checked');
      console.log('SETTINGS - Ilk toggle onceki durum:', beforeState);
      await firstToggle.click();
      await page.waitForTimeout(500);
      const afterState = await firstToggle.getAttribute('aria-checked');
      console.log('SETTINGS - Ilk toggle sonraki durum:', afterState);
    } catch {
      console.log('SETTINGS - Toggle tiklanamadi');
    }
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-settings.png`, fullPage: true });
});

// =====================================================
// GRUP 6: EMPTY STATE & EDGE CASE
// =====================================================

test('C6-18: Booking success sayfasi kontrolu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/booking/success`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-booking-success.png`, fullPage: true });

  const pageText = await page.textContent('body') || '';
  const hasSuccess = pageText.includes('Tebrik') || pageText.includes('tebrik') || pageText.includes('Başarı') || pageText.includes('başarı') || pageText.includes('Onay');
  const hasReservasyonlarim = pageText.includes('Rezervasyonlarım') || pageText.includes('rezervasyonlarım');
  console.log('BOOKING SUCCESS - Tebrik mesaji var mi:', hasSuccess);
  console.log('BOOKING SUCCESS - Reservasyonlarim sayfasi mi:', hasReservasyonlarim);
  console.log('BOOKING SUCCESS - URL:', page.url());
});

test('C6-19: Host bookings empty state', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/bookings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-host-bookings.png`, fullPage: true });

  const pageText = await page.textContent('body') || '';
  const hasEmptyState = pageText.includes('henüz') || pageText.includes('talep yok') || pageText.includes('boş');
  console.log('HOST BOOKINGS - Empty state var mi:', hasEmptyState);

  const tabs = page.locator('button:has-text("Bekleyen"), button:has-text("Onaylanan"), button:has-text("Reddedilen"), button:has-text("Geçmiş")');
  const tabCount = await tabs.count();
  console.log('HOST BOOKINGS - Filtre tab sayisi:', tabCount);
});

// =====================================================
// GRUP 7: CONSOLE ERROR & PLACEHOLDER TARAMASI
// =====================================================

test('C6-20: Console error taramasi (10 sayfa)', async ({ page }) => {
  await login(page);

  const errorPages: Record<string, string[]> = {};
  const pagePaths = [
    '/favorites', '/compare', '/booking', '/profile/bookings',
    '/search/map', '/host/earnings', '/roommates', '/events',
    '/community', '/notifications'
  ];

  for (const p of pagePaths) {
    const errors: string[] = [];
    const handler = (msg: any) => {
      if (msg.type() === 'error') errors.push(msg.text());
    };
    page.on('console', handler);

    await page.goto(`${BASE}${p}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    if (errors.length > 0) {
      errorPages[p] = errors;
    }

    page.removeListener('console', handler);
  }

  console.log('CONSOLE ERRORS:', JSON.stringify(errorPages));
  console.log('Sayfa sayisi with errors:', Object.keys(errorPages).length);
});

test('C6-21: Placeholder Yakinda taramasi (12 sayfa)', async ({ page }) => {
  await login(page);

  const placeholderPages: string[] = [];
  const pagePaths = [
    '/favorites', '/compare', '/booking', '/profile/bookings',
    '/search/map', '/host/earnings', '/host/bookings', '/host/calendar',
    '/roommates', '/events', '/mentors', '/budget'
  ];

  for (const p of pagePaths) {
    await page.goto(`${BASE}${p}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const text = await page.textContent('body') || '';
    const hasPlaceholder = text.includes('Yakında') || text.includes('Coming soon') ||
      text.includes('lorem ipsum') || text.includes('TODO') ||
      text.includes('Bu özellik yakında');

    if (hasPlaceholder) placeholderPages.push(p);
  }

  console.log('PLACEHOLDER bulunan sayfalar:', JSON.stringify(placeholderPages));
  console.log('Temiz sayfa sayisi:', pagePaths.length - placeholderPages.length, '/', pagePaths.length);
});

// =====================================================
// GRUP 8: REGRESYON DOĞRULAMA
// =====================================================

test('C6-22: Notifications regresyon dogrulama', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/notifications`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-notifications.png`, fullPage: true });

  const pageText = await page.textContent('body') || '';
  const hasYukleniyor = pageText.includes('Yükleniyor') || pageText.includes('yükleniyor');
  const hasNotifications = pageText.includes('bildirim') || pageText.includes('Coffee') || pageText.includes('beğeni') || pageText.includes('mesaj');
  console.log('NOTIFICATIONS - Yukleniyor spinner var mi:', hasYukleniyor);
  console.log('NOTIFICATIONS - Bildirimler yuklendi mi:', hasNotifications);

  const filterBtns = page.locator('button:has-text("Tümü"), button:has-text("Okunmamış")');
  console.log('NOTIFICATIONS - Filtre buton sayisi:', await filterBtns.count());
});

test('C6-23: Messages chat input dogrulama', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/messages`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const convLink = page.locator('a[href*="/messages/"]').first();
  if (await convLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await convLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-messages-detail.png`, fullPage: true });

  const chatInput = page.locator('input[placeholder*="Mesaj yaz"], input[placeholder*="mesaj"], textarea[placeholder*="Mesaj"]').first();
  const hasInput = await chatInput.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('MESSAGES DETAIL - Chat input var mi:', hasInput);

  const sendBtn = page.locator('button[aria-label*="Gönder"], button[aria-label*="gönder"], button:has-text("Gönder")').first();
  const hasSend = await sendBtn.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('MESSAGES DETAIL - Gonder butonu var mi:', hasSend);
});

test('C6-24: Community detail yorum yazma flow', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/community`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const allLinks = page.locator('a[href*="/community/"]');
  const linkCount = await allLinks.count();
  let detailHref = '';
  for (let i = 0; i < linkCount; i++) {
    const h = await allLinks.nth(i).getAttribute('href') || '';
    if (h !== '/community/new' && h.includes('/community/')) {
      detailHref = h;
      break;
    }
  }

  if (detailHref) {
    await page.goto(`${BASE}${detailHref}`);
  } else {
    await page.goto(`${BASE}/community/1`);
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-community-detail.png`, fullPage: true });

  const pageText = await page.textContent('body') || '';
  const hasComments = pageText.includes('yorum') || pageText.includes('Yorum');
  console.log('COMMUNITY DETAIL - Yorumlar var mi:', hasComments);

  const commentInput = page.locator('input[placeholder*="Yorum"], input[placeholder*="yorum"], textarea[placeholder*="Yorum"]').first();
  const hasCommentInput = await commentInput.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('COMMUNITY DETAIL - Yorum input var mi:', hasCommentInput);

  if (hasCommentInput) {
    await commentInput.fill('Dongu 6 test yorumu!');
    await page.waitForTimeout(500);
  }
});

test('C6-25: Mentors filtre + detay kontrolu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/mentors`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Mentor sayısı
  const mentorCards = page.locator('[class*="card"], [class*="mentor"]');
  const cardCount = await mentorCards.count();
  console.log('MENTORS - Kart sayisi:', cardCount);

  const pageText = await page.textContent('body') || '';
  const mentorNames = pageText.match(/(Maria|Carlos|García|Martínez)/g) || [];
  console.log('MENTORS - Bulunan isimler:', JSON.stringify([...new Set(mentorNames)]));

  // Şehir filtreleri
  const cityFilters = page.locator('button:has-text("Barcelona"), button:has-text("Berlin"), button:has-text("İstanbul"), button:has-text("Tümü")');
  const filterCount = await cityFilters.count();
  console.log('MENTORS - Sehir filtre sayisi:', filterCount);

  // Barcelona filtresine tıkla
  const barcelonaBtn = page.locator('button:has-text("Barcelona")').first();
  if (await barcelonaBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await barcelonaBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-mentors.png`, fullPage: true });

  // Detay sayfasına git
  const mentorLink = page.locator('a[href*="/mentors/"]').first();
  if (await mentorLink.isVisible({ timeout: 2000 }).catch(() => false)) {
    const href = await mentorLink.getAttribute('href');
    await page.goto(`${BASE}${href}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c6-mentors-detail.png`, fullPage: true });

    const detailText = await page.textContent('body') || '';
    const hasMesajGonder = detailText.includes('Mesaj Gönder') || detailText.includes('mesaj gönder');
    console.log('MENTORS DETAIL - Mesaj Gonder butonu:', hasMesajGonder);
  }
});
