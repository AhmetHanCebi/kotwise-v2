import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

  await emailInput.fill('deniz@kotwise.com');
  await passwordInput.fill('KotwiseTest2026!');

  const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("giriş"), button:has-text("Login")').first();
  await submitBtn.click();

  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `tests/screenshots/sentinel-c4-${name}.png`, fullPage: true });
}

// =====================================================
// TEST 1: Devam eden bug — Siyah kare fotoğraf re-check
// =====================================================
test('C4-01: Siyah kare fotoğraf re-check (favorites, compare, booking, profile-bookings)', async ({ page }) => {
  await login(page);

  const pages = [
    { path: '/favorites', name: 'favorites' },
    { path: '/compare', name: 'compare' },
    { path: '/booking', name: 'booking' },
    { path: '/profile/bookings', name: 'profile-bookings' },
  ];

  const results: any[] = [];

  for (const p of pages) {
    await page.goto(`${BASE}${p.path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, `black-square-${p.name}`);

    // Check all images
    const images = await page.locator('img').all();
    let svgCount = 0;
    let realCount = 0;
    let brokenCount = 0;

    for (const img of images) {
      const src = await img.getAttribute('src') || '';
      if (src.includes('data:image/svg+xml')) {
        svgCount++;
      } else if (src.startsWith('http') || src.startsWith('/') || src.startsWith('blob:')) {
        const natural = await img.evaluate((el: HTMLImageElement) => ({
          w: el.naturalWidth,
          h: el.naturalHeight,
          complete: el.complete
        }));
        if (natural.w > 0 && natural.complete) {
          realCount++;
        } else {
          brokenCount++;
        }
      }
    }

    results.push({ page: p.name, svgCount, realCount, brokenCount, totalImages: images.length });
    console.log(`[${p.name}] Total: ${images.length}, SVG placeholder: ${svgCount}, Real: ${realCount}, Broken: ${brokenCount}`);
  }

  // Log overall
  const totalSvg = results.reduce((a, r) => a + r.svgCount, 0);
  console.log(`\n=== SIYAH KARE SONUÇ: ${totalSvg} SVG placeholder hâlâ mevcut ===`);
});

// =====================================================
// TEST 2: Devam eden bug — Harita zoom re-check
// =====================================================
test('C4-02: Harita zoom level re-check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search/map`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await screenshot(page, 'map-zoom');

  // Check zoom level from tile URLs
  const tiles = await page.locator('.leaflet-tile-pane img, .leaflet-tile').all();
  const tileSrcs: string[] = [];
  for (const tile of tiles) {
    const src = await tile.getAttribute('src') || '';
    if (src) tileSrcs.push(src);
  }

  // Extract zoom levels from tile URLs (format: /{z}/{x}/{y}.png)
  const zoomLevels = tileSrcs
    .map(s => { const m = s.match(/\/(\d+)\/\d+\/\d+/); return m ? parseInt(m[1]) : null; })
    .filter(z => z !== null);

  const maxZoom = Math.max(...zoomLevels as number[]);
  console.log(`Harita zoom level: ${maxZoom} (olması gereken: 12+)`);
  console.log(`Tile count: ${tileSrcs.length}`);

  // Check markers
  const markers = await page.locator('.leaflet-marker-icon, .leaflet-marker-pane *').count();
  console.log(`Marker count: ${markers}`);

  // Check map center — is it zoomed to a city?
  const mapContainer = page.locator('.leaflet-container').first();
  const mapBounds = await mapContainer.boundingBox();
  console.log(`Map container size: ${mapBounds?.width}x${mapBounds?.height}`);
});

// =====================================================
// TEST 3: DERİN TEST — Listing New form doldurma
// =====================================================
test('C4-03: Listing New — form doldurma ve adımlar', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/listing/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'listing-new-step1');

  // Step 1: Basic info
  const titleInput = page.locator('input[name="title"], input[placeholder*="başlık"], input[placeholder*="Başlık"], input[placeholder*="title"]').first();
  if (await titleInput.isVisible()) {
    await titleInput.fill('Test İlan - Döngü 4 Playwright');
    console.log('Title input dolduruldu');
  } else {
    console.log('Title input bulunamadı');
  }

  // Check university field is dropdown/autocomplete, NOT free text
  const uniField = page.locator('[class*="combobox"], [role="combobox"], [class*="select"], [class*="autocomplete"], select').first();
  const uniExists = await uniField.isVisible().catch(() => false);
  console.log(`Üniversite alanı dropdown/autocomplete: ${uniExists}`);

  // Check city dropdown
  const citySelect = page.locator('select, [role="combobox"], [class*="select"]');
  const cityCount = await citySelect.count();
  console.log(`Select/combobox element sayısı: ${cityCount}`);

  // Try to fill description
  const descInput = page.locator('textarea, [contenteditable="true"]').first();
  if (await descInput.isVisible().catch(() => false)) {
    await descInput.fill('Bu bir test açıklamasıdır. Döngü 4 Playwright derin test.');
    console.log('Açıklama alanı dolduruldu');
  }

  // Check price input
  const priceInput = page.locator('input[name="price"], input[type="number"], input[placeholder*="fiyat"], input[placeholder*="Fiyat"], input[placeholder*="₺"], input[placeholder*="TL"]').first();
  if (await priceInput.isVisible().catch(() => false)) {
    await priceInput.fill('500');
    console.log('Fiyat alanı dolduruldu');
  }

  // Try next step button
  const nextBtn = page.locator('button:has-text("Devam"), button:has-text("İleri"), button:has-text("Sonraki"), button:has-text("Next")').first();
  if (await nextBtn.isVisible().catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(1000);
    await screenshot(page, 'listing-new-step2');
    console.log('Step 2\'ye geçildi');
  }

  await screenshot(page, 'listing-new-filled');
});

// =====================================================
// TEST 4: DERİN TEST — Events filtreleri ve görünüm toggle
// =====================================================
test('C4-04: Events — filtreler ve grid/list/takvim toggle', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'events-default');

  // Test category filters
  const filters = page.locator('button, [role="tab"]');
  const filterTexts: string[] = [];
  const allFilters = await filters.all();
  for (const f of allFilters) {
    const text = (await f.textContent() || '').trim();
    if (text && ['Kahve', 'Spor', 'Dil', 'Tur', 'Tümü', 'Kültür', 'Müzik', 'Yemek'].includes(text)) {
      filterTexts.push(text);
    }
  }
  console.log(`Event kategori filtreleri: ${filterTexts.join(', ')}`);

  // Click a category filter
  for (const filterText of filterTexts) {
    if (filterText !== 'Tümü') {
      const filterBtn = page.locator(`button:has-text("${filterText}"), [role="tab"]:has-text("${filterText}")`).first();
      if (await filterBtn.isVisible().catch(() => false)) {
        await filterBtn.click();
        await page.waitForTimeout(500);
        await screenshot(page, `events-filter-${filterText.toLowerCase()}`);
        console.log(`Filtre "${filterText}" tıklandı`);

        // Check if events change or show empty state
        const cards = await page.locator('[class*="card"], [class*="event"], article').count();
        console.log(`"${filterText}" filtresi sonrası kart sayısı: ${cards}`);
        break;
      }
    }
  }

  // Test view toggles (grid/list/calendar)
  const viewToggles = page.locator('button[aria-label*="grid"], button[aria-label*="list"], button[aria-label*="calendar"], button:has-text("📋"), button:has-text("📅"), [class*="toggle"] button, [class*="view"] button');
  const toggleCount = await viewToggles.count();
  console.log(`View toggle buton sayısı: ${toggleCount}`);

  if (toggleCount > 1) {
    // Click second toggle (probably list or calendar)
    await viewToggles.nth(1).click();
    await page.waitForTimeout(500);
    await screenshot(page, 'events-view-toggle');
    console.log('View toggle tıklandı');
  }
});

// =====================================================
// TEST 5: DERİN TEST — Community new post form
// =====================================================
test('C4-05: Community New — gönderi formu doldurma', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/community/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'community-new-empty');

  // Fill title/content
  const titleInput = page.locator('input[name="title"], input[placeholder*="başlık"], input[placeholder*="Başlık"]').first();
  if (await titleInput.isVisible().catch(() => false)) {
    await titleInput.fill('Döngü 4 Test Gönderisi');
    console.log('Community başlık dolduruldu');
  }

  const contentInput = page.locator('textarea, [contenteditable="true"], input[placeholder*="içerik"], input[placeholder*="yaz"]').first();
  if (await contentInput.isVisible().catch(() => false)) {
    await contentInput.fill('Bu bir Playwright test gönderisidir. Döngü 4 derin test.');
    console.log('Community içerik dolduruldu');
  }

  // Check for hashtag/category field
  const hashtagField = page.locator('input[placeholder*="hashtag"], input[placeholder*="etiket"], input[placeholder*="tag"], [class*="tag"]');
  const hashtagExists = await hashtagField.count();
  console.log(`Hashtag/etiket alanı: ${hashtagExists > 0 ? 'VAR' : 'YOK'}`);

  // Check for photo upload
  const fileInput = page.locator('input[type="file"]');
  const uploadExists = await fileInput.count();
  console.log(`Fotoğraf yükleme alanı: ${uploadExists > 0 ? 'VAR' : 'YOK'}`);

  // Check submit button
  const submitBtn = page.locator('button[type="submit"], button:has-text("Paylaş"), button:has-text("Gönder"), button:has-text("Yayınla")').first();
  const submitVisible = await submitBtn.isVisible().catch(() => false);
  console.log(`Paylaş/Gönder butonu: ${submitVisible ? 'VAR' : 'YOK'}`);

  await screenshot(page, 'community-new-filled');
});

// =====================================================
// TEST 6: DERİN TEST — Events New form
// =====================================================
test('C4-06: Events New — etkinlik formu doldurma', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'events-new-empty');

  // Fill event fields
  const fields = {
    'title': 'Döngü 4 Test Etkinliği',
    'description': 'Playwright derin test etkinliği açıklaması',
    'location': 'Test Mekanı, Barcelona',
  };

  for (const [name, value] of Object.entries(fields)) {
    const input = page.locator(`input[name="${name}"], input[placeholder*="${name}"], textarea[name="${name}"]`).first();
    if (await input.isVisible().catch(() => false)) {
      await input.fill(value);
      console.log(`${name} dolduruldu`);
    }
  }

  // Also try Turkish placeholders
  const titleInput = page.locator('input[placeholder*="Etkinlik"], input[placeholder*="etkinlik"], input[placeholder*="başlık"]').first();
  if (await titleInput.isVisible().catch(() => false)) {
    await titleInput.fill('Döngü 4 Test Etkinliği');
    console.log('Etkinlik başlık dolduruldu');
  }

  // Check date picker
  const datePicker = page.locator('input[type="date"], input[type="datetime-local"], [class*="date"], [class*="calendar"]');
  const datePickerCount = await datePicker.count();
  console.log(`Tarih seçici: ${datePickerCount > 0 ? 'VAR' : 'YOK'} (${datePickerCount} adet)`);

  // Check category select
  const categorySelect = page.locator('select, [role="combobox"], [role="listbox"]');
  const categoryCount = await categorySelect.count();
  console.log(`Kategori/select alanı: ${categoryCount > 0 ? 'VAR' : 'YOK'} (${categoryCount} adet)`);

  await screenshot(page, 'events-new-filled');
});

// =====================================================
// TEST 7: DERİN TEST — Profile Edit form doldurma
// =====================================================
test('C4-07: Profile Edit — form alanları ve kaydetme', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/edit`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'profile-edit-initial');

  // Check pre-filled fields
  const allInputs = await page.locator('input:visible, textarea:visible, select:visible').all();
  console.log(`Toplam görünür input sayısı: ${allInputs.length}`);

  let filledCount = 0;
  for (const input of allInputs) {
    const value = await input.inputValue().catch(() => '');
    const tagName = await input.evaluate(el => el.tagName.toLowerCase());
    const name = await input.getAttribute('name') || await input.getAttribute('placeholder') || '';
    if (value) {
      filledCount++;
      console.log(`  [DOLU] ${tagName} "${name}": "${value.substring(0, 50)}"`);
    } else {
      console.log(`  [BOŞ] ${tagName} "${name}"`);
    }
  }
  console.log(`Dolu alan: ${filledCount}/${allInputs.length}`);

  // Check university field type
  const uniCombobox = page.locator('[role="combobox"]');
  const uniComboCount = await uniCombobox.count();
  console.log(`Combobox (üniversite vb.): ${uniComboCount}`);

  // Check interest tags
  const tags = page.locator('[class*="tag"], [class*="chip"], [class*="badge"]');
  const tagCount = await tags.count();
  console.log(`İlgi alanı tag/chip sayısı: ${tagCount}`);

  // Check save button
  const saveBtn = page.locator('button:has-text("Kaydet"), button:has-text("Güncelle"), button[type="submit"]').first();
  const saveVisible = await saveBtn.isVisible().catch(() => false);
  console.log(`Kaydet butonu: ${saveVisible ? 'VAR' : 'YOK'}`);

  // Try modifying bio/about
  const bioField = page.locator('textarea').first();
  if (await bioField.isVisible().catch(() => false)) {
    const currentBio = await bioField.inputValue();
    console.log(`Mevcut bio: "${currentBio.substring(0, 80)}..."`);
  }

  await screenshot(page, 'profile-edit-checked');
});

// =====================================================
// TEST 8: DERİN TEST — Roommates swipe etkileşim
// =====================================================
test('C4-08: Roommates — swipe etkileşim testi', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await screenshot(page, 'roommates-initial');

  // Check card content
  const matchPercent = page.locator('text=/%Uyum/i, text=/\\d+%/, [class*="match"]');
  const matchCount = await matchPercent.count();
  console.log(`Uyum yüzdesi elementi: ${matchCount}`);

  // Check action buttons (X, Message, Heart)
  const actionBtns = page.locator('[class*="action"] button, [class*="swipe"] button, button:has-text("❌"), button:has-text("💬"), button:has-text("❤"), button:has-text("✕")');
  const actionCount = await actionBtns.count();
  console.log(`Swipe aksiyon butonu sayısı: ${actionCount}`);

  // Try clicking reject (X) button
  const rejectBtn = page.locator('button:has-text("✕"), button:has-text("❌"), button[aria-label*="reject"], button[aria-label*="skip"]').first();
  if (await rejectBtn.isVisible().catch(() => false)) {
    // Get current card info before swipe
    const cardText1 = await page.locator('[class*="card"], [class*="profile"]').first().textContent().catch(() => '');
    console.log(`Swipe öncesi kart: ${cardText1?.substring(0, 80)}`);

    await rejectBtn.click();
    await page.waitForTimeout(1000);

    const cardText2 = await page.locator('[class*="card"], [class*="profile"]').first().textContent().catch(() => '');
    console.log(`Swipe sonrası kart: ${cardText2?.substring(0, 80)}`);

    const cardChanged = cardText1 !== cardText2;
    console.log(`Kart değişti mi: ${cardChanged}`);

    await screenshot(page, 'roommates-after-swipe');
  } else {
    console.log('Reject butonu bulunamadı');
  }

  // Check for empty state (if no more cards)
  const emptyState = page.locator('text=/tükendi/i, text=/kalmadı/i, text=/bitti/i, text=/yok/i, [class*="empty"]');
  const emptyExists = await emptyState.count();
  console.log(`Empty state: ${emptyExists > 0 ? 'VAR' : 'YOK'}`);
});

// =====================================================
// TEST 9: DERİN TEST — Search filtreleri
// =====================================================
test('C4-09: Search — filtre değiştirme ve sonuç kontrolü', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'search-default');

  // Count initial listings
  const initialCards = await page.locator('[class*="card"], [class*="listing"], article').count();
  console.log(`Başlangıç ilan sayısı: ${initialCards}`);

  // Check filter elements
  const selects = await page.locator('select').all();
  console.log(`Select dropdown sayısı: ${selects.length}`);
  for (const sel of selects) {
    const name = await sel.getAttribute('name') || await sel.getAttribute('id') || '';
    const options = await sel.locator('option').count();
    console.log(`  Select "${name}": ${options} seçenek`);
  }

  // Check for price range slider
  const sliders = page.locator('input[type="range"], [class*="slider"], [class*="range"]');
  const sliderCount = await sliders.count();
  console.log(`Slider/range: ${sliderCount}`);

  // Check search input
  const searchInput = page.locator('input[type="search"], input[placeholder*="Ara"], input[placeholder*="ara"], input[placeholder*="search"]').first();
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill('Barcelona');
    await page.waitForTimeout(1000);
    await screenshot(page, 'search-filtered-barcelona');

    const filteredCards = await page.locator('[class*="card"], [class*="listing"], article').count();
    console.log(`"Barcelona" araması sonrası ilan sayısı: ${filteredCards}`);
  }

  // Check city filter
  const cityFilter = page.locator('select, button:has-text("Barcelona"), button:has-text("Berlin"), button:has-text("İstanbul")').first();
  if (await cityFilter.isVisible().catch(() => false)) {
    console.log('Şehir filtresi VAR');
  }
});

// =====================================================
// TEST 10: DERİN TEST — Budget calculator etkileşim
// =====================================================
test('C4-10: Budget — slider ve hesaplama etkileşimi', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/budget`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'budget-initial');

  // Check sliders
  const sliders = await page.locator('input[type="range"]').all();
  console.log(`Slider sayısı: ${sliders.length}`);

  for (let i = 0; i < sliders.length; i++) {
    const min = await sliders[i].getAttribute('min') || '0';
    const max = await sliders[i].getAttribute('max') || '100';
    const value = await sliders[i].inputValue();
    console.log(`  Slider ${i}: min=${min}, max=${max}, value=${value}`);
  }

  // Modify a slider
  if (sliders.length > 0) {
    await sliders[0].fill('75');
    await page.waitForTimeout(500);
    await screenshot(page, 'budget-slider-changed');
    console.log('Slider değiştirildi');
  }

  // Check for total/summary
  const totalText = await page.locator('text=/toplam/i, text=/aylık/i, text=/bütçe/i, [class*="total"], [class*="summary"]').all();
  console.log(`Toplam/özet elementi: ${totalText.length}`);

  // Check currency display
  const pageContent = await page.textContent('body');
  const hasTL = pageContent?.includes('₺') || pageContent?.includes('TL');
  const hasEuro = pageContent?.includes('€');
  console.log(`Para birimi: TL=${hasTL}, EUR=${hasEuro}`);
});

// =====================================================
// TEST 11: DERİN TEST — Host Apply form
// =====================================================
test('C4-11: Host Apply — başvuru formu kontrolü', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/apply`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'host-apply-initial');

  // Check form steps
  const steps = page.locator('[class*="step"], [class*="progress"], [class*="indicator"]');
  const stepCount = await steps.count();
  console.log(`Form adım göstergesi: ${stepCount}`);

  // Check form fields
  const inputs = await page.locator('input:visible, textarea:visible, select:visible').all();
  console.log(`Toplam form alanı: ${inputs.length}`);

  for (const input of inputs) {
    const type = await input.getAttribute('type') || 'text';
    const name = await input.getAttribute('name') || await input.getAttribute('placeholder') || '';
    console.log(`  [${type}] "${name}"`);
  }

  // Check for ID verification step
  const idVerify = page.locator('text=/kimlik/i, text=/doğrulama/i, text=/verification/i, text=/TC/i');
  const idCount = await idVerify.count();
  console.log(`Kimlik doğrulama alanı: ${idCount > 0 ? 'VAR' : 'YOK'}`);

  // Check submit button
  const submitBtn = page.locator('button[type="submit"], button:has-text("Başvur"), button:has-text("Gönder")').first();
  const submitVisible = await submitBtn.isVisible().catch(() => false);
  console.log(`Başvur butonu: ${submitVisible ? 'VAR' : 'YOK'}`);
});

// =====================================================
// TEST 12: DERİN TEST — Settings togglelar
// =====================================================
test('C4-12: Settings — toggle etkileşimleri', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/settings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'settings-initial');

  // Find all toggles/switches
  const toggles = await page.locator('input[type="checkbox"], [role="switch"], [class*="toggle"], [class*="switch"]').all();
  console.log(`Toggle/switch sayısı: ${toggles.length}`);

  // Try clicking a toggle
  if (toggles.length > 0) {
    const firstToggle = toggles[0];
    const beforeState = await firstToggle.isChecked().catch(() => null);
    console.log(`Toggle öncesi durum: ${beforeState}`);

    await firstToggle.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);

    const afterState = await firstToggle.isChecked().catch(() => null);
    console.log(`Toggle sonrası durum: ${afterState}`);
    console.log(`Toggle çalışıyor: ${beforeState !== afterState}`);

    await screenshot(page, 'settings-toggle-changed');
  }

  // Check language selector
  const langSelector = page.locator('select, [class*="language"], text=/Türkçe/i');
  const langExists = await langSelector.count();
  console.log(`Dil seçici: ${langExists > 0 ? 'VAR' : 'YOK'}`);

  // Check currency selector
  const currencySelector = page.locator('text=/TRY/i, text=/EUR/i, text=/para birimi/i');
  const currExists = await currencySelector.count();
  console.log(`Para birimi seçici: ${currExists > 0 ? 'VAR' : 'YOK'}`);

  // Check dark mode toggle
  const darkMode = page.locator('text=/karanlık/i, text=/dark/i, text=/tema/i');
  const darkExists = await darkMode.count();
  console.log(`Karanlık tema: ${darkExists > 0 ? 'VAR' : 'YOK'}`);
});

// =====================================================
// TEST 13: DERİN TEST — Listing detail carousel & booking
// =====================================================
test('C4-13: Listing Detail — carousel ve rezervasyon butonu', async ({ page }) => {
  await login(page);

  // First go to search to find a listing
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Click first listing card to go to detail
  const firstCard = page.locator('a[href*="/listing/"], [class*="card"] a, article a').first();
  if (await firstCard.isVisible().catch(() => false)) {
    await firstCard.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  } else {
    // Try direct navigation
    await page.goto(`${BASE}/listing/1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  }

  await screenshot(page, 'listing-detail');

  // Check carousel
  const carouselImages = await page.locator('[class*="carousel"] img, [class*="slider"] img, [class*="gallery"] img').count();
  console.log(`Carousel fotoğraf sayısı: ${carouselImages}`);

  // Check carousel navigation
  const prevBtn = page.locator('button[aria-label*="previous"], button:has-text("‹"), button:has-text("<"), [class*="prev"]').first();
  const nextBtn = page.locator('button[aria-label*="next"], button:has-text("›"), button:has-text(">"), [class*="next"]').first();
  const prevExists = await prevBtn.isVisible().catch(() => false);
  const nextExists = await nextBtn.isVisible().catch(() => false);
  console.log(`Carousel navigasyon: prev=${prevExists}, next=${nextExists}`);

  // Try clicking next
  if (nextExists) {
    await nextBtn.click();
    await page.waitForTimeout(500);
    await screenshot(page, 'listing-detail-carousel-next');
    console.log('Carousel next tıklandı');
  }

  // Check booking button
  const bookBtn = page.locator('button:has-text("Rezervasyon"), button:has-text("rezervasyon"), button:has-text("Kirala"), button:has-text("Book")').first();
  const bookExists = await bookBtn.isVisible().catch(() => false);
  console.log(`Rezervasyon butonu: ${bookExists ? 'VAR' : 'YOK'}`);

  // Check price
  const priceText = await page.locator('text=/\\d+.*₺/, text=/\\d+.*TL/, text=/\\d+.*\\/ay/').first().textContent().catch(() => '');
  console.log(`Fiyat: ${priceText}`);

  // Check reviews/comments
  const reviews = page.locator('[class*="review"], [class*="comment"], [class*="yorum"]');
  const reviewCount = await reviews.count();
  console.log(`Yorum/review: ${reviewCount}`);

  // Check similar listings
  const similar = page.locator('text=/Benzer/, text=/benzer/, text=/Similar/');
  const similarExists = await similar.count();
  console.log(`Benzer ilanlar bölümü: ${similarExists > 0 ? 'VAR' : 'YOK'}`);
});

// =====================================================
// TEST 14: DERİN TEST — Messages detay (chat input doğrulama)
// =====================================================
test('C4-14: Messages — chat input ve mesaj gönderme', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/messages`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'messages-list');

  // Click first conversation
  const firstConvo = page.locator('a[href*="/messages/"], [class*="conversation"], [class*="chat-item"]').first();
  if (await firstConvo.isVisible().catch(() => false)) {
    await firstConvo.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await screenshot(page, 'messages-detail');

    // Check chat input
    const chatInput = page.locator('input[placeholder*="Mesaj"], input[placeholder*="mesaj"], input[placeholder*="yaz"], textarea[placeholder*="Mesaj"]').first();
    const chatInputVisible = await chatInput.isVisible().catch(() => false);
    console.log(`Chat input: ${chatInputVisible ? 'VAR' : 'YOK'}`);

    if (chatInputVisible) {
      // Try typing a message
      await chatInput.fill('Test mesajı - Döngü 4');
      console.log('Mesaj yazıldı');

      // Check send button
      const sendBtn = page.locator('button:has-text("Gönder"), button:has-text("✈"), button[aria-label*="send"], button[type="submit"]').first();
      const sendVisible = await sendBtn.isVisible().catch(() => false);
      console.log(`Gönder butonu: ${sendVisible ? 'VAR' : 'YOK'}`);

      await screenshot(page, 'messages-input-filled');
    }

    // Check chat bubbles
    const bubbles = page.locator('[class*="bubble"], [class*="message-item"], [class*="chat-message"]');
    const bubbleCount = await bubbles.count();
    console.log(`Chat balon sayısı: ${bubbleCount}`);

    // Check emoji and camera buttons
    const emojiBtn = page.locator('button:has-text("😊"), button:has-text("emoji"), button[aria-label*="emoji"]');
    const cameraBtn = page.locator('button:has-text("📷"), button:has-text("camera"), button[aria-label*="camera"], button[aria-label*="photo"]');
    console.log(`Emoji butonu: ${await emojiBtn.count() > 0 ? 'VAR' : 'YOK'}`);
    console.log(`Kamera butonu: ${await cameraBtn.count() > 0 ? 'VAR' : 'YOK'}`);
  }
});

// =====================================================
// TEST 15: DERİN TEST — Host Bookings & Calendar etkileşim
// =====================================================
test('C4-15: Host Bookings & Calendar — empty state ve takvim', async ({ page }) => {
  await login(page);

  // Host bookings
  await page.goto(`${BASE}/host/bookings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'host-bookings');

  // Check empty state
  const emptyState = page.locator('text=/talep yok/i, text=/henüz/i, text=/boş/i, text=/bulunamadı/i, [class*="empty"]');
  const emptyCount = await emptyState.count();
  console.log(`Host bookings empty state: ${emptyCount > 0 ? 'VAR - düzgün' : 'YOK veya talepler var'}`);

  // Check filter tabs
  const tabs = page.locator('[role="tab"], button:has-text("Bekleyen"), button:has-text("Onaylı"), button:has-text("Reddedilen")');
  const tabCount = await tabs.count();
  console.log(`Host bookings filtre tab: ${tabCount}`);

  // Host calendar
  await page.goto(`${BASE}/host/calendar`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'host-calendar');

  // Check calendar navigation
  const prevMonth = page.locator('button:has-text("<"), button:has-text("‹"), button[aria-label*="previous"]').first();
  const nextMonth = page.locator('button:has-text(">"), button:has-text("›"), button[aria-label*="next"]').first();

  if (await nextMonth.isVisible().catch(() => false)) {
    await nextMonth.click();
    await page.waitForTimeout(500);
    await screenshot(page, 'host-calendar-next-month');
    console.log('Takvim sonraki ay tıklandı');
  }

  // Check legend
  const legend = page.locator('text=/Müsait/i, text=/Dolu/i, text=/Beklemede/i');
  const legendCount = await legend.count();
  console.log(`Takvim legend: ${legendCount} öğe`);

  // Check if dates are clickable
  const dateCell = page.locator('td, [class*="day"], [class*="cell"]').first();
  const dateCellClickable = await dateCell.isVisible().catch(() => false);
  console.log(`Tarih hücreleri: ${dateCellClickable ? 'var' : 'yok'}`);
});

// =====================================================
// TEST 16: DERİN TEST — Notifications etkileşim
// =====================================================
test('C4-16: Notifications — okundu işaretleme ve filtreler', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/notifications`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await screenshot(page, 'notifications-initial');

  // Check if loaded (not stuck on spinner)
  const spinner = page.locator('text=/Yükleniyor/i, [class*="spinner"], [class*="loading"]');
  const spinnerVisible = await spinner.isVisible().catch(() => false);
  console.log(`Spinner gösteriliyor mu: ${spinnerVisible ? 'EVET (BUG!)' : 'HAYIR (İYİ)'}`);

  // Count notifications
  const notifItems = page.locator('[class*="notification"], [class*="notif"], li, article').filter({ hasText: /.{10,}/ });
  const notifCount = await notifItems.count();
  console.log(`Bildirim sayısı: ${notifCount}`);

  // Check "Tümünü Okundu İşaretle" button
  const markAllBtn = page.locator('button:has-text("Tümünü"), button:has-text("Okundu"), button:has-text("Mark all")').first();
  const markAllVisible = await markAllBtn.isVisible().catch(() => false);
  console.log(`"Tümünü Okundu" butonu: ${markAllVisible ? 'VAR' : 'YOK'}`);

  // Check filter tabs
  const allTab = page.locator('button:has-text("Tümü"), [role="tab"]:has-text("Tümü")').first();
  const unreadTab = page.locator('button:has-text("Okunmamış"), [role="tab"]:has-text("Okunmamış")').first();
  console.log(`Tümü tab: ${await allTab.isVisible().catch(() => false) ? 'VAR' : 'YOK'}`);
  console.log(`Okunmamış tab: ${await unreadTab.isVisible().catch(() => false) ? 'VAR' : 'YOK'}`);

  // Click unread filter
  if (await unreadTab.isVisible().catch(() => false)) {
    await unreadTab.click();
    await page.waitForTimeout(500);
    await screenshot(page, 'notifications-unread');
    console.log('Okunmamış filtresi tıklandı');
  }
});

// =====================================================
// TEST 17: "Yakında" / Placeholder taraması (tüm sorunlu sayfalarda)
// =====================================================
test('C4-17: Yakında / Placeholder taraması', async ({ page }) => {
  await login(page);

  const pagesToCheck = [
    '/favorites', '/compare', '/booking', '/profile/bookings',
    '/search/map', '/host/apply', '/host/bookings', '/host/calendar',
    '/host/earnings', '/budget', '/roommates', '/mentors',
    '/community/new', '/events/new', '/listing/new', '/messages/new',
  ];

  const issues: string[] = [];

  for (const path of pagesToCheck) {
    await page.goto(`${BASE}${path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const content = await page.textContent('body') || '';

    const placeholders = [
      { pattern: /Yakında/gi, label: 'Yakında' },
      { pattern: /Coming soon/gi, label: 'Coming soon' },
      { pattern: /placeholder/gi, label: 'placeholder' },
      { pattern: /lorem ipsum/gi, label: 'lorem ipsum' },
      { pattern: /TODO/g, label: 'TODO' },
      { pattern: /Bu özellik yakında/gi, label: 'Bu özellik yakında' },
      { pattern: /Henüz hazır değil/gi, label: 'Henüz hazır değil' },
    ];

    for (const p of placeholders) {
      const matches = content.match(p.pattern);
      if (matches) {
        issues.push(`[${path}] "${p.label}" bulundu (${matches.length} kez)`);
      }
    }
  }

  if (issues.length > 0) {
    console.log('=== PLACEHOLDER/YAKINDA BULUNDU ===');
    issues.forEach(i => console.log(i));
  } else {
    console.log('=== TÜM SAYFALARDA PLACEHOLDER/YAKINDA YOK — TEMİZ ===');
  }
});
