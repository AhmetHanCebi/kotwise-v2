import { test, expect, Page } from '@playwright/test';
import path from 'path';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

async function screenshot(page: Page, name: string) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `verify-${name}.png`),
    fullPage: true,
  });
}

async function login(page: Page) {
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

  await emailInput.fill('deniz@kotwise.com');
  await passwordInput.fill('KotwiseTest2026!');

  const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login"), button:has-text("giriş")').first();
  await submitBtn.click();

  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle').catch(() => {});
}

test.describe('Cycle 2 - Fix Verification', () => {

  test('01 - /favorites loads after login (no infinite spinner)', async ({ page }) => {
    await login(page);
    await page.goto(BASE + '/favorites');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(5000);

    // Check that loading spinner is NOT visible
    const spinner = page.locator('text=Yükleniyor');
    const spinnerAlt = page.locator('text=Yukleniyor');
    const spinnerVisible = await spinner.isVisible().catch(() => false) || await spinnerAlt.isVisible().catch(() => false);

    await screenshot(page, '01-favorites');
    console.log(`[FAVORITES] Spinner visible: ${spinnerVisible}`);

    // Check page has actual content (either favorites or empty state)
    const bodyText = await page.textContent('body') || '';
    console.log(`[FAVORITES] Page contains text length: ${bodyText.length}`);
    console.log(`[FAVORITES] Has empty state: ${bodyText.includes('favori') || bodyText.includes('Favori')}`);
  });

  test('02 - /compare loads after login (no infinite spinner)', async ({ page }) => {
    await login(page);
    await page.goto(BASE + '/compare');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(5000);

    const spinnerVisible = await page.locator('text=Yükleniyor').isVisible().catch(() => false)
      || await page.locator('text=Yukleniyor').isVisible().catch(() => false);

    await screenshot(page, '02-compare');
    console.log(`[COMPARE] Spinner visible: ${spinnerVisible}`);
  });

  test('03 - /host loads without infinite spinner', async ({ page }) => {
    await login(page);
    await page.goto(BASE + '/host');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(5000);

    const spinnerVisible = await page.locator('text=Yükleniyor').isVisible().catch(() => false)
      || await page.locator('text=Yukleniyor').isVisible().catch(() => false);

    await screenshot(page, '03-host');
    console.log(`[HOST] Spinner visible: ${spinnerVisible}`);
    console.log(`[HOST] Current URL: ${page.url()}`);
  });

  test('04 - /host/earnings loads', async ({ page }) => {
    await login(page);
    await page.goto(BASE + '/host/earnings');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(5000);

    const spinnerVisible = await page.locator('text=Yükleniyor').isVisible().catch(() => false)
      || await page.locator('text=Yukleniyor').isVisible().catch(() => false);

    await screenshot(page, '04-host-earnings');
    console.log(`[HOST/EARNINGS] Spinner visible: ${spinnerVisible}`);
  });

  test('05 - /events has clickable event links', async ({ page }) => {
    await page.goto(BASE + '/events');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);

    // Check for <a> tags linking to event detail pages
    const eventLinks = page.locator('a[href*="/events/"]');
    const linkCount = await eventLinks.count();

    await screenshot(page, '05-events');
    console.log(`[EVENTS] Event links found: ${linkCount}`);

    if (linkCount > 0) {
      const firstHref = await eventLinks.first().getAttribute('href');
      console.log(`[EVENTS] First event link href: ${firstHref}`);

      // Try clicking the first event link to verify navigation
      await eventLinks.first().click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
      console.log(`[EVENTS] Navigated to: ${page.url()}`);
      await screenshot(page, '05-events-detail');
    }
  });

  test('06 - /community post cards navigate to detail', async ({ page }) => {
    await page.goto(BASE + '/community');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);

    const postLinks = page.locator('a[href*="/community/"]');
    const linkCount = await postLinks.count();

    await screenshot(page, '06-community');
    console.log(`[COMMUNITY] Post links found: ${linkCount}`);

    if (linkCount > 0) {
      // Filter out /community/new links
      const detailLinks = page.locator('a[href*="/community/"]:not([href*="/community/new"])');
      const detailCount = await detailLinks.count();
      console.log(`[COMMUNITY] Detail links (excl /new): ${detailCount}`);

      if (detailCount > 0) {
        const firstHref = await detailLinks.first().getAttribute('href');
        console.log(`[COMMUNITY] First post link href: ${firstHref}`);
        await detailLinks.first().click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(2000);
        console.log(`[COMMUNITY] Navigated to: ${page.url()}`);
        await screenshot(page, '06-community-detail');
      }
    }
  });

  test('07 - /roommates has profile view links', async ({ page }) => {
    await login(page);
    await page.goto(BASE + '/roommates');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);

    const roommateLinks = page.locator('a[href*="/roommates/"]');
    const linkCount = await roommateLinks.count();

    await screenshot(page, '07-roommates');
    console.log(`[ROOMMATES] Roommate links found: ${linkCount}`);

    if (linkCount > 0) {
      const firstHref = await roommateLinks.first().getAttribute('href');
      console.log(`[ROOMMATES] First roommate link href: ${firstHref}`);
      await roommateLinks.first().click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
      console.log(`[ROOMMATES] Navigated to: ${page.url()}`);
      await screenshot(page, '07-roommates-detail');
    }
  });

  test('08 - /listing/[id] price bar and description', async ({ page }) => {
    // First find a listing ID from search
    await page.goto(BASE + '/search');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);

    const listingLinks = page.locator('a[href*="/listing/"]');
    const linkCount = await listingLinks.count();
    console.log(`[LISTING] Listing links on search: ${linkCount}`);

    if (linkCount > 0) {
      const firstHref = await listingLinks.first().getAttribute('href');
      console.log(`[LISTING] First listing href: ${firstHref}`);
      await listingLinks.first().click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(3000);

      // Check for price bar
      const priceBar = page.locator('[class*="sticky"], [class*="fixed"]').last();
      const bottomContent = await page.textContent('body') || '';
      console.log(`[LISTING] Page has 'TRY': ${bottomContent.includes('TRY')}`);
      console.log(`[LISTING] Page has 'Rezervasyon': ${bottomContent.includes('Rezervasyon')}`);

      // Check description section
      console.log(`[LISTING] Has 'Açıklama' or 'Aciklama': ${bottomContent.includes('Açıklama') || bottomContent.includes('Aciklama')}`);

      // Scroll down to check description visibility
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(1000);
      await screenshot(page, '08-listing-detail-scrolled');

      // Scroll back to top for full page screenshot
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      await screenshot(page, '08-listing-detail');
    }
  });

  test('09 - / (home) auto-selects a city', async ({ page }) => {
    await login(page);
    await page.goto(BASE + '/');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(5000);

    const bodyText = await page.textContent('body') || '';

    // Check if empty states are still showing
    const hasEmptyListings = bodyText.includes('Bu şehirde henüz ilan yok') || bodyText.includes('Bu sehirde henuz ilan yok');
    const hasEmptyEvents = bodyText.includes('Yaklaşan etkinlik yok') || bodyText.includes('Yaklasan etkinlik yok');
    const hasEmptyPosts = bodyText.includes('Henüz paylaşım yok') || bodyText.includes('Henuz paylasim yok');

    console.log(`[HOME] Empty listings: ${hasEmptyListings}`);
    console.log(`[HOME] Empty events: ${hasEmptyEvents}`);
    console.log(`[HOME] Empty posts: ${hasEmptyPosts}`);

    // Check if a city name appears (Istanbul, Barcelona, etc.)
    const hasCityName = bodyText.includes('Istanbul') || bodyText.includes('İstanbul')
      || bodyText.includes('Barcelona') || bodyText.includes('Berlin');
    console.log(`[HOME] Has city name: ${hasCityName}`);

    await screenshot(page, '09-home-logged-in');
  });

  test('10 - /city/[id] tabs show content', async ({ page }) => {
    // Use Istanbul city ID from Cycle 1
    await page.goto(BASE + '/city/c0000001-0000-4000-a000-000000000001');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);

    await screenshot(page, '10-city-istanbul-default');

    // Check if tab content is visible
    const bodyText = await page.textContent('body') || '';
    console.log(`[CITY] Has Bilgi tab content: ${bodyText.length > 200}`);

    // Click Mahalleler tab
    const mahalleTab = page.locator('button:has-text("Mahalleler"), [role="tab"]:has-text("Mahalleler")');
    if (await mahalleTab.isVisible().catch(() => false)) {
      await mahalleTab.click();
      await page.waitForTimeout(1500);
      await screenshot(page, '10-city-istanbul-mahalleler');
    }

    // Click Maliyet tab
    const maliyetTab = page.locator('button:has-text("Maliyet"), [role="tab"]:has-text("Maliyet")');
    if (await maliyetTab.isVisible().catch(() => false)) {
      await maliyetTab.click();
      await page.waitForTimeout(1500);
      await screenshot(page, '10-city-istanbul-maliyet');

      // Check cost values are formatted
      const costText = await page.textContent('body') || '';
      console.log(`[CITY] Has formatted cost (TRY): ${costText.includes('TRY')}`);
      console.log(`[CITY] Has formatted number (18.000): ${costText.includes('18.000')}`);
    }

    // Click Ulasim tab
    const ulasimTab = page.locator('button:has-text("Ulasim"), button:has-text("Ulaşım"), [role="tab"]:has-text("Ulasim")');
    if (await ulasimTab.isVisible().catch(() => false)) {
      await ulasimTab.click();
      await page.waitForTimeout(1500);
      await screenshot(page, '10-city-istanbul-ulasim');
    }
  });

  // NEW ISSUE DETECTION TESTS
  test('11 - Check for layout regressions on /events (padding)', async ({ page }) => {
    await page.goto(BASE + '/events');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);

    // Scroll to bottom to check if bottom nav still overlaps
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await screenshot(page, '11-events-bottom');

    // Check the last event card is not hidden behind nav
    const eventCards = page.locator('article, [class*="card"]');
    const cardCount = await eventCards.count();
    console.log(`[EVENTS-LAYOUT] Total cards: ${cardCount}`);
  });

  test('12 - Check /profile/bookings image fallback', async ({ page }) => {
    await login(page);
    await page.goto(BASE + '/profile/bookings');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);

    await screenshot(page, '12-profile-bookings');

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let broken = 0;
      imgs.forEach(img => {
        if (img.naturalWidth === 0 && img.complete) broken++;
      });
      return broken;
    });
    console.log(`[BOOKINGS] Broken images: ${brokenImages}`);
  });

  test('13 - Check hooks did not break other pages (/messages, /notifications)', async ({ page }) => {
    await login(page);

    // Check messages still works
    await page.goto(BASE + '/messages');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);
    const msgSpinner = await page.locator('text=Yükleniyor').isVisible().catch(() => false)
      || await page.locator('text=Yukleniyor').isVisible().catch(() => false);
    console.log(`[MESSAGES] Spinner visible: ${msgSpinner}`);
    await screenshot(page, '13-messages');

    // Check notifications still works
    await page.goto(BASE + '/notifications');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);
    const notifSpinner = await page.locator('text=Yükleniyor').isVisible().catch(() => false)
      || await page.locator('text=Yukleniyor').isVisible().catch(() => false);
    console.log(`[NOTIFICATIONS] Spinner visible: ${notifSpinner}`);
    await screenshot(page, '13-notifications');
  });

  test('14 - Check /profile still loads correctly', async ({ page }) => {
    await login(page);
    await page.goto(BASE + '/profile');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000);

    const bodyText = await page.textContent('body') || '';
    console.log(`[PROFILE] Has user name: ${bodyText.includes('Deniz')}`);
    await screenshot(page, '14-profile');
  });
});
