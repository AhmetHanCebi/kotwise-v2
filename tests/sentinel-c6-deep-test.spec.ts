import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SD = 'tests/screenshots';

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

function prices(text: string): string[] {
  return text?.match(/[\d.,]+\s*(?:TL|₺|€|EUR)/gi) || [];
}

function has100x(priceList: string[]): boolean {
  return priceList.some(p => {
    const num = parseInt(p.replace(/[^\d]/g, ''));
    return num > 5000;
  });
}

function svgCount(page): Promise<{total:number,svg:number,real:number}> {
  return page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    let svg = 0, real = 0;
    imgs.forEach(img => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('data:image/svg') || src === '') svg++;
      else real++;
    });
    return { total: imgs.length, svg, real };
  });
}

// ===== GRUP 1: FİYAT 100x REGRESYON RE-CHECK =====

test('C6D-01: Favorites fiyat + thumbnail', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/favorites`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const text = await page.textContent('body') || '';
  const p = prices(text);
  const imgs = await svgCount(page);
  await page.screenshot({ path: `${SD}/sentinel-c6-favorites.png`, fullPage: true });
  console.log('FAVORITES prices:', JSON.stringify(p));
  console.log('FAVORITES 100x:', has100x(p));
  console.log('FAVORITES imgs:', JSON.stringify(imgs));
});

test('C6D-02: Compare fiyat + thumbnail', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/compare`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const text = await page.textContent('body') || '';
  const p = prices(text);
  const imgs = await svgCount(page);
  await page.screenshot({ path: `${SD}/sentinel-c6-compare.png`, fullPage: true });
  console.log('COMPARE prices:', JSON.stringify(p));
  console.log('COMPARE 100x:', has100x(p));
  console.log('COMPARE imgs:', JSON.stringify(imgs));
});

test('C6D-03: Listing detail fiyat', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const link = await page.$('a[href*="/listing/"]');
  const href = link ? await link.getAttribute('href') : '/listing/1';
  await page.goto(`${BASE}${href}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const text = await page.textContent('body') || '';
  const p = prices(text);
  await page.screenshot({ path: `${SD}/sentinel-c6-listing-detail.png`, fullPage: true });
  console.log('LISTING-DETAIL prices:', JSON.stringify(p));
  console.log('LISTING-DETAIL 100x:', has100x(p));
  // Check carousel
  const realPhotos = await page.evaluate(() =>
    document.querySelectorAll('img[src*="http"], img[src*="supabase"]').length
  );
  console.log('LISTING-DETAIL real photos:', realPhotos);
});

test('C6D-04: Search map fiyat + zoom', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search/map`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  const text = await page.textContent('body') || '';
  const p = prices(text);
  const tiles = await page.evaluate(() => {
    const t = document.querySelectorAll('img.leaflet-tile');
    return Array.from(t).map(i => i.getAttribute('src')||'').slice(0,3);
  });
  await page.screenshot({ path: `${SD}/sentinel-c6-search-map.png`, fullPage: true });
  console.log('MAP prices:', JSON.stringify(p));
  console.log('MAP 100x:', has100x(p));
  console.log('MAP tiles:', JSON.stringify(tiles));
});

test('C6D-05: Profile bookings fiyat + thumbnail', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/bookings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const text = await page.textContent('body') || '';
  const p = prices(text);
  const imgs = await svgCount(page);
  await page.screenshot({ path: `${SD}/sentinel-c6-profile-bookings.png`, fullPage: true });
  console.log('PROFILE-BOOKINGS prices:', JSON.stringify(p));
  console.log('PROFILE-BOOKINGS 100x:', has100x(p));
  console.log('PROFILE-BOOKINGS imgs:', JSON.stringify(imgs));
});

test('C6D-06: Booking fiyat + thumbnail', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/booking`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const text = await page.textContent('body') || '';
  const p = prices(text);
  const imgs = await svgCount(page);
  await page.screenshot({ path: `${SD}/sentinel-c6-booking.png`, fullPage: true });
  console.log('BOOKING prices:', JSON.stringify(p));
  console.log('BOOKING imgs:', JSON.stringify(imgs));
});

test('C6D-07: Homepage fiyat', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const text = await page.textContent('body') || '';
  const p = prices(text);
  await page.screenshot({ path: `${SD}/sentinel-c6-homepage.png`, fullPage: true });
  console.log('HOMEPAGE prices:', JSON.stringify(p));
  console.log('HOMEPAGE 100x:', has100x(p));
  // Check nav links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.textContent?.trim()?.substring(0,30),
      href: a.getAttribute('href'),
    })).filter(a => a.href?.startsWith('/'));
  });
  console.log('HOMEPAGE links:', JSON.stringify(links));
});

// ===== GRUP 2: DEVAM EDEN BUG RE-CHECK =====

test('C6D-08: Host earnings currencySymbol', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/earnings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const text = await page.textContent('body') || '';
  const hasBug = text.includes('{currencySymbol}');
  const p = prices(text);
  await page.screenshot({ path: `${SD}/sentinel-c6-host-earnings.png`, fullPage: true });
  console.log('HOST-EARNINGS {currencySymbol} bug:', hasBug);
  console.log('HOST-EARNINGS prices:', JSON.stringify(p));
});

test('C6D-09: Roommates uyum yüzdesi', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const text = await page.textContent('body') || '';
  const hasUyumYok = text.includes('Uyum bilgisi yok');
  const hasUyumPct = /\d+%\s*Uyum/i.test(text);
  const hasPhoto = await page.evaluate(() =>
    document.querySelectorAll('img[src*="http"], img[src*="supabase"]').length > 0
  );
  await page.screenshot({ path: `${SD}/sentinel-c6-roommates.png`, fullPage: true });
  console.log('ROOMMATES uyum yok:', hasUyumYok);
  console.log('ROOMMATES uyum %:', hasUyumPct);
  console.log('ROOMMATES hasPhoto:', hasPhoto);
  // Check buttons
  const btns = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim() || b.getAttribute('aria-label') || '').filter(Boolean)
  );
  console.log('ROOMMATES buttons:', JSON.stringify(btns));
});

test('C6D-10: Events detail katıl butonu', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const eventLink = await page.$('a[href*="/events/"]:not([href*="new"])');
  const href = eventLink ? await eventLink.getAttribute('href') : '/events/1';
  await page.goto(`${BASE}${href}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const text = await page.textContent('body') || '';
  const hasKatil = text.includes('Katıl');
  const hasAyril = text.includes('Ayrıl');
  await page.screenshot({ path: `${SD}/sentinel-c6-events-detail.png`, fullPage: true });
  console.log('EVENTS-DETAIL Katıl:', hasKatil);
  console.log('EVENTS-DETAIL Ayrıl:', hasAyril);
});

// ===== GRUP 3: DERİN TEST — FORM DOLDURMA =====

test('C6D-11: Listing new form doldur + validasyon', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/listing/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try empty submit
  const devamBtn = page.locator('button:has-text("Devam"), button:has-text("devam")').first();
  if (await devamBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await devamBtn.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: `${SD}/sentinel-c6-listing-new-validation.png`, fullPage: true });

  // Fill form
  const titleInput = page.locator('input').first();
  if (await titleInput.isVisible()) await titleInput.fill('Döngü 6 Test İlanı');

  // Check form elements
  const formInfo = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, textarea, [role="combobox"]');
    return Array.from(inputs).map(el => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type') || '',
      placeholder: el.getAttribute('placeholder') || '',
      role: el.getAttribute('role') || '',
    }));
  });
  const bodyText = await page.textContent('body') || '';
  const hasValidationError = bodyText.includes('gerekli') || bodyText.includes('zorunlu');
  await page.screenshot({ path: `${SD}/sentinel-c6-listing-new-filled.png`, fullPage: true });
  console.log('LISTING-NEW form inputs:', JSON.stringify(formInfo));
  console.log('LISTING-NEW validation errors:', hasValidationError);
});

test('C6D-12: Community new post', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/community/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible()) {
    await textarea.fill('Barcelona harika! Erasmus deneyimimi paylaşıyorum! #Erasmus2026');
  }
  const hashtagBtns = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.includes('#')).map(b => b.textContent?.trim())
  );
  await page.screenshot({ path: `${SD}/sentinel-c6-community-new.png`, fullPage: true });
  console.log('COMMUNITY-NEW hashtags:', JSON.stringify(hashtagBtns));
});

test('C6D-13: Events new form', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const formInfo = await page.evaluate(() => ({
    inputs: document.querySelectorAll('input').length,
    selects: document.querySelectorAll('select').length,
    textareas: document.querySelectorAll('textarea').length,
    buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean),
  }));
  await page.screenshot({ path: `${SD}/sentinel-c6-events-new.png`, fullPage: true });
  console.log('EVENTS-NEW form:', JSON.stringify(formInfo));
});

test('C6D-14: Profile edit form', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/edit`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const formInfo = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, textarea, [role="combobox"]');
    return Array.from(inputs).map(el => ({
      tag: el.tagName.toLowerCase(),
      value: (el as HTMLInputElement).value?.substring(0, 30) || '',
      placeholder: el.getAttribute('placeholder')?.substring(0, 30) || '',
      role: el.getAttribute('role') || '',
    }));
  });
  const bodyText = await page.textContent('body') || '';
  const hasTags = bodyText.includes('Müzik') || bodyText.includes('Spor') || bodyText.includes('Seyahat');
  await page.screenshot({ path: `${SD}/sentinel-c6-profile-edit.png`, fullPage: true });
  console.log('PROFILE-EDIT form:', JSON.stringify(formInfo));
  console.log('PROFILE-EDIT interest tags:', hasTags);
});

// ===== GRUP 4: DERİN TEST — FİLTRE & ETKİLEŞİM =====

test('C6D-15: Search filtreleri', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  const listingCount = (await page.$$('a[href*="/listing/"]')).length;
  const selects = await page.$$('select');
  const selectOpts: string[][] = [];
  for (const s of selects) {
    const opts = await s.evaluate(el => Array.from((el as HTMLSelectElement).options).map(o => o.textContent?.trim() || ''));
    selectOpts.push(opts);
  }
  const sliders = (await page.$$('input[type="range"]')).length;
  // Change filter
  if (selects.length > 0) {
    const optCount = await selects[0].evaluate(el => (el as HTMLSelectElement).options.length);
    if (optCount > 2) {
      await selects[0].selectOption({ index: 2 });
      await page.waitForTimeout(1000);
    }
  }
  const listingCountAfter = (await page.$$('a[href*="/listing/"]')).length;
  await page.screenshot({ path: `${SD}/sentinel-c6-search-filtered.png`, fullPage: true });
  console.log('SEARCH listings before:', listingCount, 'after filter:', listingCountAfter);
  console.log('SEARCH selects:', JSON.stringify(selectOpts));
  console.log('SEARCH sliders:', sliders);
});

test('C6D-16: Events filtreler', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const filterBtns = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent?.trim()?.substring(0, 20),
      ariaLabel: b.getAttribute('aria-label') || '',
    })).filter(b => b.text && b.text.length < 15)
  );
  // Click Kahve filter
  const kahve = page.locator('button:has-text("Kahve")').first();
  if (await kahve.isVisible({ timeout: 2000 }).catch(() => false)) {
    await kahve.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: `${SD}/sentinel-c6-events-filtered.png`, fullPage: true });
  console.log('EVENTS filters:', JSON.stringify(filterBtns));
});

test('C6D-17: Budget sliderlar', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/budget`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const sliderInfo = await page.evaluate(() => {
    const ranges = document.querySelectorAll('input[type="range"]');
    return Array.from(ranges).map(r => ({
      min: r.getAttribute('min'),
      max: r.getAttribute('max'),
      value: (r as HTMLInputElement).value,
    }));
  });
  const text = await page.textContent('body') || '';
  const p = prices(text);
  await page.screenshot({ path: `${SD}/sentinel-c6-budget.png`, fullPage: true });
  console.log('BUDGET sliders:', JSON.stringify(sliderInfo));
  console.log('BUDGET prices:', JSON.stringify(p));
});

test('C6D-18: Settings togglelar + dil/para', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/settings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const text = await page.textContent('body') || '';
  const info = {
    dil: text.includes('Türkçe'),
    paraBirimi: text.includes('TRY'),
    hesabiSil: text.includes('Hesabı Sil'),
    surum: text.includes('2.0'),
    karanlikTema: text.includes('Karanlık') || text.includes('Tema'),
  };
  await page.screenshot({ path: `${SD}/sentinel-c6-settings.png`, fullPage: true });
  console.log('SETTINGS:', JSON.stringify(info));
});

test('C6D-19: Notifications filtre', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/notifications`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const text = await page.textContent('body') || '';
  const info = {
    isLoading: text.includes('Yükleniyor'),
    hasTumu: text.includes('Tümü'),
    hasOkunmamis: text.includes('Okunmamış'),
    hasMarkAll: text.includes('Okundu İşaretle') || text.includes('Tümünü Okundu'),
  };
  await page.screenshot({ path: `${SD}/sentinel-c6-notifications.png`, fullPage: true });
  console.log('NOTIFICATIONS:', JSON.stringify(info));
});

// ===== GRUP 5: ETKİLEŞİM TESTLERİ =====

test('C6D-20: Messages chat detay', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/messages`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const conv = await page.$('a[href*="/messages/"]');
  if (conv) {
    await conv.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  }
  const chatInput = page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"], textarea[placeholder*="Mesaj"]');
  const hasInput = await chatInput.isVisible().catch(() => false);
  if (hasInput) await chatInput.fill('Test mesajı döngü 6');
  const hasSendBtn = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button')).some(b =>
      (b.getAttribute('aria-label') || '').toLowerCase().includes('gönder') ||
      (b.getAttribute('aria-label') || '').toLowerCase().includes('send')
    )
  );
  await page.screenshot({ path: `${SD}/sentinel-c6-messages-chat.png`, fullPage: true });
  console.log('MESSAGES hasInput:', hasInput);
  console.log('MESSAGES hasSendBtn:', hasSendBtn);
});

test('C6D-21: Roommates swipe + detay', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  // Try clicking heart/like button
  const heartBtn = page.locator('button[aria-label*="beğen"], button[aria-label*="like"]').first();
  const hasHeart = await heartBtn.isVisible({ timeout: 2000 }).catch(() => false);
  // Check for roommate detail link
  const detailLink = await page.$('a[href*="/roommates/"]');
  const hasDetailLink = !!detailLink;
  await page.screenshot({ path: `${SD}/sentinel-c6-roommates-swipe.png`, fullPage: true });
  console.log('ROOMMATES hasHeart:', hasHeart);
  console.log('ROOMMATES hasDetailLink:', hasDetailLink);
});

// ===== GRUP 6: EMPTY STATE & EDGE CASE =====

test('C6D-22: Host bookings empty state', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/bookings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const text = await page.textContent('body') || '';
  const hasEmpty = text.includes('henüz') || text.includes('talep yok') || text.includes('bulunamadı');
  const tabs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button, [role="tab"]')).map(b => b.textContent?.trim()).filter(Boolean)
  );
  await page.screenshot({ path: `${SD}/sentinel-c6-host-bookings.png`, fullPage: true });
  console.log('HOST-BOOKINGS empty:', hasEmpty);
  console.log('HOST-BOOKINGS tabs:', JSON.stringify(tabs));
});

test('C6D-23: Profile menü linkleri', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.textContent?.trim()?.substring(0, 25),
      href: a.getAttribute('href'),
    })).filter(a => a.href?.startsWith('/'))
  );
  const text = await page.textContent('body') || '';
  const menuItems = {
    profilDuzenle: text.includes('Profil Düzenle'),
    rezervasyonlarim: text.includes('Rezervasyonlarım'),
    evSahibiOl: text.includes('Ev Sahibi'),
    bildirimler: text.includes('Bildirimler'),
    ayarlar: text.includes('Ayarlar'),
    cikis: text.includes('Çıkış'),
  };
  await page.screenshot({ path: `${SD}/sentinel-c6-profile.png`, fullPage: true });
  console.log('PROFILE links:', JSON.stringify(links));
  console.log('PROFILE menu:', JSON.stringify(menuItems));
});

// ===== GRUP 7: PLACEHOLDER TARAMASI =====

test('C6D-24: Placeholder + yakında taraması (10 sayfa)', async ({ page }) => {
  await login(page);
  const pages = [
    '/favorites', '/compare', '/booking', '/profile/bookings',
    '/host/earnings', '/roommates', '/mentors', '/events',
    '/community', '/budget',
  ];
  const results: any[] = [];
  for (const path of pages) {
    await page.goto(`${BASE}${path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const text = await page.textContent('body') || '';
    const found: string[] = [];
    if (/yakında/i.test(text)) found.push('Yakında');
    if (/coming soon/i.test(text)) found.push('Coming soon');
    if (/lorem ipsum/i.test(text)) found.push('Lorem ipsum');
    if (/\bTODO\b/.test(text)) found.push('TODO');
    if (/{[a-zA-Z]+}/.test(text)) found.push('Template variable: ' + text.match(/{[a-zA-Z]+}/)?.[0]);
    results.push({ path, placeholders: found });
  }
  console.log('=== PLACEHOLDER SCAN ===');
  for (const r of results) {
    console.log(`${r.path}: ${r.placeholders.length === 0 ? 'CLEAN' : JSON.stringify(r.placeholders)}`);
  }
});

// ===== GRUP 8: Search → Detail → Rezervasyon Flow =====

test('C6D-25: Search → Detail → Rezervasyon akışı', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const firstLink = await page.$('a[href*="/listing/"]');
  if (firstLink) {
    await firstLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const text = await page.textContent('body') || '';
    const hasRezervasyon = text.includes('Rezervasyon');
    const hasCarousel = await page.evaluate(() => document.querySelectorAll('img[src*="http"], img[src*="supabase"]').length);
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const hasBenzerIlanlar = text.includes('Benzer') || text.includes('benzer');
    const hasYorumlar = text.includes('Değerlendirme') || text.includes('yorum');
    await page.screenshot({ path: `${SD}/sentinel-c6-listing-detail-full.png`, fullPage: true });
    console.log('FLOW hasRezervasyon:', hasRezervasyon);
    console.log('FLOW realPhotos:', hasCarousel);
    console.log('FLOW hasBenzerIlanlar:', hasBenzerIlanlar);
    console.log('FLOW hasYorumlar:', hasYorumlar);
  }
});
