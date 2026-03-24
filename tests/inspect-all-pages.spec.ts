import { test, expect, Page } from '@playwright/test';
import path from 'path';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

async function screenshot(page: Page, name: string) {
  // Wait for network idle and animations
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `inspect-${name}.png`),
    fullPage: true,
  });
}

test.describe('Public Pages Inspection', () => {
  test('01 - Home page', async ({ page }) => {
    await page.goto(BASE + '/');
    await screenshot(page, '01-home');
  });

  test('02 - Welcome page', async ({ page }) => {
    await page.goto(BASE + '/welcome');
    await screenshot(page, '02-welcome');
  });

  test('03 - Onboarding page', async ({ page }) => {
    await page.goto(BASE + '/onboarding');
    await screenshot(page, '03-onboarding');
  });

  test('04 - Login page', async ({ page }) => {
    await page.goto(BASE + '/login');
    await screenshot(page, '04-login');
  });

  test('05 - Forgot password page', async ({ page }) => {
    await page.goto(BASE + '/forgot-password');
    await screenshot(page, '05-forgot-password');
  });

  test('06 - Search page', async ({ page }) => {
    await page.goto(BASE + '/search');
    await screenshot(page, '06-search');
  });

  test('07 - Search map page', async ({ page }) => {
    await page.goto(BASE + '/search/map');
    await screenshot(page, '07-search-map');
  });

  test('08 - Community page', async ({ page }) => {
    await page.goto(BASE + '/community');
    await screenshot(page, '08-community');
  });

  test('09 - Events page', async ({ page }) => {
    await page.goto(BASE + '/events');
    await screenshot(page, '09-events');
  });

  test('10 - City Istanbul page', async ({ page }) => {
    await page.goto(BASE + '/city/c0000001-0000-4000-a000-000000000001');
    await screenshot(page, '10-city-istanbul');
  });

  test('11 - Budget page', async ({ page }) => {
    await page.goto(BASE + '/budget');
    await screenshot(page, '11-budget');
  });

  test('12 - Mentors page', async ({ page }) => {
    await page.goto(BASE + '/mentors');
    await screenshot(page, '12-mentors');
  });
});

test.describe('Auth Pages Inspection', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto(BASE + '/login');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    // Fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');

    // Click submit button
    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login"), button:has-text("giriş")').first();
    await submitBtn.click();

    // Wait for navigation after login
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('13 - Profile page', async ({ page }) => {
    await page.goto(BASE + '/profile');
    await screenshot(page, '13-profile');
  });

  test('14 - Profile edit page', async ({ page }) => {
    await page.goto(BASE + '/profile/edit');
    await screenshot(page, '14-profile-edit');
  });

  test('15 - Profile bookings page', async ({ page }) => {
    await page.goto(BASE + '/profile/bookings');
    await screenshot(page, '15-profile-bookings');
  });

  test('16 - Settings page', async ({ page }) => {
    await page.goto(BASE + '/settings');
    await screenshot(page, '16-settings');
  });

  test('17 - Favorites page', async ({ page }) => {
    await page.goto(BASE + '/favorites');
    await screenshot(page, '17-favorites');
  });

  test('18 - Compare page', async ({ page }) => {
    await page.goto(BASE + '/compare');
    await screenshot(page, '18-compare');
  });

  test('19 - Messages page', async ({ page }) => {
    await page.goto(BASE + '/messages');
    await screenshot(page, '19-messages');
  });

  test('20 - Messages new page', async ({ page }) => {
    await page.goto(BASE + '/messages/new');
    await screenshot(page, '20-messages-new');
  });

  test('21 - Notifications page', async ({ page }) => {
    await page.goto(BASE + '/notifications');
    await screenshot(page, '21-notifications');
  });

  test('22 - Roommates page', async ({ page }) => {
    await page.goto(BASE + '/roommates');
    await screenshot(page, '22-roommates');
  });

  test('23 - Listing new page', async ({ page }) => {
    await page.goto(BASE + '/listing/new');
    await screenshot(page, '23-listing-new');
  });

  test('24 - Host page', async ({ page }) => {
    await page.goto(BASE + '/host');
    await screenshot(page, '24-host');
  });

  test('25 - Host apply page', async ({ page }) => {
    await page.goto(BASE + '/host/apply');
    await screenshot(page, '25-host-apply');
  });

  test('26 - Host bookings page', async ({ page }) => {
    await page.goto(BASE + '/host/bookings');
    await screenshot(page, '26-host-bookings');
  });

  test('27 - Host calendar page', async ({ page }) => {
    await page.goto(BASE + '/host/calendar');
    await screenshot(page, '27-host-calendar');
  });

  test('28 - Host earnings page', async ({ page }) => {
    await page.goto(BASE + '/host/earnings');
    await screenshot(page, '28-host-earnings');
  });

  test('29 - Community new page', async ({ page }) => {
    await page.goto(BASE + '/community/new');
    await screenshot(page, '29-community-new');
  });

  test('30 - Events new page', async ({ page }) => {
    await page.goto(BASE + '/events/new');
    await screenshot(page, '30-events-new');
  });
});

test.describe('Dynamic Content Inspection', () => {
  test('31 - Click listing card', async ({ page }) => {
    await page.goto(BASE + '/search');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await screenshot(page, '31-search-before-click');

    // Try to find and click a listing card
    const card = page.locator('a[href*="/listing/"], [data-testid*="listing"], .listing-card, [class*="ListingCard"], [class*="listing"]').first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
      await screenshot(page, '32-listing-detail');
    } else {
      await screenshot(page, '32-listing-detail-NO-CARD-FOUND');
    }
  });

  test('33 - Click event card', async ({ page }) => {
    await page.goto(BASE + '/events');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);

    const card = page.locator('a[href*="/events/"], [data-testid*="event"], .event-card, [class*="EventCard"], [class*="event"]').first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
      await screenshot(page, '33-event-detail');
    } else {
      await screenshot(page, '33-event-detail-NO-CARD-FOUND');
    }
  });

  test('34 - Click community post', async ({ page }) => {
    await page.goto(BASE + '/community');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);

    const card = page.locator('a[href*="/community/"], [data-testid*="post"], .post-card, [class*="PostCard"], [class*="post"]').first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
      await screenshot(page, '34-community-detail');
    } else {
      await screenshot(page, '34-community-detail-NO-CARD-FOUND');
    }
  });

  test('35 - Click roommate card', async ({ page }) => {
    // Login first for roommates
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

    await page.goto(BASE + '/roommates');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);

    const card = page.locator('a[href*="/roommates/"], [data-testid*="roommate"], .roommate-card, [class*="RoommateCard"], [class*="roommate"]').first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(2000);
      await screenshot(page, '35-roommate-detail');
    } else {
      await screenshot(page, '35-roommate-detail-NO-CARD-FOUND');
    }
  });
});
