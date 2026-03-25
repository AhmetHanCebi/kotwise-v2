import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';

const PAGES = [
  { name: 'login', path: '/login', auth: false },
  { name: 'register', path: '/register', auth: false },
  { name: 'forgot-password', path: '/forgot-password', auth: false },
  { name: 'welcome', path: '/welcome', auth: false },
  // Auth required pages
  { name: 'home', path: '/', auth: true },
  { name: 'onboarding', path: '/onboarding', auth: true },
  { name: 'search', path: '/search', auth: true },
  { name: 'search-map', path: '/search/map', auth: true },
  { name: 'favorites', path: '/favorites', auth: true },
  { name: 'city', path: '/city', auth: true },
  { name: 'community', path: '/community', auth: true },
  { name: 'community-new', path: '/community/new', auth: true },
  { name: 'events', path: '/events', auth: true },
  { name: 'events-new', path: '/events/new', auth: true },
  { name: 'roommates', path: '/roommates', auth: true },
  { name: 'mentors', path: '/mentors', auth: true },
  { name: 'messages', path: '/messages', auth: true },
  { name: 'messages-new', path: '/messages/new', auth: true },
  { name: 'notifications', path: '/notifications', auth: true },
  { name: 'profile', path: '/profile', auth: true },
  { name: 'profile-edit', path: '/profile/edit', auth: true },
  { name: 'profile-bookings', path: '/profile/bookings', auth: true },
  { name: 'budget', path: '/budget', auth: true },
  { name: 'compare', path: '/compare', auth: true },
  { name: 'booking', path: '/booking', auth: true },
  { name: 'booking-success', path: '/booking/success', auth: true },
  { name: 'host', path: '/host', auth: true },
  { name: 'host-apply', path: '/host/apply', auth: true },
  { name: 'host-bookings', path: '/host/bookings', auth: true },
  { name: 'host-calendar', path: '/host/calendar', auth: true },
  { name: 'host-earnings', path: '/host/earnings', auth: true },
  { name: 'settings', path: '/settings', auth: true },
  { name: 'settings-faq', path: '/settings/faq', auth: true },
  { name: 'settings-terms', path: '/settings/terms', auth: true },
  { name: 'settings-privacy', path: '/settings/privacy', auth: true },
  { name: 'listing-new', path: '/listing/new', auth: true },
];

test('Sentinel C1 - Full Page Scan', async ({ browser }) => {
  test.setTimeout(300000); // 5 min total

  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
  });
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // --- LOGIN ---
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-login-before.png`, fullPage: true });

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

  await emailInput.fill('deniz@kotwise.com');
  await passwordInput.fill('KotwiseTest2026!');

  const submitBtn = page.locator('button:has-text("Giriş Yap")').first();
  await submitBtn.click();

  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 }).catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-after-login.png`, fullPage: true });

  const loggedIn = !page.url().includes('/login');
  console.log(`LOGIN: ${loggedIn ? 'SUCCESS' : 'FAILED'} - URL: ${page.url()}`);

  // --- TEST EACH PAGE ---
  const results: Array<{
    name: string;
    path: string;
    status: 'OK' | 'BUG';
    bugs: string[];
    notes: string[];
  }> = [];

  for (const p of PAGES) {
    const result = { name: p.name, path: p.path, status: 'OK' as 'OK' | 'BUG', bugs: [] as string[], notes: [] as string[] };
    consoleErrors.length = 0;

    try {
      const resp = await page.goto(p.path, { timeout: 15000 });

      if (resp && resp.status() >= 400) {
        result.bugs.push(`HTTP ${resp.status()}`);
        result.status = 'BUG';
      }

      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000); // Let renders settle

      const currentUrl = page.url();

      // Auth check
      if (p.auth && currentUrl.includes('/login')) {
        result.bugs.push('Redirected to login - session lost');
        result.status = 'BUG';
      }

      // Screenshot
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c1-${p.name}.png`, fullPage: true });

      const bodyText = await page.textContent('body') || '';

      // Next.js errors
      const errorOverlay = await page.locator('[data-nextjs-dialog-overlay], [data-nextjs-error]').count();
      if (errorOverlay > 0) {
        result.bugs.push('Next.js error overlay');
        result.status = 'BUG';
      }

      // Error text patterns
      for (const pat of [
        /Unhandled Runtime Error/i,
        /Application error/i,
        /Internal Server Error/i,
      ]) {
        if (pat.test(bodyText)) {
          result.bugs.push(`Error: ${pat.source}`);
          result.status = 'BUG';
        }
      }

      // "Yakında" / placeholder checks
      const yakindaMatch = bodyText.match(/yakında|coming soon|çok yakında|henüz aktif değil|bu özellik yakında/i);
      if (yakindaMatch) {
        result.notes.push(`Placeholder: "${yakindaMatch[0]}"`);
      }

      // Lorem ipsum
      if (/lorem ipsum/i.test(bodyText)) {
        result.notes.push('Lorem ipsum dummy text found');
      }

      // Stuck spinner check
      const spinners = await page.locator('.animate-spin').count();
      if (spinners > 0) {
        await page.waitForTimeout(3000);
        const still = await page.locator('.animate-spin').count();
        if (still > 0) {
          result.notes.push('Loading spinner stuck');
        }
      }

      // Placeholder images
      const imgs = await page.locator('img[src*="placeholder"], img[src*="via.placeholder"]').count();
      if (imgs > 0) {
        result.notes.push(`${imgs} placeholder image(s)`);
      }

      // University free-text check
      if (['register', 'onboarding', 'profile-edit'].includes(p.name)) {
        const uniFields = await page.locator('input').all();
        for (const field of uniFields) {
          const ph = (await field.getAttribute('placeholder') || '').toLowerCase();
          const nm = (await field.getAttribute('name') || '').toLowerCase();
          if (ph.includes('üniversite') || ph.includes('universi') || nm.includes('universi')) {
            const tag = await field.evaluate(el => el.tagName.toLowerCase());
            const type = await field.getAttribute('type') || 'text';
            if (tag === 'input' && (type === 'text' || type === '')) {
              result.notes.push('University field is free text input (should be dropdown/autocomplete)');
            }
          }
        }
      }

      // Empty page check
      const visibleText = bodyText.replace(/\s+/g, ' ').trim();
      if (visibleText.length < 30) {
        result.notes.push('Page appears mostly empty');
      }

      // Console errors
      if (consoleErrors.length > 0) {
        result.notes.push(`${consoleErrors.length} console error(s)`);
      }

    } catch (err: any) {
      result.bugs.push(`Error: ${err.message?.substring(0, 150)}`);
      result.status = 'BUG';
    }

    results.push(result);
    const noteStr = result.notes.length > 0 ? ` | Notes: ${result.notes.join('; ')}` : '';
    console.log(`[${result.status}] ${p.name} (${p.path})${result.bugs.length > 0 ? ' - ' + result.bugs.join(', ') : ''}${noteStr}`);
  }

  // --- SUMMARY ---
  console.log('\n========== SENTINEL C1 SUMMARY ==========');
  const bugs = results.filter(r => r.status === 'BUG');
  const clean = results.filter(r => r.status === 'OK' && r.notes.length === 0);
  const withNotes = results.filter(r => r.notes.length > 0);

  console.log(`Total: ${results.length} | Clean: ${clean.length} | Bugs: ${bugs.length} | With Notes: ${withNotes.length}`);

  console.log('\n--- BUGS ---');
  for (const r of bugs) {
    console.log(`  ${r.name} (${r.path}): ${r.bugs.join(', ')}`);
  }

  console.log('\n--- NOTES ---');
  for (const r of withNotes) {
    console.log(`  ${r.name} (${r.path}): ${r.notes.join('; ')}`);
  }

  console.log('\n--- CLEAN ---');
  for (const r of clean) {
    console.log(`  ${r.name} (${r.path})`);
  }

  // Output results as JSON for post-processing
  console.log('\n__RESULTS_JSON__');
  console.log(JSON.stringify(results));

  await context.close();
});
