import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
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
// FIX TEST 8: Roommates swipe
// =====================================================
test('C4-08-fix: Roommates swipe etkileşim', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await screenshot(page, 'roommates-initial');

  // Check page content
  const bodyText = await page.textContent('body') || '';
  console.log(`Roommates sayfa içeriği (ilk 200): ${bodyText.substring(0, 200)}`);

  // Check match percentage
  const hasMatch = bodyText.includes('%') && bodyText.includes('Uyum');
  console.log(`Uyum yüzdesi var mı: ${hasMatch}`);

  // Check for swipe buttons
  const allButtons = await page.locator('button').all();
  console.log(`Toplam buton sayısı: ${allButtons.length}`);
  for (const btn of allButtons) {
    const text = (await btn.textContent() || '').trim().substring(0, 30);
    if (text) console.log(`  Buton: "${text}"`);
  }

  // Try to find and click reject/skip
  const buttons = await page.locator('button').all();
  let clicked = false;
  for (const btn of buttons) {
    const text = (await btn.textContent() || '').trim();
    if (text.includes('✕') || text.includes('❌') || text.includes('Geç') || text.includes('Reddet')) {
      const beforeContent = await page.locator('main, [class*="card"]').first().textContent().catch(() => '');
      await btn.click();
      await page.waitForTimeout(1000);
      const afterContent = await page.locator('main, [class*="card"]').first().textContent().catch(() => '');
      console.log(`Swipe butonu tıklandı: "${text}"`);
      console.log(`Kart değişti: ${beforeContent?.substring(0, 50) !== afterContent?.substring(0, 50)}`);
      clicked = true;
      await screenshot(page, 'roommates-after-swipe');
      break;
    }
  }
  if (!clicked) console.log('Swipe butonu bulunamadı');
});

// =====================================================
// FIX TEST 10: Budget slider
// =====================================================
test('C4-10-fix: Budget slider etkileşimi', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/budget`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'budget-initial');

  const sliders = await page.locator('input[type="range"]').all();
  console.log(`Slider sayısı: ${sliders.length}`);

  for (let i = 0; i < sliders.length; i++) {
    const min = await sliders[i].getAttribute('min') || '0';
    const max = await sliders[i].getAttribute('max') || '100';
    const value = await sliders[i].inputValue();
    console.log(`  Slider ${i}: min=${min}, max=${max}, value=${value}`);
  }

  // Modify first slider
  if (sliders.length > 0) {
    await sliders[0].fill('8');
    await page.waitForTimeout(500);
    console.log('Slider değiştirildi (value=8)');
  }

  // Check total display
  const bodyText = await page.textContent('body') || '';
  const hasTL = bodyText.includes('₺') || bodyText.includes('TL');
  console.log(`Para birimi görünüyor: ${hasTL}`);

  // Check for summary/total section
  const hasTotal = bodyText.includes('Toplam') || bodyText.includes('toplam') || bodyText.includes('Aylık');
  console.log(`Toplam/Aylık bölümü: ${hasTotal}`);

  await screenshot(page, 'budget-slider-changed');
});

// =====================================================
// FIX TEST 12: Settings toggles
// =====================================================
test('C4-12-fix: Settings toggle etkileşimleri', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/settings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'settings-initial');

  // Get all interactive elements
  const bodyText = await page.textContent('body') || '';
  console.log(`Settings sayfa içeriği (ilk 300): ${bodyText.substring(0, 300)}`);

  // Look for toggle-like elements more broadly
  const checkboxes = await page.locator('input[type="checkbox"]').count();
  const switches = await page.locator('[role="switch"]').count();
  const divToggles = await page.locator('div[class*="toggle"], div[class*="switch"]').count();
  console.log(`Checkbox: ${checkboxes}, Switch: ${switches}, Div toggle: ${divToggles}`);

  // Check for specific settings
  const hasDarkMode = bodyText.includes('Karanlık') || bodyText.includes('karanlık') || bodyText.includes('Tema');
  const hasLanguage = bodyText.includes('Türkçe') || bodyText.includes('Dil');
  const hasCurrency = bodyText.includes('TRY') || bodyText.includes('Para');
  console.log(`Karanlık tema: ${hasDarkMode}, Dil: ${hasLanguage}, Para birimi: ${hasCurrency}`);

  // Try to find and click any toggle/switch
  const clickableElements = await page.locator('[role="switch"], input[type="checkbox"], div[class*="toggle"]').all();
  if (clickableElements.length > 0) {
    await clickableElements[0].click({ force: true });
    await page.waitForTimeout(500);
    console.log('Toggle tıklandı');
    await screenshot(page, 'settings-toggle-changed');
  } else {
    console.log('Toggle/switch bulunamadı — sayfa yapısı incelenmeli');
  }
});

// =====================================================
// FIX TEST 13: Listing detail — no timeout
// =====================================================
test('C4-13-fix: Listing Detail carousel ve butonlar', async ({ page }) => {
  await login(page);

  // Go directly to a listing
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Find listing links
  const links = await page.locator('a[href*="/listing/"]').all();
  console.log(`Listing link sayısı: ${links.length}`);

  if (links.length > 0) {
    const href = await links[0].getAttribute('href');
    console.log(`İlk listing link: ${href}`);
    await page.goto(`${BASE}${href}`);
  } else {
    // Try direct URL
    await page.goto(`${BASE}/listing/1`);
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, 'listing-detail');

  // Check all images
  const images = await page.locator('img').all();
  let realPhotos = 0;
  for (const img of images) {
    const src = await img.getAttribute('src') || '';
    if (!src.includes('data:image/svg+xml') && (src.startsWith('http') || src.startsWith('/'))) {
      realPhotos++;
    }
  }
  console.log(`Toplam img: ${images.length}, Gerçek fotoğraf: ${realPhotos}`);

  // Check price
  const bodyText = await page.textContent('body') || '';
  const priceMatch = bodyText.match(/\d+[\s.]?\d*\s*(₺|TL|\/ay)/);
  console.log(`Fiyat: ${priceMatch ? priceMatch[0] : 'bulunamadı'}`);

  // Check booking button
  const hasBooking = bodyText.includes('Rezervasyon') || bodyText.includes('Kirala');
  console.log(`Rezervasyon butonu: ${hasBooking}`);

  // Check reviews
  const hasReviews = bodyText.includes('Yorum') || bodyText.includes('yorum') || bodyText.includes('Değerlendirme');
  console.log(`Yorum bölümü: ${hasReviews}`);

  // Check similar listings
  const hasSimilar = bodyText.includes('Benzer') || bodyText.includes('benzer');
  console.log(`Benzer ilanlar: ${hasSimilar}`);

  // Carousel — look for image counter
  const hasCounter = bodyText.match(/\d+\s*\/\s*\d+/);
  console.log(`Carousel sayaç: ${hasCounter ? hasCounter[0] : 'yok'}`);
});

// =====================================================
// FIX TEST 15: Host Bookings & Calendar
// =====================================================
test('C4-15-fix: Host Bookings & Calendar', async ({ page }) => {
  await login(page);

  // Host bookings
  await page.goto(`${BASE}/host/bookings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'host-bookings');

  const bodyText = await page.textContent('body') || '';
  const hasEmpty = bodyText.includes('henüz') || bodyText.includes('talep yok') || bodyText.includes('boş') || bodyText.includes('bulunamadı');
  console.log(`Host bookings empty state: ${hasEmpty ? 'VAR' : 'İçerik var veya farklı yapıda'}`);

  // Check filter tabs
  const hasBekleyen = bodyText.includes('Bekleyen') || bodyText.includes('Beklemede');
  const hasOnayli = bodyText.includes('Onaylı') || bodyText.includes('Onaylandı');
  console.log(`Bekleyen tab: ${hasBekleyen}, Onaylı tab: ${hasOnayli}`);

  // Host calendar
  await page.goto(`${BASE}/host/calendar`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'host-calendar');

  const calText = await page.textContent('body') || '';
  const hasMusait = calText.includes('Müsait');
  const hasDolu = calText.includes('Dolu');
  const hasBeklemede = calText.includes('Beklemede');
  console.log(`Legend: Müsait=${hasMusait}, Dolu=${hasDolu}, Beklemede=${hasBeklemede}`);

  // Try month navigation
  const navBtns = await page.locator('button').all();
  for (const btn of navBtns) {
    const text = (await btn.textContent() || '').trim();
    if (text === '>' || text === '›' || text === '→') {
      await btn.click();
      await page.waitForTimeout(500);
      console.log('Sonraki ay tıklandı');
      await screenshot(page, 'host-calendar-next');
      break;
    }
  }
});

// =====================================================
// EXTRA: Search deep — neden 0 kart?
// =====================================================
test('C4-extra-1: Search page — kart sayısı araştırması', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, 'search-deep');

  // Get full page structure
  const bodyText = await page.textContent('body') || '';
  console.log(`Search sayfa içeriği (ilk 500): ${bodyText.substring(0, 500)}`);

  // Check for listing items more broadly
  const allLinks = await page.locator('a').all();
  let listingLinks = 0;
  for (const link of allLinks) {
    const href = await link.getAttribute('href') || '';
    if (href.includes('/listing/')) {
      listingLinks++;
      if (listingLinks <= 5) console.log(`  Listing link: ${href}`);
    }
  }
  console.log(`Listing link sayısı: ${listingLinks}`);

  // Check for photos
  const imgs = await page.locator('img').all();
  let realImgs = 0;
  let svgImgs = 0;
  for (const img of imgs) {
    const src = await img.getAttribute('src') || '';
    if (src.includes('data:image/svg+xml')) svgImgs++;
    else if (src.startsWith('http') || src.startsWith('/')) realImgs++;
  }
  console.log(`Resimler: gerçek=${realImgs}, svg placeholder=${svgImgs}`);

  // Check for price display
  const priceMatches = bodyText.match(/\d+\s*(₺|TL|\/ay)/g);
  console.log(`Fiyat gösterimleri: ${priceMatches ? priceMatches.join(', ') : 'yok'}`);
});

// =====================================================
// EXTRA: Host Apply deep — neden 0 form alanı?
// =====================================================
test('C4-extra-2: Host Apply — detaylı inceleme', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/apply`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await screenshot(page, 'host-apply-deep');

  const bodyText = await page.textContent('body') || '';
  console.log(`Host Apply içerik (ilk 500): ${bodyText.substring(0, 500)}`);

  // Check all elements
  const allInputs = await page.locator('input, textarea, select').all();
  console.log(`Tüm input/textarea/select: ${allInputs.length}`);
  for (const inp of allInputs) {
    const type = await inp.getAttribute('type') || '';
    const name = await inp.getAttribute('name') || '';
    const placeholder = await inp.getAttribute('placeholder') || '';
    const visible = await inp.isVisible();
    console.log(`  type=${type}, name=${name}, placeholder=${placeholder}, visible=${visible}`);
  }

  // Check buttons
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = (await btn.textContent() || '').trim().substring(0, 40);
    if (text) console.log(`  Buton: "${text}"`);
  }
});

// =====================================================
// EXTRA: Messages detail — Gönder butonu araştırması
// =====================================================
test('C4-extra-3: Messages detail — Gönder butonu detaylı', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/messages`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Click first conversation
  const convos = await page.locator('a[href*="/messages/"]').all();
  console.log(`Konuşma link sayısı: ${convos.length}`);

  if (convos.length > 0) {
    const href = await convos[0].getAttribute('href');
    console.log(`İlk konuşma: ${href}`);
    await page.goto(`${BASE}${href}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await screenshot(page, 'messages-detail-deep');

    // Check all inputs
    const inputs = await page.locator('input, textarea').all();
    console.log(`Input/textarea sayısı: ${inputs.length}`);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type') || '';
      const placeholder = await inp.getAttribute('placeholder') || '';
      const visible = await inp.isVisible();
      console.log(`  [${type}] placeholder="${placeholder}" visible=${visible}`);
    }

    // Check ALL buttons
    const buttons = await page.locator('button').all();
    console.log(`Buton sayısı: ${buttons.length}`);
    for (const btn of buttons) {
      const text = (await btn.textContent() || '').trim().substring(0, 30);
      const ariaLabel = await btn.getAttribute('aria-label') || '';
      console.log(`  Buton: "${text}" aria="${ariaLabel}"`);
    }

    // Check for send icon (SVG or icon)
    const svgInButtons = await page.locator('button svg, button i, button span[class*="icon"]').count();
    console.log(`Butonlardaki ikon sayısı: ${svgInButtons}`);
  }
});
