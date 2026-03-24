import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

test('Debug auth flow and test protected pages', async ({ page }) => {
  // Go to login
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Fill login
  await page.fill('input[type="email"]', 'deniz@kotwise.com');
  await page.fill('input[type="password"]', 'KotwiseTest2026!');

  // Click login
  await page.getByText('Giriş Yap').first().click();
  await page.waitForTimeout(5000);

  // Check where we ended up
  const urlAfterLogin = page.url();
  console.log('URL after login:', urlAfterLogin);

  // Check cookies and localStorage
  const cookies = await page.context().cookies();
  console.log('Cookies:', JSON.stringify(cookies.map(c => ({ name: c.name, domain: c.domain })), null, 2));

  const storage = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    return keys.map(k => ({ key: k, valueLength: localStorage.getItem(k)?.length || 0 }));
  });
  console.log('LocalStorage keys:', JSON.stringify(storage, null, 2));

  // Check for any toast/error messages
  const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 300));
  console.log('Page text (first 300):', bodyText);

  // Take screenshot after login
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-after-login.png`, fullPage: true });

  // Now try navigating to protected pages one by one
  const protectedPages = [
    { name: 'listing-new', path: '/listing/new' },
    { name: 'profile-edit', path: '/profile/edit' },
    { name: 'roommates', path: '/roommates' },
    { name: 'compare', path: '/compare' },
    { name: 'favorites', path: '/favorites' },
  ];

  for (const pg of protectedPages) {
    await page.goto(`${BASE}${pg.path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const pageTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      return { h1: h1?.textContent?.trim()?.substring(0, 50), h2: h2?.textContent?.trim()?.substring(0, 50) };
    });

    const hasLoginForm = await page.evaluate(() => {
      return !!document.querySelector('input[type="email"]') && !!document.querySelector('input[type="password"]');
    });

    console.log(`\n=== ${pg.name} (${pg.path}) ===`);
    console.log('Current URL:', currentUrl);
    console.log('Titles:', JSON.stringify(pageTitle));
    console.log('Has login form (redirected?):', hasLoginForm);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-${pg.name}.png`, fullPage: true });
  }
});
