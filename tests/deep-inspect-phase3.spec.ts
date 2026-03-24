import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';
const WAIT = 3000;

async function snap(page: any, name: string) {
  await page.waitForTimeout(WAIT);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/deep-${name}.png`, fullPage: true });
}

async function login(page: any) {
  await page.goto('/login');
  await page.waitForTimeout(1500);
  await page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first().fill('deniz@kotwise.com');
  await page.locator('input[type="password"], input[name="password"]').first().fill('KotwiseTest2026!');
  await page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first().click();
  await page.waitForTimeout(3000);
}

test.describe('PHASE 3: Dynamic Content Click-Through', () => {

  test('31 - Click listing on /search → listing detail', async ({ page }) => {
    await login(page);
    await page.goto('/search');
    await page.waitForTimeout(WAIT);

    // Find and click first listing card
    const listingLink = page.locator('a[href*="/listing/"]').first();
    if (await listingLink.count() > 0) {
      const href = await listingLink.getAttribute('href');
      console.log('LISTING_HREF:', href);
      await listingLink.click();
      await snap(page, '31-listing-detail-top');

      // Check images
      const images = await page.locator('img').evaluateAll((imgs: HTMLImageElement[]) =>
        imgs.map(i => ({ src: i.src?.substring(0, 80), broken: !i.complete || i.naturalWidth === 0 }))
      );
      console.log('LISTING_IMAGES:', JSON.stringify(images));

      // Check host info
      const hostInfo = page.locator('text=/ev sahibi|host/i');
      console.log('HOST_INFO_EXISTS:', await hostInfo.count() > 0);

      // Check reviews
      const reviews = page.locator('text=/yorum|review|değerlendirme/i');
      console.log('REVIEWS_EXIST:', await reviews.count() > 0);

      // Check price
      const price = await page.locator('text=/₺|TL/').allTextContents();
      console.log('PRICE_TEXTS:', JSON.stringify(price));

      // Check booking button
      const bookBtn = page.locator('button:has-text("Rezerv"), button:has-text("Kirala"), button:has-text("Book")');
      console.log('BOOKING_BUTTON:', await bookBtn.count() > 0);

      // Scroll to see all content
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(1500);
      await snap(page, '31-listing-detail-mid');

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);
      await snap(page, '31-listing-detail-bottom');
    } else {
      console.log('NO_LISTING_LINKS_FOUND');
    }
  });

  test('32 - Click event on /events → event detail', async ({ page }) => {
    await login(page);
    await page.goto('/events');
    await page.waitForTimeout(WAIT);

    const eventLink = page.locator('a[href*="/events/"]').first();
    if (await eventLink.count() > 0) {
      const href = await eventLink.getAttribute('href');
      console.log('EVENT_HREF:', href);
      await eventLink.click();
      await snap(page, '32-event-detail');

      // Check details
      const participants = await page.locator('text=/katılımcı|kişi|participant/i').allTextContents();
      console.log('PARTICIPANTS:', JSON.stringify(participants));

      // Check date
      const dates = await page.locator('text=/\\d{1,2}.*[A-Za-zÖÜÇŞİĞ].*\\d{4}|\\d{1,2}\\/\\d{1,2}/').allTextContents();
      console.log('DATE_TEXTS:', JSON.stringify(dates));
    } else {
      console.log('NO_EVENT_LINKS_FOUND');
    }
  });

  test('33 - Click post on /community → post detail', async ({ page }) => {
    await login(page);
    await page.goto('/community');
    await page.waitForTimeout(WAIT);

    const postLink = page.locator('a[href*="/community/"]').first();
    if (await postLink.count() > 0) {
      const href = await postLink.getAttribute('href');
      console.log('POST_HREF:', href);
      await postLink.click();
      await snap(page, '33-community-detail');

      // Check comments
      const comments = page.locator('[class*="comment"], [class*="Comment"]');
      console.log('COMMENT_COUNT:', await comments.count());

      // Check like count
      const likes = await page.locator('text=/beğeni|like|❤/i').allTextContents();
      console.log('LIKES:', JSON.stringify(likes));
    } else {
      console.log('NO_POST_LINKS_FOUND');
    }
  });

  test('34 - Click roommate → roommate detail', async ({ page }) => {
    await login(page);
    await page.goto('/roommates');
    await page.waitForTimeout(WAIT);

    const roommateLink = page.locator('a[href*="/roommates/"]').first();
    if (await roommateLink.count() > 0) {
      const href = await roommateLink.getAttribute('href');
      console.log('ROOMMATE_HREF:', href);
      await roommateLink.click();
      await snap(page, '34-roommate-detail');

      // Check compatibility
      const compat = await page.locator('text=/%/').allTextContents();
      console.log('COMPATIBILITY:', JSON.stringify(compat));
    } else {
      console.log('NO_ROOMMATE_LINKS_FOUND');
    }
  });
});
