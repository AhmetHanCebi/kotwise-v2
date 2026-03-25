import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SS = 'tests/screenshots';

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  if (await emailInput.count() > 0) {
    await emailInput.fill('deniz@kotwise.com');
    await page.locator('input[type="password"]').fill('KotwiseTest2026!');
    await page.locator('button[type="submit"], button:has-text("Giriş")').first().click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  }
}

function checkPrices100x(content: string, label: string) {
  const prices = content.match(/(\d[\d.]*)\s*₺\/ay/g) || [];
  const results: string[] = [];
  for (const p of prices) {
    const num = parseInt(p.replace(/[^\d]/g, ''));
    if (num > 5000) results.push(`⚠️ ${label} 100x: ${p}`);
  }
  return { prices, issues: results };
}

function countPhotos(images: { src: string }[]) {
  let real = 0, svg = 0;
  for (const img of images) {
    if (img.src.includes('unsplash') || (img.src.startsWith('http') && !img.src.includes('data:'))) real++;
    if (img.src.includes('data:image/svg')) svg++;
  }
  return { real, svg };
}

// ==========================================
// AKIŞ TESTİ 1: İlan Ara → Detay
// ==========================================
test('C9-01: Search → Listing Detail akışı', async ({ page }) => {
  test.setTimeout(60000);
  await login(page);

  // Search
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');

  const listingLinks = await page.locator('a[href*="/listing/"]').all();
  console.log(`Search: ${listingLinks.length} ilan linki`);

  // Fotoğraf kontrolü
  const imgs = await page.locator('img').all();
  const srcs = await Promise.all(imgs.map(i => i.getAttribute('src').then(s => ({ src: s || '' }))));
  const { real, svg } = countPhotos(srcs);
  console.log(`Search fotoğraf: ${real} gerçek, ${svg} SVG`);

  // Fiyat kontrolü
  const content = await page.content();
  const { prices, issues } = checkPrices100x(content, 'Search');
  console.log(`Search fiyatlar: ${prices.slice(0, 8).join(', ')}`);
  issues.forEach(i => console.log(i));

  await page.screenshot({ path: `${SS}/sentinel-c9-01-search.png`, fullPage: true });

  // İlk ilana tıkla
  if (listingLinks.length > 0) {
    const href = await listingLinks[0].getAttribute('href');
    await page.goto(`${BASE}${href}`);
    await page.waitForLoadState('networkidle');

    const detailContent = await page.content();
    const detailPrices = detailContent.match(/(\d[\d.]*)\s*₺/g) || [];
    console.log(`Listing detail fiyatlar: ${detailPrices.slice(0, 6).join(', ')}`);

    // Carousel fotoğraf
    const detailImgs = await page.locator('img[src*="unsplash"], img[src*="http"]').count();
    console.log(`Listing detail gerçek foto: ${detailImgs}`);

    // Önemli butonlar
    const favBtn = await page.locator('[aria-label*="Favori"], [aria-label*="favori"]').count();
    const bookBtn = await page.locator('button:has-text("Rezervasyon"), a:has-text("Rezervasyon")').count();
    const msgBtn = await page.locator('button:has-text("Mesaj"), a:has-text("Mesaj")').count();
    console.log(`Butonlar — Favori: ${favBtn}, Rezervasyon: ${bookBtn}, Mesaj: ${msgBtn}`);

    await page.screenshot({ path: `${SS}/sentinel-c9-01b-listing-detail.png`, fullPage: true });
  }

  expect(listingLinks.length).toBeGreaterThan(0);
});

// ==========================================
// AKIŞ TESTİ 2: Favorites → Compare
// ==========================================
test('C9-02: Favorites ve Compare', async ({ page }) => {
  test.setTimeout(60000);
  await login(page);

  // Favorites
  await page.goto(`${BASE}/favorites`);
  await page.waitForLoadState('networkidle');

  const imgs = await page.locator('img').all();
  const srcs = await Promise.all(imgs.map(i => i.getAttribute('src').then(s => ({ src: s || '' }))));
  const { real, svg } = countPhotos(srcs);
  console.log(`Favorites fotoğraf: ${real} gerçek, ${svg} SVG`);

  const content = await page.content();
  const { prices, issues } = checkPrices100x(content, 'Favorites');
  console.log(`Favorites fiyatlar: ${prices.join(', ')}`);
  issues.forEach(i => console.log(i));

  // Karşılaştır butonu
  const compareBtn = await page.locator('button:has-text("Karşılaştır"), a:has-text("Karşılaştır")').count();
  console.log(`Karşılaştır butonu: ${compareBtn > 0 ? 'MEVCUT' : 'YOK'}`);

  await page.screenshot({ path: `${SS}/sentinel-c9-02-favorites.png`, fullPage: true });

  // Compare
  await page.goto(`${BASE}/compare`);
  await page.waitForLoadState('networkidle');

  const compareImgs = await page.locator('img').all();
  const compareSrcs = await Promise.all(compareImgs.map(i => i.getAttribute('src').then(s => ({ src: s || '' }))));
  const comparePhotos = countPhotos(compareSrcs);
  console.log(`Compare fotoğraf: ${comparePhotos.real} gerçek, ${comparePhotos.svg} SVG`);

  const compareContent = await page.content();
  const comparePrices = checkPrices100x(compareContent, 'Compare');
  console.log(`Compare fiyatlar: ${comparePrices.prices.join(', ')}`);

  await page.screenshot({ path: `${SS}/sentinel-c9-02b-compare.png`, fullPage: true });
});

// ==========================================
// AKIŞ TESTİ 3: Booking
// ==========================================
test('C9-03: Booking akışı', async ({ page }) => {
  test.setTimeout(60000);
  await login(page);

  // Booking sayfası
  await page.goto(`${BASE}/booking`);
  await page.waitForLoadState('networkidle');

  const imgs = await page.locator('img').all();
  const srcs = await Promise.all(imgs.map(i => i.getAttribute('src').then(s => ({ src: s || '' }))));
  const { real, svg } = countPhotos(srcs);
  console.log(`Booking fotoğraf: ${real} gerçek, ${svg} SVG`);

  const content = await page.content();
  const priceMatches = content.match(/(\d[\d.]*)\s*₺/g) || [];
  console.log(`Booking fiyatlar: ${priceMatches.join(', ')}`);

  // Stripe kontrolü
  const hasStripe = content.includes('stripe') || content.includes('Stripe') || content.includes('Ödeme');
  console.log(`Stripe/Ödeme: ${hasStripe ? 'MEVCUT' : 'YOK'}`);

  await page.screenshot({ path: `${SS}/sentinel-c9-03-booking.png`, fullPage: true });

  // Profile bookings
  await page.goto(`${BASE}/profile/bookings`);
  await page.waitForLoadState('networkidle');

  const pbImgs = await page.locator('img').all();
  const pbSrcs = await Promise.all(pbImgs.map(i => i.getAttribute('src').then(s => ({ src: s || '' }))));
  const pbPhotos = countPhotos(pbSrcs);
  console.log(`Profile-bookings fotoğraf: ${pbPhotos.real} gerçek, ${pbPhotos.svg} SVG`);

  const pbContent = await page.content();
  const pbPrices = pbContent.match(/(\d[\d.]*)\s*₺/g) || [];
  console.log(`Profile-bookings fiyatlar: ${pbPrices.join(', ')}`);

  // Filtreler
  const filters = await page.locator('button:has-text("Aktif"), button:has-text("Geçmiş"), button:has-text("İptal")').count();
  console.log(`Filtre butonları: ${filters}`);

  await page.screenshot({ path: `${SS}/sentinel-c9-03b-profile-bookings.png`, fullPage: true });
});

// ==========================================
// AKIŞ TESTİ 4: Mesaj Gönder
// ==========================================
test('C9-04: Mesaj gönderme akışı', async ({ page }) => {
  test.setTimeout(60000);
  await login(page);

  // Messages liste
  await page.goto(`${BASE}/messages`);
  await page.waitForLoadState('networkidle');

  const convLinks = await page.locator('a[href*="/messages/"]').count();
  console.log(`Konuşma linkleri: ${convLinks}`);

  await page.screenshot({ path: `${SS}/sentinel-c9-04a-messages-list.png`, fullPage: true });

  // İlk konuşmaya git
  const firstConv = page.locator('a[href*="/messages/"]').first();
  if (await firstConv.count() > 0) {
    const href = await firstConv.getAttribute('href');
    await page.goto(`${BASE}${href}`);
    await page.waitForLoadState('networkidle');

    // Chat input
    const chatInput = await page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"], textarea[placeholder*="Mesaj"], textarea[placeholder*="mesaj"]').count();
    console.log(`Chat input: ${chatInput > 0 ? 'MEVCUT' : 'YOK'}`);

    // Chat balonları
    const content = await page.content();
    const hasBubbles = content.includes('Nisan 2026') || content.includes('mesaj');
    console.log(`Chat balonları/tarih: ${hasBubbles ? 'MEVCUT' : 'YOK'}`);

    // Mesaj yaz
    const input = page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"], textarea[placeholder*="Mesaj"], textarea[placeholder*="mesaj"]').first();
    if (await input.count() > 0) {
      await input.fill('Döngü 9 test mesajı');
      console.log('Mesaj yazıldı ✅');
    }

    // Gönder, emoji, kamera butonları
    const sendBtn = await page.locator('button[aria-label*="Gönder"], button[aria-label*="gönder"]').count();
    const emojiBtn = await page.locator('button[aria-label*="Emoji"], button[aria-label*="emoji"]').count();
    const cameraBtn = await page.locator('button[aria-label*="Fotoğraf"], button[aria-label*="fotoğraf"], button[aria-label*="Dosya"], button[aria-label*="dosya"]').count();
    console.log(`Butonlar — Gönder: ${sendBtn}, Emoji: ${emojiBtn}, Kamera/Dosya: ${cameraBtn}`);

    await page.screenshot({ path: `${SS}/sentinel-c9-04b-chat-detail.png`, fullPage: true });
  }
});

// ==========================================
// AKIŞ TESTİ 5: Ev sahibine mesaj (Listing → Message)
// ==========================================
test('C9-05: Listing detail → Ev sahibine mesaj', async ({ page }) => {
  test.setTimeout(60000);
  await login(page);

  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');

  const firstLink = page.locator('a[href*="/listing/"]').first();
  if (await firstLink.count() > 0) {
    const href = await firstLink.getAttribute('href');
    await page.goto(`${BASE}${href}`);
    await page.waitForLoadState('networkidle');

    // Mesaj butonuna tıkla
    const msgBtn = page.locator('button:has-text("Mesaj"), a:has-text("Mesaj")').first();
    if (await msgBtn.count() > 0) {
      await msgBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      const url = page.url();
      console.log(`Mesaj sonrası URL: ${url}`);
      const isMessages = url.includes('/messages');
      console.log(`Messages sayfasına yönlendi: ${isMessages ? 'EVET' : 'HAYIR'}`);

      // Chat input
      const chatInput = await page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"]').count();
      console.log(`Ev sahibi chat input: ${chatInput > 0 ? 'MEVCUT' : 'YOK'}`);

      await page.screenshot({ path: `${SS}/sentinel-c9-05-host-message.png`, fullPage: true });
    } else {
      console.log('Mesaj butonu bulunamadı');
    }
  }
});

// ==========================================
// REGRESYON + TARAMA 6: Harita, Notifications, Roommates, Host-earnings, Budget
// ==========================================
test('C9-06: Harita zoom + marker fiyatları', async ({ page }) => {
  test.setTimeout(60000);
  await login(page);

  await page.goto(`${BASE}/search/map`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Zoom level
  const tiles = await page.locator('img[src*="openstreetmap"]').all();
  let zoomLevel = 0;
  for (const tile of tiles) {
    const src = await tile.getAttribute('src') || '';
    const m = src.match(/\/(\d+)\/\d+\/\d+/);
    if (m) { zoomLevel = parseInt(m[1]); break; }
  }
  console.log(`Harita zoom level: ${zoomLevel}`);

  // Marker fiyatları
  const content = await page.content();
  const markerPrices = content.match(/(\d[\d.]*)\s*₺/g) || [];
  console.log(`Map marker fiyatlar: ${markerPrices.slice(0, 10).join(', ')}`);
  for (const p of markerPrices) {
    const num = parseInt(p.replace(/[^\d]/g, ''));
    if (num > 5000) console.log(`⚠️ MAP 100x: ${p}`);
  }

  await page.screenshot({ path: `${SS}/sentinel-c9-06-search-map.png`, fullPage: true });
  expect(zoomLevel).toBeGreaterThanOrEqual(10);
});

test('C9-07: Notifications + Roommates + Host-earnings + Budget', async ({ page }) => {
  test.setTimeout(60000);
  await login(page);

  // Notifications
  await page.goto(`${BASE}/notifications`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const notifContent = await page.content();
  const hasLoading = notifContent.includes('Yükleniyor');
  console.log(`Notifications Yükleniyor stuck: ${hasLoading ? '❌ REGRESYON' : '✅ TEMİZ'}`);

  await page.screenshot({ path: `${SS}/sentinel-c9-07a-notifications.png`, fullPage: true });

  // Roommates
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');

  const rmContent = await page.content();
  const uyumMatch = rmContent.match(/%\d+\s*Uyum/);
  const hasUyumYok = rmContent.includes('Uyum bilgisi yok');
  console.log(`Roommates: Uyum: ${uyumMatch ? uyumMatch[0] : 'YOK'}, "Uyum bilgisi yok": ${hasUyumYok}`);

  await page.screenshot({ path: `${SS}/sentinel-c9-07b-roommates.png`, fullPage: true });

  // Host-earnings
  await page.goto(`${BASE}/host/earnings`);
  await page.waitForLoadState('networkidle');

  const earningsContent = await page.content();
  const hasCurrencyTemplate = earningsContent.includes('{currencySymbol}');
  console.log(`Host-earnings {currencySymbol}: ${hasCurrencyTemplate ? '❌ SORUN' : '✅ TEMİZ'}`);

  await page.screenshot({ path: `${SS}/sentinel-c9-07c-host-earnings.png`, fullPage: true });

  // Budget
  await page.goto(`${BASE}/budget`);
  await page.waitForLoadState('networkidle');

  const budgetContent = await page.content();
  const hasEUR = /€|EUR/.test(budgetContent);
  const hasTRY = /₺|TRY|TL/.test(budgetContent);
  console.log(`Budget para birimi: EUR=${hasEUR}, TRY=${hasTRY}`);

  await page.screenshot({ path: `${SS}/sentinel-c9-07d-budget.png`, fullPage: true });
});

// ==========================================
// TARAMA 8: Homepage fiyat + navigasyon + placeholder + console errors
// ==========================================
test('C9-08: Homepage fiyat + navigasyon kontrolü', async ({ page }) => {
  test.setTimeout(60000);
  await login(page);

  await page.goto(`${BASE}/`);
  await page.waitForLoadState('networkidle');

  const content = await page.content();

  // Fiyat kontrolü
  const { prices, issues } = checkPrices100x(content, 'Homepage');
  console.log(`Homepage fiyatlar: ${prices.slice(0, 8).join(', ')}`);
  issues.forEach(i => console.log(i));

  // Navigasyon linkleri
  const roomLink = await page.locator('a[href*="/roommates"]').count();
  const hostLink = await page.locator('a[href*="/host"]').count();
  const mentorLink = await page.locator('a[href*="/mentors"]').count();
  const eventLink = await page.locator('a[href*="/events"]').count();
  const budgetLink = await page.locator('a[href*="/budget"]').count();
  console.log(`Nav links — Roommates: ${roomLink}, Host: ${hostLink}, Mentors: ${mentorLink}, Events: ${eventLink}, Budget: ${budgetLink}`);

  await page.screenshot({ path: `${SS}/sentinel-c9-08-homepage.png`, fullPage: true });
});

test('C9-09: Placeholder + console error taraması (17 sayfa)', async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().substring(0, 100));
  });

  await login(page);

  const pages = ['/', '/search', '/favorites', '/compare', '/booking', '/profile/bookings',
    '/messages', '/community', '/events', '/roommates', '/mentors', '/budget',
    '/host/earnings', '/notifications', '/settings', '/search/map', '/profile'];

  const placeholderPages: string[] = [];
  for (const p of pages) {
    await page.goto(`${BASE}${p}`);
    await page.waitForLoadState('networkidle');
    const content = await page.content();
    if (/Yakında|Coming soon|lorem ipsum|TODO(?!=)|{currencySymbol}/i.test(content)) {
      placeholderPages.push(p);
      console.log(`⚠️ Placeholder bulundu: ${p}`);
    }
  }

  console.log(`Placeholder: ${placeholderPages.length === 0 ? '✅ HİÇBİRİ' : placeholderPages.join(', ')}`);
  console.log(`Console errors: ${errors.length} adet`);
  if (errors.length > 0) {
    errors.slice(0, 5).forEach(e => console.log(`  Error: ${e}`));
  }
});
