import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'search', path: '/search' },
  { name: 'favorites', path: '/favorites' },
  { name: 'messages', path: '/messages' },
  { name: 'profile', path: '/profile' },
  { name: 'settings', path: '/settings' },
  { name: 'notifications', path: '/notifications' },
  { name: 'budget', path: '/budget' },
  { name: 'community', path: '/community' },
  { name: 'events', path: '/events' },
  { name: 'mentors', path: '/mentors' },
  { name: 'roommates', path: '/roommates' },
  { name: 'city', path: '/city' },
  { name: 'compare', path: '/compare' },
  { name: 'booking', path: '/booking' },
  { name: 'host', path: '/host' },
];

test.describe('Sentinel C1 - Temel Kontrol', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill('deniz@kotwise.com');
      await passwordInput.fill('KotwiseTest2026!');
      await page.getByRole('button', { name: 'Giriş Yap', exact: true }).click();

      // Wait for navigation away from login
      await page.waitForTimeout(3000);
    }
  });

  for (const p of PAGES) {
    test(`${p.name} sayfası yükleniyor`, async ({ page }) => {
      const response = await page.goto(p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      // 1. HTTP status check
      const status = response?.status() ?? 0;
      const statusOk = status < 400;

      // 2. Check for Next.js error overlay
      const errorOverlay = await page.locator('nextjs-portal, [data-nextjs-dialog]').count();
      const hasErrorOverlay = errorOverlay > 0;

      // 3. Check for visible error text in body
      const bodyText = await page.locator('body').innerText().catch(() => '');
      const hasErrorText = /unhandled|runtime error|application error|server error/i.test(bodyText);

      // 4. Check if redirected to login (auth issue)
      const currentUrl = page.url();
      const redirectedToLogin = currentUrl.includes('/login');

      // 5. Content height check
      const viewport = page.viewportSize();
      const bodyBox = await page.locator('body').boundingBox().catch(() => null);
      const tooSmall = bodyBox ? bodyBox.height < 200 : false;

      // 6. Screenshot
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/sentinel-c1-${p.name}.png`,
        fullPage: true
      });

      // Collect issues
      const issues: string[] = [];
      if (!statusOk) issues.push(`HTTP ${status}`);
      if (hasErrorOverlay) issues.push('Next.js error overlay');
      if (hasErrorText) issues.push('Error text on page');
      if (redirectedToLogin) issues.push('Redirected to login');
      if (tooSmall) issues.push(`Content too small: ${bodyBox?.height}px`);

      if (issues.length > 0) {
        console.log(`[BUG] ${p.name}: ${issues.join(', ')}`);
      } else {
        console.log(`[OK] ${p.name}`);
      }

      // Soft assertions - mark all issues
      expect(statusOk, `${p.name}: HTTP status ${status}`).toBeTruthy();
      expect(hasErrorOverlay, `${p.name}: Error overlay visible`).toBeFalsy();
    });
  }
});
