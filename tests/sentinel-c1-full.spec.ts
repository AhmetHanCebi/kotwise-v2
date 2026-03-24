import { test, expect, Page } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';

// Helper: login
async function login(page: Page) {
  await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.fill('input[type="email"]', 'deniz@kotwise.com');
  await page.fill('input[type="password"]', 'KotwiseTest2026!');
  await page.getByRole('button', { name: 'Giriş Yap', exact: true }).click();
  await page.waitForURL('/**', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
}

// Helper: check page basics
async function checkPage(page: Page, url: string, name: string) {
  const result: {
    name: string;
    url: string;
    status: 'OK' | 'BUG';
    bugs: string[];
    screenshots: string[];
  } = {
    name,
    url,
    status: 'OK',
    bugs: [],
    screenshots: [],
  };

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

    // Check HTTP status
    if (response && response.status() >= 400) {
      result.bugs.push(`HTTP ${response.status()} error`);
      result.status = 'BUG';
    }

    await page.waitForTimeout(1500);

    // Take screenshot
    const screenshotPath = `${SCREENSHOT_DIR}/sentinel-c1-${name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshots.push(screenshotPath);

    // Check for error messages on page
    const errorTexts = await page.locator('text=/error|hata|404|not found/i').count();
    const bodyText = await page.locator('body').innerText();

    // Check for "Yakında" / "Coming soon" placeholders
    const yakindaMatch = bodyText.match(/yakında|coming soon|bu özellik yakında/gi);
    if (yakindaMatch) {
      result.bugs.push(`Placeholder bulundu: "${yakindaMatch.join(', ')}"`);
      result.status = 'BUG';
    }

    // Check for empty/blank page
    const bodyLength = bodyText.trim().length;
    if (bodyLength < 20) {
      result.bugs.push(`Sayfa neredeyse boş (${bodyLength} karakter)`);
      result.status = 'BUG';
    }

    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Check if loading spinners are stuck
    const spinners = await page.locator('.animate-spin, .animate-pulse, [class*="loading"], [class*="skeleton"]').count();
    // Give extra time if spinners found
    if (spinners > 0) {
      await page.waitForTimeout(3000);
      const stillSpinning = await page.locator('.animate-spin').count();
      if (stillSpinning > 0) {
        result.bugs.push(`Yükleme spinner'ı takılı kaldı (${stillSpinning} adet)`);
        result.status = 'BUG';
      }
    }

    // Check for broken images
    const images = page.locator('img');
    const imgCount = await images.count();
    for (let i = 0; i < Math.min(imgCount, 10); i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      const src = await img.getAttribute('src');
      if (naturalWidth === 0 && src && !src.startsWith('data:')) {
        result.bugs.push(`Kırık resim: ${src?.substring(0, 80)}`);
        result.status = 'BUG';
      }
    }

  } catch (err: any) {
    result.bugs.push(`Sayfa yüklenemedi: ${err.message?.substring(0, 100)}`);
    result.status = 'BUG';
    try {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-${name}-error.png` });
    } catch {}
  }

  return result;
}

// All pages to test
const PAGES = [
  { url: '/', name: 'home' },
  { url: '/welcome', name: 'welcome' },
  { url: '/search', name: 'search' },
  { url: '/search/map', name: 'search-map' },
  { url: '/community', name: 'community' },
  { url: '/community/new', name: 'community-new' },
  { url: '/events', name: 'events' },
  { url: '/events/new', name: 'events-new' },
  { url: '/roommates', name: 'roommates' },
  { url: '/mentors', name: 'mentors' },
  { url: '/messages', name: 'messages' },
  { url: '/messages/new', name: 'messages-new' },
  { url: '/city', name: 'city' },
  { url: '/favorites', name: 'favorites' },
  { url: '/compare', name: 'compare' },
  { url: '/budget', name: 'budget' },
  { url: '/notifications', name: 'notifications' },
  { url: '/profile', name: 'profile' },
  { url: '/profile/edit', name: 'profile-edit' },
  { url: '/profile/bookings', name: 'profile-bookings' },
  { url: '/host', name: 'host' },
  { url: '/host/apply', name: 'host-apply' },
  { url: '/host/bookings', name: 'host-bookings' },
  { url: '/host/calendar', name: 'host-calendar' },
  { url: '/host/earnings', name: 'host-earnings' },
  { url: '/settings', name: 'settings' },
  { url: '/settings/faq', name: 'settings-faq' },
  { url: '/settings/privacy', name: 'settings-privacy' },
  { url: '/settings/terms', name: 'settings-terms' },
  { url: '/booking', name: 'booking' },
  { url: '/listing/new', name: 'listing-new' },
  { url: '/onboarding', name: 'onboarding' },
];

test.describe('Sentinel Cycle 1 - Temel Kontrol', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await login(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  for (const p of PAGES) {
    test(`${p.name} (${p.url})`, async () => {
      const result = await checkPage(page, p.url, p.name);
      console.log(JSON.stringify(result));
      if (result.bugs.length > 0) {
        console.log(`BUGS [${p.name}]: ${result.bugs.join(' | ')}`);
      }
      // Don't fail on bugs - we want to continue testing all pages
      // Just log them
    });
  }
});

// Special tests for dynamic pages - need IDs from database
test.describe('Sentinel Cycle 1 - Dinamik Sayfalar', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await login(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('listing detail - first listing', async () => {
    // Go to search and find first listing
    await page.goto('/search', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const listingLink = page.locator('a[href*="/listing/"]').first();
    if (await listingLink.count() > 0) {
      await listingLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-listing-detail.png`, fullPage: true });

      const bodyText = await page.locator('body').innerText();

      // Check for real content
      if (bodyText.length < 50) {
        console.log('BUG [listing-detail]: Sayfa neredeyse boş');
      }

      // Check map
      const hasMap = await page.locator('[class*="map"], [class*="Map"], canvas, .leaflet-container, iframe[src*="map"]').count();
      if (hasMap === 0) {
        console.log('BUG [listing-detail]: Harita bileşeni bulunamadı');
      }
    } else {
      console.log('BUG [search]: Hiç ilan bulunamadı');
    }
  });

  test('city detail - first city', async () => {
    await page.goto('/city', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const cityLink = page.locator('a[href*="/city/"]').first();
    if (await cityLink.count() > 0) {
      await cityLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-city-detail.png`, fullPage: true });

      const bodyText = await page.locator('body').innerText();
      if (bodyText.length < 50) {
        console.log('BUG [city-detail]: Sayfa neredeyse boş');
      }
    } else {
      console.log('BUG [city]: Hiç şehir bulunamadı');
    }
  });

  test('event detail - first event', async () => {
    await page.goto('/events', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.count() > 0) {
      const href = await eventLink.getAttribute('href');
      if (href && href !== '/events/new') {
        await eventLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-event-detail.png`, fullPage: true });
      }
    }
  });

  test('community post detail - first post', async () => {
    await page.goto('/community', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const postLink = page.locator('a[href*="/community/"]').first();
    if (await postLink.count() > 0) {
      const href = await postLink.getAttribute('href');
      if (href && href !== '/community/new') {
        await postLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-community-detail.png`, fullPage: true });
      }
    }
  });

  test('roommate detail - first roommate', async () => {
    await page.goto('/roommates', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const roommateLink = page.locator('a[href*="/roommates/"]').first();
    if (await roommateLink.count() > 0) {
      await roommateLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-roommate-detail.png`, fullPage: true });
    }
  });

  // Product quality checks
  test('harita sayfaları gerçek harita gösteriyor mu?', async () => {
    await page.goto('/search/map', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const hasRealMap = await page.locator('.leaflet-container, [class*="mapboxgl"], iframe[src*="google"], iframe[src*="map"], canvas').count();
    const hasPlaceholderMap = await page.locator('text=/harita yakında|map coming soon|placeholder/i').count();

    if (hasRealMap === 0) {
      console.log('BUG [search-map]: Gerçek harita bileşeni bulunamadı - placeholder olabilir');
    }
    if (hasPlaceholderMap > 0) {
      console.log('BUG [search-map]: Harita placeholder');
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-search-map-check.png`, fullPage: true });
  });

  test('üniversite alanı kontrolü - profile edit', async () => {
    await page.goto('/profile/edit', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if university field is free text or autocomplete
    const uniInput = page.locator('input[name*="universit"], input[name*="uni"], input[placeholder*="üniversite" i], input[placeholder*="universit" i]');
    if (await uniInput.count() > 0) {
      const inputType = await uniInput.first().getAttribute('type');
      const hasAutocomplete = await page.locator('[class*="autocomplete"], [class*="dropdown"], [role="listbox"], [role="combobox"], datalist').count();
      if (hasAutocomplete === 0) {
        console.log('BUG [profile-edit]: Üniversite alanı serbest metin - dropdown/autocomplete olmalı');
      }
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-profile-edit-check.png`, fullPage: true });
  });
});
