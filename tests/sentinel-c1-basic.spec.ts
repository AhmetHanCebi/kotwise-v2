import { test, expect, Page } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';
const BASE = 'http://localhost:3336';

// All routes to test
const PUBLIC_PAGES = [
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'forgot-password', path: '/forgot-password' },
  { name: 'welcome', path: '/welcome' },
];

const AUTH_PAGES = [
  { name: 'home', path: '/' },
  { name: 'onboarding', path: '/onboarding' },
  { name: 'search', path: '/search' },
  { name: 'search-map', path: '/search/map' },
  { name: 'city', path: '/city' },
  { name: 'listing-new', path: '/listing/new' },
  { name: 'community', path: '/community' },
  { name: 'community-new', path: '/community/new' },
  { name: 'events', path: '/events' },
  { name: 'events-new', path: '/events/new' },
  { name: 'messages', path: '/messages' },
  { name: 'messages-new', path: '/messages/new' },
  { name: 'notifications', path: '/notifications' },
  { name: 'profile', path: '/profile' },
  { name: 'profile-edit', path: '/profile/edit' },
  { name: 'profile-bookings', path: '/profile/bookings' },
  { name: 'host', path: '/host' },
  { name: 'host-apply', path: '/host/apply' },
  { name: 'host-bookings', path: '/host/bookings' },
  { name: 'host-calendar', path: '/host/calendar' },
  { name: 'host-earnings', path: '/host/earnings' },
  { name: 'roommates', path: '/roommates' },
  { name: 'budget', path: '/budget' },
  { name: 'compare', path: '/compare' },
  { name: 'booking', path: '/booking' },
  { name: 'favorites', path: '/favorites' },
  { name: 'mentors', path: '/mentors' },
  { name: 'settings', path: '/settings' },
];

interface BugReport {
  page: string;
  path: string;
  issue: string;
  priority: 'high' | 'medium' | 'low';
  type: 'bug' | 'feature' | 'ux';
}

const bugs: BugReport[] = [];

function reportBug(page: string, path: string, issue: string, priority: 'high' | 'medium' | 'low' = 'medium', type: 'bug' | 'feature' | 'ux' = 'bug') {
  bugs.push({ page, path, issue, priority, type });
  console.log(`[BUG] ${priority.toUpperCase()} | ${page} (${path}): ${issue}`);
}

async function checkPage(p: Page, name: string, path: string) {
  const results: string[] = [];

  try {
    const response = await p.goto(path, { waitUntil: 'networkidle', timeout: 15000 });

    // 1. HTTP status
    if (!response || response.status() >= 400) {
      reportBug(name, path, `HTTP ${response?.status() || 'no response'}`, 'high', 'bug');
      results.push(`FAIL: HTTP ${response?.status()}`);
    } else {
      results.push(`OK: HTTP ${response.status()}`);
    }

    // Wait a bit for dynamic content
    await p.waitForTimeout(1500);

    // 2. Check for error screens
    const bodyText = await p.textContent('body') || '';
    if (bodyText.includes('Application error') || bodyText.includes('Internal Server Error') || bodyText.includes('500')) {
      reportBug(name, path, 'Application error / 500 on page', 'high', 'bug');
      results.push('FAIL: Error screen detected');
    }

    // 3. Check for "Yakında" / placeholder toasts
    if (bodyText.includes('Yakında') || bodyText.includes('yakında') || bodyText.includes('Bu özellik yakında')) {
      reportBug(name, path, '"Yakında" placeholder text found — feature not implemented', 'medium', 'feature');
      results.push('WARN: "Yakında" placeholder found');
    }

    if (bodyText.includes('Coming soon') || bodyText.includes('coming soon')) {
      reportBug(name, path, '"Coming soon" placeholder text found', 'medium', 'feature');
      results.push('WARN: "Coming soon" placeholder found');
    }

    // 4. Check page has meaningful content (not blank)
    const contentLength = bodyText.trim().length;
    if (contentLength < 50) {
      reportBug(name, path, 'Page appears blank or has very little content', 'high', 'bug');
      results.push('FAIL: Page is nearly blank');
    }

    // 5. Check for broken images
    const brokenImages = await p.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let broken = 0;
      imgs.forEach(img => {
        if (img.naturalWidth === 0 && img.src && !img.src.startsWith('data:')) broken++;
      });
      return broken;
    });
    if (brokenImages > 0) {
      reportBug(name, path, `${brokenImages} broken image(s) detected`, 'medium', 'bug');
      results.push(`WARN: ${brokenImages} broken images`);
    }

    // 6. Check for console errors
    const consoleErrors: string[] = [];
    p.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // 7. Check layout - viewport overflow
    const hasOverflow = await p.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 10;
    });
    if (hasOverflow) {
      reportBug(name, path, 'Horizontal scroll overflow detected — layout issue', 'medium', 'ux');
      results.push('WARN: Horizontal overflow');
    }

    // 8. Screenshot
    await p.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-${name}.png`, fullPage: true });
    results.push('Screenshot taken');

  } catch (err: any) {
    reportBug(name, path, `Page failed to load: ${err.message}`, 'high', 'bug');
    results.push(`FAIL: ${err.message}`);
    try {
      await p.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-${name}-error.png` });
    } catch {}
  }

  return results;
}

test.describe('Sentinel Cycle 1 — Public Pages', () => {
  for (const pg of PUBLIC_PAGES) {
    test(`[PUBLIC] ${pg.name} (${pg.path})`, async ({ page }) => {
      const results = await checkPage(page, pg.name, pg.path);
      console.log(`  ${pg.name}: ${results.join(' | ')}`);
      // Don't fail on warnings, only on HTTP errors
    });
  }
});

test.describe('Sentinel Cycle 1 — Auth Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');

    // Click login button
    const loginBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("giriş"), button:has-text("Login")').first();
    await loginBtn.click();

    // Wait for navigation after login
    await page.waitForTimeout(3000);
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 }).catch(() => {});
  });

  for (const pg of AUTH_PAGES) {
    test(`[AUTH] ${pg.name} (${pg.path})`, async ({ page }) => {
      const results = await checkPage(page, pg.name, pg.path);
      console.log(`  ${pg.name}: ${results.join(' | ')}`);
    });
  }
});

test.afterAll(() => {
  console.log('\n========== BUG SUMMARY ==========');
  if (bugs.length === 0) {
    console.log('ALL_CLEAR — No bugs found!');
  } else {
    console.log(`Total bugs found: ${bugs.length}`);
    bugs.forEach((b, i) => {
      console.log(`  ${i + 1}. [${b.priority.toUpperCase()}] [${b.type}] ${b.page} (${b.path}): ${b.issue}`);
    });
  }
  console.log('==================================\n');
});
