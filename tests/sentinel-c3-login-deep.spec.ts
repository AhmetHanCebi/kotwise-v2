import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';
const EMAIL = 'deniz@kotwise.com';
const PASSWORD = 'KotwiseTest2026!';

test.describe('C3 Login Deep Investigation', () => {

  test('C3-LOGIN: Detailed login flow', async ({ page }) => {
    // Listen to all network requests
    const authRequests: string[] = [];
    const authResponses: { url: string; status: number; body: string }[] = [];

    page.on('request', req => {
      if (req.url().includes('auth') || req.url().includes('token') || req.url().includes('supabase')) {
        authRequests.push(`${req.method()} ${req.url()}`);
      }
    });

    page.on('response', async res => {
      if (res.url().includes('auth') || res.url().includes('token')) {
        let body = '';
        try { body = await res.text(); } catch {}
        authResponses.push({ url: res.url(), status: res.status(), body: body.substring(0, 500) });
      }
    });

    // Console log capture
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Go to login
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-login-before.png`, fullPage: true });

    // Check the form structure
    const formHTML = await page.locator('form').first().innerHTML();
    console.log(`[FORM] HTML length: ${formHTML.length}`);

    // Fill credentials
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
    await emailInput.fill(EMAIL);

    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(PASSWORD);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-login-filled.png`, fullPage: true });

    // Click submit and wait
    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
    const submitText = await submitBtn.textContent();
    console.log(`[SUBMIT] Button text: ${submitText}`);

    await submitBtn.click();

    // Wait for network activity
    await page.waitForTimeout(5000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-login-after.png`, fullPage: true });

    // Report
    const currentUrl = page.url();
    console.log(`[RESULT] Final URL: ${currentUrl}`);
    console.log(`[RESULT] Auth requests: ${JSON.stringify(authRequests, null, 2)}`);
    console.log(`[RESULT] Auth responses: ${JSON.stringify(authResponses, null, 2)}`);
    console.log(`[RESULT] Console logs: ${consoleLogs.filter(l => l.includes('auth') || l.includes('error') || l.includes('Error') || l.includes('supabase')).join('\n')}`);

    // Check cookies after login
    const cookies = await page.context().cookies();
    console.log(`[RESULT] All cookies: ${cookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`).join(', ')}`);

    // Check localStorage
    const allStorage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)!;
        items[key] = localStorage.getItem(key)?.substring(0, 100) || '';
      }
      return items;
    });
    console.log(`[RESULT] localStorage: ${JSON.stringify(allStorage, null, 2)}`);

    // Check error message on page
    const errorEl = page.locator('[class*="error"], [class*="alert"], [role="alert"], .text-red-500, .text-destructive, [class*="toast"]');
    if (await errorEl.count() > 0) {
      const errorText = await errorEl.first().textContent();
      console.log(`[RESULT] Error on page: ${errorText}`);
    }

    // Check if still on login
    const onLogin = currentUrl.includes('/login');
    console.log(`[RESULT] Still on login: ${onLogin}`);

    // If login succeeded, navigate to a protected page
    if (!onLogin) {
      await page.goto(`${BASE}/profile/edit`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      const profileUrl = page.url();
      console.log(`[RESULT] Profile/edit URL after login: ${profileUrl}`);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-profile-edit-loggedin.png`, fullPage: true });
    }
  });
});
