import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

test.describe('Sentinel C8 — Akış Testi: Ara → Favorile → Booking → Mesaj', () => {

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-login-filled.png`, fullPage: true });

    // Submit login
    const loginBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login"), button:has-text("giriş")').first();
    await loginBtn.click();

    // Wait for navigation away from login
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 }).catch(() => {});
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-after-login.png`, fullPage: true });
  });

  test('1. İlan arama akışı', async ({ page }) => {
    // Navigate to search
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-search-page.png`, fullPage: true });

    // Check if listings exist
    const listingCards = page.locator('[class*="card"], [class*="listing"], [class*="Card"], [class*="Listing"], [data-testid*="listing"]');
    const cardCount = await listingCards.count();
    console.log(`[SEARCH] Found ${cardCount} listing cards`);

    // Check for search/filter functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="Ara"], input[placeholder*="Search"], input[placeholder*="ara"]').first();
    const hasSearchInput = await searchInput.count() > 0;
    console.log(`[SEARCH] Search input exists: ${hasSearchInput}`);

    // Check filter buttons/tabs
    const filters = page.locator('button:has-text("Filtre"), button:has-text("Filter"), [class*="filter"], [class*="Filter"]');
    const filterCount = await filters.count();
    console.log(`[SEARCH] Filter elements: ${filterCount}`);

    // Try clicking first listing card if exists
    if (cardCount > 0) {
      const firstCard = listingCards.first();
      await firstCard.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-listing-detail.png`, fullPage: true });

      const currentUrl = page.url();
      console.log(`[SEARCH] Navigated to listing detail: ${currentUrl}`);

      // Check listing detail content
      const detailTitle = await page.locator('h1, h2, [class*="title"], [class*="Title"]').first().textContent().catch(() => 'N/A');
      console.log(`[SEARCH] Listing detail title: ${detailTitle}`);

      // Check for price
      const priceText = await page.locator('[class*="price"], [class*="Price"], :text("€"), :text("₺"), :text("TL")').first().textContent().catch(() => 'N/A');
      console.log(`[SEARCH] Price: ${priceText}`);
    }
  });

  test('2. Favorileme akışı', async ({ page }) => {
    // Go to search first
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for favorite/heart button on listing cards
    const heartButtons = page.locator('[class*="heart"], [class*="Heart"], [class*="favorite"], [class*="Favorite"], button:has(svg), [class*="bookmark"], [class*="Bookmark"]');
    const heartCount = await heartButtons.count();
    console.log(`[FAVORITE] Heart/favorite buttons found: ${heartCount}`);

    // Try to find a heart icon (SVG with heart path or specific icon)
    const favIcons = page.locator('svg[class*="heart"], svg[class*="Heart"], [data-testid*="favorite"], [aria-label*="favorite"], [aria-label*="Favori"]');
    const favIconCount = await favIcons.count();
    console.log(`[FAVORITE] Specific favorite icons found: ${favIconCount}`);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-search-before-fav.png`, fullPage: true });

    // Try clicking a favorite button
    if (favIconCount > 0) {
      await favIcons.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-after-fav-click.png`, fullPage: true });
      console.log('[FAVORITE] Clicked favorite icon');
    } else if (heartCount > 0) {
      // Try clicking first heart-like button
      await heartButtons.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-after-fav-click.png`, fullPage: true });
      console.log('[FAVORITE] Clicked heart button');
    } else {
      // Click into a listing and look for favorite button there
      const cards = page.locator('[class*="card"], [class*="Card"], [class*="listing"], [class*="Listing"]');
      if (await cards.count() > 0) {
        await cards.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const detailFav = page.locator('[class*="heart"], [class*="Heart"], [class*="favorite"], [class*="Favorite"], [class*="bookmark"], [class*="Bookmark"], button:has-text("Favori")');
        const detailFavCount = await detailFav.count();
        console.log(`[FAVORITE] Favorite buttons in listing detail: ${detailFavCount}`);

        if (detailFavCount > 0) {
          await detailFav.first().click();
          await page.waitForTimeout(1000);
        }

        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-listing-fav.png`, fullPage: true });
      }
    }

    // Navigate to favorites page to verify
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-favorites-page.png`, fullPage: true });

    const favContent = await page.content();
    const hasFavorites = !favContent.includes('henüz') && !favContent.includes('boş') && !favContent.includes('empty');
    console.log(`[FAVORITE] Favorites page has content: ${hasFavorites}`);
  });

  test('3. Booking akışı', async ({ page }) => {
    // Navigate to search and find a listing to book
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const cards = page.locator('[class*="card"], [class*="Card"], [class*="listing"], [class*="Listing"]');
    const cardCount = await cards.count();
    console.log(`[BOOKING] Listing cards found: ${cardCount}`);

    if (cardCount > 0) {
      // Click first listing
      await cards.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-listing-for-booking.png`, fullPage: true });

      // Look for booking/reserve button
      const bookBtn = page.locator('button:has-text("Rezerve"), button:has-text("Book"), button:has-text("Kirala"), button:has-text("Başvur"), button:has-text("İletişim"), a:has-text("Rezerve"), a:has-text("Book")').first();
      const hasBookBtn = await bookBtn.count() > 0;
      console.log(`[BOOKING] Book button found: ${hasBookBtn}`);

      if (hasBookBtn) {
        const bookBtnText = await bookBtn.textContent();
        console.log(`[BOOKING] Book button text: ${bookBtnText}`);

        await bookBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-booking-form.png`, fullPage: true });

        const currentUrl = page.url();
        console.log(`[BOOKING] After booking click URL: ${currentUrl}`);

        // Check for date picker or booking form
        const datePicker = page.locator('[class*="date"], [class*="Date"], [class*="calendar"], [class*="Calendar"], input[type="date"]');
        const datePickerCount = await datePicker.count();
        console.log(`[BOOKING] Date picker elements: ${datePickerCount}`);

        // Look for confirm/submit booking button
        const confirmBtn = page.locator('button:has-text("Onayla"), button:has-text("Confirm"), button:has-text("Gönder"), button:has-text("Tamamla"), button[type="submit"]');
        const confirmCount = await confirmBtn.count();
        console.log(`[BOOKING] Confirm button found: ${confirmCount}`);
      }
    }

    // Also check existing bookings
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-my-bookings.png`, fullPage: true });

    const bookingContent = await page.content();
    console.log(`[BOOKING] Bookings page loaded: ${page.url()}`);
  });

  test('4. Mesaj gönderme akışı', async ({ page }) => {
    // Go to messages
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-messages-list.png`, fullPage: true });

    // Check existing conversations
    const conversations = page.locator('[class*="conversation"], [class*="Conversation"], [class*="chat"], [class*="Chat"], [class*="message-item"], [class*="MessageItem"]');
    const convCount = await conversations.count();
    console.log(`[MESSAGE] Existing conversations: ${convCount}`);

    // Try clicking into an existing conversation
    if (convCount > 0) {
      await conversations.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-conversation-detail.png`, fullPage: true });

      // Look for message input
      const msgInput = page.locator('input[placeholder*="mesaj"], input[placeholder*="Mesaj"], input[placeholder*="message"], textarea[placeholder*="mesaj"], textarea[placeholder*="Mesaj"], textarea, input[type="text"]').last();
      const hasMsgInput = await msgInput.count() > 0;
      console.log(`[MESSAGE] Message input found: ${hasMsgInput}`);

      if (hasMsgInput) {
        // Type a test message (don't send to avoid polluting data)
        await msgInput.fill('Test mesajı - Sentinel C8');
        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-message-typed.png`, fullPage: true });
        console.log('[MESSAGE] Message typed successfully');

        // Check for send button
        const sendBtn = page.locator('button:has-text("Gönder"), button:has-text("Send"), button[type="submit"], button:has(svg[class*="send"]), button[aria-label*="send"], button[aria-label*="gönder"]');
        const hasSendBtn = await sendBtn.count() > 0;
        console.log(`[MESSAGE] Send button found: ${hasSendBtn}`);
      }
    }

    // Try new message flow
    await page.goto(`${BASE}/messages/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-new-message.png`, fullPage: true });

    // Check for recipient selection
    const recipientList = page.locator('[class*="contact"], [class*="Contact"], [class*="user"], [class*="User"], [class*="recipient"], [class*="Recipient"]');
    const recipientCount = await recipientList.count();
    console.log(`[MESSAGE] Recipients/contacts found: ${recipientCount}`);
  });

  test('5. Uçtan uca navigasyon tutarlılığı', async ({ page }) => {
    // Test bottom nav exists and works across flow pages
    const flowPages = ['/search', '/favorites', '/messages', '/profile/bookings'];

    for (const pagePath of flowPages) {
      await page.goto(`${BASE}${pagePath}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // Check bottom navigation
      const bottomNav = page.locator('nav, [class*="bottom-nav"], [class*="BottomNav"], [class*="tab-bar"], [class*="TabBar"], [role="navigation"]');
      const hasBottomNav = await bottomNav.count() > 0;

      // Check for console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      // Check HTTP status
      const response = await page.reload();
      const status = response?.status() || 0;

      console.log(`[NAV] ${pagePath} — status: ${status}, bottomNav: ${hasBottomNav}`);

      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c8-nav-${pagePath.replace(/\//g, '-').slice(1)}.png`, fullPage: true });
    }
  });
});
