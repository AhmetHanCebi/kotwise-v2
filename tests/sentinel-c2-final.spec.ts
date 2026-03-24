import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

// Test 1: Check login error message
test('Login attempt — capture error', async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Listen for network responses to Supabase
  const authResponses: any[] = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('supabase') || url.includes('auth')) {
      try {
        const body = await response.text();
        authResponses.push({ url: url.substring(0, 100), status: response.status(), body: body.substring(0, 300) });
      } catch {}
    }
  });

  await page.fill('input[type="email"]', 'deniz@kotwise.com');
  await page.fill('input[type="password"]', 'KotwiseTest2026!');
  await page.getByText('Giriş Yap').first().click();
  await page.waitForTimeout(5000);

  // Check for error div
  const errorDiv = page.locator('[style*="FEF2F2"], [style*="error"], .text-red-500, [class*="error"]');
  const errorCount = await errorDiv.count();
  if (errorCount > 0) {
    const errorText = await errorDiv.first().textContent();
    console.log('LOGIN ERROR:', errorText);
  } else {
    console.log('No visible error div found');
  }

  // Check auth responses
  console.log('Auth responses:', JSON.stringify(authResponses, null, 2));

  // Check URL
  console.log('Current URL:', page.url());

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-login-error.png`, fullPage: true });
});

// Test 2: Recheck /search — broken images (PUBLIC, no auth needed)
test('/search — broken images recheck', async ({ page }) => {
  await page.goto(`${BASE}/search`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const imageAnalysis = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return {
      total: imgs.length,
      broken: imgs.filter(img => img.naturalWidth === 0 && img.src && !img.src.startsWith('data:')).map(img => ({
        src: img.src?.substring(0, 120),
        alt: img.alt
      })),
      loaded: imgs.filter(img => img.naturalWidth > 0).length
    };
  });

  console.log('=== /search IMAGE ANALYSIS ===');
  console.log(`Total: ${imageAnalysis.total}, Loaded: ${imageAnalysis.loaded}, Broken: ${imageAnalysis.broken.length}`);
  console.log('Broken URLs:', JSON.stringify(imageAnalysis.broken, null, 2));

  // Check for placeholder logos (Kotwise branded placeholders)
  const placeholderCheck = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.filter(img => {
      const src = img.src || '';
      return src.includes('/logo') || src.includes('/kotwise') || src.includes('/placeholder');
    }).map(img => ({ src: img.src?.substring(0, 100), alt: img.alt }));
  });
  console.log('Placeholder logos:', JSON.stringify(placeholderCheck));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-search.png`, fullPage: true });
});

// Test 3: Recheck /search/map — now has Leaflet! Verify quality
test('/search/map — verify map quality', async ({ page }) => {
  await page.goto(`${BASE}/search/map`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const mapAnalysis = await page.evaluate(() => {
    const hasLeaflet = !!document.querySelector('.leaflet-container');
    const leafletContainer = document.querySelector('.leaflet-container');
    const markers = document.querySelectorAll('.leaflet-marker-icon, .leaflet-marker-pane *');
    const tileLayer = !!document.querySelector('.leaflet-tile-pane img');
    const bodyText = document.body?.innerText || '';
    const hasComingSoon = bodyText.toLowerCase().includes('yakında') || bodyText.toLowerCase().includes('coming soon');

    return {
      hasLeaflet,
      containerSize: leafletContainer ? {
        width: leafletContainer.clientWidth,
        height: leafletContainer.clientHeight
      } : null,
      markerCount: markers.length,
      hasTiles: tileLayer,
      hasComingSoon,
      priceMarkers: bodyText.match(/\d+\.?\d*\s*TL/g)?.length || 0
    };
  });

  console.log('=== /search/map ANALYSIS ===');
  console.log('Map analysis:', JSON.stringify(mapAnalysis, null, 2));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-search-map.png`, fullPage: true });
});

// Test 4-8: Protected pages — try direct navigation (some might work without full auth)
const protectedPages = [
  { name: 'listing-new', path: '/listing/new' },
  { name: 'profile-edit', path: '/profile/edit' },
  { name: 'roommates', path: '/roommates' },
  { name: 'compare', path: '/compare' },
  { name: 'favorites', path: '/favorites' },
];

for (const pg of protectedPages) {
  test(`${pg.name} — auth-protected recheck`, async ({ page }) => {
    // Try direct access first
    await page.goto(`${BASE}${pg.path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const pageState = await page.evaluate(() => {
      const bodyText = document.body?.innerText?.substring(0, 500) || '';
      const hasLoginForm = !!document.querySelector('input[type="email"]') && !!document.querySelector('input[type="password"]');
      const hasLoader = !!document.querySelector('.animate-spin');
      const h1 = document.querySelector('h1')?.textContent?.trim() || '';
      return { bodyText, hasLoginForm, hasLoader, h1, url: window.location.href };
    });

    console.log(`=== ${pg.name} (${pg.path}) ===`);
    console.log('Redirected to login:', pageState.hasLoginForm);
    console.log('H1:', pageState.h1);
    console.log('URL:', pageState.url);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-${pg.name}.png`, fullPage: true });
  });
}
