import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';

test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }
});

const NEW_PAGES = [
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'forgot-password', path: '/forgot-password' },
  { name: 'onboarding', path: '/onboarding' },
  { name: 'welcome', path: '/welcome' },
  { name: 'listing-new', path: '/listing/new' },
  { name: 'listing-detail', path: '/listing/1' },
  { name: 'search-map', path: '/search/map' },
  { name: 'messages-detail', path: '/messages/1' },
  { name: 'community-new', path: '/community/new' },
  { name: 'community-detail', path: '/community/1' },
  { name: 'events-detail', path: '/events/1' },
  { name: 'city-detail', path: '/city/1' },
  { name: 'city-chat', path: '/city/1/chat' },
  { name: 'host-apply', path: '/host/apply' },
  { name: 'host-bookings', path: '/host/bookings' },
  { name: 'host-calendar', path: '/host/calendar' },
  { name: 'host-earnings', path: '/host/earnings' },
  { name: 'roommates-detail', path: '/roommates/1' },
  { name: 'profile-edit', path: '/profile/edit' },
  { name: 'booking-success', path: '/booking/success' },
];

for (const pg of NEW_PAGES) {
  test(`C3 - ${pg.name} (${pg.path})`, async ({ page }) => {
    const response = await page.goto(`${BASE}${pg.path}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(1500);

    await page.screenshot({ path: `tests/screenshots/sentinel-c3-${pg.name}.png`, fullPage: false });

    const status = response?.status() ?? 0;
    const url = page.url();
    const bodyText = await page.locator('body').innerText().catch(() => '');

    const is404 = status === 404 || bodyText.includes('404') || bodyText.includes('sayfa bulunamadı') || bodyText.includes('This page could not be found');
    const isBlank = bodyText.trim().length < 10;
    const hasBottomNav = await page.locator('nav, [class*="bottom"], [class*="BottomNav"], [class*="tab-bar"]').count() > 0;

    console.log(`[${pg.name}] status=${status} url=${url} blank=${isBlank} 404=${is404} bottomNav=${hasBottomNav}`);
    console.log(`[${pg.name}] body-preview: ${bodyText.substring(0, 200).replace(/\n/g, ' ')}`);

    if (is404) console.log(`BUG: ${pg.name} — 404`);
    if (isBlank) console.log(`BUG: ${pg.name} — blank page`);
  });
}
