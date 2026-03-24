import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

// Login helper
async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', 'deniz@kotwise.com');
  await page.fill('input[type="password"]', 'KotwiseTest2026!');
  await page.getByText('Giriş Yap').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
}

// Helper: check for placeholder images (Kotwise logo as placeholder)
async function findPlaceholderImages(page) {
  return await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const placeholders = imgs.filter(img => {
      const src = img.src || '';
      const alt = img.alt || '';
      return src.includes('kotwise') || src.includes('placeholder') || src.includes('logo') ||
             src.includes('data:image') || alt.includes('placeholder');
    });
    return placeholders.map(img => ({
      src: img.src?.substring(0, 100),
      alt: img.alt,
      width: img.width,
      height: img.height,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    }));
  });
}

// Helper: check for broken images
async function findBrokenImages(page) {
  return await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => ({ src: img.src?.substring(0, 100), alt: img.alt }));
  });
}

// Helper: check for "yakında" / "coming soon" text
async function findComingSoonText(page) {
  return await page.evaluate(() => {
    const body = document.body?.innerText || '';
    const patterns = ['yakında', 'coming soon', 'bu özellik yakında', 'aktif olacak'];
    return patterns.filter(p => body.toLowerCase().includes(p.toLowerCase()));
  });
}

// Helper: check if input is free text (no dropdown/autocomplete)
async function checkFieldType(page, selector: string) {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { found: false };
    const tag = el.tagName.toLowerCase();
    const type = el.getAttribute('type') || '';
    const role = el.getAttribute('role') || '';
    const list = el.getAttribute('list') || '';
    const ariaExpanded = el.getAttribute('aria-expanded');
    const hasDatalist = !!document.querySelector(`datalist#${list}`);
    return {
      found: true,
      tag,
      type,
      role,
      list,
      hasDatalist,
      ariaExpanded,
      isSelect: tag === 'select',
      isCombobox: role === 'combobox',
      isFreeText: tag === 'input' && type === 'text' && !list && role !== 'combobox'
    };
  }, selector);
}

test.describe('Sentinel C2 — BUG Recheck', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // BUG #1: /search — 4 broken images + placeholder logos
  test('/search — broken images & placeholders', async ({ page }) => {
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-search.png`, fullPage: true });

    const broken = await findBrokenImages(page);
    const placeholders = await findPlaceholderImages(page);
    const comingSoon = await findComingSoonText(page);

    console.log('=== /search ===');
    console.log('Broken images:', JSON.stringify(broken, null, 2));
    console.log('Placeholder images:', JSON.stringify(placeholders, null, 2));
    console.log('Coming soon text:', comingSoon);

    // Check all images on page
    const allImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src?.substring(0, 120),
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete
      }));
    });
    console.log('All images:', JSON.stringify(allImages, null, 2));
  });

  // BUG #2: /search/map — no real map
  test('/search/map — map placeholder check', async ({ page }) => {
    await page.goto(`${BASE}/search/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-search-map.png`, fullPage: true });

    const comingSoon = await findComingSoonText(page);

    // Check for actual map elements (leaflet, mapbox, google maps, etc.)
    const mapCheck = await page.evaluate(() => {
      const hasLeaflet = !!document.querySelector('.leaflet-container');
      const hasMapbox = !!document.querySelector('.mapboxgl-map');
      const hasGoogleMap = !!document.querySelector('[class*="gm-style"]');
      const hasCanvas = !!document.querySelector('canvas');
      const hasIframe = !!document.querySelector('iframe[src*="map"]');
      const bodyText = document.body?.innerText || '';
      return {
        hasLeaflet, hasMapbox, hasGoogleMap, hasCanvas, hasIframe,
        hasMapElement: hasLeaflet || hasMapbox || hasGoogleMap || hasCanvas || hasIframe,
        bodyTextSnippet: bodyText.substring(0, 500)
      };
    });

    console.log('=== /search/map ===');
    console.log('Coming soon text:', comingSoon);
    console.log('Map check:', JSON.stringify(mapCheck, null, 2));
  });

  // BUG #3: /listing/new — free text city/university fields
  test('/listing/new — field type check', async ({ page }) => {
    await page.goto(`${BASE}/listing/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-listing-new.png`, fullPage: true });

    // Check all form fields
    const formFields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      return inputs.map(el => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        name: el.getAttribute('name') || '',
        placeholder: el.getAttribute('placeholder') || '',
        role: el.getAttribute('role') || '',
        id: el.id || '',
        label: el.closest('label')?.textContent?.trim()?.substring(0, 50) ||
               (el.id ? document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim()?.substring(0, 50) : '') || ''
      }));
    });

    console.log('=== /listing/new ===');
    console.log('Form fields:', JSON.stringify(formFields, null, 2));

    // Look for city/university fields specifically
    const cityField = formFields.find(f =>
      f.name?.toLowerCase().includes('city') || f.placeholder?.toLowerCase().includes('şehir') ||
      f.label?.toLowerCase().includes('şehir') || f.placeholder?.toLowerCase().includes('city')
    );
    const uniField = formFields.find(f =>
      f.name?.toLowerCase().includes('univ') || f.placeholder?.toLowerCase().includes('üniversite') ||
      f.label?.toLowerCase().includes('üniversite') || f.placeholder?.toLowerCase().includes('university')
    );

    console.log('City field:', JSON.stringify(cityField));
    console.log('University field:', JSON.stringify(uniField));
  });

  // BUG #4: /profile/edit — free text university field
  test('/profile/edit — university field type', async ({ page }) => {
    await page.goto(`${BASE}/profile/edit`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-profile-edit.png`, fullPage: true });

    const formFields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      return inputs.map(el => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        name: el.getAttribute('name') || '',
        placeholder: el.getAttribute('placeholder') || '',
        role: el.getAttribute('role') || '',
        id: el.id || '',
        label: el.closest('label')?.textContent?.trim()?.substring(0, 50) ||
               (el.id ? document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim()?.substring(0, 50) : '') || ''
      }));
    });

    console.log('=== /profile/edit ===');
    console.log('Form fields:', JSON.stringify(formFields, null, 2));
  });

  // BUG #5: /roommates — no profile photos
  test('/roommates — profile photos check', async ({ page }) => {
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-roommates.png`, fullPage: true });

    // Check for avatar/profile images vs initials
    const avatarCheck = await page.evaluate(() => {
      // Look for avatar containers
      const allText = document.body?.innerText || '';
      const imgs = Array.from(document.querySelectorAll('img'));
      const avatarImgs = imgs.filter(img => {
        const cl = img.className || '';
        const parent = img.parentElement?.className || '';
        return cl.includes('avatar') || cl.includes('profile') || cl.includes('rounded-full') ||
               parent.includes('avatar') || parent.includes('profile') ||
               img.alt?.includes('profil') || img.alt?.includes('avatar');
      });

      // Look for initial circles (divs with single/double letters, rounded-full)
      const initialCircles = Array.from(document.querySelectorAll('[class*="rounded-full"]'))
        .filter(el => {
          const text = el.textContent?.trim() || '';
          return text.length <= 2 && text.length > 0 && el.tagName !== 'IMG';
        });

      return {
        totalImages: imgs.length,
        avatarImages: avatarImgs.map(img => ({ src: img.src?.substring(0, 100), alt: img.alt })),
        initialCircles: initialCircles.length,
        hasRealPhotos: avatarImgs.length > 0 && avatarImgs.some(img => img.naturalWidth > 0)
      };
    });

    console.log('=== /roommates ===');
    console.log('Avatar check:', JSON.stringify(avatarCheck, null, 2));
  });

  // BUG #6: /compare — placeholder listing photos
  test('/compare — listing photos check', async ({ page }) => {
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-compare.png`, fullPage: true });

    const broken = await findBrokenImages(page);
    const placeholders = await findPlaceholderImages(page);

    const allImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src?.substring(0, 120),
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        complete: img.complete
      }));
    });

    console.log('=== /compare ===');
    console.log('Broken:', JSON.stringify(broken, null, 2));
    console.log('Placeholders:', JSON.stringify(placeholders, null, 2));
    console.log('All images:', JSON.stringify(allImages, null, 2));
  });

  // BUG #7: /favorites — placeholder listing photos
  test('/favorites — listing photos check', async ({ page }) => {
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-favorites.png`, fullPage: true });

    const broken = await findBrokenImages(page);
    const placeholders = await findPlaceholderImages(page);

    const allImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src?.substring(0, 120),
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        complete: img.complete
      }));
    });

    console.log('=== /favorites ===');
    console.log('Broken:', JSON.stringify(broken, null, 2));
    console.log('Placeholders:', JSON.stringify(placeholders, null, 2));
    console.log('All images:', JSON.stringify(allImages, null, 2));
  });

});
