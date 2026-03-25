import { test, expect } from '@playwright/test';

test('debug login form', async ({ page }) => {
  await page.goto('http://localhost:3336/login');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/sentinel-c3-login-debug.png', fullPage: true });

  const inputs = await page.$$eval('input', els => els.map(e => ({
    type: e.type, name: e.name, placeholder: e.placeholder, id: e.id
  })));
  console.log('INPUTS:', JSON.stringify(inputs));

  const buttons = await page.$$eval('button', els => els.map(e => ({
    type: e.type, text: e.textContent?.trim(), class: e.className?.substring(0, 50)
  })));
  console.log('BUTTONS:', JSON.stringify(buttons));

  const html = await page.content();
  console.log('HAS_EMAIL_INPUT:', html.includes('type="email"') || html.includes('name="email"'));
  console.log('HAS_PASSWORD_INPUT:', html.includes('type="password"') || html.includes('name="password"'));
  console.log('PAGE_URL:', page.url());
});
