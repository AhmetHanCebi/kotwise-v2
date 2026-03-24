import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SCREENSHOT_DIR = 'tests/screenshots';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[name="email"]', 'deniz@kotwise.com');
  await page.fill('input[type="password"], input[name="password"]', 'KotwiseTest2026!');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

async function ss(page: Page, name: string) {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c4-${name}.png`, fullPage: true });
}

// ============================================================
// PART 1: C3 AÇIK BUG RE-CHECK
// ============================================================

test.describe('C3 Bug Re-check', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Search kartlarında TRY etiketi kontrolü', async ({ page }) => {
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'search-try-recheck');

    const content = await page.textContent('body');
    const hasTRY = content?.includes('TRY');
    const hasTL = content?.includes('TL') || content?.includes('₺');
    console.log(`SEARCH: TRY=${hasTRY}, TL/₺=${hasTL}`);
  });

  test('Compare sayfasında TRY etiketi kontrolü', async ({ page }) => {
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'compare-try-recheck');

    const content = await page.textContent('body');
    const hasTRY = content?.includes('TRY');
    const hasTL = content?.includes('TL') || content?.includes('₺');
    console.log(`COMPARE: TRY=${hasTRY}, TL/₺=${hasTL}`);
  });

  test('Profile Edit üniversite alanı kontrolü', async ({ page }) => {
    await page.goto(`${BASE}/profile/edit`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'profile-edit-uni-recheck');

    // Check if university field is dropdown/autocomplete or free text
    const uniSelect = await page.locator('select').filter({ hasText: /üniversite|universi/i }).count();
    const uniAutocomplete = await page.locator('[role="combobox"], [data-autocomplete], .autocomplete').count();
    const uniInput = await page.locator('input').filter({ hasText: /üniversite|universi/i }).count();
    console.log(`PROFILE EDIT UNI: select=${uniSelect}, autocomplete=${uniAutocomplete}, input=${uniInput}`);
  });
});

// ============================================================
// PART 2: DERİN TEST — Form doldurma, buton tıklama, filtre
// ============================================================

test.describe('Deep Test — Forms & Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Search filtre değiştirme', async ({ page }) => {
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Try clicking filter buttons
    const filterBtn = page.locator('button, [role="button"]').filter({ hasText: /filtre|filter/i });
    if (await filterBtn.count() > 0) {
      await filterBtn.first().click();
      await page.waitForTimeout(1000);
      await ss(page, 'search-filter-open');

      // Try changing price range or other filters
      const sliders = await page.locator('input[type="range"]').count();
      const selects = await page.locator('select').count();
      const checkboxes = await page.locator('input[type="checkbox"]').count();
      console.log(`SEARCH FILTERS: sliders=${sliders}, selects=${selects}, checkboxes=${checkboxes}`);
    } else {
      console.log('SEARCH: No filter button found');
      await ss(page, 'search-no-filter-btn');
    }
  });

  test('Search harita gerçek mi placeholder mı', async ({ page }) => {
    await page.goto(`${BASE}/search/map`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await ss(page, 'search-map-deep');

    const leafletMap = await page.locator('.leaflet-container, .leaflet-map-pane').count();
    const mapTiles = await page.locator('.leaflet-tile, img[src*="tile"]').count();
    console.log(`MAP: leaflet=${leafletMap}, tiles=${mapTiles}`);
  });

  test('Community yeni post oluşturma formu', async ({ page }) => {
    await page.goto(`${BASE}/community/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'community-new-form');

    // Try filling the form
    const inputs = page.locator('input, textarea');
    const inputCount = await inputs.count();
    console.log(`COMMUNITY NEW: ${inputCount} input fields`);

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const tagName = await input.evaluate(el => el.tagName.toLowerCase());
      console.log(`  Input ${i}: tag=${tagName}, type=${type}, placeholder=${placeholder}`);
    }

    // Fill title/content if available
    const titleInput = page.locator('input[name="title"], input[placeholder*="başlık" i], input[placeholder*="title" i]');
    if (await titleInput.count() > 0) {
      await titleInput.fill('Test Post Başlığı');
    }

    const contentInput = page.locator('textarea[name="content"], textarea[placeholder*="içerik" i], textarea[placeholder*="yaz" i], textarea');
    if (await contentInput.count() > 0) {
      await contentInput.first().fill('Bu bir test içeriğidir. Playwright ile yazılmıştır.');
    }

    await ss(page, 'community-new-filled');

    // Check submit button
    const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /paylaş|gönder|submit|oluştur/i });
    console.log(`COMMUNITY NEW: submit buttons=${await submitBtn.count()}`);
  });

  test('Events yeni etkinlik oluşturma formu', async ({ page }) => {
    await page.goto(`${BASE}/events/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'events-new-form');

    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    console.log(`EVENTS NEW: ${inputCount} form fields`);

    for (let i = 0; i < Math.min(inputCount, 15); i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const tagName = await input.evaluate(el => el.tagName.toLowerCase());
      console.log(`  Field ${i}: tag=${tagName}, type=${type}, name=${name}, placeholder=${placeholder}`);
    }
  });

  test('Listing new — 4 adımlı form wizard', async ({ page }) => {
    await page.goto(`${BASE}/listing/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'listing-new-step1');

    // Try filling step 1
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    console.log(`LISTING NEW STEP1: ${inputCount} fields`);

    // Try to navigate to next step
    const nextBtn = page.locator('button').filter({ hasText: /devam|ileri|next|sonraki/i });
    if (await nextBtn.count() > 0) {
      console.log('LISTING NEW: Next button found');
    }
  });

  test('Host Apply — başvuru formu wizard', async ({ page }) => {
    await page.goto(`${BASE}/host/apply`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'host-apply-form');

    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    console.log(`HOST APPLY: ${inputCount} fields`);

    // Check for file upload
    const fileInputs = await page.locator('input[type="file"]').count();
    console.log(`HOST APPLY: file upload fields=${fileInputs}`);
  });

  test('Events filtre değiştirme', async ({ page }) => {
    await page.goto(`${BASE}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check filter/category buttons
    const categoryBtns = page.locator('button, [role="tab"]').filter({ hasText: /tümü|hepsi|all|workshop|sosyal|spor|kültür/i });
    const catCount = await categoryBtns.count();
    console.log(`EVENTS: category buttons=${catCount}`);

    if (catCount > 1) {
      // Click second category
      await categoryBtns.nth(1).click();
      await page.waitForTimeout(1000);
      await ss(page, 'events-filter-changed');

      // Check if content changed
      const cards = await page.locator('[class*="card"], [class*="Card"], article').count();
      console.log(`EVENTS after filter: cards=${cards}`);
    }
  });

  test('Roommates filtre ve detay', async ({ page }) => {
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'roommates-deep');

    // Check for filter options
    const filterBtns = page.locator('button, [role="button"]').filter({ hasText: /filtre|filter/i });
    console.log(`ROOMMATES: filter buttons=${await filterBtns.count()}`);

    // Click first roommate card
    const cards = page.locator('a[href*="/roommates/"], [class*="card"] a, [class*="Card"] a');
    if (await cards.count() > 0) {
      await cards.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await ss(page, 'roommates-detail-deep');

      // Check for action buttons
      const msgBtn = page.locator('button').filter({ hasText: /mesaj|message|iletişim/i });
      console.log(`ROOMMATE DETAIL: message button=${await msgBtn.count()}`);
    }
  });

  test('Messages — mesaj gönderme', async ({ page }) => {
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'messages-list-deep');

    // Click first conversation
    const convos = page.locator('a[href*="/messages/"], [class*="chat"], [class*="conversation"]');
    const convoCount = await convos.count();
    console.log(`MESSAGES: conversations=${convoCount}`);

    if (convoCount > 0) {
      await convos.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await ss(page, 'messages-detail-deep');

      // Try sending a message
      const msgInput = page.locator('input[placeholder*="mesaj" i], input[placeholder*="yaz" i], textarea[placeholder*="mesaj" i], textarea[placeholder*="yaz" i]');
      if (await msgInput.count() > 0) {
        await msgInput.first().fill('Test mesajı');
        await ss(page, 'messages-typing');

        const sendBtn = page.locator('button[type="submit"], button').filter({ hasText: /gönder|send/i });
        console.log(`MESSAGES: send button=${await sendBtn.count()}`);
      } else {
        console.log('MESSAGES: No message input found');
      }
    }
  });

  test('Favorites — empty state kontrolü', async ({ page }) => {
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'favorites-deep');

    const content = await page.textContent('body');
    const hasEmptyState = content?.match(/henüz|boş|favori.*yok|empty|no.*favorite/i);
    const hasCards = await page.locator('[class*="card"], [class*="Card"]').count();
    console.log(`FAVORITES: emptyState=${!!hasEmptyState}, cards=${hasCards}`);
  });

  test('Notifications — içerik kontrolü', async ({ page }) => {
    await page.goto(`${BASE}/notifications`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'notifications-deep');

    const content = await page.textContent('body');
    const hasYakinda = content?.match(/yakında|coming soon|bu özellik/i);
    console.log(`NOTIFICATIONS: yakında=${!!hasYakinda}`);

    // Check notification items
    const items = await page.locator('[class*="notification"], [class*="Notification"], li').count();
    console.log(`NOTIFICATIONS: items=${items}`);
  });

  test('Settings — dark mode ve dil ayarı', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'settings-deep');

    const content = await page.textContent('body');

    // Check for dark mode toggle
    const darkToggle = page.locator('button, [role="switch"], input[type="checkbox"]').filter({ hasText: /karanlık|dark|tema|theme/i });
    const darkToggleCount = await darkToggle.count();
    console.log(`SETTINGS: dark mode toggle=${darkToggleCount}`);

    // Check for language selector
    const langBtn = page.locator('button, select').filter({ hasText: /dil|language|türkçe|english/i });
    console.log(`SETTINGS: language selector=${await langBtn.count()}`);

    // Try clicking dark mode if available
    if (darkToggleCount > 0) {
      await darkToggle.first().click();
      await page.waitForTimeout(500);
      await ss(page, 'settings-darkmode-clicked');
    }
  });

  test('Booking akışı — listing detaydan booking', async ({ page }) => {
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click first listing
    const listings = page.locator('a[href*="/listing/"]');
    if (await listings.count() > 0) {
      await listings.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await ss(page, 'listing-detail-deep');

      // Look for booking/reserve button
      const bookBtn = page.locator('button').filter({ hasText: /rezerv|book|kirala|başvur/i });
      console.log(`LISTING DETAIL: booking button=${await bookBtn.count()}`);

      if (await bookBtn.count() > 0) {
        await bookBtn.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        await ss(page, 'booking-flow-deep');

        const url = page.url();
        console.log(`BOOKING FLOW: redirected to ${url}`);

        // Check for Stripe elements
        const stripeFrame = await page.locator('iframe[src*="stripe"], [class*="stripe"], #card-element').count();
        console.log(`BOOKING: stripe elements=${stripeFrame}`);
      }
    }
  });

  test('Profile sayfası — bilgiler ve düzenleme', async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'profile-deep');

    const content = await page.textContent('body');
    const hasName = content?.includes('Deniz') || content?.includes('deniz');
    console.log(`PROFILE: has user name=${hasName}`);

    // Click edit button
    const editBtn = page.locator('a[href*="/profile/edit"], button').filter({ hasText: /düzenle|edit/i });
    if (await editBtn.count() > 0) {
      await editBtn.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await ss(page, 'profile-edit-deep');

      // Check all form fields
      const allInputs = page.locator('input, textarea, select');
      const count = await allInputs.count();
      console.log(`PROFILE EDIT: ${count} fields`);

      for (let i = 0; i < count; i++) {
        const el = allInputs.nth(i);
        const tag = await el.evaluate(e => e.tagName.toLowerCase());
        const type = await el.getAttribute('type');
        const name = await el.getAttribute('name');
        const value = await el.inputValue().catch(() => '');
        const placeholder = await el.getAttribute('placeholder');
        console.log(`  Field ${i}: ${tag} type=${type} name=${name} value="${value?.substring(0, 30)}" placeholder="${placeholder}"`);
      }
    }
  });

  test('Home carousel swipe testi', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const swiperExists = await page.locator('.swiper, .swiper-container, [class*="swiper"], [class*="carousel"], [class*="Carousel"]').count();
    console.log(`HOME: swiper/carousel elements=${swiperExists}`);

    if (swiperExists > 0) {
      // Try swiping
      const carousel = page.locator('.swiper, .swiper-container, [class*="swiper"], [class*="carousel"]').first();
      const box = await carousel.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(500);
        await ss(page, 'home-carousel-swiped');
      }
    }
    await ss(page, 'home-deep');
  });
});

// ============================================================
// PART 3: EMPTY STATE & EDGE CASE
// ============================================================

test.describe('Empty States & Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Search boş sonuç — garip arama', async ({ page }) => {
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Search for something that shouldn't exist
    const searchInput = page.locator('input[type="search"], input[type="text"], input[placeholder*="ara" i], input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('zzzzxyznonexistent12345');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      await ss(page, 'search-empty-result');

      const content = await page.textContent('body');
      const hasEmptyMsg = content?.match(/sonuç.*bulunamadı|no.*result|aramanız.*eşleş/i);
      console.log(`SEARCH EMPTY: has empty message=${!!hasEmptyMsg}`);
    }
  });

  test('404 sayfası kontrolü', async ({ page }) => {
    await page.goto(`${BASE}/nonexistent-page-12345`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, '404-page');

    const content = await page.textContent('body');
    const has404 = content?.match(/404|bulunamadı|not found|sayfa.*yok/i);
    console.log(`404 PAGE: has 404 message=${!!has404}`);
  });

  test('Host Bookings — empty state', async ({ page }) => {
    await page.goto(`${BASE}/host/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'host-bookings-deep');

    const content = await page.textContent('body');
    const hasYakinda = content?.match(/yakında|coming soon/i);
    console.log(`HOST BOOKINGS: yakında=${!!hasYakinda}`);
  });

  test('Host Calendar — fonksiyonellik', async ({ page }) => {
    await page.goto(`${BASE}/host/calendar`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'host-calendar-deep');

    // Check for actual calendar
    const calendarEl = page.locator('[class*="calendar"], [class*="Calendar"], table');
    console.log(`HOST CALENDAR: calendar elements=${await calendarEl.count()}`);

    // Try clicking a date
    const dateCell = page.locator('td, [class*="day"], [class*="Day"]');
    if (await dateCell.count() > 5) {
      await dateCell.nth(5).click();
      await page.waitForTimeout(500);
      await ss(page, 'host-calendar-clicked');
    }
  });

  test('Compare — fonksiyonellik', async ({ page }) => {
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await ss(page, 'compare-deep');

    const content = await page.textContent('body');
    const hasItems = await page.locator('[class*="card"], [class*="Card"], table, [class*="compare"]').count();
    console.log(`COMPARE: items/elements=${hasItems}`);
  });
});
