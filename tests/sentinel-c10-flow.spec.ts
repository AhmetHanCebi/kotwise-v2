import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3336';
const SS = 'tests/screenshots';

test.describe('Sentinel C10 — Uçtan Uca Akış Testi', () => {
  test.setTimeout(180000);

  test('Tam akış: Login → Ara → Favorile → Booking → Mesaj', async ({ page }) => {
    const bugs: string[] = [];
    const log = (msg: string) => console.log(`[C10] ${msg}`);

    // ===== 1. LOGIN =====
    log('--- LOGIN ---');
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail" i]').first();
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
    await page.screenshot({ path: `${SS}/sentinel-c10-01-after-login.png`, fullPage: true });

    // ===== 2. SEARCH — İlan Ara =====
    log('--- SEARCH ---');
    await page.goto(`${BASE}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-02-search.png`, fullPage: true });

    // Arama inputu
    const searchInput = page.locator('input[type="search"], input[placeholder*="Ara" i], input[placeholder*="Search" i]').first();
    const hasSearch = await searchInput.count() > 0;
    log(`Search input bulundu: ${hasSearch}`);

    if (hasSearch) {
      await searchInput.fill('Barcelona');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SS}/sentinel-c10-03-search-barcelona.png`, fullPage: true });
      log('Barcelona araması yapıldı');
    } else {
      bugs.push('SEARCH — Arama input bulunamadı');
    }

    // İlan kartları
    const allCards = page.locator('[class*="card" i], [class*="listing" i]');
    const cardCount = await allCards.count();
    log(`İlan kartı sayısı: ${cardCount}`);

    if (cardCount === 0) {
      bugs.push('SEARCH — Hiç ilan kartı bulunamadı');
    }

    // Kırık/placeholder resim kontrolü (C1 bug)
    const brokenImgs = page.locator('img[src=""], img:not([src]), img[src*="placeholder"], img[src*="kotwise-logo"]');
    const brokenImgCount = await brokenImgs.count();
    log(`Search kırık/placeholder resim: ${brokenImgCount}`);

    // naturalWidth=0 olan resimleri de kontrol et
    const allImgs = page.locator('img');
    const imgCount = await allImgs.count();
    let zeroWidthImgs = 0;
    for (let i = 0; i < imgCount; i++) {
      const nw = await allImgs.nth(i).evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (nw === 0) zeroWidthImgs++;
    }
    log(`naturalWidth=0 olan resim: ${zeroWidthImgs}`);

    if (brokenImgCount > 0 || zeroWidthImgs > 0) {
      bugs.push(`SEARCH — ${brokenImgCount} placeholder + ${zeroWidthImgs} kırık resim (C1 bug devam)`);
    }

    // İlk ilana tıkla
    let listingDetailUrl = '';
    if (cardCount > 0) {
      const clickableCard = allCards.first();
      await clickableCard.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      listingDetailUrl = page.url();
      log(`İlan detay URL: ${listingDetailUrl}`);
      await page.screenshot({ path: `${SS}/sentinel-c10-04-listing-detail.png`, fullPage: true });

      // İlan detay kontrolleri
      const title = await page.locator('h1, h2').first().textContent().catch(() => '');
      const price = await page.locator('[class*="price" i], :text("€"), :text("₺"), :text("/ay"), :text("/mo")').first().textContent().catch(() => '');
      log(`  Başlık: ${title || 'YOK'}`);
      log(`  Fiyat: ${price || 'YOK'}`);

      if (!title) bugs.push('LISTING DETAIL — Başlık (h1/h2) bulunamadı');
      if (!price) bugs.push('LISTING DETAIL — Fiyat bilgisi bulunamadı');

      // İlan detay resimleri kontrol
      const detailImgs = page.locator('img');
      const detailImgCount = await detailImgs.count();
      let detailBrokenImgs = 0;
      for (let i = 0; i < detailImgCount; i++) {
        const src = await detailImgs.nth(i).getAttribute('src') || '';
        const nw = await detailImgs.nth(i).evaluate((el: HTMLImageElement) => el.naturalWidth);
        if (nw === 0 || src.includes('placeholder') || src.includes('kotwise-logo')) {
          detailBrokenImgs++;
        }
      }
      if (detailBrokenImgs > 0) {
        log(`  İlan detay kırık resim: ${detailBrokenImgs}`);
        bugs.push(`LISTING DETAIL — ${detailBrokenImgs} kırık/placeholder resim`);
      }

      // ===== 3. FAVORİLE =====
      log('--- FAVORİLE ---');
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
        // Tıklamadan önce state kontrol
        const beforeClass = await favBtn.first().getAttribute('class') || '';
        await favBtn.first().click();
        await page.waitForTimeout(1500);
        const afterClass = await favBtn.first().getAttribute('class') || '';
        log(`Favori class önce: ${beforeClass.substring(0, 50)}`);
        log(`Favori class sonra: ${afterClass.substring(0, 50)}`);

        // Görsel değişim var mı?
        if (beforeClass === afterClass) {
          log('UYARI: Favori butonunda görsel değişim yok');
          bugs.push('FAVORİ — Butona tıklanınca görsel feedback yok (class değişmedi)');
        }

        await page.screenshot({ path: `${SS}/sentinel-c10-05-after-fav.png`, fullPage: true });
        log('Favori butonuna tıklandı');
      } else {
        // SVG icon'ları logla
        const svgBtns = page.locator('button:has(svg)');
        const svgCount = await svgBtns.count();
        log(`SVG butonları: ${svgCount}`);
        for (let i = 0; i < Math.min(svgCount, 8); i++) {
          const ariaLabel = await svgBtns.nth(i).getAttribute('aria-label') || '';
          const cls = await svgBtns.nth(i).getAttribute('class') || '';
          log(`  SVG btn[${i}]: aria="${ariaLabel}" class="${cls.substring(0, 40)}"`);
        }
        bugs.push('LISTING DETAIL — Favori butonu bulunamadı');
      }

      // Favoriler sayfasını kontrol
      await page.goto(`${BASE}/favorites`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS}/sentinel-c10-06-favorites.png`, fullPage: true });

      const favPageCards = await page.locator('[class*="card" i], [class*="listing" i]').count();
      log(`Favoriler sayfası kart sayısı: ${favPageCards}`);

      // Favori sayfasında placeholder resim?
      const favBrokenImgs = page.locator('img[src*="placeholder"], img[src*="kotwise-logo"]');
      const favBrokenCount = await favBrokenImgs.count();
      if (favBrokenCount > 0) {
        bugs.push(`FAVORİLER — ${favBrokenCount} placeholder resim (C1 bug devam)`);
      }

      // ===== 4. BOOKING =====
      log('--- BOOKING ---');
      if (listingDetailUrl) {
        await page.goto(listingDetailUrl);
      } else {
        await page.goto(`${BASE}/search`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        const firstCard = page.locator('[class*="card" i], [class*="listing" i]').first();
        if (await firstCard.count() > 0) await firstCard.click();
      }
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS}/sentinel-c10-07-listing-for-booking.png`, fullPage: true });

      // Booking butonu
      const bookBtn = page.locator(
        'button:has-text("Rezerve"), button:has-text("Book"), button:has-text("Kirala"), ' +
        'button:has-text("Başvur"), button:has-text("İletişim"), button:has-text("Talep"), ' +
        'a:has-text("Rezerve"), a:has-text("Book"), a:has-text("Başvur"), ' +
        'button:has-text("Rezervasyon"), button:has-text("Reserve"), ' +
        'button:has-text("Mesaj Gönder"), a:has-text("Mesaj Gönder")'
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
        await page.screenshot({ path: `${SS}/sentinel-c10-08-booking-flow.png`, fullPage: true });

        // Booking formunda gerekli alanlar var mı?
        const dateElements = page.locator('input[type="date"], [class*="date" i], [class*="calendar" i], [class*="picker" i]');
        const dateCount = await dateElements.count();
        log(`Date/Calendar elemanları: ${dateCount}`);

        // Confirm butonu
        const confirmBtn = page.locator(
          'button:has-text("Onayla"), button:has-text("Confirm"), button:has-text("Gönder"), ' +
          'button:has-text("Tamamla"), button:has-text("Devam"), button[type="submit"]'
        );
        const confirmCount = await confirmBtn.count();
        log(`Onay butonu: ${confirmCount}`);

        if (confirmCount > 0) {
          await confirmBtn.first().click();
          await page.waitForTimeout(3000);
          await page.screenshot({ path: `${SS}/sentinel-c10-09-booking-result.png`, fullPage: true });
          log(`Booking sonucu URL: ${page.url()}`);

          // Hata mesajı var mı?
          const errorMsg = page.locator('[class*="error" i], [class*="alert" i], [role="alert"]');
          const errorCount = await errorMsg.count();
          if (errorCount > 0) {
            const errorText = await errorMsg.first().textContent();
            log(`Booking hata: ${errorText}`);
            bugs.push(`BOOKING — Hata mesajı: ${errorText?.trim().substring(0, 80)}`);
          }
        }
      } else {
        // Scroll ve tüm butonları listele
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SS}/sentinel-c10-07b-listing-scrolled.png`, fullPage: true });

        const allBtns = page.locator('button, a[class*="btn" i], a[class*="button" i]');
        const btnCount = await allBtns.count();
        log(`Toplam buton/link: ${btnCount}`);
        for (let i = 0; i < Math.min(btnCount, 15); i++) {
          const txt = await allBtns.nth(i).textContent();
          log(`  btn[${i}]: "${txt?.trim().substring(0, 50)}"`);
        }

        const bookBtnRetry = page.locator(
          'button:has-text("Rezerve"), button:has-text("Book"), button:has-text("Başvur"), ' +
          'button:has-text("Mesaj"), button:has-text("İletişim"), a:has-text("Başvur")'
        ).first();
        if (await bookBtnRetry.count() > 0) {
          await bookBtnRetry.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `${SS}/sentinel-c10-08-booking-flow.png`, fullPage: true });
        } else {
          bugs.push('LISTING DETAIL — Booking/Rezerve butonu bulunamadı');
        }
      }

      // Bookings sayfası kontrol
      await page.goto(`${BASE}/profile/bookings`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS}/sentinel-c10-10-my-bookings.png`, fullPage: true });

      const bookingCards = page.locator('[class*="card" i], [class*="booking" i], [class*="reservation" i]');
      const bookingCardCount = await bookingCards.count();
      log(`Booking kart sayısı: ${bookingCardCount}`);

    } else {
      bugs.push('ARAMA — Hiç ilan kartı yok, akış testi devam edemez');
    }

    // ===== 5. MESAJ GÖNDER =====
    log('--- MESAJ ---');
    await page.goto(`${BASE}/messages`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-11-messages.png`, fullPage: true });

    // Konuşmaları bul
    const convItems = page.locator('[class*="conversation" i], [class*="chat" i], [class*="message-item" i], [class*="thread" i]');
    let convCount = await convItems.count();
    log(`Konuşma sayısı: ${convCount}`);

    if (convCount === 0) {
      // Alternatif: listeli elemanlar
      const listItems = page.locator('li, [role="button"], [class*="item" i], [class*="row" i]').filter({ hasText: /.+/ });
      convCount = await listItems.count();
      log(`Alternatif konuşma elemanları: ${convCount}`);

      if (convCount > 0) {
        await listItems.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${SS}/sentinel-c10-12-conversation.png`, fullPage: true });
      }
    } else {
      await convItems.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS}/sentinel-c10-12-conversation.png`, fullPage: true });
    }

    // Mesaj yaz ve gönder
    const msgInput = page.locator(
      'textarea, input[placeholder*="mesaj" i], input[placeholder*="message" i], ' +
      'input[placeholder*="yaz" i], [contenteditable="true"]'
    ).last();
    const hasMsgInput = await msgInput.count() > 0;
    log(`Mesaj input bulundu: ${hasMsgInput}`);

    if (hasMsgInput) {
      const testMsg = 'Test mesajı - C10 akış testi ' + new Date().toISOString().substring(11, 19);
      await msgInput.fill(testMsg);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SS}/sentinel-c10-13-message-typed.png`, fullPage: true });
      log('Mesaj yazıldı');

      // Gönder
      const sendBtn = page.locator(
        'button:has-text("Gönder"), button:has-text("Send"), button[type="submit"], ' +
        'button[aria-label*="send" i], button[aria-label*="gönder" i]'
      ).first();
      const hasSendBtn = await sendBtn.count() > 0;

      if (!hasSendBtn) {
        // SVG gönder butonu dene
        const svgSendBtn = page.locator('button:has(svg)').last();
        if (await svgSendBtn.count() > 0) {
          await svgSendBtn.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `${SS}/sentinel-c10-14-message-sent.png`, fullPage: true });
        } else {
          bugs.push('MESAJ — Gönder butonu bulunamadı');
        }
      } else {
        await sendBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${SS}/sentinel-c10-14-message-sent.png`, fullPage: true });
      }

      // Mesaj gönderildi mi?
      const pageHtml = await page.content();
      const msgSent = pageHtml.includes('C10 akış testi') || pageHtml.includes('Test mesajı');
      log(`Mesaj sayfada göründü: ${msgSent}`);
      if (!msgSent) {
        bugs.push('MESAJ — Mesaj gönderildi ama sayfada görünmüyor');
      }
    } else {
      bugs.push('MESAJ — Mesaj input alanı bulunamadı (konuşma açılamadı?)');
    }

    // ===== 6. ÖNCEKİ BUG'LAR RE-CHECK =====
    log('--- ÖNCEKİ BUG RE-CHECK ---');

    // C1 bug: /roommates fotoğraf yok
    await page.goto(`${BASE}/roommates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-15-roommates.png`, fullPage: true });

    const roommateImgs = page.locator('img[class*="avatar" i], img[class*="profile" i], img[class*="photo" i]');
    const roommateImgCount = await roommateImgs.count();
    const initialsOnly = page.locator('[class*="avatar" i]:not(:has(img)), [class*="initial" i]');
    const initialsCount = await initialsOnly.count();
    log(`Roommates: avatar img=${roommateImgCount}, sadece harf=${initialsCount}`);
    if (roommateImgCount === 0 && initialsCount > 0) {
      bugs.push(`ROOMMATES — Hala fotoğraf yok, ${initialsCount} kart sadece baş harf (C1 bug devam)`);
    }

    // C1 bug: /compare placeholder
    await page.goto(`${BASE}/compare`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SS}/sentinel-c10-16-compare.png`, fullPage: true });

    const compareBroken = page.locator('img[src*="placeholder"], img[src*="kotwise-logo"]');
    const compareBrokenCount = await compareBroken.count();
    log(`Compare placeholder resim: ${compareBrokenCount}`);
    if (compareBrokenCount > 0) {
      bugs.push(`COMPARE — ${compareBrokenCount} placeholder resim (C1 bug devam)`);
    }

    // ===== SONUÇ =====
    log('========== C10 SONUÇ ==========');
    log(`Toplam bug: ${bugs.length}`);
    bugs.forEach((b, i) => log(`  BUG ${i + 1}: ${b}`));

    if (bugs.length > 0) {
      console.log('\n[C10-BUGS]\n' + bugs.join('\n'));
    } else {
      console.log('\n[C10] ALL_CLEAR');
    }
  });
});
