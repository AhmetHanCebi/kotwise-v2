import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';
const EMAIL = 'deniz@kotwise.com';
const PASSWORD = 'KotwiseTest2026!';

test('C3-LOGIN-V2: Login flow investigation', async ({ page }) => {
  const authResponses: { url: string; status: number; body: string }[] = [];
  const consoleLogs: string[] = [];

  page.on('response', async res => {
    if (res.url().includes('auth') || res.url().includes('token') || res.url().includes('supabase')) {
      let body = '';
      try { body = await res.text(); } catch {}
      authResponses.push({ url: res.url(), status: res.status(), body: body.substring(0, 300) });
    }
  });

  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Debug: what inputs exist?
  const inputs = await page.locator('input').all();
  for (const inp of inputs) {
    const type = await inp.getAttribute('type') || '';
    const name = await inp.getAttribute('name') || '';
    const placeholder = await inp.getAttribute('placeholder') || '';
    console.log(`[INPUT] type=${type} name=${name} placeholder=${placeholder}`);
  }

  // Fill email - try multiple selectors
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="E-posta"]').first();
  const emailExists = await emailInput.count() > 0;
  console.log(`[LOGIN] Email input found: ${emailExists}`);
  if (emailExists) {
    await emailInput.fill(EMAIL);
  }

  // Fill password
  const passwordInput = page.locator('input[type="password"]').first();
  const pwExists = await passwordInput.count() > 0;
  console.log(`[LOGIN] Password input found: ${pwExists}`);
  if (pwExists) {
    await passwordInput.fill(PASSWORD);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-login-v2-filled.png`, fullPage: true });

  // Find and click submit button
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent() || '';
    const type = await btn.getAttribute('type') || '';
    console.log(`[BUTTON] text="${text.trim()}" type=${type}`);
  }

  const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("giriş")').first();
  const btnExists = await submitBtn.count() > 0;
  console.log(`[LOGIN] Submit button found: ${btnExists}`);

  if (btnExists) {
    await submitBtn.click();
    await page.waitForTimeout(5000);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-login-v2-after.png`, fullPage: true });

  const finalUrl = page.url();
  console.log(`[RESULT] Final URL: ${finalUrl}`);
  console.log(`[RESULT] Still on login: ${finalUrl.includes('/login')}`);
  console.log(`[RESULT] Auth responses: ${JSON.stringify(authResponses, null, 2)}`);

  // Check for error messages on page
  const bodyText = await page.locator('body').textContent() || '';
  const errorPatterns = ['hata', 'error', 'yanlış', 'geçersiz', 'başarısız', 'incorrect', 'invalid'];
  for (const pat of errorPatterns) {
    if (bodyText.toLowerCase().includes(pat)) {
      // Find the context around the error
      const idx = bodyText.toLowerCase().indexOf(pat);
      console.log(`[ERROR] Found "${pat}" at pos ${idx}: ...${bodyText.substring(Math.max(0, idx - 30), idx + 50)}...`);
    }
  }

  // Relevant console logs
  const relevantLogs = consoleLogs.filter(l =>
    l.toLowerCase().includes('auth') ||
    l.toLowerCase().includes('error') ||
    l.toLowerCase().includes('supabase') ||
    l.toLowerCase().includes('login') ||
    l.toLowerCase().includes('token')
  );
  console.log(`[CONSOLE] Relevant logs:\n${relevantLogs.join('\n')}`);

  // Check localStorage for auth
  const storage = await page.evaluate(() => {
    const items: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      items.push(`${key}=${localStorage.getItem(key)?.substring(0, 50)}`);
    }
    return items;
  });
  console.log(`[STORAGE] ${storage.join('\n')}`);
});
