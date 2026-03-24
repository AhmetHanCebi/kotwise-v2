import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';

// All pages to test
const pages = [
  { name: 'home', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'forgot-password', path: '/forgot-password' },
  { name: 'welcome', path: '/welcome' },
  { name: 'onboarding', path: '/onboarding' },
  { name: 'search', path: '/search' },
  { name: 'favorites', path: '/favorites' },
  { name: 'messages', path: '/messages' },
  { name: 'notifications', path: '/notifications' },
  { name: 'profile', path: '/profile' },
  { name: 'settings', path: '/settings' },
  { name: 'budget', path: '/budget' },
  { name: 'roommates', path: '/roommates' },
  { name: 'mentors', path: '/mentors' },
  { name: 'community', path: '/community' },
  { name: 'events', path: '/events' },
  { name: 'city', path: '/city' },
  { name: 'compare', path: '/compare' },
  { name: 'host', path: '/host' },
  { name: 'booking', path: '/booking' },
];

// Login helper
async function login(page: any) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');

    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login"), button:has-text("giriş")').first();
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
  }
}

test.describe('Sentinel Cycle 2 - Basic Page Checks', () => {

  test.beforeAll(async ({ browser }) => {
    // Login once to check auth pages
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page);
    await context.storageState({ path: 'tests/auth-state.json' });
    await context.close();
  });

  // Test public pages (no auth needed)
  for (const p of [
    { name: 'home', path: '/' },
    { name: 'login', path: '/login' },
    { name: 'register', path: '/register' },
    { name: 'forgot-password', path: '/forgot-password' },
  ]) {
    test(`[PUBLIC] ${p.name} - loads and renders`, async ({ page }) => {
      const response = await page.goto(p.path);

      // 1. HTTP status check
      expect(response?.status(), `${p.name}: HTTP error`).toBeLessThan(400);

      // 2. Wait for content
      await page.waitForLoadState('networkidle');

      // 3. Check page is not blank
      const body = await page.locator('body').innerHTML();
      expect(body.length, `${p.name}: Page body is empty`).toBeGreaterThan(100);

      // 4. Check no uncaught errors in page title (Next.js error)
      const title = await page.title();
      expect(title.toLowerCase()).not.toContain('error');

      // 5. Check for Next.js error overlay
      const errorOverlay = page.locator('#__next-build-error, [data-nextjs-dialog]');
      const hasError = await errorOverlay.isVisible({ timeout: 1000 }).catch(() => false);
      expect(hasError, `${p.name}: Next.js error overlay visible`).toBeFalsy();

      // 6. Screenshot
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-${p.name}.png`, fullPage: true });
    });
  }

  // Test authenticated pages
  for (const p of pages.filter(pg => !['/login', '/register', '/forgot-password', '/'].includes(pg.path))) {
    test(`[AUTH] ${p.name} - loads and renders`, async ({ browser }) => {
      let context;
      try {
        context = await browser.newContext({ storageState: 'tests/auth-state.json' });
      } catch {
        context = await browser.newContext();
        const loginPage = await context.newPage();
        await login(loginPage);
        await loginPage.close();
      }

      const page = await context.newPage();

      try {
        const response = await page.goto(p.path, { timeout: 15000 });

        // 1. HTTP status check
        expect(response?.status(), `${p.name}: HTTP error ${response?.status()}`).toBeLessThan(400);

        // 2. Wait for content
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // 3. Check page is not blank
        const body = await page.locator('body').innerHTML();
        expect(body.length, `${p.name}: Page body is empty`).toBeGreaterThan(100);

        // 4. Check no error in title
        const title = await page.title();
        expect(title.toLowerCase()).not.toContain('error');

        // 5. Check for Next.js error overlay
        const errorOverlay = page.locator('#__next-build-error, [data-nextjs-dialog]');
        const hasError = await errorOverlay.isVisible({ timeout: 1000 }).catch(() => false);
        expect(hasError, `${p.name}: Next.js error overlay visible`).toBeFalsy();

        // 6. Check layout - main content area exists
        const hasContent = await page.locator('main, [role="main"], .container, .content, div[class*="page"], div[class*="container"]').first()
          .isVisible({ timeout: 3000 }).catch(() => false);

        // 7. Screenshot
        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-${p.name}.png`, fullPage: true });

        // Log if no main content found (not a hard fail, just info)
        if (!hasContent) {
          console.warn(`⚠️ ${p.name}: No main content container found`);
        }

      } finally {
        await context.close();
      }
    });
  }
});
