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
  const loginBtn = page.locator('button.font-bold').first();
  await loginBtn.click();
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
}

// Find actual IDs from listing links and test detail pages
test('C7-FIX-01: Find actual IDs and test detail pages', async ({ page }) => {
  await login(page);

  // Get listing IDs from search page
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const listingLinks = await page.$$eval('a[href*="/listing/"]', els =>
    els.map(el => el.getAttribute('href')).filter(h => h && h !== '/listing/new')
  );
  console.log('LISTING LINKS:', JSON.stringify(listingLinks?.slice(0, 5)));

  // Get event IDs from events page
  await page.goto(`${BASE}/events`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const eventLinks = await page.$$eval('a[href*="/events/"]', els =>
    els.map(el => el.getAttribute('href')).filter(h => h && h !== '/events/new')
  );
  console.log('EVENT LINKS:', JSON.stringify(eventLinks?.slice(0, 5)));

  // Get mentor IDs from mentors page
  await page.goto(`${BASE}/mentors`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const mentorLinks = await page.$$eval('a[href*="/mentors/"]', els =>
    els.map(el => el.getAttribute('href'))
  );
  console.log('MENTOR LINKS:', JSON.stringify(mentorLinks?.slice(0, 5)));

  // Get city IDs
  await page.goto(`${BASE}/city`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const cityLinks = await page.$$eval('a[href*="/city/"]', els =>
    els.map(el => el.getAttribute('href'))
  );
  console.log('CITY LINKS:', JSON.stringify(cityLinks?.slice(0, 5)));

  // Get favorites page (re-test with proper auth)
  await page.goto(`${BASE}/favorites`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const favContent = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText?.substring(0, 1000);
  });
  console.log('FAVORITES CONTENT:', favContent);

  const favImages = await page.$$eval('img', imgs => imgs.map(img => ({
    src: img.src?.substring(0, 80),
    isSVG: img.src?.includes('data:image/svg+xml'),
  })));
  console.log('FAV IMAGES:', JSON.stringify(favImages));

  const favPrices = await page.$$eval('*', els =>
    els.map(el => el.textContent?.trim()).filter(t => t && /\d+\s*(TL|₺)/i.test(t) && t.length < 30)
  );
  console.log('FAV PRICES:', JSON.stringify(favPrices));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-favorites-recheck.png`, fullPage: true });
});

test('C7-FIX-02: Test listing detail with correct ID', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click first listing link
  const firstListing = await page.$('a[href*="/listing/"]:not([href="/listing/new"])');
  if (firstListing) {
    const href = await firstListing.getAttribute('href');
    console.log('CLICKING LISTING:', href);
    await firstListing.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log('LISTING DETAIL URL:', url);

    // Check carousel
    const images = await page.$$eval('img', imgs => imgs.length);
    console.log('LISTING DETAIL IMAGES:', images);

    // Check price
    const prices = await page.$$eval('*', els =>
      els.map(el => el.textContent?.trim()).filter(t => t && /\d+\s*(TL|₺)/i.test(t) && t.length < 30)
    );
    console.log('LISTING DETAIL PRICES:', JSON.stringify(prices?.slice(0, 10)));

    // Check Rezervasyon Yap button
    const bookBtn = await page.$('button:has-text("Rezervasyon"), a:has-text("Rezervasyon")');
    console.log('REZERVASYON BUTTON:', bookBtn ? 'FOUND' : 'NOT FOUND');

    // Check carousel counter
    const pageText = await page.evaluate(() => document.body.innerText?.substring(0, 2000));
    const counterMatch = pageText?.match(/\d+\s*\/\s*\d+/);
    console.log('CAROUSEL COUNTER:', counterMatch?.[0] || 'NOT FOUND');

    // Check similar listings
    const similarCount = await page.evaluate(() => {
      const text = document.body.innerText;
      return text?.includes('Benzer') ? 'YES' : 'NO';
    });
    console.log('HAS SIMILAR LISTINGS:', similarCount);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-listing-detail-correct.png`, fullPage: true });
  }
});

test('C7-FIX-03: Test event detail with correct ID', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const firstEvent = await page.$('a[href*="/events/"]:not([href="/events/new"])');
  if (firstEvent) {
    const href = await firstEvent.getAttribute('href');
    console.log('CLICKING EVENT:', href);
    await firstEvent.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log('EVENT DETAIL URL:', url);

    const buttons = await page.$$eval('button', btns =>
      btns.map(b => b.textContent?.trim()).filter(t => t && t.length < 30)
    );
    console.log('EVENT DETAIL BUTTONS:', JSON.stringify(buttons));

    const pageContent = await page.evaluate(() => {
      const main = document.querySelector('main') || document.body;
      return main.innerText?.substring(0, 1500);
    });
    console.log('EVENT DETAIL CONTENT:', pageContent);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-events-detail-correct.png`, fullPage: true });
  }
});

test('C7-FIX-04: Test mentor detail with correct ID', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/mentors`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Try clicking mentor card or "Mesaj Gönder" / mentor name link
  const mentorLink = await page.$('a[href*="/mentors/"]:not([href="/mentors/new"])');
  const mentorCard = await page.$('[class*="card"], [class*="mentor"]');

  if (mentorLink) {
    const href = await mentorLink.getAttribute('href');
    console.log('CLICKING MENTOR LINK:', href);
    await mentorLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  } else {
    // Try clicking the first mentor card area
    console.log('NO MENTOR LINK FOUND, trying card click');
    const cards = await page.$$('div.rounded-2xl, div.rounded-xl');
    if (cards.length > 0) {
      await cards[0].click();
      await page.waitForTimeout(2000);
    }
  }

  const url = page.url();
  console.log('MENTOR DETAIL URL:', url);

  const pageContent = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText?.substring(0, 1500);
  });
  console.log('MENTOR DETAIL CONTENT:', pageContent);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-mentors-detail-correct.png`, fullPage: true });
});

test('C7-FIX-05: Test city detail with correct ID', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/city`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const cityLink = await page.$('a[href*="/city/"]');
  if (cityLink) {
    const href = await cityLink.getAttribute('href');
    console.log('CLICKING CITY:', href);
    await cityLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log('CITY DETAIL URL:', url);

    // Check tabs
    const buttons = await page.$$eval('button', btns =>
      btns.map(b => b.textContent?.trim()).filter(t => t && t.length < 30)
    );
    console.log('CITY BUTTONS:', JSON.stringify(buttons));

    // Check for chat link
    const chatLink = await page.$('a[href*="/chat"], button:has-text("Sohbet")');
    console.log('CHAT LINK:', chatLink ? 'FOUND' : 'NOT FOUND');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-city-detail-correct.png`, fullPage: true });
  }
});

test('C7-FIX-06: Host calendar navigation', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/calendar`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Get all buttons
  const buttons = await page.$$eval('button', btns =>
    btns.map(b => ({
      text: b.textContent?.trim(),
      ariaLabel: b.getAttribute('aria-label'),
    })).filter(b => (b.text && b.text.length < 30) || b.ariaLabel)
  );
  console.log('CALENDAR BUTTONS:', JSON.stringify(buttons));

  // Try SVG-based navigation buttons
  const svgButtons = await page.$$('button:has(svg)');
  console.log('SVG BUTTONS COUNT:', svgButtons.length);

  if (svgButtons.length >= 2) {
    // Click the second SVG button (likely "next")
    await svgButtons[1].click();
    await page.waitForTimeout(1000);
  }

  const pageContent = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText?.substring(0, 800);
  });
  console.log('CALENDAR CONTENT:', pageContent);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-host-calendar-correct.png`, fullPage: true });
});
