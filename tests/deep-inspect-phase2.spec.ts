import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';
const WAIT = 3000;

async function snap(page: any, name: string) {
  await page.waitForTimeout(WAIT);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/deep-${name}.png`, fullPage: true });
}

async function login(page: any) {
  await page.goto('/login');
  await page.waitForTimeout(1500);
  await page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first().fill('deniz@kotwise.com');
  await page.locator('input[type="password"], input[name="password"]').first().fill('KotwiseTest2026!');
  await page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first().click();
  await page.waitForTimeout(3000);
}

test.describe('PHASE 2: Authenticated Pages', () => {

  test('12 - / (home after login)', async ({ page }) => {
    await login(page);
    await page.goto('/');
    await snap(page, '12-home');

    // Check city auto-select
    const cityText = await page.locator('text=/İstanbul|Ankara|İzmir/').allTextContents();
    console.log('CITY_AUTOSELECT:', JSON.stringify(cityText));

    // Check listings section
    const listingCards = page.locator('[class*="card"], [class*="listing"], [class*="Card"]');
    console.log('HOME_LISTING_CARDS:', await listingCards.count());

    // Check events section
    const eventSection = page.locator('text=/etkinlik|event/i');
    console.log('EVENT_SECTION_EXISTS:', await eventSection.count() > 0);

    // Check community section
    const communitySection = page.locator('text=/topluluk|community/i');
    console.log('COMMUNITY_SECTION_EXISTS:', await communitySection.count() > 0);

    const brokenImages = await page.locator('img').evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)
    );
    console.log('BROKEN_IMAGES:', JSON.stringify(brokenImages));

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    await snap(page, '12-home-scrolled');
  });

  test('13 - /profile', async ({ page }) => {
    await login(page);
    await page.goto('/profile');
    await snap(page, '13-profile');

    // Check name
    const h1 = await page.locator('h1, h2').first().textContent();
    console.log('PROFILE_NAME:', h1);

    // Check avatar
    const avatarImg = page.locator('img[class*="avatar"], img[class*="Avatar"], img[alt*="profil"], img[alt*="avatar"]');
    console.log('AVATAR_COUNT:', await avatarImg.count());

    // Check stats
    const statsNumbers = await page.locator('text=/^\\d+$/').allTextContents();
    console.log('STATS_NUMBERS:', JSON.stringify(statsNumbers));

    // Check badges
    const badges = page.locator('[class*="badge"], [class*="Badge"]');
    console.log('BADGE_COUNT:', await badges.count());
  });

  test('14 - /profile/edit', async ({ page }) => {
    await login(page);
    await page.goto('/profile/edit');
    await snap(page, '14-profile-edit');

    const inputs = await page.locator('input, textarea, select').evaluateAll((els: HTMLInputElement[]) =>
      els.map(e => ({ type: e.type, name: e.name, value: e.value?.substring(0, 50) }))
    );
    console.log('EDIT_INPUTS:', JSON.stringify(inputs));
  });

  test('15 - /profile/bookings', async ({ page }) => {
    await login(page);
    await page.goto('/profile/bookings');
    await snap(page, '15-profile-bookings');

    const cards = page.locator('[class*="card"], [class*="booking"], [class*="Card"]');
    console.log('BOOKING_CARD_COUNT:', await cards.count());

    const brokenImages = await page.locator('img').evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)
    );
    console.log('BROKEN_IMAGES:', JSON.stringify(brokenImages));

    // Check status badges
    const statusBadges = page.locator('text=/onaylandı|bekliyor|iptal|confirmed|pending|cancelled/i');
    console.log('STATUS_BADGE_COUNT:', await statusBadges.count());
  });

  test('16 - /settings', async ({ page }) => {
    await login(page);
    await page.goto('/settings');
    await snap(page, '16-settings');

    const pageText = await page.textContent('body');
    console.log('SETTINGS_TEXT:', pageText?.substring(0, 500));
  });

  test('17 - /favorites', async ({ page }) => {
    await login(page);
    await page.goto('/favorites');
    await snap(page, '17-favorites');

    const cards = page.locator('[class*="card"], [class*="Card"], [class*="listing"]');
    console.log('FAVORITE_CARD_COUNT:', await cards.count());

    const brokenImages = await page.locator('img').evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)
    );
    console.log('BROKEN_IMAGES:', JSON.stringify(brokenImages));
  });

  test('18 - /compare', async ({ page }) => {
    await login(page);
    await page.goto('/compare');
    await snap(page, '18-compare');

    const table = page.locator('table, [class*="compare"], [class*="Compare"]');
    console.log('COMPARE_TABLE_COUNT:', await table.count());
  });

  test('19 - /messages', async ({ page }) => {
    await login(page);
    await page.goto('/messages');
    await snap(page, '19-messages');

    // Check conversation list
    const conversations = page.locator('[class*="conversation"], [class*="chat"], [class*="message"], li, [role="listitem"]');
    console.log('CONVERSATION_COUNT:', await conversations.count());

    // Check avatars
    const avatars = page.locator('img[class*="avatar"], img[class*="Avatar"]');
    console.log('AVATAR_COUNT:', await avatars.count());

    // Check timestamps
    const timestamps = await page.locator('text=/\\d{1,2}[.:]\\ ?\\d{2}|dün|bugün|saat/i').allTextContents();
    console.log('TIMESTAMPS:', JSON.stringify(timestamps));
  });

  test('20 - /messages/[first conversation]', async ({ page }) => {
    await login(page);
    await page.goto('/messages');
    await page.waitForTimeout(WAIT);

    // Click first conversation
    const firstConvo = page.locator('[class*="conversation"], [class*="chat"], [class*="message"], a[href*="messages"]').first();
    if (await firstConvo.count() > 0) {
      await firstConvo.click();
      await snap(page, '20-message-chat');

      // Check bubbles
      const bubbles = page.locator('[class*="bubble"], [class*="Bubble"], [class*="message-content"]');
      console.log('BUBBLE_COUNT:', await bubbles.count());
    } else {
      console.log('NO_CONVERSATIONS_FOUND');
      await snap(page, '20-message-chat-empty');
    }
  });

  test('21 - /messages/new', async ({ page }) => {
    await login(page);
    await page.goto('/messages/new');
    await snap(page, '21-messages-new');
  });

  test('22 - /notifications', async ({ page }) => {
    await login(page);
    await page.goto('/notifications');
    await snap(page, '22-notifications');

    const cards = page.locator('[class*="notification"], [class*="Notification"], li');
    console.log('NOTIFICATION_COUNT:', await cards.count());
  });

  test('23 - /roommates', async ({ page }) => {
    await login(page);
    await page.goto('/roommates');
    await snap(page, '23-roommates');

    // Check swipe card
    const swipeCard = page.locator('[class*="swipe"], [class*="card"], [class*="Swipe"], [class*="Card"]');
    console.log('SWIPE_CARD_COUNT:', await swipeCard.count());

    // Check match percentage
    const matchPercent = await page.locator('text=/%/').allTextContents();
    console.log('MATCH_PERCENT:', JSON.stringify(matchPercent));
  });

  test('24 - /listing/new (all steps)', async ({ page }) => {
    await login(page);
    await page.goto('/listing/new');
    await snap(page, '24-listing-new-step1');

    // Check form steps render
    const steps = page.locator('[class*="step"], [class*="Step"], [class*="progress"]');
    console.log('STEP_INDICATORS:', await steps.count());

    const inputs = await page.locator('input, textarea, select').count();
    console.log('FORM_INPUT_COUNT:', inputs);
  });

  test('25 - /host', async ({ page }) => {
    await login(page);
    await page.goto('/host');
    await page.waitForTimeout(2000);
    // Might redirect to /host/apply
    const url = page.url();
    console.log('HOST_URL:', url);
    await snap(page, '25-host');
  });

  test('26 - /host/bookings', async ({ page }) => {
    await login(page);
    await page.goto('/host/bookings');
    await snap(page, '26-host-bookings');
  });

  test('27 - /host/calendar', async ({ page }) => {
    await login(page);
    await page.goto('/host/calendar');
    await snap(page, '27-host-calendar');
  });

  test('28 - /host/earnings', async ({ page }) => {
    await login(page);
    await page.goto('/host/earnings');
    await snap(page, '28-host-earnings');
  });

  test('29 - /community/new', async ({ page }) => {
    await login(page);
    await page.goto('/community/new');
    await snap(page, '29-community-new');
  });

  test('30 - /events/new', async ({ page }) => {
    await login(page);
    await page.goto('/events/new');
    await snap(page, '30-events-new');
  });
});
