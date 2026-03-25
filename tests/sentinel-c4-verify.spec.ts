import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  if (await emailInput.isVisible()) {
    await emailInput.fill('deniz@kotwise.com');
    await page.locator('input[type="password"]').first().fill('KotwiseTest2026!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);
  }
}

test('VERIFY-1: Harita zoom DÜZELDİ Mİ?', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search/map`);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-map-zoom-verify.png`, fullPage: true });

  // Get ALL tile URLs
  const allImgs = page.locator('img');
  const imgCount = await allImgs.count();
  let tileZooms: string[] = [];
  let markerPrices: string[] = [];

  for (let i = 0; i < imgCount; i++) {
    const src = await allImgs.nth(i).getAttribute('src') || '';
    if (src.includes('openstreetmap') || src.includes('tile')) {
      const match = src.match(/\/(\d+)\/\d+\/\d+\.png/);
      if (match) tileZooms.push(match[1]);
    }
  }
  console.log(`[MAP-VERIFY] Tile zoom levels: ${[...new Set(tileZooms)].join(', ')}`);

  // Get marker prices from text
  const markerPane = page.locator('.leaflet-marker-pane');
  if (await markerPane.isVisible()) {
    const text = await markerPane.textContent() || '';
    console.log(`[MAP-VERIFY] Marker text: ${text.substring(0, 300)}`);
  }

  // Check Leaflet container zoom attribute
  const mapContainer = page.locator('.leaflet-container, [class*="leaflet"]').first();
  const mapClasses = await mapContainer.getAttribute('class') || '';
  console.log(`[MAP-VERIFY] Map container classes: ${mapClasses}`);

  // Check zoom control value
  const zoomIn = page.locator('.leaflet-control-zoom-in');
  const zoomOut = page.locator('.leaflet-control-zoom-out');
  console.log(`[MAP-VERIFY] Zoom controls: in=${await zoomIn.isVisible()}, out=${await zoomOut.isVisible()}`);
});

test('VERIFY-2: Messages detay — chat input doğrulaması', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/messages`);
  await page.waitForTimeout(2000);

  // Get all clickable items
  const items = page.locator('a, [role="button"], [class*="item"], [class*="conversation"]');
  const count = await items.count();
  console.log(`[MSG-VERIFY] Clickable items: ${count}`);

  // Try clicking first link/conversation
  const firstConv = page.locator('a[href*="/messages/"]').first();
  if (await firstConv.isVisible()) {
    const href = await firstConv.getAttribute('href');
    console.log(`[MSG-VERIFY] First conversation href: ${href}`);
    await firstConv.click();
    await page.waitForTimeout(2000);
  } else {
    // Try direct URL
    await page.goto(`${BASE}/messages/1`);
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-messages-chat.png`, fullPage: true });

  // Check for input
  const allInputs = page.locator('input, textarea');
  const inputCount = await allInputs.count();
  for (let i = 0; i < inputCount; i++) {
    const el = allInputs.nth(i);
    const tag = await el.evaluate(e => e.tagName.toLowerCase());
    const type = await el.getAttribute('type') || '';
    const placeholder = await el.getAttribute('placeholder') || '';
    console.log(`[MSG-VERIFY] Input ${i}: <${tag}> type="${type}" placeholder="${placeholder}"`);
  }

  // Check for send button
  const buttons = page.locator('button');
  const btnCount = await buttons.count();
  for (let i = 0; i < btnCount; i++) {
    const text = await buttons.nth(i).textContent() || '';
    if (text.trim()) console.log(`[MSG-VERIFY] Button ${i}: "${text.trim().substring(0, 30)}"`);
  }
});

test('VERIFY-3: SVG placeholder — tam img src analizi', async ({ page }) => {
  await login(page);

  // Test favorites specifically
  await page.goto(`${BASE}/favorites`);
  await page.waitForTimeout(2000);

  const imgs = page.locator('img');
  const imgCount = await imgs.count();
  for (let i = 0; i < imgCount; i++) {
    const src = await imgs.nth(i).getAttribute('src') || '';
    const alt = await imgs.nth(i).getAttribute('alt') || '';
    const width = await imgs.nth(i).evaluate(e => (e as HTMLImageElement).naturalWidth);
    const height = await imgs.nth(i).evaluate(e => (e as HTMLImageElement).naturalHeight);
    console.log(`[FAV-IMG] ${i}: src="${src.substring(0, 80)}" alt="${alt}" natural=${width}x${height}`);
  }
});

test('VERIFY-4: Events view toggles derin kontrol', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events`);
  await page.waitForTimeout(2000);

  // Get ALL buttons
  const allButtons = page.locator('button');
  const btnCount = await allButtons.count();
  for (let i = 0; i < btnCount; i++) {
    const text = await allButtons.nth(i).textContent() || '';
    const ariaLabel = await allButtons.nth(i).getAttribute('aria-label') || '';
    if (text.trim() || ariaLabel) {
      console.log(`[EVENTS-BTN] ${i}: text="${text.trim().substring(0, 30)}" aria="${ariaLabel}"`);
    }
  }

  // Look for SVG icons that might be view toggles
  const svgs = page.locator('button svg, button [class*="icon"]');
  const svgCount = await svgs.count();
  console.log(`[EVENTS] Button SVG/icons: ${svgCount}`);
});

test('VERIFY-5: Profile Edit — ilgi alanı tagleri kontrolü', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/edit`);
  await page.waitForTimeout(2000);

  // Broader search for tags/chips
  const bodyHTML = await page.locator('body').innerHTML();
  const hasTag = bodyHTML.includes('tag') || bodyHTML.includes('chip') || bodyHTML.includes('badge') || bodyHTML.includes('interest');
  console.log(`[PROFILE-EDIT] Has tag/chip/badge/interest in HTML: ${hasTag}`);

  // Check for all span/div elements that look like tags
  const smallElements = page.locator('span[class], div[class]');
  const count = await smallElements.count();
  let tagLike = 0;
  for (let i = 0; i < Math.min(count, 50); i++) {
    const cls = await smallElements.nth(i).getAttribute('class') || '';
    const text = await smallElements.nth(i).textContent() || '';
    if ((cls.includes('tag') || cls.includes('chip') || cls.includes('badge') || cls.includes('interest')) && text.trim().length < 30) {
      tagLike++;
      console.log(`[PROFILE-EDIT] Tag-like: class="${cls.substring(0, 40)}" text="${text.trim()}"`);
    }
  }
  console.log(`[PROFILE-EDIT] Tag-like elements: ${tagLike}`);
});

test('VERIFY-6: Host Apply — adım wizard kontrolü', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/apply`);
  await page.waitForTimeout(2000);

  // Get full page text
  const bodyText = await page.locator('body').textContent() || '';
  console.log(`[HOST-APPLY] Page text (first 500): ${bodyText.substring(0, 500)}`);

  // Check for step indicators
  const steps = page.locator('[class*="step"], [class*="Step"], [class*="wizard"]');
  const stepCount = await steps.count();
  console.log(`[HOST-APPLY] Step indicators: ${stepCount}`);

  // All buttons
  const btns = page.locator('button');
  const btnCount = await btns.count();
  for (let i = 0; i < btnCount; i++) {
    const text = await btns.nth(i).textContent() || '';
    if (text.trim()) console.log(`[HOST-APPLY] Button: "${text.trim()}"`);
  }
});
