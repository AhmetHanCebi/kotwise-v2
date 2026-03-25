import { test, expect } from '@playwright/test';
import * as fs from 'fs';

const SCREENSHOT_DIR = 'tests/screenshots';

const PAGES = [
  // Auth & Onboarding
  { name: 'home', path: '/' },
  { name: 'welcome', path: '/welcome' },
  { name: 'onboarding', path: '/onboarding' },
  // Search & Discovery
  { name: 'search', path: '/search' },
  { name: 'search-map', path: '/search/map' },
  { name: 'city', path: '/city' },
  { name: 'compare', path: '/compare' },
  // Listings
  { name: 'listing-new', path: '/listing/new' },
  // Booking & Budget
  { name: 'booking', path: '/booking' },
  { name: 'budget', path: '/budget' },
  // User
  { name: 'profile', path: '/profile' },
  { name: 'profile-edit', path: '/profile/edit' },
  { name: 'profile-bookings', path: '/profile/bookings' },
  { name: 'favorites', path: '/favorites' },
  { name: 'settings', path: '/settings' },
  { name: 'settings-privacy', path: '/settings/privacy' },
  { name: 'settings-terms', path: '/settings/terms' },
  { name: 'settings-faq', path: '/settings/faq' },
  { name: 'notifications', path: '/notifications' },
  // Messaging
  { name: 'messages', path: '/messages' },
  { name: 'messages-new', path: '/messages/new' },
  // Community
  { name: 'community', path: '/community' },
  { name: 'community-new', path: '/community/new' },
  // Events
  { name: 'events', path: '/events' },
  { name: 'events-new', path: '/events/new' },
  // Social
  { name: 'roommates', path: '/roommates' },
  { name: 'mentors', path: '/mentors' },
  // Host
  { name: 'host', path: '/host' },
  { name: 'host-apply', path: '/host/apply' },
  { name: 'host-bookings', path: '/host/bookings' },
  { name: 'host-calendar', path: '/host/calendar' },
  { name: 'host-earnings', path: '/host/earnings' },
];

interface PageResult {
  page: string;
  path: string;
  status: 'OK' | 'BUG' | 'PLACEHOLDER';
  issues: string[];
}

test.describe('Sentinel C1 - Temel Kontrol', () => {
  const allResults: PageResult[] = [];

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
      await page.waitForTimeout(3000);
    }
  });

  for (const p of PAGES) {
    test(`${p.name} sayfası (${p.path})`, async ({ page }) => {
      const result: PageResult = { page: p.name, path: p.path, status: 'OK', issues: [] };

      const response = await page.goto(p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2500);

      // 1. HTTP status
      const status = response?.status() ?? 0;
      if (status >= 400) {
        result.status = 'BUG';
        result.issues.push(`HTTP ${status}`);
      }

      // 2. Redirected to login?
      const currentUrl = page.url();
      if (currentUrl.includes('/login') && p.path !== '/login') {
        result.issues.push('Redirected to login (auth issue)');
      }

      // 3. Next.js error overlay (not dev tools button)
      const errorDialog = await page.locator('[data-nextjs-dialog], [data-nextjs-dialog-overlay], #nextjs__container_errors_overlay').count();
      if (errorDialog > 0) {
        result.status = 'BUG';
        result.issues.push('Next.js error overlay visible');
      }

      // 4. Error text in body
      const bodyText = await page.locator('body').innerText().catch(() => '');
      if (/unhandled|runtime error|application error|server error/i.test(bodyText)) {
        result.status = 'BUG';
        result.issues.push('Error text on page');
      }

      // 5. Content height
      const bodyBox = await page.locator('body').boundingBox().catch(() => null);
      if (bodyBox && bodyBox.height < 200) {
        result.status = 'BUG';
        result.issues.push(`Content too small: ${bodyBox.height}px`);
      }

      // 6. "Yakında" / Coming Soon placeholder check
      const yakindaEls = page.locator('text=/yakında|coming soon|bu özellik yakında|çok yakında/i');
      const yakindaCount = await yakindaEls.count();
      if (yakindaCount > 0) {
        if (result.status === 'OK') result.status = 'PLACEHOLDER';
        result.issues.push(`"Yakında/Coming Soon" placeholder (${yakindaCount}x)`);
      }

      // 7. Map check - is it a real map or placeholder?
      if (p.path.includes('map') || p.path.includes('harita') || p.name.includes('map')) {
        const hasMapCanvas = await page.locator('.mapboxgl-map, .leaflet-container, .gm-style, [class*="MapContainer"], canvas[aria-label*="Map"]').count();
        const hasMapIframe = await page.locator('iframe[src*="maps"], iframe[src*="mapbox"]').count();
        if (hasMapCanvas === 0 && hasMapIframe === 0) {
          if (result.status === 'OK') result.status = 'PLACEHOLDER';
          result.issues.push('Map page has no real map component (placeholder?)');
        }
      }

      // 8. Placeholder images
      const placeholderImgs = await page.locator('img[src*="placeholder"], img[src*="via.placeholder"], img[src*="picsum.photos"]').count();
      if (placeholderImgs > 0) {
        if (result.status === 'OK') result.status = 'PLACEHOLDER';
        result.issues.push(`${placeholderImgs} placeholder image(s)`);
      }

      // 9. University field check (free text vs dropdown)
      const uniField = page.locator('input[name*="universi"], input[name*="üniversite"], input[placeholder*="Üniversite"], input[placeholder*="universi"]');
      if (await uniField.count() > 0) {
        const fieldType = await uniField.first().getAttribute('type');
        const hasList = await uniField.first().getAttribute('list');
        const role = await uniField.first().getAttribute('role');
        if (fieldType === 'text' && !hasList && role !== 'combobox') {
          if (result.status === 'OK') result.status = 'PLACEHOLDER';
          result.issues.push('University field is free text - should be dropdown/autocomplete');
        }
      }

      // 10. Empty state - page with no meaningful content
      const mainText = bodyText.replace(/\s+/g, ' ').trim();
      if (mainText.length < 30 && !currentUrl.includes('/login')) {
        result.status = 'BUG';
        result.issues.push('Page appears empty (< 30 chars of text)');
      }

      // Screenshot
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/sentinel-c1-${p.name}.png`,
        fullPage: true
      });

      // Log result
      const icon = result.status === 'OK' ? '✅' : result.status === 'BUG' ? '🐛' : '⚠️';
      console.log(`${icon} [${result.status}] ${p.name} (${p.path})${result.issues.length ? ': ' + result.issues.join(', ') : ''}`);

      allResults.push(result);

      // Write results incrementally
      fs.writeFileSync('tests/sentinel-c1-results.json', JSON.stringify(allResults, null, 2));

      // Fail test only for actual bugs
      if (result.status === 'BUG') {
        expect(false, `${p.name}: ${result.issues.join(', ')}`).toBeTruthy();
      }
    });
  }
});
