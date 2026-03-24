import { chromium } from 'playwright';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.fill('input[type="email"]', 'deniz@kotwise.com');
  await page.fill('input[type="password"]', 'KotwiseTest2026!');
  await page.getByRole('button', { name: 'Giriş Yap', exact: true }).click();
  await page.waitForTimeout(3000);
  console.log('Login OK, URL:', page.url());

  const results = [];

  // Test /booking (previous BUG: "İlan bulunamadı" + bottom nav yok)
  console.log('\n--- Testing /booking ---');
  try {
    await page.goto(`${BASE}/booking`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-booking.png`, fullPage: true });
    
    const bodyText = await page.textContent('body');
    const hasIlanBulunamadi = bodyText.includes('İlan bulunamadı') || bodyText.includes('ilan bulunamadı');
    const has404 = bodyText.includes('404');
    
    // Check bottom nav (look for common bottom nav patterns)
    const bottomNav = await page.$('[class*="bottom-nav"], [class*="bottomNav"], [class*="tab-bar"], nav[class*="fixed"], [class*="BottomNavigation"]');
    const hasBottomNav = !!bottomNav;
    
    console.log(`  Body length: ${bodyText.length}`);
    console.log(`  Has "İlan bulunamadı": ${hasIlanBulunamadi}`);
    console.log(`  Has 404: ${has404}`);
    console.log(`  Has bottom nav: ${hasBottomNav}`);
    
    let status = 'TEMİZ';
    let notes = [];
    if (hasIlanBulunamadi) notes.push('"İlan bulunamadı" hala görünüyor');
    if (has404) notes.push('404 hatası');
    if (!hasBottomNav) notes.push('bottom nav yok');
    if (notes.length > 0) status = 'BUG';
    else notes.push('Önceki bug düzelmiş');
    
    results.push({ page: 'booking', path: '/booking', status, note: notes.join(' + ') });
  } catch (e) {
    console.log('  ERROR:', e.message);
    results.push({ page: 'booking', path: '/booking', status: 'BUG', note: `Error: ${e.message.substring(0, 100)}` });
  }

  // Test /city (previous BUG: 404)
  console.log('\n--- Testing /city ---');
  try {
    await page.goto(`${BASE}/city`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-city.png`, fullPage: true });
    
    const bodyText = await page.textContent('body');
    const url = page.url();
    const has404 = bodyText.includes('404') || bodyText.toLowerCase().includes('not found') || bodyText.includes('bulunamadı');
    
    console.log(`  URL: ${url}`);
    console.log(`  Body length: ${bodyText.length}`);
    console.log(`  Has 404: ${has404}`);
    console.log(`  First 200 chars: ${bodyText.substring(0, 200).replace(/\s+/g, ' ')}`);
    
    let status = 'TEMİZ';
    let note = '';
    if (has404) { status = 'BUG'; note = '404 hala devam ediyor'; }
    else if (bodyText.trim().length < 50) { status = 'BUG'; note = 'Sayfa boş'; }
    else { note = 'Önceki bug düzelmiş'; }
    
    results.push({ page: 'city', path: '/city', status, note });
  } catch (e) {
    console.log('  ERROR:', e.message);
    results.push({ page: 'city', path: '/city', status: 'BUG', note: `Error: ${e.message.substring(0, 100)}` });
  }

  // Check for new undiscovered pages
  console.log('\n--- Checking for new pages ---');
  const extraPaths = ['/map', '/explore', '/help', '/faq', '/about', '/contact', '/listings', '/friends', '/activity', '/wallet', '/chat', '/discover'];
  for (const p of extraPaths) {
    try {
      await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle', timeout: 8000 });
      await page.waitForTimeout(500);
      const bodyText = await page.textContent('body');
      const currentUrl = page.url();
      const has404 = bodyText.includes('404') || bodyText.toLowerCase().includes('not found');
      const redirected = currentUrl === `${BASE}/` || currentUrl === `${BASE}/login` || currentUrl.includes('/home');
      
      if (has404 || redirected) {
        console.log(`  ${p}: skip (404 or redirect)`);
      } else if (bodyText.trim().length > 50) {
        console.log(`  ${p}: FOUND! URL=${currentUrl}, ${bodyText.length} chars`);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c2-${p.replace('/', '')}.png`, fullPage: true });
        
        // Quick check for issues
        const bottomNav = await page.$('[class*="bottom-nav"], [class*="bottomNav"], [class*="tab-bar"], nav[class*="fixed"]');
        let note = `Yeni sayfa (${bodyText.length} char)`;
        let status = 'YENİ-TEMİZ';
        if (!bottomNav) { status = 'YENİ-BUG'; note += ' — bottom nav yok'; }
        
        results.push({ page: p.replace('/', ''), path: p, status, note });
      }
    } catch (e) {
      console.log(`  ${p}: timeout/error`);
    }
  }

  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
