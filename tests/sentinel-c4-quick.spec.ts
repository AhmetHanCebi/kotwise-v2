import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SS = 'tests/screenshots';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="E-posta"]').first();
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill('deniz@kotwise.com');
    await page.locator('input[type="password"], input[name="password"]').first().fill('KotwiseTest2026!');
    await page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first().click();
    await page.waitForTimeout(2000);
  }
}

test('Q1: Map zoom level check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/search/map`);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SS}/sentinel-c4-map-zoom-verify.png`, fullPage: true });

  // Evaluate zoom from tile URLs directly
  const tileInfo = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    const tiles: string[] = [];
    imgs.forEach(img => {
      const src = img.src || '';
      if (src.includes('openstreetmap') || src.includes('tile')) {
        const match = src.match(/\/(\d+)\/\d+\/\d+\.png/);
        if (match) tiles.push(match[1]);
      }
    });
    return [...new Set(tiles)];
  });
  console.log(`[MAP] Zoom levels from tiles: ${tileInfo.join(', ')}`);

  // Get marker prices
  const markerText = await page.evaluate(() => {
    const pane = document.querySelector('.leaflet-marker-pane');
    return pane ? pane.textContent?.substring(0, 300) : 'NO_PANE';
  });
  console.log(`[MAP] Marker text: ${markerText}`);
});

test('Q2: Favorites img src detail', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/favorites`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SS}/sentinel-c4-favorites-verify.png`, fullPage: true });

  const imgInfo = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs).map(img => ({
      src: img.src.substring(0, 100),
      alt: img.alt,
      w: img.naturalWidth,
      h: img.naturalHeight
    }));
  });
  imgInfo.forEach((img, i) => {
    console.log(`[FAV-IMG] ${i}: src="${img.src}" alt="${img.alt}" ${img.w}x${img.h}`);
  });
});

test('Q3: Messages conversation detail', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/messages`);
  await page.waitForTimeout(2000);

  // Find and click first conversation link
  const href = await page.evaluate(() => {
    const links = document.querySelectorAll('a[href*="/messages/"]');
    if (links.length > 0) {
      const h = (links[0] as HTMLAnchorElement).href;
      (links[0] as HTMLAnchorElement).click();
      return h;
    }
    return 'NO_LINKS';
  });
  console.log(`[MSG] First conversation: ${href}`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SS}/sentinel-c4-messages-chat-verify.png`, fullPage: true });

  // Check inputs and buttons
  const formInfo = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, textarea');
    const buttons = document.querySelectorAll('button');
    return {
      inputs: Array.from(inputs).map(el => ({
        tag: el.tagName,
        type: (el as HTMLInputElement).type,
        placeholder: (el as HTMLInputElement).placeholder
      })),
      buttons: Array.from(buttons).map(el => el.textContent?.trim().substring(0, 30)).filter(t => t)
    };
  });
  formInfo.inputs.forEach((inp, i) => console.log(`[MSG-INPUT] ${i}: <${inp.tag}> type="${inp.type}" placeholder="${inp.placeholder}"`));
  formInfo.buttons.forEach((btn, i) => console.log(`[MSG-BTN] ${i}: "${btn}"`));
});

test('Q4: Events buttons detail', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/events`);
  await page.waitForTimeout(2000);

  const btnInfo = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    return Array.from(btns).map(b => ({
      text: b.textContent?.trim().substring(0, 40),
      aria: b.getAttribute('aria-label'),
      cls: b.className.substring(0, 60)
    }));
  });
  btnInfo.forEach((b, i) => console.log(`[EVENTS-BTN] ${i}: text="${b.text}" aria="${b.aria}" class="${b.cls}"`));
});

test('Q5: Profile Edit tags check', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/edit`);
  await page.waitForTimeout(2000);

  const tagInfo = await page.evaluate(() => {
    const body = document.body.innerHTML;
    const hasInterest = body.includes('interest') || body.includes('ilgi') || body.includes('hobby');
    const hasTags = body.includes('tag') || body.includes('chip') || body.includes('badge');

    // Look for small text elements that could be tags
    const spans = document.querySelectorAll('span, div');
    const tagLike: string[] = [];
    spans.forEach(el => {
      const cls = el.className || '';
      const text = el.textContent?.trim() || '';
      if ((cls.includes('tag') || cls.includes('chip') || cls.includes('badge') || cls.includes('interest')) && text.length < 30 && text.length > 1) {
        tagLike.push(`${cls.substring(0, 30)}: "${text}"`);
      }
    });
    return { hasInterest, hasTags, tagLike: tagLike.slice(0, 10) };
  });
  console.log(`[PROFILE] hasInterest=${tagInfo.hasInterest}, hasTags=${tagInfo.hasTags}`);
  tagInfo.tagLike.forEach(t => console.log(`[PROFILE-TAG] ${t}`));
});

test('Q6: Host Apply full content', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/host/apply`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SS}/sentinel-c4-host-apply-verify.png`, fullPage: true });

  const pageInfo = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, textarea, select');
    const btns = document.querySelectorAll('button');
    const text = document.body.textContent?.substring(0, 600) || '';
    return {
      inputs: Array.from(inputs).map(el => ({
        tag: el.tagName,
        type: (el as HTMLInputElement).type,
        name: (el as HTMLInputElement).name,
        placeholder: (el as HTMLInputElement).placeholder
      })),
      buttons: Array.from(btns).map(b => b.textContent?.trim()).filter(t => t),
      text
    };
  });
  pageInfo.inputs.forEach((inp, i) => console.log(`[HOST-APPLY] Input ${i}: <${inp.tag}> type="${inp.type}" name="${inp.name}" ph="${inp.placeholder}"`));
  pageInfo.buttons.forEach((b, i) => console.log(`[HOST-APPLY] Button ${i}: "${b}"`));
  console.log(`[HOST-APPLY] Text: ${pageInfo.text.substring(0, 300)}`);
});
