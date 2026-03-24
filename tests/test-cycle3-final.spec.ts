import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';

test.describe('Cycle 3 - Final Verification', () => {
  test.setTimeout(60000);

  test('Login and verify all 4 fixes + final sweep', async ({ page }) => {
    // ===== LOGIN =====
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');

    const loginBtn = page.getByRole('button', { name: 'Giriş Yap', exact: true });
    await loginBtn.click();

    // Wait for login to complete
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('Login complete, URL:', page.url());

    // ===== FIX 1: Community post links =====
    await page.goto(`${BASE}/community`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for clickable post cards
    const communityLinks = page.locator('a[href*="/community/"]');
    const communityLinkCount = await communityLinks.count();
    console.log(`Community links found: ${communityLinkCount}`);

    // Try clicking first post card
    let communityClickWorked = false;
    if (communityLinkCount > 0) {
      try {
        await communityLinks.first().click({ timeout: 5000 });
        await page.waitForTimeout(2000);
        communityClickWorked = page.url().includes('/community/');
        console.log(`Community click navigated to: ${page.url()}`);
      } catch (e) {
        console.log(`Community click failed: ${e}`);
        // Try alternative: click any card-like element
        try {
          const card = page.locator('[class*="card"], [class*="post"]').first();
          await card.click({ timeout: 3000 });
          await page.waitForTimeout(2000);
          communityClickWorked = page.url().includes('/community/');
          console.log(`Community card click navigated to: ${page.url()}`);
        } catch (e2) {
          console.log(`Community card click also failed: ${e2}`);
        }
      }
    }

    await page.screenshot({ path: 'verify-c3-01-community.png', fullPage: true });
    console.log(`FIX 1 - Community: links=${communityLinkCount}, clickable=${communityClickWorked}`);

    // ===== FIX 2: Favorites loading =====
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    const favSpinner = await page.locator('text=Yükleniyor, text=Yukleniyor').count();
    const favContent = await page.locator('[class*="card"], [class*="listing"], img').count();

    await page.screenshot({ path: 'verify-c3-02-favorites.png', fullPage: true });
    console.log(`FIX 2 - Favorites: spinners=${favSpinner}, content_elements=${favContent}`);

    // ===== FIX 3: Listing price bar =====
    // First find a listing ID
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    let listingUrl = `${BASE}/listing/a0000001-0000-4000-a000-000000000001`;
    const listingLinks = page.locator('a[href*="/listing/"]');
    const listingCount = await listingLinks.count();
    if (listingCount > 0) {
      const href = await listingLinks.first().getAttribute('href');
      if (href) listingUrl = `${BASE}${href}`;
    }

    await page.goto(listingUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check price bar visibility
    const priceBar = page.locator('[class*="sticky"], [class*="fixed"]').filter({ hasText: /TRY|Rezervasyon/ });
    const priceBarVisible = await priceBar.count() > 0;

    // Scroll to bottom to check overlap
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'verify-c3-03-listing.png', fullPage: false });
    console.log(`FIX 3 - Listing price bar: visible=${priceBarVisible}`);

    // ===== FIX 4: City cost tab =====
    await page.goto(`${BASE}/city/c0000001-0000-4000-a000-000000000001`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Click Maliyet tab
    const costTab = page.locator('button:has-text("Maliyet"), [role="tab"]:has-text("Maliyet")');
    if (await costTab.count() > 0) {
      await costTab.first().click();
      await page.waitForTimeout(2000);
    }

    // Check for cost data vs empty state
    const costEmpty = await page.locator('text=henuz eklenmedi, text=henüz eklenmedi').count();
    const costData = await page.locator('text=TRY, text=₺').count();

    await page.screenshot({ path: 'verify-c3-04-city-cost.png', fullPage: true });
    console.log(`FIX 4 - City cost: empty_states=${costEmpty}, cost_data=${costData}`);

    // ===== FINAL SWEEP =====

    // Sweep 1: /messages
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verify-c3-05-messages.png', fullPage: true });
    const msgContent = await page.locator('text=Mesaj, text=mesaj, [class*="message"], [class*="chat"]').count();
    console.log(`SWEEP - Messages: content_elements=${msgContent}, url=${page.url()}`);

    // Sweep 2: /profile
    await page.goto(`${BASE}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verify-c3-06-profile.png', fullPage: true });
    const profileContent = await page.locator('text=Profil, text=profil, text=Deniz, text=deniz').count();
    console.log(`SWEEP - Profile: content_elements=${profileContent}, url=${page.url()}`);

    // Sweep 3: /events
    await page.goto(`${BASE}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verify-c3-07-events.png', fullPage: true });
    const eventCards = await page.locator('a[href*="/events/"], [class*="event"]').count();
    console.log(`SWEEP - Events: cards=${eventCards}, url=${page.url()}`);

    // Sweep 4: /search
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verify-c3-08-search.png', fullPage: true });
    const searchContent = await page.locator('input, [class*="search"], [class*="filter"]').count();
    console.log(`SWEEP - Search: interactive_elements=${searchContent}, url=${page.url()}`);

    // Sweep 5: / (home)
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verify-c3-09-home.png', fullPage: true });
    const homeContent = await page.locator('a[href*="/listing/"], [class*="card"], img').count();
    console.log(`SWEEP - Home: content_elements=${homeContent}, url=${page.url()}`);
  });
});
