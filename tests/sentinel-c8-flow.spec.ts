import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const EMAIL = 'deniz@kotwise.com';
const PASS = 'KotwiseTest2026!';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.fill(EMAIL);
  await passInput.fill(PASS);
  const loginBtn = page.locator('button[type="submit"], button:has-text("Giriş")').first();
  await loginBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

// FLOW-1: Search -> Listing Detail -> Favorite
test('FLOW-1: Search -> Detail -> Favorite', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c8-flow1-search.png', fullPage: true });

  const listingLinks = page.locator('a[href*="/listing/"]');
  const linkCount = await listingLinks.count();
  console.log(`SEARCH: ${linkCount} listing links found`);

  if (linkCount > 0) {
    const firstHref = await listingLinks.first().getAttribute('href');
    console.log(`SEARCH: First listing href: ${firstHref}`);
    await listingLinks.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-flow1-detail.png', fullPage: true });

    const pageText = await page.textContent('body');
    console.log(`DETAIL: Has Rezervasyon Yap: ${pageText?.includes('Rezervasyon Yap')}`);

    const priceMatch = pageText?.match(/(\d{1,3}(?:\.\d{3})*)\s*(?:TL|lira)/g);
    console.log(`DETAIL: Prices: ${JSON.stringify(priceMatch)}`);

    // Check all buttons
    const allBtns = page.locator('button');
    const btnCount = await allBtns.count();
    const btnTexts: string[] = [];
    for (let i = 0; i < Math.min(btnCount, 25); i++) {
      const txt = await allBtns.nth(i).textContent();
      const ariaLabel = await allBtns.nth(i).getAttribute('aria-label');
      btnTexts.push(`${txt?.trim() || ''} [aria:${ariaLabel || ''}]`);
    }
    console.log(`DETAIL: Buttons: ${JSON.stringify(btnTexts)}`);

    // Favorite button
    const favBtn = page.locator('button[aria-label*="Favori"], button[aria-label*="favori"], button[aria-label*="heart"], button[aria-label*="kalp"]');
    console.log(`DETAIL: Favorite buttons: ${await favBtn.count()}`);
    if (await favBtn.count() > 0) {
      await favBtn.first().click();
      await page.waitForTimeout(1000);
      console.log('DETAIL: Favorite clicked!');
      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-flow1-favorited.png', fullPage: true });
    }
  }
});

// FLOW-2: Favorites page
test('FLOW-2: Favorites page', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/favorites`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c8-flow2-favorites.png', fullPage: true });

  const pageText = await page.textContent('body');
  const prices = pageText?.match(/(\d{1,3}(?:\.\d{3})*)\s*(?:TL|lira)/g);
  console.log(`FAVORITES: Prices: ${JSON.stringify(prices)}`);

  const imgs = page.locator('img');
  const imgCount = await imgs.count();
  let svgCount = 0, realCount = 0;
  for (let i = 0; i < imgCount; i++) {
    const src = await imgs.nth(i).getAttribute('src');
    if (src?.includes('data:image/svg')) svgCount++;
    else if (src && src.length > 10) realCount++;
  }
  console.log(`FAVORITES: ${imgCount} imgs, ${svgCount} SVG, ${realCount} real`);
});

// FLOW-3: Booking flow from listing
test('FLOW-3: Booking flow', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const listingLinks = page.locator('a[href*="/listing/"]');
  if (await listingLinks.count() > 0) {
    const href = await listingLinks.first().getAttribute('href');
    await page.goto(`${BASE}${href}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bookBtn = page.locator('button:has-text("Rezervasyon Yap"), a:has-text("Rezervasyon Yap")');
    console.log(`BOOKING: Rezervasyon Yap: ${await bookBtn.count()}`);

    if (await bookBtn.count() > 0) {
      await bookBtn.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log(`BOOKING: URL after click: ${page.url()}`);
      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-flow3-booking.png', fullPage: true });

      const bookText = await page.textContent('body');
      console.log(`BOOKING: Has Tarih: ${bookText?.includes('Tarih')}`);
      console.log(`BOOKING: Has Odeme: ${bookText?.includes('deme')}`);
      console.log(`BOOKING: Has Stripe: ${bookText?.includes('Stripe')}`);
      console.log(`BOOKING: Has Onayla: ${bookText?.includes('Onayla') || bookText?.includes('Tamamla')}`);

      const btns = page.locator('button');
      const btnCount = await btns.count();
      const btnTexts: string[] = [];
      for (let i = 0; i < Math.min(btnCount, 15); i++) {
        btnTexts.push((await btns.nth(i).textContent())?.trim() || '');
      }
      console.log(`BOOKING: Buttons: ${JSON.stringify(btnTexts)}`);
    }
  }
});

// FLOW-4: Booking page direct
test('FLOW-4: Booking page', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/booking`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c8-flow4-booking.png', fullPage: true });

  const pageText = await page.textContent('body');
  const prices = pageText?.match(/(\d{1,3}(?:\.\d{3})*)\s*(?:TL|lira)/g);
  console.log(`BOOKING: Prices: ${JSON.stringify(prices)}`);

  const imgs = page.locator('img');
  let svgCount = 0;
  for (let i = 0; i < await imgs.count(); i++) {
    const src = await imgs.nth(i).getAttribute('src');
    if (src?.includes('data:image/svg')) svgCount++;
  }
  console.log(`BOOKING: ${await imgs.count()} imgs, ${svgCount} SVG`);
});

// FLOW-5: Messages flow
test('FLOW-5: Message flow', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/messages`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c8-flow5-messages.png', fullPage: true });

  const convLinks = page.locator('a[href*="/messages/"]');
  console.log(`MESSAGES: Conversations: ${await convLinks.count()}`);

  if (await convLinks.count() > 0) {
    await convLinks.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log(`MESSAGES: URL: ${page.url()}`);
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-flow5-conv.png', fullPage: true });

    const chatInput = page.locator('input[placeholder*="esaj"], textarea[placeholder*="esaj"]');
    console.log(`MESSAGES: Chat input: ${await chatInput.count()}`);

    if (await chatInput.count() > 0) {
      await chatInput.first().fill('Merhaba, ilan hakkinda bilgi almak istiyorum.');
      console.log('MESSAGES: Message typed!');

      const sendBtn = page.locator('button[aria-label*="nder"], button[aria-label*="send"]');
      console.log(`MESSAGES: Send btn: ${await sendBtn.count()}`);

      const emojiBtn = page.locator('button[aria-label*="moji"]');
      const fileBtn = page.locator('button[aria-label*="oto"], button[aria-label*="osya"]');
      console.log(`MESSAGES: Emoji: ${await emojiBtn.count()}, File: ${await fileBtn.count()}`);

      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-flow5-typed.png', fullPage: true });
    }
  }
});

// FLOW-6: Contact host from listing
test('FLOW-6: Contact host', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const listingLinks = page.locator('a[href*="/listing/"]');
  if (await listingLinks.count() > 0) {
    await listingLinks.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const contactBtn = page.locator('button:has-text("Mesaj"), a:has-text("Mesaj")');
    console.log(`CONTACT: Mesaj buttons: ${await contactBtn.count()}`);

    const pageText = await page.textContent('body');
    console.log(`CONTACT: Anna Schmidt: ${pageText?.includes('Anna Schmidt')}`);
    console.log(`CONTACT: SUPERHOST: ${pageText?.includes('SUPERHOST')}`);

    if (await contactBtn.count() > 0) {
      await contactBtn.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      console.log(`CONTACT: URL: ${page.url()}`);
      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-flow6-contact.png', fullPage: true });
    }
    await page.screenshot({ path: 'tests/screenshots/sentinel-c8-flow6-detail.png', fullPage: true });
  }
});

// BUG-RECHECK-1: Thumbnails
test('BUG-RECHECK-1: Thumbnails', async ({ page }) => {
  await login(page);
  for (const p of [
    { name: 'favorites', path: '/favorites' },
    { name: 'compare', path: '/compare' },
    { name: 'booking', path: '/booking' },
    { name: 'profile-bookings', path: '/profile/bookings' },
  ]) {
    await page.goto(`${BASE}${p.path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `tests/screenshots/sentinel-c8-thumb-${p.name}.png`, fullPage: true });

    const imgs = page.locator('img');
    let svgCount = 0, realCount = 0;
    for (let i = 0; i < await imgs.count(); i++) {
      const src = await imgs.nth(i).getAttribute('src');
      if (src?.includes('data:image/svg')) svgCount++;
      else if (src && !src.includes('avatar') && !src.includes('profile') && src.length > 10) realCount++;
    }
    console.log(`THUMB ${p.name}: ${await imgs.count()} imgs, ${svgCount} SVG, ${realCount} real`);
  }
});

// BUG-RECHECK-2: Roommates uyum
test('BUG-RECHECK-2: Roommates uyum', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/roommates`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c8-roommates.png', fullPage: true });

  const cardText = await page.textContent('body');
  const uyumMatch = cardText?.match(/(\d+)%?\s*Uyum/);
  console.log(`ROOMMATES: Uyum: ${JSON.stringify(uyumMatch?.[0])}`);
  console.log(`ROOMMATES: Uyum bilgisi yok: ${cardText?.includes('Uyum bilgisi yok')}`);

  const detailLink = page.locator('a[href*="/roommates/"]');
  if (await detailLink.count() > 0) {
    const href = await detailLink.first().getAttribute('href');
    if (href) {
      await page.goto(`${BASE}${href}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'tests/screenshots/sentinel-c8-roommates-detail.png', fullPage: true });

      const detailText = await page.textContent('body');
      console.log(`ROOMMATES DETAIL: Uyum: ${detailText?.includes('Uyum')}`);
      console.log(`ROOMMATES DETAIL: Farkli ilgi: ${detailText?.includes('ilgi')}`);
    }
  }
});

// FLOW-7: Homepage
test('FLOW-7: Homepage', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c8-homepage.png', fullPage: true });

  const pageText = await page.textContent('body');
  const prices = pageText?.match(/(\d{1,3}(?:\.\d{3})*)\s*(?:TL|lira)\/ay/g);
  console.log(`HOMEPAGE: Prices: ${JSON.stringify(prices)}`);

  for (const f of ['/roommates', '/host', '/mentors', '/events', '/budget']) {
    console.log(`HOMEPAGE: ${f}: ${await page.locator(`a[href*="${f}"]`).count()} links`);
  }
});

// FLOW-8: Search map
test('FLOW-8: Map', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search/map`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c8-map.png', fullPage: true });

  const tiles = page.locator('img[src*="tile.openstreetmap"]');
  if (await tiles.count() > 0) {
    const src = await tiles.first().getAttribute('src');
    const zoom = src?.match(/\/(\d+)\/\d+\/\d+/)?.[1];
    console.log(`MAP: Zoom: ${zoom}, Tiles: ${await tiles.count()}`);
  }

  const pageText = await page.textContent('body');
  const prices = pageText?.match(/(\d{1,3}(?:\.\d{3})*)\s*(?:TL|lira)/g);
  console.log(`MAP: Prices: ${JSON.stringify(prices?.slice(0, 10))}`);
});

// FLOW-9: Profile bookings
test('FLOW-9: Profile bookings', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/bookings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c8-profile-bookings.png', fullPage: true });

  const pageText = await page.textContent('body');
  const prices = pageText?.match(/(\d{1,3}(?:\.\d{3})*)\s*(?:TL|lira)/g);
  console.log(`PROFILE BOOKINGS: Prices: ${JSON.stringify(prices)}`);
});

// FLOW-10: Console errors
test('FLOW-10: Console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  await login(page);
  await page.goto(`${BASE}/notifications`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c8-notifications.png', fullPage: true });

  const text = await page.textContent('body');
  console.log(`NOTIFICATIONS: Loading stuck: ${text?.includes('kleniyor')}`);
  console.log(`NOTIFICATIONS: Has content: ${text?.includes('Coffee') || text?.includes('mesaj')}`);

  for (const p of ['/favorites', '/compare', '/booking', '/profile/bookings', '/search/map', '/messages', '/roommates', '/mentors']) {
    await page.goto(`${BASE}${p}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
  }
  console.log(`CONSOLE ERRORS (9 pages): ${errors.length}`);
  if (errors.length > 0) console.log(`ERRORS: ${JSON.stringify(errors.slice(0, 5))}`);
});

// FLOW-11: Placeholder scan
test('FLOW-11: Placeholder scan', async ({ page }) => {
  await login(page);
  const scanPages = [
    '/', '/search', '/favorites', '/compare', '/booking', '/profile/bookings',
    '/messages', '/notifications', '/community', '/events', '/roommates',
    '/mentors', '/budget', '/host', '/host/bookings', '/host/earnings',
    '/settings', '/search/map'
  ];
  const issues: string[] = [];
  for (const p of scanPages) {
    await page.goto(`${BASE}${p}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    const text = await page.textContent('body');
    if (text?.includes('Yakında')) issues.push(`${p}: Yakinda`);
    if (text?.includes('Coming soon')) issues.push(`${p}: Coming soon`);
    if (text?.includes('TODO')) issues.push(`${p}: TODO`);
    if (text?.includes('{currencySymbol}')) issues.push(`${p}: {currencySymbol}`);
    if (text?.includes('lorem ipsum')) issues.push(`${p}: lorem ipsum`);
  }
  console.log(`SCAN (${scanPages.length} pages): ${issues.length} issues`);
  if (issues.length > 0) console.log(`ISSUES: ${JSON.stringify(issues)}`);
  else console.log('ALL CLEAR');
});
