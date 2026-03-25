import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SS = 'tests/screenshots';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  await emailInput.fill('deniz@kotwise.com');
  await passwordInput.fill('KotwiseTest2026!');
  const loginBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
  await loginBtn.click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Messages Deep Check', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('messages — konuşma detay ve chat input', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Tüm tıklanabilir elementleri listele
    const clickables = await page.evaluate(() => {
      const items = document.querySelectorAll('div[class*="cursor"], a[href*="messages"], div[role="button"], li');
      return Array.from(items).slice(0, 10).map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 50),
        href: (el as HTMLAnchorElement).href || '',
        classes: el.className?.toString().substring(0, 60),
      }));
    });
    console.log('[messages] Tıklanabilir elementler:', JSON.stringify(clickables, null, 2));

    // Konuşma linklerine bak
    const links = await page.locator('a[href*="message"]').all();
    console.log(`[messages] Mesaj linkleri: ${links.length}`);
    for (const link of links.slice(0, 5)) {
      const href = await link.getAttribute('href');
      console.log(`  href: ${href}`);
    }

    // İlk konuşmaya tıkla — farklı selektörler dene
    const conversationSelectors = [
      'a[href*="messages/"]',
      'div:has-text("Fatma") >> nth=0',
      'div:has-text("Maria García") >> nth=0',
      'div:has-text("Mert") >> nth=0',
    ];

    for (const sel of conversationSelectors) {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log(`[messages] Tıklıyorum: ${sel}`);
        await el.click();
        await page.waitForTimeout(2000);
        break;
      }
    }

    // URL değişti mi?
    console.log(`[messages] URL after click: ${page.url()}`);
    await page.screenshot({ path: `${SS}/sentinel-c3-messages-detail-v2.png`, fullPage: true });

    // Chat input kontrolü
    const body = await page.locator('body').innerText();
    console.log(`[messages] Body preview: ${body.substring(0, 300)}`);

    const allInputs = await page.locator('input, textarea').all();
    for (const inp of allInputs) {
      const placeholder = await inp.getAttribute('placeholder').catch(() => '');
      const type = await inp.getAttribute('type').catch(() => '');
      console.log(`[messages] input: type=${type}, placeholder=${placeholder}`);
    }

    // Konuşma detay sayfasına doğrudan git
    await page.goto(`${BASE}/messages/1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log(`[messages/1] URL: ${page.url()}`);
    await page.screenshot({ path: `${SS}/sentinel-c3-messages-1.png`, fullPage: true });

    const body2 = await page.locator('body').innerText();
    console.log(`[messages/1] Body preview: ${body2.substring(0, 300)}`);

    const allInputs2 = await page.locator('input, textarea').all();
    for (const inp of allInputs2) {
      const placeholder = await inp.getAttribute('placeholder').catch(() => '');
      const type = await inp.getAttribute('type').catch(() => '');
      console.log(`[messages/1] input: type=${type}, placeholder=${placeholder}`);
    }

    // Mesaj yaz alanı var mı?
    const hasMessageInput = body2.toLowerCase().includes('mesaj yaz') || body2.toLowerCase().includes('bir mesaj');
    console.log(`[messages/1] "Mesaj yaz" text: ${hasMessageInput}`);
  });
});
