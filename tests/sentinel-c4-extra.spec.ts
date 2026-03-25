import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';

async function login(page: any) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.fill('input[type="email"]', 'deniz@kotwise.com');
  await page.fill('input[type="password"]', 'KotwiseTest2026!');
  await page.getByRole('button', { name: 'Giriş Yap', exact: true }).click();
  await page.waitForTimeout(3000);
}

test('FAVORITES re-test with proper login', async ({ page }) => {
  await login(page);
  expect(page.url()).not.toContain('/login');

  await page.goto(`${BASE}/favorites`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c4-favorites-retest.png', fullPage: true });

  const text = await page.textContent('body') || '';
  const imgs = page.locator('img');
  const count = await imgs.count();
  let svgCount = 0, realCount = 0;
  const srcs: string[] = [];
  for (let i = 0; i < count; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    srcs.push(src.substring(0, 80));
    if (src.includes('data:image/svg') || src.includes('placeholder')) svgCount++;
    else if (src.includes('http') || src.includes('unsplash') || src.includes('/api') || src.includes('/_next')) realCount++;
  }

  const prices = text.match(/[\d.,]+\s*[₺TL]/g) || [];
  console.log(`FAVORITES: ${count} imgs, ${svgCount} SVG, ${realCount} real`);
  console.log(`FAVORITES prices: ${prices.join(', ')}`);
  console.log(`FAVORITES img srcs: ${srcs.join(' | ')}`);
});

test('CITY DETAIL re-test', async ({ page }) => {
  await login(page);

  await page.goto(`${BASE}/city`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Get city links
  const cityLinks = page.locator('a[href*="/city/"]');
  const linkCount = await cityLinks.count();
  console.log(`CITY page: ${linkCount} city links`);

  if (linkCount > 0) {
    const href = await cityLinks.first().getAttribute('href');
    console.log(`First city href: ${href}`);
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tests/screenshots/sentinel-c4-city-detail-retest.png', fullPage: true });

  const text = await page.textContent('body') || '';
  const hasBilgi = text.includes('Bilgi');
  const hasMahalleler = text.includes('Mahalleler') || text.includes('mahalleler');
  const hasIlanlar = text.includes('İlanlar') || text.includes('ilan');
  const hasUlasim = text.includes('Ulaşım') || text.includes('ulaşım');
  const hasSohbet = text.includes('Sohbet') || text.includes('sohbet');
  const hasMaliyet = text.includes('Maliyet') || text.includes('maliyet');

  console.log(`CITY-DETAIL: Bilgi=${hasBilgi}, Mahalleler=${hasMahalleler}, İlanlar=${hasIlanlar}, Ulaşım=${hasUlasim}, Sohbet=${hasSohbet}, Maliyet=${hasMaliyet}`);
});

test('ROOMMATES DETAIL re-test', async ({ page }) => {
  await login(page);

  // Go to API to get roommate IDs
  await page.goto(`${BASE}/roommates`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Find any link to roommate detail
  const allLinks = page.locator('a');
  const linkCount = await allLinks.count();
  let roommateHref = '';
  for (let i = 0; i < linkCount; i++) {
    const href = await allLinks.nth(i).getAttribute('href') || '';
    if (href.includes('/roommates/') && href !== '/roommates') {
      roommateHref = href;
      break;
    }
  }

  console.log(`Roommate detail href: ${roommateHref || 'NONE FOUND'}`);

  if (roommateHref) {
    await page.goto(`${BASE}${roommateHref}`, { waitUntil: 'networkidle', timeout: 15000 });
  } else {
    // Try clicking the card
    const card = page.locator('[class*="card"]').first();
    if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
      await card.click();
      await page.waitForTimeout(2000);
    }
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c4-roommates-detail-retest.png', fullPage: true });

  const text = await page.textContent('body') || '';
  const hasUyumPercent = /\d+%/.test(text);
  const hasUyumBilgisiYok = text.includes('Uyum bilgisi yok');
  const hasFarkliIlgi = text.includes('Farklı ilgi') || text.includes('farklı ilgi');
  const hasMesajGonder = text.includes('Mesaj Gönder');
  const hasPhoto = text.includes('Can') || text.includes('Berlin');

  console.log(`ROOMMATES-DETAIL: URL=${page.url()}, uyum%=${hasUyumPercent}, UyumBilgisiYok=${hasUyumBilgisiYok}, FarklıİIlgi=${hasFarkliIlgi}, MesajGönder=${hasMesajGonder}, content=${hasPhoto}`);
});

test('PLACEHOLDER scan - 18 pages (fast)', async ({ page }) => {
  await login(page);

  const pages = [
    '/', '/search', '/favorites', '/compare', '/booking', '/profile/bookings',
    '/search/map', '/events', '/community', '/messages', '/roommates',
    '/mentors', '/budget', '/settings', '/notifications', '/host/bookings',
    '/host/calendar', '/host/earnings'
  ];

  let foundPages: string[] = [];

  for (const path of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(800);

    const text = await page.textContent('body') || '';
    const hasYakinda = text.includes('Yakında') || text.includes('yakında');
    const hasComingSoon = text.toLowerCase().includes('coming soon');
    const hasTemplate = text.includes('{currencySymbol}') || text.includes('{currency}');
    const hasTodo = text.includes('TODO');

    if (hasYakinda || hasComingSoon || hasTemplate || hasTodo) {
      foundPages.push(`${path}: yakında=${hasYakinda}, comingSoon=${hasComingSoon}, template=${hasTemplate}, todo=${hasTodo}`);
    }
  }

  if (foundPages.length === 0) {
    console.log('PLACEHOLDER SCAN: ALL CLEAR - 18 sayfada hiçbir placeholder bulunamadı');
  } else {
    console.log(`PLACEHOLDER SCAN FOUND: ${foundPages.join(' | ')}`);
  }
});

test('CONSOLE errors - 10 pages', async ({ page }) => {
  await login(page);

  const testPages = [
    '/favorites', '/compare', '/booking', '/profile/bookings', '/search/map',
    '/notifications', '/messages', '/roommates', '/host/earnings', '/events'
  ];

  const allErrors: Record<string, string[]> = {};

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const url = page.url();
      const path = new URL(url).pathname;
      if (!allErrors[path]) allErrors[path] = [];
      allErrors[path].push(msg.text().substring(0, 100));
    }
  });

  for (const path of testPages) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }

  const totalErrors = Object.values(allErrors).flat().length;
  if (totalErrors === 0) {
    console.log('CONSOLE ERRORS: 0 errors across 10 pages');
  } else {
    for (const [path, errors] of Object.entries(allErrors)) {
      console.log(`CONSOLE ERROR ${path}: ${errors.join(' | ')}`);
    }
    console.log(`CONSOLE ERRORS TOTAL: ${totalErrors}`);
  }
});
