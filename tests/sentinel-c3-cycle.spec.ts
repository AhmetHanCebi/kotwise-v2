import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

// Login credentials
const EMAIL = 'deniz@kotwise.com';
const PASSWORD = 'KotwiseTest2026!';

async function login(page: Page): Promise<boolean> {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  // Fill email
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  if (await emailInput.count() === 0) return false;
  await emailInput.fill(EMAIL);

  // Fill password
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  if (await passwordInput.count() === 0) return false;
  await passwordInput.fill(PASSWORD);

  // Click submit
  const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login"), button:has-text("giriş")').first();
  if (await submitBtn.count() === 0) return false;
  await submitBtn.click();

  // Wait for navigation or response
  await page.waitForTimeout(3000);

  // Check if we're still on login page
  const currentUrl = page.url();
  const stillOnLogin = currentUrl.includes('/login');

  // Check for error messages
  const errorMsg = page.locator('[class*="error"], [class*="alert"], [role="alert"], .text-red, .text-destructive');
  const hasError = await errorMsg.count() > 0;
  let errorText = '';
  if (hasError) {
    errorText = await errorMsg.first().textContent() || '';
  }

  return !stillOnLogin;
}

test.describe('Sentinel C3 — Login & Auth-Protected Pages', () => {

  test('C3-01: Login Test', async ({ page }) => {
    const success = await login(page);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-login.png`, fullPage: true });

    const url = page.url();
    console.log(`[LOGIN] URL after submit: ${url}`);
    console.log(`[LOGIN] Success: ${success}`);

    // Check cookies/localStorage for auth tokens
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(c => c.name.includes('auth') || c.name.includes('token') || c.name.includes('session') || c.name.includes('supabase'));
    console.log(`[LOGIN] Auth cookies: ${authCookies.map(c => c.name).join(', ') || 'NONE'}`);

    // Check localStorage
    const localStorageKeys = await page.evaluate(() => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('auth') || key.includes('token') || key.includes('supabase'))) {
          keys.push(key);
        }
      }
      return keys;
    });
    console.log(`[LOGIN] Auth localStorage keys: ${localStorageKeys.join(', ') || 'NONE'}`);

    // Check for any visible error
    const bodyText = await page.locator('body').textContent();
    if (bodyText?.includes('hata') || bodyText?.includes('error') || bodyText?.includes('yanlış') || bodyText?.includes('geçersiz')) {
      console.log(`[LOGIN] Error text found on page`);
    }

    test.info().annotations.push({ type: 'login_success', description: String(success) });
  });

  test('C3-02: Search — Broken Images Recheck', async ({ page }) => {
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-search.png`, fullPage: true });

    // Count all images
    const allImages = page.locator('img');
    const imgCount = await allImages.count();
    console.log(`[SEARCH] Total images: ${imgCount}`);

    // Check each image for broken state
    const brokenImages: string[] = [];
    for (let i = 0; i < imgCount; i++) {
      const img = allImages.nth(i);
      const src = await img.getAttribute('src') || '';
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      const isVisible = await img.isVisible();

      if (isVisible && naturalWidth === 0 && src) {
        brokenImages.push(src);
        console.log(`[SEARCH] Broken image: ${src}`);
      }
    }
    console.log(`[SEARCH] Broken images: ${brokenImages.length}`);

    // Check for placeholder logos
    const placeholderImgs = page.locator('img[src*="kotwise"], img[alt*="Kotwise"]');
    const placeholderCount = await placeholderImgs.count();
    console.log(`[SEARCH] Placeholder Kotwise logos: ${placeholderCount}`);
  });

  test('C3-03: Auth-Protected Pages (with login)', async ({ page }) => {
    // First login
    const loginSuccess = await login(page);
    console.log(`[AUTH] Login success: ${loginSuccess}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-after-login.png`, fullPage: true });

    if (!loginSuccess) {
      console.log('[AUTH] Login failed — testing protected pages without auth');
    }

    // Test each auth-protected page from C2
    const protectedPages = [
      { name: 'listing-new', path: '/listing/new' },
      { name: 'profile-edit', path: '/profile/edit' },
      { name: 'roommates', path: '/roommates' },
      { name: 'compare', path: '/compare' },
      { name: 'favorites', path: '/favorites' },
    ];

    for (const pg of protectedPages) {
      await page.goto(`${BASE}${pg.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-${pg.name}.png`, fullPage: true });

      const currentUrl = page.url();
      const redirectedToLogin = currentUrl.includes('/login');
      console.log(`[${pg.name}] URL: ${currentUrl} | Redirected to login: ${redirectedToLogin}`);

      if (!redirectedToLogin) {
        // Page loaded - check content
        const bodyText = await page.locator('body').textContent() || '';

        // Check for "yakında" placeholders
        if (bodyText.includes('yakında') || bodyText.includes('Yakında')) {
          console.log(`[${pg.name}] ⚠️ "Yakında" placeholder found`);
        }

        // Check for broken images
        const imgs = page.locator('img');
        const imgCount = await imgs.count();
        let brokenCount = 0;
        for (let i = 0; i < imgCount; i++) {
          const img = imgs.nth(i);
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          const isVisible = await img.isVisible();
          if (isVisible && naturalWidth === 0) brokenCount++;
        }
        console.log(`[${pg.name}] Images: ${imgCount}, Broken: ${brokenCount}`);

        // Check for free-text inputs that should be dropdowns (university, city)
        if (pg.name === 'profile-edit' || pg.name === 'listing-new') {
          const universityInput = page.locator('input[name*="universi"], input[placeholder*="üniversite"], input[placeholder*="Üniversite"], label:has-text("Üniversite") + input, label:has-text("Üniversite") ~ input');
          const uniCount = await universityInput.count();
          console.log(`[${pg.name}] University free-text inputs: ${uniCount}`);

          const cityInput = page.locator('input[name*="city"], input[name*="sehir"], input[placeholder*="şehir"], input[placeholder*="Şehir"], label:has-text("Şehir") + input');
          const cityCount = await cityInput.count();
          console.log(`[${pg.name}] City free-text inputs: ${cityCount}`);

          // Check for select/dropdown alternatives
          const selects = page.locator('select, [role="combobox"], [role="listbox"]');
          const selectCount = await selects.count();
          console.log(`[${pg.name}] Select/Combobox elements: ${selectCount}`);
        }

        // Check roommates for missing photos
        if (pg.name === 'roommates') {
          const avatarPlaceholders = page.locator('[class*="avatar"], [class*="initial"], .rounded-full:not(img)');
          const avatarCount = await avatarPlaceholders.count();
          const profileImages = page.locator('img[class*="avatar"], img[class*="profile"], img.rounded-full');
          const profileImgCount = await profileImages.count();
          console.log(`[${pg.name}] Avatar placeholders (initials): ${avatarCount}, Profile images: ${profileImgCount}`);
        }

        // Check favorites/compare for placeholder images
        if (pg.name === 'favorites' || pg.name === 'compare') {
          const placeholders = page.locator('img[src*="kotwise"], img[src*="placeholder"]');
          const phCount = await placeholders.count();
          console.log(`[${pg.name}] Placeholder images: ${phCount}`);
        }
      }
    }
  });
});
