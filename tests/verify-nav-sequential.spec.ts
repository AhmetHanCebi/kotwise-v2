import { test, Page } from '@playwright/test';
import path from 'path';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

async function screenshot(page: Page, name: string) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `verify-${name}.png`),
    fullPage: true,
  });
}

test('Navigate via client-side links after login', async ({ page }) => {
  // Login
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000);

  await page.locator('input[type="email"], input[placeholder*="mail"]').first().fill('deniz@kotwise.com');
  await page.locator('input[type="password"]').first().fill('KotwiseTest2026!');
  await page.locator('button[type="submit"], button:has-text("Giriş")').first().click();

  // Wait for redirect to home
  await page.waitForTimeout(5000);
  await page.waitForLoadState('networkidle').catch(() => {});
  console.log(`[NAV] After login URL: ${page.url()}`);

  // Verify we're logged in on home page
  let bodyText = await page.textContent('body') || '';
  console.log(`[NAV] Home has Deniz: ${bodyText.includes('Deniz')}`);

  // Use bottom nav to go to Profile
  const profileNavLink = page.locator('a[href="/profile"], nav a:has-text("Profil")').first();
  if (await profileNavLink.isVisible().catch(() => false)) {
    await profileNavLink.click();
    await page.waitForTimeout(5000);
    bodyText = await page.textContent('body') || '';
    console.log(`[NAV-PROFILE] Has Deniz: ${bodyText.includes('Deniz')} | URL: ${page.url()}`);
    await screenshot(page, 'nav-01-profile');

    // From profile, click Favoriler stat or find favorites link
    const favLink = page.locator('a[href="/favorites"]').first();
    if (await favLink.isVisible().catch(() => false)) {
      await favLink.click();
      await page.waitForTimeout(8000);
      bodyText = await page.textContent('body') || '';
      const spinner = await page.locator('text=Yükleniyor').isVisible().catch(() => false);
      console.log(`[NAV-FAV] Spinner: ${spinner} | Has Favorilerim: ${bodyText.includes('Favorilerim')}`);
      await screenshot(page, 'nav-02-favorites');
    } else {
      console.log('[NAV-FAV] No favorites link on profile page');
    }
  }

  // Go to home then navigate to favorites via URL bar
  await page.goto(BASE + '/favorites');
  await page.waitForTimeout(10000);
  bodyText = await page.textContent('body') || '';
  const favSpinner = await page.locator('text=Yükleniyor').isVisible().catch(() => false);
  console.log(`[GOTO-FAV] Spinner: ${favSpinner} | Has Favorilerim: ${bodyText.includes('Favorilerim')}`);
  await screenshot(page, 'nav-03-favorites-goto');

  // Compare
  await page.goto(BASE + '/compare');
  await page.waitForTimeout(10000);
  bodyText = await page.textContent('body') || '';
  const compSpinner = await page.locator('text=Yükleniyor').isVisible().catch(() => false);
  console.log(`[GOTO-COMPARE] Spinner: ${compSpinner} | Body len: ${bodyText.length}`);
  await screenshot(page, 'nav-04-compare-goto');

  // Host
  await page.goto(BASE + '/host');
  await page.waitForTimeout(10000);
  bodyText = await page.textContent('body') || '';
  const hostSpinner = await page.locator('text=Yükleniyor').isVisible().catch(() => false);
  console.log(`[GOTO-HOST] Spinner: ${hostSpinner} | URL: ${page.url()} | Body len: ${bodyText.length}`);
  await screenshot(page, 'nav-05-host-goto');

  // Host/earnings
  await page.goto(BASE + '/host/earnings');
  await page.waitForTimeout(10000);
  bodyText = await page.textContent('body') || '';
  const earnSpinner = await page.locator('text=Yükleniyor').isVisible().catch(() => false);
  console.log(`[GOTO-EARNINGS] Spinner: ${earnSpinner} | Body len: ${bodyText.length}`);
  await screenshot(page, 'nav-06-earnings-goto');

  // Messages
  await page.goto(BASE + '/messages');
  await page.waitForTimeout(10000);
  bodyText = await page.textContent('body') || '';
  const msgSpinner = await page.locator('text=Yükleniyor').isVisible().catch(() => false);
  console.log(`[GOTO-MESSAGES] Spinner: ${msgSpinner} | Has Mesaj: ${bodyText.includes('Mesaj')}`);
  await screenshot(page, 'nav-07-messages-goto');

  // Bookings
  await page.goto(BASE + '/profile/bookings');
  await page.waitForTimeout(10000);
  bodyText = await page.textContent('body') || '';
  const bookSpinner = await page.locator('text=Yükleniyor').isVisible().catch(() => false);
  console.log(`[GOTO-BOOKINGS] Spinner: ${bookSpinner} | Has Rezervasyon: ${bodyText.includes('Rezervasyon')}`);
  await screenshot(page, 'nav-08-bookings-goto');

  // Roommates
  await page.goto(BASE + '/roommates');
  await page.waitForTimeout(5000);
  const rmLinks = await page.locator('a[href*="/roommates/"]').count();
  // Also check for Link components rendered as anchors
  const allAnchors = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => a.getAttribute('href')).filter(h => h && h.includes('/roommate'));
  });
  console.log(`[GOTO-ROOMMATES] Links: ${rmLinks} | All roommate anchors: ${JSON.stringify(allAnchors)}`);
  await screenshot(page, 'nav-09-roommates-goto');
});
