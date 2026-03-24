import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const EMAIL = 'deniz@kotwise.com';
const PASSWORD = 'KotwiseTest2026!';
const SCREENSHOT_DIR = 'C:/Yerel_Disc_D/Atlat_V3/tests/screenshots';

test.describe('C10 — Akış Testi: Ara → Favorile → Booking → Mesaj', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // Mobile viewport

  test('Uçtan uca akış testi', async ({ page }) => {
    // ========== ADIM 1: LOGIN ==========
    console.log('--- ADIM 1: Login ---');
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');

    // Email ve şifre gir
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(EMAIL);
    await passwordInput.fill(PASSWORD);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-login-filled.png`, fullPage: true });

    // Login butonuna tıkla
    const loginBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("giriş"), button:has-text("Login"), button:has-text("login")').first();
    await loginBtn.click();

    // Yönlendirme bekle
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const afterLoginUrl = page.url();
    console.log(`Login sonrası URL: ${afterLoginUrl}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-after-login.png`, fullPage: true });

    const loginSuccess = !afterLoginUrl.includes('/login');
    console.log(`Login başarılı: ${loginSuccess}`);

    // ========== ADIM 2: SEARCH — İlan Ara ==========
    console.log('--- ADIM 2: Search ---');
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-search.png`, fullPage: true });

    // İlan kartları var mı?
    const listingCards = page.locator('[class*="card"], [class*="listing"], [class*="Card"], [class*="Listing"], a[href*="/listing/"]');
    const cardCount = await listingCards.count();
    console.log(`Search sayfasında ${cardCount} ilan kartı bulundu`);

    // Arama inputu var mı?
    const searchInput = page.locator('input[type="search"], input[placeholder*="Ara"], input[placeholder*="ara"], input[placeholder*="Search"], input[placeholder*="search"]').first();
    const hasSearchInput = await searchInput.count() > 0;
    console.log(`Arama input: ${hasSearchInput}`);

    // Filtreler var mı?
    const filters = page.locator('[class*="filter"], [class*="Filter"], button:has-text("Filtre"), button:has-text("filtre")');
    const filterCount = await filters.count();
    console.log(`Filtre elemanları: ${filterCount}`);

    // Bir ilana tıkla
    let listingDetailReached = false;
    let listingDetailUrl = '';

    if (cardCount > 0) {
      // İlk ilan kartına tıkla
      const firstCard = listingCards.first();
      await firstCard.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      listingDetailUrl = page.url();
      listingDetailReached = true;
      console.log(`İlan detay URL: ${listingDetailUrl}`);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-listing-detail.png`, fullPage: true });
    } else {
      // Kart bulunamadıysa link dene
      const listingLinks = page.locator('a[href*="/listing/"]');
      const linkCount = await listingLinks.count();
      console.log(`İlan linkleri: ${linkCount}`);

      if (linkCount > 0) {
        await listingLinks.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        listingDetailUrl = page.url();
        listingDetailReached = true;
        console.log(`İlan detay URL: ${listingDetailUrl}`);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-listing-detail.png`, fullPage: true });
      }
    }

    // ========== ADIM 3: FAVORİ ==========
    console.log('--- ADIM 3: Favori ---');

    if (listingDetailReached) {
      // Favori butonu ara (kalp ikonu)
      const favBtn = page.locator('button:has(svg[class*="heart"]), button:has([data-testid*="heart"]), button:has([class*="Heart"]), button[aria-label*="favori"], button[aria-label*="Favori"], button[aria-label*="favorite"], [class*="favorite"], [class*="Favorite"], button:has(svg):near(:text("Favorile"))').first();
      const hasFavBtn = await favBtn.count() > 0;
      console.log(`Favori butonu bulundu: ${hasFavBtn}`);

      if (hasFavBtn) {
        await favBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-favorited.png`, fullPage: true });
        console.log('Favoriye eklendi');
      } else {
        // Tüm butonları listele (debug)
        const allBtns = page.locator('button');
        const btnCount = await allBtns.count();
        console.log(`Sayfada ${btnCount} buton var`);
        for (let i = 0; i < Math.min(btnCount, 10); i++) {
          const txt = await allBtns.nth(i).textContent().catch(() => '');
          const ariaLabel = await allBtns.nth(i).getAttribute('aria-label').catch(() => '');
          console.log(`  Buton ${i}: text="${txt?.trim()}", aria-label="${ariaLabel}"`);
        }
        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-no-fav-btn.png`, fullPage: true });
      }
    }

    // Favoriler sayfasını kontrol et
    await page.goto(`${BASE}/favorites`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-favorites-page.png`, fullPage: true });

    const favItems = page.locator('[class*="card"], [class*="listing"], [class*="Card"], a[href*="/listing/"]');
    const favCount = await favItems.count();
    console.log(`Favoriler sayfasında ${favCount} ilan`);

    // ========== ADIM 4: BOOKING ==========
    console.log('--- ADIM 4: Booking ---');

    // İlan detayına geri dön veya search'ten bir ilana git
    if (listingDetailUrl) {
      await page.goto(listingDetailUrl);
    } else {
      await page.goto(`${BASE}/search`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      const cards = page.locator('[class*="card"], [class*="listing"], a[href*="/listing/"]');
      if (await cards.count() > 0) {
        await cards.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      }
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Booking / Rezervasyon butonu ara
    const bookingBtn = page.locator('button:has-text("Rezervasyon"), button:has-text("rezervasyon"), button:has-text("Book"), button:has-text("book"), button:has-text("Başvur"), button:has-text("İletişim"), a:has-text("Rezervasyon"), a:has-text("Book")').first();
    const hasBookingBtn = await bookingBtn.count() > 0;
    console.log(`Booking butonu bulundu: ${hasBookingBtn}`);

    if (hasBookingBtn) {
      await bookingBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const bookingUrl = page.url();
      console.log(`Booking URL: ${bookingUrl}`);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-booking-flow.png`, fullPage: true });

      // Booking formunda tarih seçimi var mı?
      const dateInputs = page.locator('input[type="date"], [class*="date"], [class*="calendar"], [class*="Date"], [class*="Calendar"]');
      const dateCount = await dateInputs.count();
      console.log(`Tarih seçim elemanları: ${dateCount}`);

      // Onay butonu var mı?
      const confirmBtn = page.locator('button:has-text("Onayla"), button:has-text("Tamamla"), button:has-text("Gönder"), button:has-text("Confirm"), button[type="submit"]').first();
      const hasConfirmBtn = await confirmBtn.count() > 0;
      console.log(`Onay butonu: ${hasConfirmBtn}`);

      if (hasConfirmBtn) {
        await confirmBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-booking-submitted.png`, fullPage: true });
        console.log('Booking gönderildi');
      }
    } else {
      console.log('BUG: İlan detayında booking/rezervasyon butonu bulunamadı');
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-no-booking-btn.png`, fullPage: true });
    }

    // Bookings sayfasını kontrol et
    await page.goto(`${BASE}/profile/bookings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-bookings-list.png`, fullPage: true });

    // ========== ADIM 5: MESAJ GÖNDER ==========
    console.log('--- ADIM 5: Mesaj ---');

    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-messages.png`, fullPage: true });

    // Mevcut bir konuşmaya tıkla
    const conversations = page.locator('[class*="conversation"], [class*="chat"], [class*="message-item"], [class*="MessageItem"], a[href*="/messages/"]');
    const convCount = await conversations.count();
    console.log(`Mevcut konuşmalar: ${convCount}`);

    if (convCount > 0) {
      await conversations.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const chatUrl = page.url();
      console.log(`Chat URL: ${chatUrl}`);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-chat-detail.png`, fullPage: true });

      // Mesaj input alanı
      const msgInput = page.locator('input[placeholder*="mesaj"], input[placeholder*="Mesaj"], input[placeholder*="message"], textarea[placeholder*="mesaj"], textarea[placeholder*="Mesaj"], textarea, input[type="text"]').last();
      const hasMsgInput = await msgInput.count() > 0;
      console.log(`Mesaj input: ${hasMsgInput}`);

      if (hasMsgInput) {
        await msgInput.fill('Test mesajı - Sentinel C10');
        await page.waitForTimeout(500);

        // Gönder butonu
        const sendBtn = page.locator('button:has-text("Gönder"), button:has-text("gönder"), button:has-text("Send"), button[type="submit"], button:has(svg[class*="send"]), button:has(svg[class*="Send"])').first();
        const hasSendBtn = await sendBtn.count() > 0;
        console.log(`Gönder butonu: ${hasSendBtn}`);

        if (hasSendBtn) {
          await sendBtn.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-message-sent.png`, fullPage: true });
          console.log('Mesaj gönderildi');
        }
      }
    } else {
      // Yeni mesaj sayfası
      console.log('Mevcut konuşma yok, yeni mesaj sayfasına git');
      await page.goto(`${BASE}/messages/new`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-new-message.png`, fullPage: true });
    }

    // ========== ADIM 6: ÖNCEKİ BUGLAR KONTROLÜ ==========
    console.log('--- ADIM 6: Önceki Bug Kontrolü ---');

    // /search kırık resim kontrolü
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const brokenImages = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let broken = 0;
      let placeholder = 0;
      imgs.forEach(img => {
        if (!img.complete || img.naturalWidth === 0) broken++;
        if (img.src && (img.src.includes('placeholder') || img.src.includes('logo'))) placeholder++;
      });
      return { total: imgs.length, broken, placeholder };
    });
    console.log(`Search resimleri: toplam=${brokenImages.total}, kırık=${brokenImages.broken}, placeholder=${brokenImages.placeholder}`);

    // /roommates fotoğraf kontrolü
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sentinel-c10-roommates.png`, fullPage: true });

    const roommatePhotos = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      const avatars = document.querySelectorAll('[class*="avatar"], [class*="Avatar"]');
      const initials = document.querySelectorAll('[class*="initial"], [class*="Initial"]');
      return { imgs: imgs.length, avatars: avatars.length, initials: initials.length };
    });
    console.log(`Roommates: img=${roommatePhotos.imgs}, avatar=${roommatePhotos.avatars}, initials=${roommatePhotos.initials}`);

    // ========== SONUÇ ==========
    console.log('=== AKIŞ TESTİ TAMAMLANDI ===');
    console.log(`Login: ${loginSuccess ? 'OK' : 'FAIL'}`);
    console.log(`Search kartları: ${cardCount}`);
    console.log(`İlan detay: ${listingDetailReached ? 'OK' : 'FAIL'}`);
    console.log(`Favoriler: ${favCount}`);
    console.log(`Booking butonu: ${hasBookingBtn}`);
    console.log(`Konuşmalar: ${convCount}`);
  });
});
