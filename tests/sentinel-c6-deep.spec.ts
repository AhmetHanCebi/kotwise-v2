import { test, expect } from '@playwright/test';

const SCREENSHOTS = 'tests/screenshots';
const BASE = 'http://localhost:3336';

async function login(page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[name="email"]', 'deniz@kotwise.com');
  await page.fill('input[type="password"], input[name="password"]', 'KotwiseTest2026!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

// ====== 1. SEARCH FILTERS ======
test('C6-01: Search page filters', async ({ page }) => {
  await login(page);
  await page.goto('/search');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try clicking filter buttons/tabs if available
  const filterBtns = page.locator('button, [role="tab"]').filter({ hasText: /filtre|fiyat|konum|tür|sırala|oda|tarih/i });
  const filterCount = await filterBtns.count();

  if (filterCount > 0) {
    await filterBtns.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-search-filter-open.png`, fullPage: true });
  }

  // Try search input
  const searchInput = page.locator('input[type="search"], input[type="text"], input[placeholder*="Ara"], input[placeholder*="ara"]').first();
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill('Barcelona');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-search-typed.png`, fullPage: true });
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-search-filters.png`, fullPage: true });
});

// ====== 2. COMMUNITY NEW POST FORM ======
test('C6-02: Community new post form fill', async ({ page }) => {
  await login(page);
  await page.goto('/community/new');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Fill text areas and inputs
  const textareas = page.locator('textarea');
  const textareaCount = await textareas.count();
  for (let i = 0; i < textareaCount; i++) {
    if (await textareas.nth(i).isVisible()) {
      await textareas.nth(i).fill('Bu bir test gönderisidir. #test #kotwise');
    }
  }

  const inputs = page.locator('input[type="text"]');
  const inputCount = await inputs.count();
  for (let i = 0; i < inputCount; i++) {
    if (await inputs.nth(i).isVisible()) {
      await inputs.nth(i).fill('Test başlık');
      break;
    }
  }

  // Click category/tag buttons if available
  const tagBtns = page.locator('button, [role="option"]').filter({ hasText: /hashtag|etiket|kategori|soru|tavsiye|deneyim/i });
  if (await tagBtns.count() > 0) {
    await tagBtns.first().click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-community-form-filled.png`, fullPage: true });

  // Try submitting (don't worry if it fails)
  const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /paylaş|gönder|oluştur|yayınla/i }).first();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-community-form-submitted.png`, fullPage: true });
  }
});

// ====== 3. LISTING NEW FORM - STEP NAVIGATION ======
test('C6-03: Listing new form step navigation', async ({ page }) => {
  await login(page);
  await page.goto('/listing/new');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Step 1: Fill basic info
  const titleInput = page.locator('input').first();
  if (await titleInput.isVisible()) {
    await titleInput.fill('Test İlan Başlığı');
  }

  // Try to fill other fields
  const allInputs = page.locator('input[type="text"], input[type="number"], textarea');
  const count = await allInputs.count();
  for (let i = 0; i < Math.min(count, 5); i++) {
    const el = allInputs.nth(i);
    if (await el.isVisible()) {
      const type = await el.getAttribute('type');
      if (type === 'number') {
        await el.fill('500');
      } else {
        const tag = await el.evaluate(e => e.tagName.toLowerCase());
        if (tag === 'textarea') {
          await el.fill('Bu bir test açıklamasıdır. Güzel bir daire.');
        }
      }
    }
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-listing-step1-filled.png`, fullPage: true });

  // Try next step button
  const nextBtn = page.locator('button').filter({ hasText: /ileri|devam|sonraki|next/i }).first();
  if (await nextBtn.isVisible().catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-listing-step2.png`, fullPage: true });

    // Try next step again
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-listing-step3.png`, fullPage: true });
    }
  }
});

// ====== 4. PROFILE EDIT FORM ======
test('C6-04: Profile edit form interactions', async ({ page }) => {
  await login(page);
  await page.goto('/profile/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try editing name/bio fields
  const nameInput = page.locator('input[name="name"], input[name="displayName"], input[placeholder*="Ad"], input[placeholder*="ad"]').first();
  if (await nameInput.isVisible().catch(() => false)) {
    await nameInput.clear();
    await nameInput.fill('Deniz Test');
  }

  const bioField = page.locator('textarea').first();
  if (await bioField.isVisible().catch(() => false)) {
    await bioField.clear();
    await bioField.fill('Merhaba! Ben Deniz, test kullanıcısı.');
  }

  // Click interest/tag chips if available
  const chips = page.locator('button, [role="checkbox"]').filter({ hasText: /müzik|spor|seyahat|yemek|teknoloji|sanat|doğa|film/i });
  const chipCount = await chips.count();
  for (let i = 0; i < Math.min(chipCount, 3); i++) {
    await chips.nth(i).click();
    await page.waitForTimeout(300);
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-profile-edit-filled.png`, fullPage: true });

  // Try save button
  const saveBtn = page.locator('button').filter({ hasText: /kaydet|güncelle|save/i }).first();
  if (await saveBtn.isVisible().catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-profile-edit-saved.png`, fullPage: true });
  }
});

// ====== 5. BUDGET CALCULATOR INTERACTIONS ======
test('C6-05: Budget calculator interactions', async ({ page }) => {
  await login(page);
  await page.goto('/budget');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try sliders or number inputs
  const numberInputs = page.locator('input[type="number"], input[type="range"]');
  const numCount = await numberInputs.count();
  for (let i = 0; i < numCount; i++) {
    const el = numberInputs.nth(i);
    if (await el.isVisible()) {
      await el.fill('1500');
      await page.waitForTimeout(300);
    }
  }

  // Try city/category selector buttons
  const cityBtns = page.locator('button, [role="option"]').filter({ hasText: /Barcelona|Berlin|İstanbul|Lizbon|şehir/i });
  if (await cityBtns.count() > 0) {
    await cityBtns.first().click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-budget-interacted.png`, fullPage: true });
});

// ====== 6. FAVORITES & COMPARE FLOW ======
test('C6-06: Favorites and compare flow', async ({ page }) => {
  await login(page);
  await page.goto('/favorites');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Check if there are favorite cards
  const cards = page.locator('[class*="card"], [class*="Card"]');
  const cardCount = await cards.count();

  if (cardCount > 0) {
    // Try clicking a card
    await cards.first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-favorite-card-clicked.png`, fullPage: true });
    await page.goBack();
    await page.waitForTimeout(1000);
  }

  // Try compare button
  const compareBtn = page.locator('button, a').filter({ hasText: /karşılaştır|compare/i }).first();
  if (await compareBtn.isVisible().catch(() => false)) {
    await compareBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-compare-from-favorites.png`, fullPage: true });
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-favorites-state.png`, fullPage: true });
});

// ====== 7. ROOMMATES SWIPE INTERACTION ======
test('C6-07: Roommates swipe interaction', async ({ page }) => {
  await login(page);
  await page.goto('/roommates');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try like/dislike buttons
  const likeBtn = page.locator('button').filter({ hasText: /beğen|like|evet|✓|💚/i }).first();
  const dislikeBtn = page.locator('button').filter({ hasText: /geç|skip|hayır|✗|❌/i }).first();

  // Try the action buttons (often icon buttons)
  const actionBtns = page.locator('button[class*="swipe"], button[class*="action"], button svg').all();

  if (await likeBtn.isVisible().catch(() => false)) {
    await likeBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-roommates-liked.png`, fullPage: true });
  }

  if (await dislikeBtn.isVisible().catch(() => false)) {
    await dislikeBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-roommates-skipped.png`, fullPage: true });
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-roommates-interacted.png`, fullPage: true });
});

// ====== 8. MESSAGES - SEND MESSAGE FLOW ======
test('C6-08: Messages send flow', async ({ page }) => {
  await login(page);
  await page.goto('/messages/1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try typing a message
  const msgInput = page.locator('input[type="text"], textarea, input[placeholder*="mesaj"], input[placeholder*="Mesaj"], input[placeholder*="yaz"]').first();
  if (await msgInput.isVisible().catch(() => false)) {
    await msgInput.fill('Merhaba, test mesajı!');
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-message-typed.png`, fullPage: true });

    // Try send button
    const sendBtn = page.locator('button').filter({ hasText: /gönder|send/i }).first();
    const sendIcon = page.locator('button[type="submit"]').first();
    if (await sendBtn.isVisible().catch(() => false)) {
      await sendBtn.click();
    } else if (await sendIcon.isVisible().catch(() => false)) {
      await sendIcon.click();
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-message-sent.png`, fullPage: true });
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-messages-interaction.png`, fullPage: true });
});

// ====== 9. SETTINGS TOGGLES ======
test('C6-09: Settings toggles and interactions', async ({ page }) => {
  await login(page);
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try toggling switches
  const toggles = page.locator('input[type="checkbox"], [role="switch"], button[role="switch"]');
  const toggleCount = await toggles.count();

  if (toggleCount > 0) {
    await toggles.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-settings-toggled.png`, fullPage: true });
  }

  // Try clicking settings sections/links
  const sections = page.locator('a, button').filter({ hasText: /hesap|bildirim|gizlilik|güvenlik|dil|tema|yardım|hakkında|çıkış/i });
  const secCount = await sections.count();
  if (secCount > 0) {
    await sections.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-settings-section.png`, fullPage: true });
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-settings-state.png`, fullPage: true });
});

// ====== 10. NOTIFICATIONS INTERACTIONS ======
test('C6-10: Notifications interactions', async ({ page }) => {
  await login(page);
  await page.goto('/notifications');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try clicking a notification
  const notifItems = page.locator('[class*="notif"], [class*="Notif"], li, [role="listitem"]');
  const notifCount = await notifItems.count();

  if (notifCount > 0) {
    await notifItems.first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-notification-clicked.png`, fullPage: true });
  }

  // Check for "mark all read" or filter buttons
  const markRead = page.locator('button').filter({ hasText: /okundu|tümü|hepsi|filtre|temizle/i }).first();
  if (await markRead.isVisible().catch(() => false)) {
    await markRead.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-notifications-action.png`, fullPage: true });
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-notifications-state.png`, fullPage: true });
});

// ====== 11. CITY DETAIL TABS ======
test('C6-11: City detail tab switching', async ({ page }) => {
  await login(page);
  await page.goto('/city');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Click on a city card
  const cityCard = page.locator('[class*="card"], [class*="Card"], a').filter({ hasText: /İstanbul|Barcelona|Berlin|Lizbon/i }).first();
  if (await cityCard.isVisible().catch(() => false)) {
    await cityCard.click();
    await page.waitForTimeout(2000);

    // Switch between tabs
    const tabs = page.locator('button, [role="tab"]').filter({ hasText: /genel|mahalle|maliyet|ulaşım|bilgi|sss|yaşam/i });
    const tabCount = await tabs.count();
    for (let i = 0; i < tabCount; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(800);
      const tabText = await tabs.nth(i).textContent();
      await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-city-tab-${tabText?.trim()}.png`, fullPage: true });
    }
  }
});

// ====== 12. EVENTS NEW (if exists) ======
test('C6-12: Events creation form', async ({ page }) => {
  await login(page);
  await page.goto('/events');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try clicking "new event" button
  const newEventBtn = page.locator('button, a').filter({ hasText: /oluştur|yeni|ekle|etkinlik oluştur/i }).first();
  if (await newEventBtn.isVisible().catch(() => false)) {
    await newEventBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-events-new-page.png`, fullPage: true });

    // Fill event form
    const titleInput = page.locator('input[type="text"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Etkinliği');
    }
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill('Bu bir test etkinliğidir.');
    }

    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-events-form-filled.png`, fullPage: true });
  }

  // Click on an event card
  const eventCard = page.locator('[class*="card"], [class*="Card"]').first();
  if (await eventCard.isVisible().catch(() => false)) {
    await eventCard.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-event-detail-deep.png`, fullPage: true });

    // Try "Katıl" button
    const joinBtn = page.locator('button').filter({ hasText: /katıl|kayıt|rsvp|join/i }).first();
    if (await joinBtn.isVisible().catch(() => false)) {
      await joinBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-event-joined.png`, fullPage: true });
    }
  }
});

// ====== 13. HOST APPLY FORM DEEP ======
test('C6-13: Host apply form deep fill', async ({ page }) => {
  await login(page);
  await page.goto('/host/apply');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Fill all visible inputs
  const allInputs = page.locator('input[type="text"], input[type="email"], input[type="tel"], input[type="number"]');
  const inputCount = await allInputs.count();
  for (let i = 0; i < inputCount; i++) {
    const el = allInputs.nth(i);
    if (await el.isVisible()) {
      const type = await el.getAttribute('type');
      if (type === 'number') await el.fill('3');
      else if (type === 'email') await el.fill('deniz@kotwise.com');
      else if (type === 'tel') await el.fill('+90 555 123 4567');
      else await el.fill('Test Değeri');
    }
  }

  const textareas = page.locator('textarea');
  const taCount = await textareas.count();
  for (let i = 0; i < taCount; i++) {
    if (await textareas.nth(i).isVisible()) {
      await textareas.nth(i).fill('Test açıklama metni. Bu bir test başvurusudur.');
    }
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-host-apply-filled.png`, fullPage: true });

  // Try step navigation
  const nextBtn = page.locator('button').filter({ hasText: /ileri|devam|sonraki/i }).first();
  if (await nextBtn.isVisible().catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-host-apply-step2.png`, fullPage: true });
  }
});

// ====== 14. EMPTY STATES CHECK ======
test('C6-14: Empty states verification', async ({ page }) => {
  await login(page);

  // Check various empty state pages
  const emptyPages = [
    { path: '/booking', name: 'booking' },
    { path: '/messages', name: 'messages' },
    { path: '/favorites', name: 'favorites' },
    { path: '/host/bookings', name: 'host-bookings' },
  ];

  for (const p of emptyPages) {
    await page.goto(p.path);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check for empty state indicators
    const emptyText = page.locator('text=/henüz|boş|bulunamadı|yok|empty|no.*found/i');
    const hasEmpty = await emptyText.count() > 0;

    // Check for broken images
    const images = page.locator('img');
    const imgCount = await images.count();
    let brokenImages = 0;
    for (let i = 0; i < imgCount; i++) {
      const naturalWidth = await images.nth(i).evaluate((img: HTMLImageElement) => img.naturalWidth);
      if (naturalWidth === 0) brokenImages++;
    }

    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-empty-${p.name}.png`, fullPage: true });

    if (brokenImages > 0) {
      console.log(`BUG: ${p.name} has ${brokenImages} broken images`);
    }
  }
});

// ====== 15. BOTTOM NAV CONSISTENCY ======
test('C6-15: Bottom nav consistency across pages', async ({ page }) => {
  await login(page);

  const pages = ['/search', '/community', '/favorites', '/profile', '/budget'];
  const navIssues: string[] = [];

  for (const p of pages) {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    // Check bottom nav exists
    const nav = page.locator('nav, [class*="bottom"], [class*="Bottom"], [class*="tab-bar"], [class*="TabBar"]');
    const navVisible = await nav.first().isVisible().catch(() => false);

    if (!navVisible) {
      navIssues.push(p);
    }
  }

  if (navIssues.length > 0) {
    console.log(`BUG: Bottom nav missing on: ${navIssues.join(', ')}`);
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-nav-check.png`, fullPage: true });
});

// ====== 16. REGISTER FORM VALIDATION ======
test('C6-16: Register form validation', async ({ page }) => {
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try submitting empty form
  const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /kayıt|kaydol|devam|oluştur|register/i }).first();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-register-empty-submit.png`, fullPage: true });
  }

  // Fill with invalid email
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  if (await emailInput.isVisible()) {
    await emailInput.fill('invalid-email');
  }

  const passInput = page.locator('input[type="password"]').first();
  if (await passInput.isVisible()) {
    await passInput.fill('123');
  }

  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-register-invalid.png`, fullPage: true });
  }

  // Fill with valid data
  if (await emailInput.isVisible()) {
    await emailInput.clear();
    await emailInput.fill('test-new@kotwise.com');
  }

  const nameInput = page.locator('input[name="name"], input[placeholder*="Ad"], input[type="text"]').first();
  if (await nameInput.isVisible()) {
    await nameInput.fill('Test Kullanıcı');
  }

  if (await passInput.isVisible()) {
    await passInput.clear();
    await passInput.fill('Test1234!');
  }

  const passConfirm = page.locator('input[type="password"]').nth(1);
  if (await passConfirm.isVisible().catch(() => false)) {
    await passConfirm.fill('Test1234!');
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-register-valid.png`, fullPage: true });
});

// ====== 17. ONBOARDING FULL FLOW ======
test('C6-17: Onboarding full flow navigation', async ({ page }) => {
  await page.goto('/onboarding');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Navigate through all onboarding steps
  for (let step = 1; step <= 5; step++) {
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-onboarding-step${step}.png`, fullPage: true });

    const nextBtn = page.locator('button').filter({ hasText: /devam|ileri|sonraki|atla|başla|next|skip/i }).first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(1000);
    } else {
      break;
    }
  }
});

// ====== 18. SEARCH MAP INTERACTION ======
test('C6-18: Search map interaction', async ({ page }) => {
  await login(page);
  await page.goto('/search/map');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Try clicking map markers/price tags
  const markers = page.locator('[class*="marker"], [class*="Marker"], [class*="price"], [class*="pin"]');
  if (await markers.count() > 0) {
    await markers.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-map-marker-clicked.png`, fullPage: true });
  }

  // Try zoom/pan buttons
  const zoomIn = page.locator('button').filter({ hasText: /\+|zoom in/i }).first();
  if (await zoomIn.isVisible().catch(() => false)) {
    await zoomIn.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-map-interacted.png`, fullPage: true });
});

// ====== 19. HOST CALENDAR INTERACTION ======
test('C6-19: Host calendar date interaction', async ({ page }) => {
  await login(page);
  await page.goto('/host/calendar');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try clicking calendar dates
  const calDays = page.locator('[class*="day"], [class*="Day"], td, [role="gridcell"]');
  const dayCount = await calDays.count();

  if (dayCount > 5) {
    // Click a few dates
    await calDays.nth(5).click();
    await page.waitForTimeout(500);
    await calDays.nth(10).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-calendar-dates-selected.png`, fullPage: true });
  }

  // Try month navigation
  const nextMonth = page.locator('button').filter({ hasText: /sonraki|ileri|›|>/i }).first();
  if (await nextMonth.isVisible().catch(() => false)) {
    await nextMonth.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-calendar-next-month.png`, fullPage: true });
  }

  await page.screenshot({ path: `${SCREENSHOTS}/sentinel-c6-calendar-state.png`, fullPage: true });
});

// ====== 20. CONSOLE ERROR CHECK ======
test('C6-20: Console error sweep across key pages', async ({ page }) => {
  const consoleErrors: { page: string; msg: string }[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ page: page.url(), msg: msg.text() });
    }
  });

  await login(page);

  const keyPages = [
    '/', '/search', '/community', '/events', '/city',
    '/budget', '/mentors', '/favorites', '/messages',
    '/profile', '/settings', '/notifications', '/roommates',
    '/booking', '/host', '/host/bookings', '/host/calendar', '/host/earnings'
  ];

  for (const p of keyPages) {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  }

  if (consoleErrors.length > 0) {
    console.log('=== CONSOLE ERRORS ===');
    for (const err of consoleErrors) {
      console.log(`[${err.page}] ${err.msg}`);
    }
  } else {
    console.log('NO CONSOLE ERRORS FOUND');
  }
});
