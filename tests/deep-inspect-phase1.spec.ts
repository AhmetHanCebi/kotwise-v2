import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/screenshots';
const WAIT = 3000;

// Helper: take full page screenshot
async function snap(page: any, name: string) {
  await page.waitForTimeout(WAIT);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/deep-${name}.png`, fullPage: true });
}

test.describe('PHASE 1: Public Pages', () => {

  test('01 - /welcome', async ({ page }) => {
    await page.goto('/welcome');
    await snap(page, '01-welcome');
    // Check basic structure
    const title = await page.locator('h1, h2, h3').first().textContent();
    console.log('WELCOME_TITLE:', title);
    // Check images
    const brokenImages = await page.locator('img').evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)
    );
    console.log('BROKEN_IMAGES:', JSON.stringify(brokenImages));
    // Check buttons
    const buttons = await page.locator('button, a[href]').allTextContents();
    console.log('BUTTONS:', JSON.stringify(buttons));
  });

  test('02 - /onboarding (all steps)', async ({ page }) => {
    await page.goto('/onboarding');
    await snap(page, '02-onboarding-step1');

    // Try to go through steps
    const nextBtn = page.locator('button:has-text("Devam"), button:has-text("İleri"), button:has-text("Sonraki"), button:has-text("Next")');
    if (await nextBtn.count() > 0) {
      await nextBtn.first().click();
      await snap(page, '02-onboarding-step2');
      if (await nextBtn.count() > 0) {
        await nextBtn.first().click();
        await snap(page, '02-onboarding-step3');
      }
    }
    // Also try swipe
    const swipeable = page.locator('[class*="swipe"], [class*="carousel"], [class*="slider"]');
    console.log('SWIPEABLE_COUNT:', await swipeable.count());
  });

  test('03 - /login', async ({ page }) => {
    await page.goto('/login');
    await snap(page, '03-login');
    // Check form fields
    const inputs = await page.locator('input').evaluateAll((els: HTMLInputElement[]) =>
      els.map(e => ({ type: e.type, placeholder: e.placeholder, name: e.name }))
    );
    console.log('LOGIN_INPUTS:', JSON.stringify(inputs));
    // Check for Turkish text
    const pageText = await page.textContent('body');
    console.log('HAS_GIRIS:', pageText?.includes('Giriş') || pageText?.includes('giriş'));
  });

  test('04 - /forgot-password', async ({ page }) => {
    await page.goto('/forgot-password');
    await snap(page, '04-forgot-password');
    const pageText = await page.textContent('body');
    console.log('FORGOT_TEXT:', pageText?.substring(0, 300));
  });

  test('05 - /search', async ({ page }) => {
    await page.goto('/search');
    await snap(page, '05-search');

    // Check listings load
    const cards = page.locator('[class*="card"], [class*="listing"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log('SEARCH_CARD_COUNT:', cardCount);

    // Check filter chips
    const chips = page.locator('[class*="chip"], [class*="filter"], [class*="Chip"], [class*="Filter"]');
    console.log('FILTER_CHIP_COUNT:', await chips.count());

    // Check images
    const brokenImages = await page.locator('img').evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)
    );
    console.log('BROKEN_IMAGES:', JSON.stringify(brokenImages));

    // Check prices displayed
    const priceTexts = await page.locator('text=/\\d+.*₺/').allTextContents();
    console.log('PRICES_FOUND:', JSON.stringify(priceTexts));

    // Scroll down to check more content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    await snap(page, '05-search-scrolled');
  });

  test('06 - /search/map', async ({ page }) => {
    await page.goto('/search/map');
    await snap(page, '06-search-map');

    // Check map loads
    const mapEl = page.locator('[class*="map"], [class*="Map"], canvas, .leaflet-container, [class*="mapbox"]');
    console.log('MAP_ELEMENT_COUNT:', await mapEl.count());
  });

  test('07 - /community', async ({ page }) => {
    await page.goto('/community');
    await snap(page, '07-community');

    // Check posts
    const posts = page.locator('[class*="post"], [class*="Post"], article');
    console.log('POST_COUNT:', await posts.count());

    // Check images in posts
    const brokenImages = await page.locator('img').evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)
    );
    console.log('BROKEN_IMAGES:', JSON.stringify(brokenImages));

    // Check like/comment counts
    const likeElements = page.locator('[class*="like"], [class*="Like"]');
    console.log('LIKE_ELEMENTS:', await likeElements.count());

    // Get all visible numbers that could be counts
    const countTexts = await page.locator('span, p').allTextContents();
    const numbers = countTexts.filter(t => /^\d+$/.test(t.trim()));
    console.log('NUMBER_COUNTS:', JSON.stringify(numbers.slice(0, 20)));

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    await snap(page, '07-community-scrolled');
  });

  test('08 - /events', async ({ page }) => {
    await page.goto('/events');
    await snap(page, '08-events');

    // Check event cards
    const cards = page.locator('[class*="card"], [class*="event"], [class*="Card"], [class*="Event"]');
    console.log('EVENT_CARD_COUNT:', await cards.count());

    // Check dates
    const dateTexts = await page.locator('text=/\\d{1,2}.*[A-Za-zÖÜÇŞİĞ]/').allTextContents();
    console.log('DATE_TEXTS:', JSON.stringify(dateTexts.slice(0, 10)));

    // Check participant counts
    const participantTexts = await page.locator('text=/katılımcı|kişi|participant/i').allTextContents();
    console.log('PARTICIPANT_TEXTS:', JSON.stringify(participantTexts));

    const brokenImages = await page.locator('img').evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)
    );
    console.log('BROKEN_IMAGES:', JSON.stringify(brokenImages));
  });

  test('09 - /city Istanbul (all tabs)', async ({ page }) => {
    await page.goto('/city/c0000001-0000-4000-a000-000000000001');
    await snap(page, '09-city-istanbul');

    const pageText = await page.textContent('body');
    console.log('HAS_ISTANBUL:', pageText?.includes('İstanbul') || pageText?.includes('istanbul'));

    // Check tabs
    const tabs = ['Bilgi', 'Mahalleler', 'Ulaşım', 'Maliyet', 'İlanlar', 'SSS'];
    for (const tab of tabs) {
      const tabEl = page.locator(`text="${tab}"`).first();
      if (await tabEl.count() > 0) {
        await tabEl.click();
        await page.waitForTimeout(1500);
        await snap(page, `09-city-tab-${tab}`);
        console.log(`TAB_${tab}_VISIBLE: true`);
      } else {
        console.log(`TAB_${tab}_VISIBLE: false - NOT FOUND`);
      }
    }
  });

  test('10 - /budget', async ({ page }) => {
    await page.goto('/budget');
    await snap(page, '10-budget');
    const pageText = await page.textContent('body');
    console.log('BUDGET_TEXT:', pageText?.substring(0, 300));
  });

  test('11 - /mentors', async ({ page }) => {
    await page.goto('/mentors');
    await snap(page, '11-mentors');

    const cards = page.locator('[class*="card"], [class*="mentor"], [class*="Card"]');
    console.log('MENTOR_CARD_COUNT:', await cards.count());

    const brokenImages = await page.locator('img').evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)
    );
    console.log('BROKEN_IMAGES:', JSON.stringify(brokenImages));
  });
});
