import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');

  // Fill login form
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

  if (await emailInput.isVisible({ timeout: 5000 })) {
    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');

    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c7-${name}.png`, fullPage: true });
}

// ============================================
// TEST 1: /search — Deep filter & interaction test
// ============================================
test.describe('C7 Deep Test — BUG Pages', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('/search — filters, broken images, interactions', async ({ page }) => {
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await screenshot(page, 'search-initial');

    // Check for broken images
    const images = page.locator('img');
    const imgCount = await images.count();
    const brokenImages: string[] = [];
    for (let i = 0; i < imgCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (naturalWidth === 0 && src) {
        brokenImages.push(src);
      }
    }
    console.log(`[SEARCH] Total images: ${imgCount}, Broken: ${brokenImages.length}`);
    if (brokenImages.length > 0) {
      console.log(`[SEARCH][BUG] Broken image sources: ${brokenImages.join(', ')}`);
    }

    // Check for placeholder images (Kotwise logo used as listing photo)
    const placeholderImgs = page.locator('img[src*="kotwise"], img[src*="placeholder"], img[src*="logo"]');
    const placeholderCount = await placeholderImgs.count();
    console.log(`[SEARCH] Placeholder images: ${placeholderCount}`);

    // Try filter interactions
    const filterButtons = page.locator('button, [role="tab"], [role="button"]');
    const filterCount = await filterButtons.count();
    console.log(`[SEARCH] Clickable elements: ${filterCount}`);

    // Try clicking filter/sort options if available
    const sortBtn = page.locator('button:has-text("Sırala"), button:has-text("Filtre"), button:has-text("Sort"), button:has-text("Filter")').first();
    if (await sortBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sortBtn.click();
      await page.waitForTimeout(1000);
      await screenshot(page, 'search-filter-open');
    }

    // Try search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Ara"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('Barcelona');
      await page.waitForTimeout(1500);
      await screenshot(page, 'search-typed');
      console.log('[SEARCH] Search input works');
    }

    // Check listing cards
    const cards = page.locator('[class*="card"], [class*="listing"], [class*="Card"], [class*="Listing"]');
    const cardCount = await cards.count();
    console.log(`[SEARCH] Listing cards found: ${cardCount}`);
  });

  // ============================================
  // TEST 2: /search/map — Map placeholder check
  // ============================================
  test('/search/map — map status check', async ({ page }) => {
    await page.goto(`${BASE}/search/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await screenshot(page, 'search-map');

    const bodyText = await page.locator('body').textContent();
    const hasMapPlaceholder = bodyText?.includes('yakında') || bodyText?.includes('coming soon') || bodyText?.includes('aktif olacak');
    console.log(`[MAP] Still placeholder: ${hasMapPlaceholder}`);

    // Check if actual map element exists
    const mapCanvas = page.locator('canvas, .mapboxgl-map, .leaflet-container, [class*="map-container"], iframe[src*="map"]');
    const hasRealMap = await mapCanvas.count();
    console.log(`[MAP] Real map elements: ${hasRealMap}`);
  });

  // ============================================
  // TEST 3: /compare — Placeholder images
  // ============================================
  test('/compare — placeholder images & interaction', async ({ page }) => {
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await screenshot(page, 'compare');

    const images = page.locator('img');
    const imgCount = await images.count();
    let placeholderCount = 0;
    for (let i = 0; i < imgCount; i++) {
      const src = await images.nth(i).getAttribute('src') || '';
      if (src.includes('kotwise') || src.includes('placeholder') || src.includes('logo')) {
        placeholderCount++;
      }
    }
    console.log(`[COMPARE] Total images: ${imgCount}, Placeholders: ${placeholderCount}`);

    // Check empty state
    const bodyText = await page.locator('body').textContent() || '';
    const isEmpty = bodyText.includes('karşılaştır') || bodyText.includes('henüz') || bodyText.includes('boş') || bodyText.includes('empty');
    console.log(`[COMPARE] Empty state indicators: ${isEmpty}`);
  });

  // ============================================
  // TEST 4: /favorites — Placeholder images
  // ============================================
  test('/favorites — placeholder images & empty state', async ({ page }) => {
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await screenshot(page, 'favorites');

    const images = page.locator('img');
    const imgCount = await images.count();
    let placeholderCount = 0;
    for (let i = 0; i < imgCount; i++) {
      const src = await images.nth(i).getAttribute('src') || '';
      if (src.includes('kotwise') || src.includes('placeholder') || src.includes('logo')) {
        placeholderCount++;
      }
    }
    console.log(`[FAVORITES] Total images: ${imgCount}, Placeholders: ${placeholderCount}`);

    // Try removing a favorite if heart/remove button exists
    const removeBtn = page.locator('button:has-text("Kaldır"), button[aria-label*="favorite"], button[aria-label*="remove"], [class*="heart"]').first();
    if (await removeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('[FAVORITES] Remove button exists');
    }
  });

  // ============================================
  // TEST 5: /roommates — Missing photos
  // ============================================
  test('/roommates — profile photos & filters', async ({ page }) => {
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await screenshot(page, 'roommates');

    // Check avatar images vs initials
    const avatarImgs = page.locator('img[class*="avatar"], img[class*="Avatar"], img[alt*="profil"], img[alt*="avatar"]');
    const avatarImgCount = await avatarImgs.count();

    // Check for initial-only avatars (divs with single/double letter)
    const initialAvatars = page.locator('[class*="avatar"]:not(img), [class*="Avatar"]:not(img)');
    const initialCount = await initialAvatars.count();

    console.log(`[ROOMMATES] Avatar images: ${avatarImgCount}, Initial-only avatars: ${initialCount}`);

    // Try filter interactions
    const filters = page.locator('button:has-text("Filtre"), select, [role="combobox"]');
    const filterCount = await filters.count();
    console.log(`[ROOMMATES] Filter elements: ${filterCount}`);

    // Try clicking a filter if exists
    if (filterCount > 0) {
      await filters.first().click();
      await page.waitForTimeout(1000);
      await screenshot(page, 'roommates-filter');
    }

    // Check profile cards content
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log(`[ROOMMATES] Profile cards: ${cardCount}`);

    if (cardCount > 0) {
      const firstCardText = await cards.first().textContent();
      console.log(`[ROOMMATES] First card content preview: ${firstCardText?.substring(0, 100)}`);
    }
  });

  // ============================================
  // TEST 6: /profile/edit — Form field types
  // ============================================
  test('/profile/edit — university field type & form interaction', async ({ page }) => {
    await page.goto(`${BASE}/profile/edit`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await screenshot(page, 'profile-edit');

    // Check university field - should be dropdown, not free text
    const uniInput = page.locator('input[name*="uni"], input[name*="university"], input[placeholder*="Üniversite"], input[placeholder*="niversite"]').first();
    const uniSelect = page.locator('select[name*="uni"], select[name*="university"], [role="combobox"][aria-label*="niversite"]').first();

    const hasInput = await uniInput.isVisible({ timeout: 2000 }).catch(() => false);
    const hasSelect = await uniSelect.isVisible({ timeout: 2000 }).catch(() => false);

    console.log(`[PROFILE/EDIT] University free-text input: ${hasInput}, University dropdown: ${hasSelect}`);

    // Try filling form fields
    const nameInput = page.locator('input[name*="name"], input[name*="ad"], input[placeholder*="Ad"]').first();
    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const currentVal = await nameInput.inputValue();
      console.log(`[PROFILE/EDIT] Name field value: ${currentVal}`);
    }

    // Check bio/description textarea
    const bioField = page.locator('textarea[name*="bio"], textarea[name*="about"], textarea[placeholder*="Hakkında"]').first();
    if (await bioField.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('[PROFILE/EDIT] Bio textarea exists');
      await bioField.fill('Test bio from C7');
      await page.waitForTimeout(500);
    }

    // Check for save button
    const saveBtn = page.locator('button:has-text("Kaydet"), button:has-text("Save"), button[type="submit"]').first();
    const hasSave = await saveBtn.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`[PROFILE/EDIT] Save button visible: ${hasSave}`);

    // Check all form inputs and their types
    const allInputs = page.locator('input, select, textarea');
    const inputCount = await allInputs.count();
    console.log(`[PROFILE/EDIT] Total form fields: ${inputCount}`);

    for (let i = 0; i < inputCount; i++) {
      const el = allInputs.nth(i);
      const tag = await el.evaluate(e => e.tagName.toLowerCase());
      const type = await el.getAttribute('type') || '';
      const name = await el.getAttribute('name') || '';
      const placeholder = await el.getAttribute('placeholder') || '';
      console.log(`[PROFILE/EDIT] Field ${i}: <${tag}> type="${type}" name="${name}" placeholder="${placeholder}"`);
    }

    await screenshot(page, 'profile-edit-filled');
  });

  // ============================================
  // TEST 7: /listing/new — Form field types
  // ============================================
  test('/listing/new — city/university fields & form interaction', async ({ page }) => {
    await page.goto(`${BASE}/listing/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await screenshot(page, 'listing-new');

    // Check city field
    const cityInput = page.locator('input[name*="city"], input[name*="şehir"], input[name*="sehir"], input[placeholder*="Şehir"], input[placeholder*="ehir"]').first();
    const citySelect = page.locator('select[name*="city"], select[name*="şehir"], [role="combobox"][aria-label*="ehir"]').first();

    const hasCityInput = await cityInput.isVisible({ timeout: 2000 }).catch(() => false);
    const hasCitySelect = await citySelect.isVisible({ timeout: 2000 }).catch(() => false);

    console.log(`[LISTING/NEW] City free-text: ${hasCityInput}, City dropdown: ${hasCitySelect}`);

    // Check university field
    const uniInput = page.locator('input[name*="uni"], input[placeholder*="Üniversite"], input[placeholder*="niversite"]').first();
    const uniSelect = page.locator('select[name*="uni"], [role="combobox"][aria-label*="niversite"]').first();

    const hasUniInput = await uniInput.isVisible({ timeout: 2000 }).catch(() => false);
    const hasUniSelect = await uniSelect.isVisible({ timeout: 2000 }).catch(() => false);

    console.log(`[LISTING/NEW] University free-text: ${hasUniInput}, University dropdown: ${hasUniSelect}`);

    // Enumerate all form fields
    const allInputs = page.locator('input, select, textarea');
    const inputCount = await allInputs.count();
    console.log(`[LISTING/NEW] Total form fields: ${inputCount}`);

    for (let i = 0; i < inputCount; i++) {
      const el = allInputs.nth(i);
      const tag = await el.evaluate(e => e.tagName.toLowerCase());
      const type = await el.getAttribute('type') || '';
      const name = await el.getAttribute('name') || '';
      const placeholder = await el.getAttribute('placeholder') || '';
      console.log(`[LISTING/NEW] Field ${i}: <${tag}> type="${type}" name="${name}" placeholder="${placeholder}"`);
    }

    // Try to fill the form partially
    const titleInput = page.locator('input[name*="title"], input[name*="başlık"], input[placeholder*="Başlık"], input[placeholder*="başlık"]').first();
    if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await titleInput.fill('Test İlan C7');
      console.log('[LISTING/NEW] Title filled');
    }

    const priceInput = page.locator('input[name*="price"], input[name*="fiyat"], input[type="number"]').first();
    if (await priceInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await priceInput.fill('500');
      console.log('[LISTING/NEW] Price filled');
    }

    await screenshot(page, 'listing-new-filled');
  });

  // ============================================
  // TEST 8: Deep interaction tests on clean pages
  // ============================================
  test('/events — filter interaction deep test', async ({ page }) => {
    await page.goto(`${BASE}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Click category filters
    const categoryBtns = page.locator('[role="tab"], button[class*="category"], button[class*="filter"], button[class*="chip"]');
    const catCount = await categoryBtns.count();
    console.log(`[EVENTS] Category buttons: ${catCount}`);

    for (let i = 0; i < Math.min(catCount, 5); i++) {
      const btn = categoryBtns.nth(i);
      const text = await btn.textContent();
      await btn.click();
      await page.waitForTimeout(800);
      console.log(`[EVENTS] Clicked filter: "${text?.trim()}"`);
    }
    await screenshot(page, 'events-filtered');

    // Check event cards
    const eventCards = page.locator('[class*="card"], [class*="Card"], [class*="event"], [class*="Event"]');
    const eventCount = await eventCards.count();
    console.log(`[EVENTS] Event cards after filter: ${eventCount}`);
  });

  test('/community — tab switching & post interaction', async ({ page }) => {
    await page.goto(`${BASE}/community`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Click tabs
    const tabs = page.locator('[role="tab"], button[class*="tab"], button[class*="Tab"]');
    const tabCount = await tabs.count();
    console.log(`[COMMUNITY] Tabs: ${tabCount}`);

    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const text = await tab.textContent();
      await tab.click();
      await page.waitForTimeout(800);
      console.log(`[COMMUNITY] Clicked tab: "${text?.trim()}"`);
    }
    await screenshot(page, 'community-tabs');

    // Check like/comment buttons
    const likeBtn = page.locator('button[aria-label*="like"], button[aria-label*="beğen"], [class*="like"], [class*="Like"]').first();
    if (await likeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await likeBtn.click();
      await page.waitForTimeout(500);
      console.log('[COMMUNITY] Like button clicked');
    }
  });

  test('/messages — filter tabs deep test', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Click filter tabs (Tümü/Okunmamış/İlan/Grup)
    const filterTabs = page.locator('[role="tab"], button[class*="tab"], button[class*="Tab"], button[class*="filter"]');
    const tabCount = await filterTabs.count();
    console.log(`[MESSAGES] Filter tabs: ${tabCount}`);

    for (let i = 0; i < tabCount; i++) {
      const tab = filterTabs.nth(i);
      const text = await tab.textContent();
      await tab.click();
      await page.waitForTimeout(800);

      // Count messages visible after filter
      const msgs = page.locator('[class*="message"], [class*="Message"], [class*="chat"], [class*="Chat"], [class*="conversation"]');
      const msgCount = await msgs.count();
      console.log(`[MESSAGES] Tab "${text?.trim()}" → ${msgCount} messages`);
    }
    await screenshot(page, 'messages-filtered');

    // Check empty state on filtered tabs
    const bodyText = await page.locator('body').textContent() || '';
    if (bodyText.includes('mesaj yok') || bodyText.includes('boş') || bodyText.includes('empty')) {
      console.log('[MESSAGES] Empty state found on current filter');
    }
  });

  test('/budget — slider interaction deep test', async ({ page }) => {
    await page.goto(`${BASE}/budget`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Find sliders
    const sliders = page.locator('input[type="range"], [role="slider"]');
    const sliderCount = await sliders.count();
    console.log(`[BUDGET] Sliders: ${sliderCount}`);

    // Try to move sliders
    for (let i = 0; i < sliderCount; i++) {
      const slider = sliders.nth(i);
      const box = await slider.boundingBox();
      if (box) {
        // Move slider to 75% position
        await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
        await page.waitForTimeout(500);
        console.log(`[BUDGET] Slider ${i} moved to 75%`);
      }
    }
    await screenshot(page, 'budget-sliders');

    // Check calculated values update
    const numbers = page.locator('[class*="total"], [class*="result"], [class*="amount"], [class*="price"]');
    const numCount = await numbers.count();
    for (let i = 0; i < numCount; i++) {
      const text = await numbers.nth(i).textContent();
      console.log(`[BUDGET] Calculated value ${i}: ${text?.trim()}`);
    }
  });

  test('/settings — toggle interactions', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Find toggles/switches
    const toggles = page.locator('input[type="checkbox"], [role="switch"], [class*="toggle"], [class*="Toggle"], [class*="switch"], [class*="Switch"]');
    const toggleCount = await toggles.count();
    console.log(`[SETTINGS] Toggles/switches: ${toggleCount}`);

    // Try clicking each toggle
    for (let i = 0; i < toggleCount; i++) {
      const toggle = toggles.nth(i);
      if (await toggle.isVisible()) {
        await toggle.click({ force: true });
        await page.waitForTimeout(300);
        console.log(`[SETTINGS] Toggle ${i} clicked`);
      }
    }
    await screenshot(page, 'settings-toggled');

    // Check language/currency selectors
    const selects = page.locator('select, [role="combobox"], [role="listbox"]');
    const selectCount = await selects.count();
    console.log(`[SETTINGS] Select elements: ${selectCount}`);
  });

  test('/host/bookings — empty state validation', async ({ page }) => {
    await page.goto(`${BASE}/host/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await screenshot(page, 'host-bookings-empty');

    const bodyText = await page.locator('body').textContent() || '';
    const hasEmptyState = bodyText.includes('Bekleyen') || bodyText.includes('talep yok') || bodyText.includes('boş');
    console.log(`[HOST/BOOKINGS] Empty state: ${hasEmptyState}`);
    console.log(`[HOST/BOOKINGS] Page text preview: ${bodyText.substring(0, 200)}`);
  });

  test('/notifications — mark as read interaction', async ({ page }) => {
    await page.goto(`${BASE}/notifications`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Count notifications
    const notifications = page.locator('[class*="notification"], [class*="Notification"], [class*="notif"]');
    const notifCount = await notifications.count();
    console.log(`[NOTIFICATIONS] Count: ${notifCount}`);

    // Try clicking a notification
    if (notifCount > 0) {
      await notifications.first().click();
      await page.waitForTimeout(1000);
      console.log('[NOTIFICATIONS] First notification clicked');
    }
    await screenshot(page, 'notifications');

    // Check mark all read button
    const markAllBtn = page.locator('button:has-text("Tümünü oku"), button:has-text("Hepsini oku"), button:has-text("Mark all")').first();
    if (await markAllBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('[NOTIFICATIONS] Mark all read button exists');
    }
  });
});
