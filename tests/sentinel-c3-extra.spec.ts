import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';

async function login(page: any) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  const emailInput = page.locator('input[type="email"], input[placeholder*="mail"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  }
}

test('C3-E1: find real listing ID + test detail', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Find listing links
  const links = await page.$$eval('a[href*="/listing/"]', (els: any[]) => els.map(e => e.href));
  console.log('LISTING_LINKS:', JSON.stringify(links.slice(0, 5)));

  if (links.length > 0) {
    await page.goto(links[0]);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c3-listing-detail-real.png', fullPage: true });
    const text = await page.textContent('body') || '';
    const pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
    console.log('DETAIL_PRICES:', JSON.stringify(pm.slice(0, 15)));
    console.log('HAS_ILAN_BULUNAMADI:', text.includes('İlan bulunamadı'));

    // Check carousel images
    const imgs = await page.$$eval('img', (els: any[]) => els.map(e => ({
      s: e.src?.substring(0, 80),
      svg: e.src?.startsWith('data:image/svg'),
      w: e.naturalWidth
    })));
    console.log('DETAIL_IMGS:', JSON.stringify(imgs.slice(0, 5)));
  }
});

test('C3-E2: host-earnings deep check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/earnings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-host-earnings-full.png', fullPage: true });
  const text = await page.textContent('body') || '';
  console.log('HAS_CURRENCY_LITERAL:', text.includes('{currencySymbol}'));
  console.log('HAS_YUKLENIYOR:', text.includes('Yükleniyor'));
  console.log('TEXT_LEN:', text.length);
  // Check for monetary values
  const pm = text.match(/[\d.]+\s*(?:TL|₺|€|EUR)/gi) || [];
  console.log('EARNINGS_PRICES:', JSON.stringify(pm));
});

test('C3-E3: search listing photos check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-search.png', fullPage: true });
  const imgs = await page.$$eval('img', (els: any[]) => els.map(e => ({
    s: e.src?.substring(0, 100),
    svg: e.src?.startsWith('data:image/svg'),
  })));
  const svgCount = imgs.filter((i: any) => i.svg).length;
  const realCount = imgs.filter((i: any) => !i.svg).length;
  console.log('SVG_PLACEHOLDER:', svgCount, 'REAL:', realCount);
  const text = await page.textContent('body') || '';
  const pm = text.match(/[\d.]+\s*(?:TL|₺|€)/gi) || [];
  console.log('SEARCH_PRICES:', JSON.stringify(pm.slice(0, 8)));
});

test('C3-E4: roommates detail uyum check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  // Find detail link
  const links = await page.$$eval('a[href*="/roommates/"]', (els: any[]) => els.map(e => e.href));
  console.log('ROOMMATE_LINKS:', JSON.stringify(links));

  // Navigate to first roommate detail if link exists
  if (links.length > 0) {
    await page.goto(links[0]);
  } else {
    // Try clicking on the card
    const card = page.locator('[class*="card"], [class*="swipe"]').first();
    if (await card.isVisible({ timeout: 2000 }).catch(() => false)) {
      await card.click();
      await page.waitForTimeout(2000);
    }
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-roommates-detail.png', fullPage: true });
  const text = await page.textContent('body') || '';
  console.log('UYUM_YOK:', text.includes('Uyum bilgisi yok'));
  console.log('UYUM_PCT:', /\d+%\s*Uyum/i.test(text));
  console.log('ORTAK_ILGI:', text.includes('Ortak ilgi'));
});

test('C3-E5: homepage price check (detailed)', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  // Extract all numeric values that could be prices
  const text = await page.textContent('body') || '';
  // Look for suspiciously high prices (>5000)
  const allNums = text.match(/[\d.]+\s*(?:TL|₺|€)\/ay/gi) || [];
  console.log('HOME_PRICE_PER_MONTH:', JSON.stringify(allNums.slice(0, 10)));
  const highPrices = allNums.filter((p: string) => {
    const num = parseInt(p.replace(/\./g, ''));
    return num > 5000;
  });
  console.log('HIGH_PRICES_OVER_5000:', JSON.stringify(highPrices));
});
