import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SS = 'tests/screenshots';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  await emailInput.fill('deniz@kotwise.com');
  await passwordInput.fill('KotwiseTest2026!');
  const loginBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
  await loginBtn.click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

async function analyzeImages(page: Page, label: string) {
  const images = page.locator('img');
  const imgCount = await images.count();
  console.log(`[${label}] Toplam img: ${imgCount}`);

  const results: string[] = [];
  for (let i = 0; i < Math.min(imgCount, 15); i++) {
    const img = images.nth(i);
    const src = await img.getAttribute('src').catch(() => null);
    const alt = await img.getAttribute('alt').catch(() => '');
    const info = await img.evaluate((el: HTMLImageElement) => ({
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      width: el.width,
      height: el.height,
      complete: el.complete,
      currentSrc: el.currentSrc?.substring(0, 100),
    })).catch(() => null);

    const line = `img[${i}]: src=${src?.substring(0, 80)}, alt=${alt}, nat=${info?.naturalWidth}x${info?.naturalHeight}, rendered=${info?.width}x${info?.height}, complete=${info?.complete}`;
    console.log(`[${label}] ${line}`);
    results.push(line);
  }
  return { imgCount, results };
}

test.describe('Döngü 3 Re-Check — Siyah Kare + Harita Zoom', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // === BUG 1: Siyah Kare Fotoğraflar ===

  test('favorites — siyah kare fotoğraf', async ({ page }) => {
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SS}/sentinel-c3-favorites.png`, fullPage: true });

    const { imgCount } = await analyzeImages(page, 'favorites');

    // CSS background-image kontrolü (siyah kare belki CSS ile?)
    const bgImages = await page.evaluate(() => {
      const els = document.querySelectorAll('div, span, figure');
      const bgs: string[] = [];
      els.forEach(el => {
        const bg = getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none') bgs.push(`${el.tagName}.${el.className?.toString().substring(0, 30)}: ${bg.substring(0, 100)}`);
      });
      return bgs.slice(0, 10);
    });
    console.log(`[favorites] Background images: ${JSON.stringify(bgImages)}`);

    const body = await page.locator('body').innerText();
    const prices = body.match(/[\d.]+\s*(?:₺|TL|€)/g);
    console.log(`[favorites] Fiyatlar: ${prices?.join(', ')}`);
    console.log(`[favorites] "Fotoğraf Yok": ${body.includes('Fotoğraf Yok')}`);
  });

  test('compare — siyah kare fotoğraf', async ({ page }) => {
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SS}/sentinel-c3-compare.png`, fullPage: true });

    await analyzeImages(page, 'compare');

    const body = await page.locator('body').innerText();
    console.log(`[compare] "Fotoğraf Yok": ${body.includes('Fotoğraf Yok')}`);

    // Karşılaştırma tablosu kontrolü
    const hasTable = body.includes('Fiyat') && body.includes('Konum');
    console.log(`[compare] Karşılaştırma tablosu: ${hasTable}`);
  });

  test('booking — siyah kare fotoğraf + Stripe', async ({ page }) => {
    await page.goto(`${BASE}/booking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SS}/sentinel-c3-booking.png`, fullPage: true });

    await analyzeImages(page, 'booking');

    const body = await page.locator('body').innerText();
    const prices = body.match(/[\d.]+\s*(?:₺|TL|€)/g);
    console.log(`[booking] Fiyatlar: ${prices?.join(', ')}`);

    // Stripe/Ödeme kontrolü
    const hasPayment = body.includes('Ödeme') || body.includes('Stripe') || body.includes('Kart') || body.includes('ödeme');
    console.log(`[booking] Ödeme/Stripe: ${hasPayment}`);
  });

  test('profile-bookings — siyah kare fotoğraf + fiyat', async ({ page }) => {
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SS}/sentinel-c3-profile-bookings.png`, fullPage: true });

    await analyzeImages(page, 'profile-bookings');

    const body = await page.locator('body').innerText();
    const prices = body.match(/[\d.]+\s*(?:₺|TL|€)/g);
    console.log(`[profile-bookings] Fiyatlar: ${prices?.join(', ')}`);

    // 100x fiyat kontrolü — 10.000+ TL olan varsa hâlâ bug
    const highPrices = prices?.filter(p => {
      const num = parseFloat(p.replace(/\./g, '').replace(/[^\d]/g, ''));
      return num > 10000;
    });
    console.log(`[profile-bookings] 10.000+ TL fiyatlar: ${highPrices?.join(', ') || 'YOK'}`);
  });

  // === BUG 2: Harita Zoom ===

  test('search-map — zoom ve marker', async ({ page }) => {
    await page.goto(`${BASE}/search/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${SS}/sentinel-c3-search-map.png`, fullPage: true });

    // Leaflet zoom level
    const mapInfo = await page.evaluate(() => {
      const containers = document.querySelectorAll('.leaflet-container');
      if (containers.length === 0) return { hasMap: false };

      // Try to find Leaflet map instance
      let zoom = null;
      let center = null;
      const container = containers[0] as any;
      if (container._leaflet_id) {
        // Leaflet stores map reference
        const maps = Object.values((window as any).L || {});
      }

      // Check zoom from tile URLs
      const tiles = document.querySelectorAll('.leaflet-tile') as NodeListOf<HTMLImageElement>;
      const tileSrcs: string[] = [];
      tiles.forEach(t => tileSrcs.push(t.src));

      // Extract zoom level from tile URL pattern: /{z}/{x}/{y}
      const zoomLevels = tileSrcs.map(src => {
        const match = src.match(/\/(\d+)\/\d+\/\d+/);
        return match ? parseInt(match[1]) : null;
      }).filter(Boolean);

      return {
        hasMap: true,
        tileCount: tiles.length,
        zoomLevels: [...new Set(zoomLevels)],
        sampleTile: tileSrcs[0]?.substring(0, 120),
      };
    });
    console.log(`[search-map] Map info: ${JSON.stringify(mapInfo)}`);

    // Marker'lar ve fiyatlar
    const markerInfo = await page.evaluate(() => {
      const markers = document.querySelectorAll('.leaflet-marker-icon, .leaflet-marker-pane > *');
      const texts: string[] = [];
      markers.forEach(m => {
        const t = m.textContent?.trim();
        if (t) texts.push(t);
      });

      // Overlay pane'deki custom marker'lar
      const overlays = document.querySelectorAll('.leaflet-overlay-pane *, .leaflet-popup-pane *');
      overlays.forEach(o => {
        const t = o.textContent?.trim();
        if (t && t.length < 30) texts.push(t);
      });

      return { markerCount: markers.length, texts: texts.slice(0, 10) };
    });
    console.log(`[search-map] Markers: ${JSON.stringify(markerInfo)}`);

    // Sayfadaki fiyatlar
    const body = await page.locator('body').innerText();
    const prices = body.match(/[\d.]+\s*(?:₺|TL)/g);
    console.log(`[search-map] Fiyatlar: ${prices?.slice(0, 8).join(', ')}`);

    // Zoom level yorumu
    if (mapInfo.hasMap && mapInfo.zoomLevels) {
      const maxZoom = Math.max(...(mapInfo.zoomLevels as number[]));
      console.log(`[search-map] Max zoom level: ${maxZoom} (şehir için 12+ olmalı, 5-6 ise Avrupa)`);
    }
  });

  // === Önceki düzeltmelerin doğrulanması ===

  test('notifications — regresyon fix doğrulama', async ({ page }) => {
    await page.goto(`${BASE}/notifications`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${SS}/sentinel-c3-notifications.png`, fullPage: true });

    const body = await page.locator('body').innerText();
    const stuckLoading = body.includes('Yükleniyor') && body.length < 300;
    console.log(`[notifications] Stuck loading: ${stuckLoading}`);
    console.log(`[notifications] Body uzunluğu: ${body.length}`);
    console.log(`[notifications] İçerik preview: ${body.substring(0, 200)}`);
  });

  test('messages — chat input doğrulama', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // İlk konuşmaya tıkla
    const firstConv = page.locator('div[class*="cursor-pointer"], div[role="button"], li').first();
    if (await firstConv.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstConv.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: `${SS}/sentinel-c3-messages-detail.png`, fullPage: true });

    // Chat input kontrolü
    const inputSelectors = [
      'input[placeholder*="mesaj" i]',
      'textarea[placeholder*="mesaj" i]',
      'input[placeholder*="yaz" i]',
      'textarea[placeholder*="yaz" i]',
      '[contenteditable="true"]',
    ];
    let hasInput = false;
    for (const sel of inputSelectors) {
      const count = await page.locator(sel).count();
      if (count > 0) {
        hasInput = true;
        console.log(`[messages] Chat input bulundu: ${sel} (${count} adet)`);
        break;
      }
    }
    if (!hasInput) console.log(`[messages] ⚠️ Chat input BULUNAMADI`);

    const body = await page.locator('body').innerText();
    console.log(`[messages] "Mesaj yaz" text: ${body.includes('Mesaj yaz') || body.includes('mesaj yaz')}`);
  });

  test('mentors — içerik zenginliği', async ({ page }) => {
    await page.goto(`${BASE}/mentors`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c3-mentors.png`, fullPage: true });

    const body = await page.locator('body').innerText();

    // Mentor sayısını say
    const mentorCards = page.locator('[class*="card"], [class*="mentor"]');
    const cardCount = await mentorCards.count();
    console.log(`[mentors] Kart sayısı: ${cardCount}`);

    // İsim arama
    const mentorNames = body.match(/(?:Maria|Carlos|Ana|Pedro|Sophie|Hans|Mehmet|Ayşe|Ali|Fatma|João|Miguel)\s+\w+/g);
    console.log(`[mentors] Mentor isimleri: ${mentorNames?.join(', ') || 'bulunamadı'}`);
    console.log(`[mentors] Mentor sayısı: ${mentorNames?.length || 0}`);

    // "Mentor Ol" butonu
    console.log(`[mentors] "Mentor Ol": ${body.includes('Mentor Ol')}`);
    console.log(`[mentors] "Mesaj Gönder": ${body.includes('Mesaj Gönder')}`);
  });

  // === Placeholder/Yakında taraması ===

  test('yakında ve placeholder taraması', async ({ page }) => {
    const pagesToCheck = [
      '/favorites', '/compare', '/booking', '/profile/bookings',
      '/search/map', '/notifications', '/messages', '/mentors',
    ];

    for (const path of pagesToCheck) {
      await page.goto(`${BASE}${path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      const body = await page.locator('body').innerText();
      const issues: string[] = [];

      if (body.includes('Yakında')) issues.push('Yakında');
      if (body.toLowerCase().includes('coming soon')) issues.push('Coming soon');
      if (body.toLowerCase().includes('placeholder')) issues.push('placeholder');
      if (body.toLowerCase().includes('lorem ipsum')) issues.push('lorem ipsum');
      if (body.includes('Bu özellik yakında')) issues.push('Bu özellik yakında');
      if (body.includes('TODO')) issues.push('TODO');

      if (issues.length > 0) {
        console.log(`[${path}] ⚠️ PLACEHOLDER: ${issues.join(', ')}`);
      } else {
        console.log(`[${path}] ✅ Temiz`);
      }
    }
  });
});
