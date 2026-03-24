import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';
const EMAIL = 'deniz@kotwise.com';
const PASSWORD = 'KotwiseTest2026!';

async function login(page: any) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.locator('input[type="email"]').first().fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.locator('button:has-text("Giriş")').first().click();
  await page.waitForTimeout(3000);
}

test('C3-D1: Profile Edit — Field Types', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/profile/edit`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Check all input/select/textarea elements and their attributes
  const fields = await page.evaluate(() => {
    const results: any[] = [];
    // Check all labels and their associated inputs
    const labels = document.querySelectorAll('label, .label, [class*="label"]');
    labels.forEach(label => {
      const text = label.textContent?.trim() || '';
      if (text) results.push({ type: 'label', text });
    });

    // Check all inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((el: any) => {
      results.push({
        type: 'input',
        tagName: el.tagName,
        inputType: el.type || '',
        name: el.name || '',
        placeholder: el.placeholder || '',
        value: el.value || '',
        role: el.getAttribute('role') || '',
        readOnly: el.readOnly || false,
      });
    });

    // Check for combobox/listbox elements
    const comboboxes = document.querySelectorAll('[role="combobox"], [role="listbox"], [role="option"]');
    comboboxes.forEach((el: any) => {
      results.push({
        type: 'combobox',
        role: el.getAttribute('role'),
        text: el.textContent?.trim().substring(0, 50),
      });
    });

    // Check for select elements
    const selects = document.querySelectorAll('select');
    selects.forEach((el: any) => {
      const options = Array.from(el.options).map((o: any) => o.text);
      results.push({
        type: 'select',
        name: el.name,
        optionCount: options.length,
        firstOptions: options.slice(0, 5),
      });
    });

    return results;
  });

  console.log('[PROFILE/EDIT] Fields:');
  fields.forEach(f => console.log(JSON.stringify(f)));

  // Specifically check "Şehir" field - is it a text input or dropdown?
  const cityField = page.locator('input[placeholder*="stanbul"], input[value*="stanbul"]').first();
  if (await cityField.count() > 0) {
    const cityType = await cityField.getAttribute('type');
    const cityReadOnly = await cityField.getAttribute('readonly');
    const cityRole = await cityField.getAttribute('role');
    console.log(`[PROFILE/EDIT] City field: type=${cityType}, readonly=${cityReadOnly}, role=${cityRole}`);
  }

  // Check "Bölüm" field
  const majorField = page.locator('input[value*="Bilgisayar"], input[placeholder*="ölüm"]').first();
  if (await majorField.count() > 0) {
    const majorType = await majorField.getAttribute('type');
    console.log(`[PROFILE/EDIT] Major field: type=${majorType}`);
  }

  // Full page screenshot at higher res
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-profile-edit-detail.png`, fullPage: true });
});

test('C3-D2: Search — Broken Image URLs', async ({ page }) => {
  await page.goto(`${BASE}/search`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);

  const images = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs).map((img: any) => ({
      src: img.src,
      alt: img.alt || '',
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayed: img.offsetWidth > 0 && img.offsetHeight > 0,
      broken: img.naturalWidth === 0 && img.src && !img.src.startsWith('data:'),
    }));
  });

  console.log(`[SEARCH] Total images: ${images.length}`);
  const broken = images.filter(i => i.broken && i.displayed);
  console.log(`[SEARCH] Broken & visible: ${broken.length}`);
  broken.forEach(b => console.log(`  BROKEN: ${b.src}`));

  // Also check for "Fotoğraf Yok" text
  const noPhotoText = await page.locator('text=Fotoğraf Yok').count();
  console.log(`[SEARCH] "Fotoğraf Yok" count: ${noPhotoText}`);

  const loaded = images.filter(i => !i.broken && i.displayed);
  console.log(`[SEARCH] Loaded & visible: ${loaded.length}`);
});

test('C3-D3: Favorites — Image Issue', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/favorites`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Check for "Fotoğraf Yok"
  const noPhotoCount = await page.locator('text=Fotoğraf Yok').count();
  console.log(`[FAVORITES] "Fotoğraf Yok" count: ${noPhotoCount}`);

  // Check all images
  const images = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs).map((img: any) => ({
      src: img.src,
      naturalWidth: img.naturalWidth,
      broken: img.naturalWidth === 0 && img.src && !img.src.startsWith('data:'),
    }));
  });
  console.log(`[FAVORITES] Images: ${images.length}, Broken: ${images.filter(i => i.broken).length}`);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-favorites-detail.png`, fullPage: true });
});

test('C3-D4: Compare — Image Issue', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/compare`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  const noPhotoCount = await page.locator('text=Fotoğraf Yok').count();
  console.log(`[COMPARE] "Fotoğraf Yok" count: ${noPhotoCount}`);

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c3-compare-detail.png`, fullPage: true });
});
