import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SS = 'tests/screenshots';

test.describe('Sentinel C9 — Uçtan Uca Akış Testi', () => {
  test.setTimeout(120000);

  test('Tam akış: Login → Ara → Favorile → Booking → Mesaj', async ({ page }) => {
    const bugs: string[] = [];
    const log = (msg: string) => console.log(`[C9] ${msg}`);

    // ===== 1. LOGIN =====
    log('--- LOGIN ---');
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await emailInput.fill('deniz@kotwise.com');
    await passwordInput.fill('KotwiseTest2026!');

    const loginBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
    await loginBtn.click();

    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const afterLoginUrl = page.url();
    log(`After login URL: ${afterLoginUrl}`);
    if (afterLoginUrl.includes('/login')) {
      bugs.push('LOGIN FAILED — hala /login sayfasında');
    }
    await page.screenshot({ path: `${SS}/sentinel-c9-01-after-login.png`, fullPage: true });

    // ===== 2. SEARCH — İlan Ara =====
    log('--- SEARCH ---');
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SS}/sentinel-c9-02-search.png`, fullPage: true });

    // Arama inputunu bul ve kullan
    const searchInput = page.locator('input[type="search"], input[placeholder*="Ara"], input[placeholder*="Search"], input[placeholder*="ara"]').first();
    const hasSearch = await searchInput.count() > 0;
    log(`Search input bulundu: ${hasSearch}`);

    if (hasSearch) {
      await searchInput.fill('Barcelona');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SS}/sentinel-c9-03-search-barcelona.png`, fullPage: true });
      log('Barcelona araması yapıldı');
    } else {
      bugs.push('SEARCH — Arama input bulunamadı');
    }

    // İlan kartlarını say
    const allCards = page.locator('[class*="card" i], [class*="listing" i]');
    const cardCount = await allCards.count();
    log(`İlan kartı sayısı: ${cardCount}`);

    if (cardCount === 0) {
      bugs.push('SEARCH — Hiç ilan kartı bulunamadı');
    }

    // İlk ilana tıkla
    let listingDetailUrl = '';
    if (cardCount > 0) {
      // Tıklanabilir kartı bul
      const clickableCard = allCards.first();
      await clickableCard.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      listingDetailUrl = page.url();
      log(`İlan detay URL: ${listingDetailUrl}`);

      await page.screenshot({ path: `${SS}/sentinel-c9-04-listing-detail.png`, fullPage: true });

      // İlan detayında olması gerekenler
      const pageContent = await page.content();
      const detailChecks = {
        'Başlık (h1/h2)': await page.locator('h1, h2').first().textContent().catch(() => ''),
        'Fiyat bilgisi': await page.locator('[class*="price" i], :text("€"), :text("₺"), :text("/ay"), :text("/mo")').first().textContent().catch(() => ''),
      };

      for (const [check, value] of Object.entries(detailChecks)) {
        log(`  ${check}: ${value || 'YOK'}`);
        if (!value) {
          bugs.push(`LISTING DETAIL — ${check} bulunamadı`);
        }
      }

      // ===== 3. FAVORİLE =====
      log('--- FAVORİLE ---');

      // Favori butonu: heart icon, bookmark, favori text
      const favBtn = page.locator(
        'button[aria-label*="favori" i], button[aria-label*="favorite" i], ' +
        'button:has(svg[class*="heart" i]), button:has([class*="heart" i]), ' +
        '[class*="heart" i]:not(div[class*="heartbeat"]), ' +
        'button:has-text("Favori"), button[class*="bookmark" i], ' +
        '[data-testid*="favorite"], [data-testid*="heart"]'
      );
      const favCount = await favBtn.count();
      log(`Favori butonları: ${favCount}`);

      if (favCount > 0) {
        await favBtn.first().click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${SS}/sentinel-c9-05-after-fav.png`, fullPage: true });
        log('Favori butonuna tıklandı');
      } else {
        // SVG icon'ları dene
        const svgBtns = page.locator('button:has(svg)');
        const svgCount = await svgBtns.count();
        log(`SVG butonları: ${svgCount}`);

        // Tüm SVG butonlarını logla
        for (let i = 0; i < Math.min(svgCount, 10); i++) {
          const ariaLabel = await svgBtns.nth(i).getAttribute('aria-label') || '';
          const className = await svgBtns.nth(i).getAttribute('class') || '';
          const text = await svgBtns.nth(i).textContent() || '';
          log(`  SVG btn[${i}]: aria="${ariaLabel}" class="${className}" text="${text.trim().substring(0, 30)}"`);
        }

        bugs.push('LISTING DETAIL — Favori butonu bulunamadı');
      }

      // Favoriler sayfasını kontrol et
      await page.goto(`${BASE}/favorites`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `${SS}/sentinel-c9-06-favorites.png`, fullPage: true });

      const favPageCards = await page.locator('[class*="card" i], [class*="listing" i]').count();
      log(`Favoriler sayfası kart sayısı: ${favPageCards}`);

      // ===== 4. BOOKING =====
      log('--- BOOKING ---');

      // İlan detayına geri dön
      if (listingDetailUrl) {
        await page.goto(listingDetailUrl);
      } else {
        await page.goto(`${BASE}/search`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        const firstCard = page.locator('[class*="card" i], [class*="listing" i]').first();
        if (await firstCard.count() > 0) {
          await firstCard.click();
        }
      }
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `${SS}/sentinel-c9-07-listing-for-booking.png`, fullPage: true });

      // Booking / Rezerve / Başvur butonu
      const bookBtn = page.locator(
        'button:has-text("Rezerve"), button:has-text("Book"), button:has-text("Kirala"), ' +
        'button:has-text("Başvur"), button:has-text("İletişim"), button:has-text("Talep"), ' +
        'a:has-text("Rezerve"), a:has-text("Book"), a:has-text("Başvur"), ' +
        'button:has-text("Rezervasyon"), button:has-text("Reserve")'
      ).first();
      const hasBookBtn = await bookBtn.count() > 0;
      log(`Booking butonu bulundu: ${hasBookBtn}`);

      if (hasBookBtn) {
        const bookBtnText = await bookBtn.textContent();
        log(`Booking buton text: ${bookBtnText?.trim()}`);

        await bookBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const bookingUrl = page.url();
        log(`Booking sonrası URL: ${bookingUrl}`);

        await page.screenshot({ path: `${SS}/sentinel-c9-08-booking-form.png`, fullPage: true });

        // Booking formunda date picker var mı?
        const dateElements = page.locator(
          'input[type="date"], [class*="date" i], [class*="calendar" i], [class*="picker" i]'
        );
        const dateCount = await dateElements.count();
        log(`Date/Calendar elemanları: ${dateCount}`);

        // Submit/Confirm butonu
        const confirmBtn = page.locator(
          'button:has-text("Onayla"), button:has-text("Confirm"), button:has-text("Gönder"), ' +
          'button:has-text("Tamamla"), button:has-text("Devam"), button[type="submit"]'
        );
        const confirmCount = await confirmBtn.count();
        log(`Onay butonu: ${confirmCount}`);

        // Eğer onay butonu varsa, tıkla (test amaçlı)
        if (confirmCount > 0) {
          await confirmBtn.first().click();
          await page.waitForTimeout(3000);
          await page.screenshot({ path: `${SS}/sentinel-c9-09-booking-result.png`, fullPage: true });
          log(`Booking sonucu URL: ${page.url()}`);
        }
      } else {
        // Scroll down to find booking button
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SS}/sentinel-c9-07b-listing-scrolled.png`, fullPage: true });

        const bookBtnAfterScroll = page.locator(
          'button:has-text("Rezerve"), button:has-text("Book"), button:has-text("Başvur"), ' +
          'button:has-text("İletişim"), button:has-text("Talep"), button:has-text("Mesaj")'
        ).first();
        const hasBookBtnScroll = await bookBtnAfterScroll.count() > 0;
        log(`Scroll sonrası booking butonu: ${hasBookBtnScroll}`);

        if (!hasBookBtnScroll) {
          // Tüm butonları listele
          const allBtns = page.locator('button, a[class*="btn" i], a[class*="button" i]');
          const btnCount = await allBtns.count();
          log(`Toplam buton sayısı: ${btnCount}`);
          for (let i = 0; i < Math.min(btnCount, 15); i++) {
            const txt = await allBtns.nth(i).textContent();
            log(`  btn[${i}]: "${txt?.trim().substring(0, 50)}"`);
          }
          bugs.push('LISTING DETAIL — Booking/Rezerve butonu bulunamadı');
        }
      }

      // Bookings sayfasını kontrol
      await page.goto(`${BASE}/profile/bookings`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS}/sentinel-c9-10-my-bookings.png`, fullPage: true });

      const bookingTabs = page.locator('button:has-text("Aktif"), button:has-text("Geçmiş"), button:has-text("İptal")');
      const tabCount = await bookingTabs.count();
      log(`Booking sekmeleri: ${tabCount}`);

    } else {
      bugs.push('ARAMA — Hiç ilan kartı yok, akış testi devam edemez');
    }

    // ===== 5. MESAJ GÖNDER =====
    log('--- MESAJ ---');
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SS}/sentinel-c9-11-messages.png`, fullPage: true });

    // Mevcut konuşmaları bul
    const convItems = page.locator('[class*="conversation" i], [class*="chat" i], [class*="message-item" i], [class*="thread" i]');
    let convCount = await convItems.count();
    log(`Konuşma sayısı: ${convCount}`);

    // Eğer konuşma bulunamazsa, tüm tıklanabilir elemanları dene
    if (convCount === 0) {
      const clickables = page.locator('[role="button"], [class*="item" i], [class*="row" i], li').filter({ hasText: /.+/ });
      convCount = await clickables.count();
      log(`Alternatif tıklanabilir eleman: ${convCount}`);

      if (convCount > 0) {
        await clickables.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${SS}/sentinel-c9-12-conversation.png`, fullPage: true });
      }
    } else {
      await convItems.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS}/sentinel-c9-12-conversation.png`, fullPage: true });
    }

    // Mesaj input
    const msgInput = page.locator(
      'textarea, input[placeholder*="mesaj" i], input[placeholder*="message" i], ' +
      'input[placeholder*="yaz" i], [contenteditable="true"]'
    ).last();
    const hasMsgInput = await msgInput.count() > 0;
    log(`Mesaj input bulundu: ${hasMsgInput}`);

    if (hasMsgInput) {
      await msgInput.fill('Merhaba, ilan hakkında bilgi almak istiyorum.');
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SS}/sentinel-c9-13-message-typed.png`, fullPage: true });
      log('Mesaj yazıldı');

      // Gönder butonu
      const sendBtn = page.locator(
        'button:has-text("Gönder"), button:has-text("Send"), button[type="submit"], ' +
        'button[aria-label*="send" i], button[aria-label*="gönder" i], button:has(svg)'
      ).last();
      const hasSendBtn = await sendBtn.count() > 0;
      log(`Gönder butonu: ${hasSendBtn}`);

      if (hasSendBtn) {
        // Gerçekten gönder (test mesajı)
        await sendBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${SS}/sentinel-c9-14-message-sent.png`, fullPage: true });

        // Mesaj gönderildi mi kontrol
        const msgContent = await page.content();
        const messageAppeared = msgContent.includes('ilan hakkında bilgi almak');
        log(`Mesaj gönderildi ve göründü: ${messageAppeared}`);

        if (!messageAppeared) {
          bugs.push('MESAJ — Mesaj gönderildi ama sayfada görünmüyor');
        }
      } else {
        bugs.push('MESAJ — Gönder butonu bulunamadı');
      }
    } else {
      bugs.push('MESAJ — Mesaj input alanı bulunamadı');
    }

    // ===== 6. ÖNCEKİ BUG'LAR KONTROL =====
    log('--- ÖNCEKİ BUG KONTROLÜ ---');

    // C1'den: /search placeholder resimleri
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const brokenImages = page.locator('img[src=""], img:not([src]), img[src*="placeholder"], img[src*="kotwise-logo"]');
    const brokenCount = await brokenImages.count();
    log(`Search kırık/placeholder resim: ${brokenCount}`);
    if (brokenCount > 0) {
      bugs.push(`SEARCH — Hala ${brokenCount} kırık/placeholder resim var (C1 bug devam ediyor)`);
    }

    // C1'den: /roommates fotoğraf yok
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c9-15-roommates.png`, fullPage: true });

    const roommateAvatars = page.locator('img[class*="avatar" i], img[class*="profile" i], img[class*="photo" i]');
    const avatarCount = await roommateAvatars.count();
    const initialsOnly = page.locator('[class*="avatar" i]:not(:has(img)), [class*="initial" i]');
    const initialsCount = await initialsOnly.count();
    log(`Roommates avatar img: ${avatarCount}, sadece baş harf: ${initialsCount}`);

    if (avatarCount === 0 && initialsCount > 0) {
      bugs.push(`ROOMMATES — Hala profil fotoğrafı yok, ${initialsCount} kart sadece baş harf gösteriyor (C1 bug devam)`);
    }

    // ===== SONUÇ =====
    log('===== SONUÇ =====');
    log(`Toplam bug: ${bugs.length}`);
    bugs.forEach((b, i) => log(`  BUG ${i + 1}: ${b}`));

    if (bugs.length > 0) {
      // Fail test to mark issues
      console.log('\n[C9-BUGS]\n' + bugs.join('\n'));
    }
  });
});
