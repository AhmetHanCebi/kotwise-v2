# Kotwise V2 — Proje Planı

> Kullanıcı gözünden her sayfanın ve özelliğin detaylı açıklaması.
> Bu doküman onaylandıktan sonra pipeline başlayacak.

---

## 🎯 Vizyon

Kotwise V2, dünya çapında değişim öğrencileri için **konaklama + sosyal platform**. Sadece ev bulmak değil — yeni şehrini tanımak, topluluk kurmak, arkadaş edinmek, etkinliklere katılmak. Airbnb + Instagram + Meetup birleşimi, öğrencilere özel.

**Hedef Kitle:** Erasmus, değişim programı, staj için yurt dışına giden üniversite öğrencileri
**Platform:** Web (Next.js) + Mobil (React Native/Expo)
**Dil:** Çoklu dil desteği (başlangıçta Türkçe + İngilizce)
**Para Birimi:** Çoklu (kullanıcının tercihine göre otomatik dönüşüm)

---

## 📱 Sayfalar ve Özellikler

---

### 1. Welcome / Splash Ekranı
**Kullanıcı ne görür:** Uygulama ilk açıldığında güzel bir gradient arka plan üzerinde Kotwise logosu, sloganı ("Evinizden Uzakta, Eviniz") ve kısa istatistikler (kaç şehir, kaç ilan, kaç kullanıcı) görünür.

**Kullanıcı ne yapabilir:**
- "Başla" butonuna tıklayıp kayıt/giriş akışına geçer
- "Zaten hesabım var" linkiyle direkt giriş yapar

---

### 2. Onboarding (3 adımlı)
**Kullanıcı ne görür:** Swipe edilebilir 3 ekran — her biri uygulamanın bir özelliğini tanıtır.

**Adımlar:**
1. "Güvenilir Konaklama" — Doğrulanmış ev sahipleri, gerçek fotoğraflar
2. "Topluluk & Etkinlikler" — Şehir grupları, arkadaş bul, etkinliklere katıl
3. "Şehir Rehberi" — Ulaşım, maliyet, mahalleler hakkında her şey

**Kullanıcı ne yapabilir:**
- Ekranlar arasında kaydırır
- "Atla" ile direkt giriş sayfasına geçer
- "Başla" ile kayıt sayfasına gider

---

### 3. Kayıt Ol (Çok Adımlı)
**Kullanıcı ne görür:** 3 adımlı kayıt formu.

**Adım 1 — Hesap:**
- Ad soyad, email, şifre
- Google / Apple ile tek tıkla kayıt
- .edu email ile kayıt olursa "Doğrulanmış Öğrenci" rozeti alır

**Adım 2 — Üniversite:**
- Mevcut üniversite (dropdown arama)
- Bölüm
- Değişim üniversitesi (gidilecek)
- Değişim tarihleri (başlangıç-bitiş)

**Adım 3 — Tercihler:**
- Hedef şehir seçimi
- Bütçe aralığı
- İlgi alanları (spor, müzik, yemek, dil pratiği, gezi...)
- Profil fotoğrafı yükleme

**Kullanıcı ne yapabilir:**
- Her adımı doldurur, "Devam Et" ile ilerler, "Geri" ile döner
- 2. ve 3. adımları atlayabilir (sonra profilden tamamlar)

---

### 4. Giriş Yap
**Kullanıcı ne görür:** Email + şifre formu, sosyal giriş butonları.

**Kullanıcı ne yapabilir:**
- Email + şifre ile giriş yapar
- Google / Apple ile giriş yapar
- "Şifremi Unuttum" ile şifre sıfırlama akışına girer
- "Kayıt Ol" ile kayıt sayfasına geçer

---

### 5. Şifre Sıfırla
**Kullanıcı ne görür:** Email input alanı ve "Sıfırlama Linki Gönder" butonu.

**Kullanıcı ne yapabilir:**
- Email girer, sıfırlama maili alır
- Maildeki linkle yeni şifre belirler
- Giriş sayfasına döner

---

### 6. Ana Sayfa
**Kullanıcı ne görür:** Seçtiği şehre göre kişiselleştirilmiş bir ana ekran. İlk girişte şehir seçimi yapılır, sonra her şey o şehre göre filtrelenir.

**Bölümler:**
- **Üst kısım:** Selamlama ("Merhaba, Deniz 👋"), bildirim zili, **aktif şehir butonu** (tıklayınca şehir değiştirebilir)
- **Arama çubuğu:** "Bu şehirde ara..."
- **Şehir bilgi bandı:** Seçili şehrin hızlı istatistikleri (nüfus, ort. kira, güvenlik) + ülke bayrağı + "Şehir Rehberi" linki
- **Bu şehirdeki ilanlar:** Öne çıkan ilanlar (o şehre filtrelenmiş)
- **Bu şehirdeki etkinlikler:** Yaklaşan etkinlikler (o şehre filtrelenmiş)
- **Topluluk:** O şehrin topluluğundan son postlar (filtre: şehir / ülke / tümü)
- **Ülke bilgileri:** Seçili şehrin ülkesiyle ilgili genel bilgiler (vize, para birimi, acil numaralar, kültürel notlar)
- **Alt navigasyon:** Ana Sayfa, Keşfet, Topluluk, Mesajlar, Profil

**Şehir seçimi akışı:**
- İlk kayıtta hedef şehir seçilir → ana sayfada o şehir aktif olur
- Üstteki şehir butonuna tıklayınca → şehir değiştirme bottom sheet açılır (arama + popüler şehirler)
- Şehir değiştirilince tüm sayfa o şehre göre güncellenir (ilanlar, etkinlikler, topluluk, bilgiler)
- Seçilen şehir profilde saklanır (her girişte hatırlanır)

**Kullanıcı ne yapabilir:**
- Şehir butonuna tıklayıp şehir değiştirir (tüm içerik güncellenir)
- Arama çubuğuna yazıp o şehirde arama yapar
- İlan kartına tıklayıp detay sayfasına gider
- Etkinliğe tıklayıp etkinlik detayına gider
- Posta tıklayıp topluluk detayına gider
- Topluluk filtresini değiştirir (şehir / ülke / tümü)
- "Şehir Rehberi" linkiyle detaylı şehir sayfasına gider
- Bildirim ziline tıklayıp bildirimlere gider

---

### 7. Şehir Sayfası (Detaylı Rehber)
**Kullanıcı ne görür:** Seçilen şehrin kapsamlı rehber sayfası. Ana sayfadaki "Şehir Rehberi" linkinden veya şehir bilgi bandından erişilir.

**Bölümler:**
- **Hero:** Şehrin güzel bir fotoğrafı + isim + ülke
- **Şehir tabları:** (Bilgi, Mahalleler, Ulaşım, Maliyet, İlanlar, Etkinlikler, SSS)
- **Hızlı istatistikler:** Nüfus, ortalama kira, öğrenci sayısı, güvenlik skoru
- **Mahalleler:** Kartlar halinde — isim, atmosfer, ortalama kira, güvenlik puanı, fotoğraf
- **Ulaşım:** Metro/otobüs bilgileri, bilet fiyatları, öğrenci kartı bilgisi
- **Yaşam maliyeti:** Interaktif grafik — kira, yemek, ulaşım, eğlence, diğer
- **Bu şehirdeki ilanlar:** Yatay kaydırılabilir ilan kartları
- **Bu şehirdeki etkinlikler:** Yaklaşan etkinlik listesi
- **SSS:** Akordeon formatında sıkça sorulan sorular
- **Öğrenci ipuçları:** Deneyimli öğrencilerin tavsiyeleri

**Kullanıcı ne yapabilir:**
- Tablar arasında geçiş yapar
- Mahalleye tıklayıp o mahalledeki ilanları filtreler
- "Bu Şehirde Ara" ile ilan aramasına gider
- Etkinliğe tıklar
- SSS'leri açıp kapatır

---

### 8. İlan Arama (Liste Görünümü)
**Kullanıcı ne görür:** Filtreli arama sayfası.

**Bölümler:**
- **Arama çubuğu:** Konum, üniversite veya ilan ara
- **Filtre çipleri:** Fiyat, Oda Tipi, Mesafe, Eşleşme, Eşyalı, Doğrulanmış
- **Genişleyebilir filtre paneli:** Fiyat aralığı slider, oda tipi grid, mesafe toggle, özellik checkboxları
- **Sonuç sayısı + sıralama:** "24 ilan bulundu" + sıralama dropdown
- **İlan kartları:** Fotoğraf, başlık, konum, fiyat, rating, eşleşme puanı, favori kalp
- **Harita FAB:** Sağ altta harita görünümüne geç butonu

**Kullanıcı ne yapabilir:**
- Arama yapar, filtreler, sıralar
- İlan kartına tıklayıp detaya gider
- Kalp ikonuna tıklayıp favorilere ekler
- Harita FAB'ına tıklayıp harita görünümüne geçer

---

### 9. İlan Arama (Harita Görünümü)
**Kullanıcı ne görür:** Tam ekran harita, üzerinde fiyat balonları.

**Harita özellikleri:**
- Zoom yapıldıkça fiyat balonları görünür (Airbnb tarzı)
- Fiyat balonuna tıklayınca mini kart açılır (fotoğraf, başlık, fiyat)
- Mini karta tıklayınca ilan detayına gider
- Harita üzerinde filtre çipleri
- Liste görünümüne geri dön butonu

**Kullanıcı ne yapabilir:**
- Haritayı kaydırır, yakınlaştırır
- Fiyat balonlarına tıklar
- Mini karttan detaya gider
- Filtreleri değiştirir

---

### 10. İlan Detay
**Kullanıcı ne görür:** Kapsamlı ilan sayfası.

**Bölümler:**
- **Fotoğraf galerisi:** Kaydırılabilir carousel, tam ekran görüntüleme
- **Başlık + konum + rating:** İlan adı, mahalle/şehir, yıldız puanı
- **Fiyat:** Aylık fiyat + dahil olanlar
- **Ev sahibi kartı:** Fotoğraf, isim, Süper Ev Sahibi rozeti, yanıt süresi, "Mesaj Gönder" butonu
- **Özellikler grid:** WiFi, eşyalı, çamaşır, mutfak, ısıtma, balkon...
- **Açıklama:** Genişleyebilir metin
- **Fiyata dahil olanlar:** Elektrik, su, internet, ısıtma listesi
- **Konum haritası:** Mini harita ile konum gösterimi
- **Üniversite mesafesi:** "İTÜ'ye 2.3 km"
- **Değerlendirmeler:** Puan + yorum listesi, yorum yazma formu
- **Benzer ilanlar:** Yatay kaydırılabilir öneriler
- **Sabit alt çubuk:** Fiyat + "Rezervasyon Yap" butonu

**Kullanıcı ne yapabilir:**
- Fotoğrafları kaydırır, tam ekran açar
- Ev sahibine mesaj gönderir (conversation oluşturur)
- Paylaş butonuyla ilanı paylaşır
- Kalp butonuyla favorilere ekler
- Değerlendirme yazar
- "Rezervasyon Yap" ile booking akışına girer
- Haritada konumu görür

---

### 11. Rezervasyon (4 Adımlı)
**Kullanıcı ne görür:** Adım adım rezervasyon formu.

**Adım 1 — Tarihler:**
- İlan özet kartı (fotoğraf, başlık, fiyat)
- Giriş tarihi seçici
- Çıkış tarihi seçici
- Toplam süre otomatik hesaplanır

**Adım 2 — Kişisel Bilgiler:**
- Ad soyad, email, telefon
- Üniversite
- Özel istekler (textarea)

**Adım 3 — Ödeme Özeti:**
- Kira tutarı (fiyat × ay)
- Hizmet bedeli (%3)
- Toplam tutar
- Ödeme yöntemi seçimi (Stripe entegrasyonu)

**Adım 4 — Onay:**
- Tüm bilgilerin özeti
- İptal politikası
- "Rezervasyonu Onayla" butonu

**Kullanıcı ne yapabilir:**
- Adımlar arasında ileri/geri gider
- Tarihleri seçer, bilgileri doldurur
- Son adımda onaylar

---

### 12. Rezervasyon Onay
**Kullanıcı ne görür:** Konfeti animasyonu, onay detayları.

**İçerik:**
- Başarı ikonu + "Rezervasyon Onaylandı!"
- Onay numarası (kopyalanabilir)
- İlan bilgileri, tarihler, toplam ödeme
- Ev sahibi iletişim kartı (mesaj + telefon)
- "Sonraki adım" ipuçları
- "Rezervasyonlarım" ve "Ana Sayfa" butonları

---

### 13. Topluluk Akışı
**Kullanıcı ne görür:** Instagram/Facebook tarzı sosyal akış.

**Bölümler:**
- **Üst kısım:** Şehir filtresi (tüm şehirler veya belirli şehir)
- **Trending konular:** Yatay etiket çipleri (#BarcelonaHayatı, #ErasmusTürkiye...)
- **Post kartları:** Kullanıcı avatarı + isim + zaman, metin içerik, fotoğraf (opsiyonel), konum etiketi, beğeni + yorum sayısı, beğen/yorum/paylaş butonları
- **Yeni post FAB:** Sağ altta "+" butonu

**Kullanıcı ne yapabilir:**
- Akışta aşağı kaydırır (infinite scroll)
- Şehre göre filtreler
- Trending etikete tıklayıp o konudaki postları görür
- Posta beğeni verir
- Posta tıklayıp detay + yorumlara gider
- FAB'a tıklayıp yeni post oluşturur

---

### 14. Post Detay
**Kullanıcı ne görür:** Bir postun tam hali ve altında yorum thread'i.

**İçerik:**
- Post sahibi bilgileri (avatar, isim, üniversite, zaman)
- Post içeriği (metin + fotoğraflar)
- Konum etiketi
- Beğeni sayısı + beğenenlerin listesi
- Yorum listesi (avatar + isim + yorum + zaman)
- Yorum yazma alanı (alt kısımda sabit)

**Kullanıcı ne yapabilir:**
- Beğenir / beğeniyi kaldırır
- Yorum yazar
- Post sahibinin profiline gider
- Fotoğrafa tıklayıp tam ekran görür
- Postu paylaşır / raporlar

---

### 15. Post Oluştur
**Kullanıcı ne görür:** Yeni post oluşturma formu.

**İçerik:**
- Metin alanı (ne düşünüyorsun?)
- Fotoğraf ekle butonu (max 5)
- Konum ekle (haritadan seçim veya arama)
- Şehir etiketi (otomatik veya manuel)
- Hashtag önerileri
- "Paylaş" butonu

---

### 16. Şehir Sohbet
**Kullanıcı ne görür:** Seçilen şehrin grup sohbet odası (WhatsApp grubu gibi).

**İçerik:**
- Şehir adı + katılımcı sayısı (üst çubuk)
- Mesaj baloncukları (avatar + isim + mesaj + zaman)
- Mesaj türleri: metin, fotoğraf, konum paylaşımı
- Sabitlenmiş mesajlar (önemli duyurular)
- Mesaj yazma alanı + gönder butonu

**Kullanıcı ne yapabilir:**
- Mesaj yazar, fotoğraf paylaşır
- Sabitlenmiş mesajları görür
- Bir kullanıcının profiline gider
- Mesajı raporlar

---

### 17. Etkinlikler Listesi
**Kullanıcı ne görür:** Yaklaşan etkinliklerin listesi.

**Bölümler:**
- **Filtre çipleri:** Tümü, Kahve ☕, Spor ⚽, Dil Pratiği 🗣️, Şehir Turu 🏛️, Parti 🎉
- **Görünüm toggle:** Liste / Harita / Takvim
- **Etkinlik kartları:** Kapak fotoğrafı, başlık, tarih/saat, konum, katılımcı sayısı, organizatör
- **Etkinlik oluştur FAB**

**Kullanıcı ne yapabilir:**
- Kategoriye göre filtreler
- Görünümler arası geçiş yapar (liste ↔ harita ↔ takvim)
- Etkinliğe tıklayıp detaya gider
- FAB'a tıklayıp yeni etkinlik oluşturur

---

### 18. Etkinlik Harita
**Kullanıcı ne görür:** Harita üzerinde etkinlik noktaları (renkli pinler).

**İçerik:**
- Kategoriye göre renkli pinler (kahve=kahverengi, spor=yeşil, dil=mavi...)
- Pine tıklayınca mini kart (başlık, tarih, katılımcı sayısı)
- Mini karta tıklayınca etkinlik detayına gider
- Filtre çipleri harita üzerinde

---

### 19. Etkinlik Detay
**Kullanıcı ne görür:** Etkinliğin tüm detayları.

**İçerik:**
- Kapak fotoğrafı
- Başlık, tarih/saat, konum (harita ile)
- Organizatör kartı (avatar, isim, rozet)
- Açıklama
- Katılımcılar listesi (avatarlar + "ve 12 kişi daha")
- Etkinlik sohbeti (katılımcılar arası mesajlaşma)
- "Katıl" / "Ayrıl" butonu
- Paylaş butonu

**Kullanıcı ne yapabilir:**
- Etkinliğe katılır / ayrılır
- Etkinlik sohbetinde mesaj yazar
- Organizatöre mesaj gönderir
- Etkinliği paylaşır
- Haritada konumu görür

---

### 20. Etkinlik Oluştur
**Kullanıcı ne görür:** Yeni etkinlik oluşturma formu.

**İçerik:**
- Başlık
- Kategori seçimi (dropdown)
- Tarih + saat seçici
- Konum (harita üzerinden pin bırakma veya adres arama)
- Açıklama
- Kapak fotoğrafı yükleme
- Maksimum katılımcı sayısı
- "Etkinlik Oluştur" butonu

---

### 21. Arkadaş Eşleştirme
**Kullanıcı ne görür:** Tinder tarzı swipe kartları.

**Kart içeriği:**
- Profil fotoğrafı (büyük)
- İsim, yaş
- Üniversite → hedef şehir
- Eşleşme yüzdesi (%87 Uyum)
- İlgi alanları (emoji etiketler)
- Alışkanlıklar (erken kalkar, sigara içmez...)
- Kısa bio

**Kullanıcı ne yapabilir:**
- Sola kaydır → Geç
- Sağa kaydır → Beğen
- Yukarı kaydır → Süper Beğeni
- Alt butonlar: ✕ Geç, 💬 Mesaj, ❤️ Beğen
- Karşılıklı beğenide "Eşleşme!" bildirimi

---

### 22. Arkadaş Profil
**Kullanıcı ne görür:** Bir kullanıcının detaylı profili.

**İçerik:**
- Profil fotoğrafı + gradient çerçeve
- İsim, yaş, üniversite, bölüm
- Eşleşme yüzdesi
- Değişim bilgileri (nereden → nereye, tarihler)
- İlgi alanları
- Bio
- Paylaşılan etkinlikler
- "Mesaj Gönder" + "Beğen" butonları

---

### 23. Mentor Bul
**Kullanıcı ne görür:** O şehirde daha önce yaşamış öğrencilerin listesi.

**İçerik:**
- Filtre: Şehir, üniversite, dil
- Mentor kartları: avatar, isim, "Barcelona'da 6 ay yaşadı", derecelendirme, uzmanlık alanları
- "Mentor Ol" başvuru butonu

**Kullanıcı ne yapabilir:**
- Mentor arar, filtreler
- Mentora mesaj gönderir
- Kendisi mentor olarak başvurur

---

### 24. Mesajlar Listesi
**Kullanıcı ne görür:** Tüm sohbetlerinin listesi.

**Bölümler:**
- **Filtre tabları:** Tümü, Okunmamış, İlan Mesajları, Grup
- **Arama çubuğu:** Sohbet ara
- **Sohbet kartları:** Avatar, isim, son mesaj, zaman, okunmamış sayısı, çevrimiçi durumu
- **Grup sohbetleri:** Etkinlik ve şehir grupları
- **Yeni mesaj FAB**

**Kullanıcı ne yapabilir:**
- Sohbete tıklayıp chat'e gider
- Arama yapar
- FAB'a tıklayıp yeni sohbet başlatır

---

### 25. Sohbet
**Kullanıcı ne görür:** WhatsApp benzeri sohbet ekranı.

**İçerik:**
- Karşı taraf bilgileri (üst çubuk): avatar, isim, çevrimiçi durumu
- Mesaj baloncukları: gönderilen (turuncu gradient) / alınan (beyaz)
- Mesaj türleri: metin, fotoğraf, konum, sesli mesaj
- Okundu bildirimi (çift tik)
- Tarih ayırıcılar
- Çeviri toggle (otomatik dil çevirisi)
- Mesaj yazma alanı: metin input + emoji + dosya eki + kamera + sesli mesaj + gönder

**Kullanıcı ne yapabilir:**
- Metin yazar, gönderir
- Fotoğraf/dosya paylaşır
- Sesli mesaj kaydeder
- Çeviri açar/kapatır
- Eski mesajlara yukarı kaydırarak ulaşır

---

### 26. Yeni Mesaj
**Kullanıcı ne görür:** Kullanıcı arama ekranı.

**İçerik:**
- Arama çubuğu (isim ile ara)
- Son konuşulan kişiler
- Arama sonuçları: avatar + isim + üniversite

**Kullanıcı ne yapabilir:**
- İsim arar, kişiye tıklar, sohbet başlar

---

### 27. Bildirimler
**Kullanıcı ne görür:** Tüm bildirimlerin listesi.

**Bildirim türleri:**
- 💬 Yeni mesaj
- ❤️ Eşleşme / beğeni
- 🏠 Rezervasyon onayı
- 💰 Fiyat düştü
- ⭐ Yeni değerlendirme
- 🎉 Etkinlik hatırlatma
- 📢 Topluluk (post beğeni, yorum)
- 🔔 Sistem bildirimleri

**Kullanıcı ne yapabilir:**
- Bildirime tıklayıp ilgili sayfaya gider
- "Tümünü okundu işaretle"
- Filtre: Tümü / Okunmamış

---

### 28. Profil
**Kullanıcı ne görür:** Kendi profil sayfası.

**Bölümler:**
- **Header:** Gradient arka plan, avatar (düzenlenebilir), isim, üniversite
- **Rozetler:** Doğrulanmış Öğrenci ✓, Süper Ev Sahibi ⭐, Mentor 🎓, Explorer 🌍
- **İstatistikler:** İlan sayısı, favori sayısı, etkinlik sayısı, puan
- **Bio:** Kısa tanıtım metni
- **Değişim bilgileri:** Nereden → Nereye, tarihler
- **Değerlendirmeler:** Aldığı puanlar ve yorumlar
- **Ayarlar menüsü:** Profil düzenle, rezervasyonlarım, ilan oluştur, ev sahibi ol, ayarlar, yardım, çıkış

**Kullanıcı ne yapabilir:**
- "Profil Düzenle" ile bilgilerini günceller
- "İlan Oluştur" ile ev sahibi akışına girer
- "Rezervasyonlarım" ile geçmiş/aktif rezervasyonlarını görür
- Çıkış yapar

---

### 29. Profil Düzenle
**Kullanıcı ne görür:** Profil bilgilerini düzenleme formu.

**Düzenlenebilir alanlar:**
- Profil fotoğrafı (kamera ikonu ile değiştir)
- Ad soyad
- Üniversite, bölüm
- Değişim üniversitesi
- Şehir
- Bio
- Değişim tarihleri
- İlgi alanları
- Doğum tarihi

**Kullanıcı ne yapabilir:**
- Fotoğraf yükler (Supabase Storage)
- Bilgileri günceller
- "Kaydet" ile değişiklikleri kaydeder

---

### 30. Ayarlar
**Kullanıcı ne görür:** Uygulama ayarları.

**Bölümler:**
- **Hesap:** Email değiştir, şifre değiştir
- **Tercihler:** Dil seçimi, para birimi, tema (açık/koyu)
- **Bildirimler:** Hangi bildirimleri almak istediği (mesaj, eşleşme, etkinlik, fiyat...)
- **Gizlilik:** Profil görünürlüğü, çevrimiçi durumu göster/gizle
- **Hakkında:** Sürüm, gizlilik politikası, kullanım şartları
- **Hesap sil**

---

### 31. Ev Sahibi Başvuru
**Kullanıcı ne görür:** Ev sahibi olmak için doğrulama formu.

**Adımlar:**
1. **Kişisel doğrulama:** Kimlik fotoğrafı yükleme
2. **Ev bilgileri:** Adres, oda sayısı, genel bilgiler
3. **Standartlar:** Temizlik, güvenlik, iletişim taahhüdü
4. **Onay:** Kuralları kabul et, başvuruyu gönder

**Sonuç:** Başvuru incelemeye alınır, onaylanınca "Ev Sahibi" rozeti verilir.

---

### 32. Ev Sahibi Paneli (Dashboard)
**Kullanıcı ne görür:** Ev sahiplerine özel yönetim paneli.

**Bölümler:**
- **Özet kartları:** Aktif ilan sayısı, bu ayki kazanç, ortalama puan, yanıt oranı
- **Gelen talepler:** Bekleyen rezervasyon istekleri listesi
- **İlanlarım:** Tüm ilanların listesi (aktif/pasif)
- **Hızlı eylemler:** Yeni ilan oluştur, takvimi gör, mesajları gör

---

### 33. İlan Oluştur / Düzenle
**Kullanıcı ne görür:** 4 adımlı ilan oluşturma formu.

**Adım 1 — Temel Bilgiler:** Başlık, açıklama, şehir, mahalle, adres, üniversite yakınlığı
**Adım 2 — Oda Detayları:** Oda tipi, fiyat, eşyalı mı, özellikler, dahil olanlar, max misafir
**Adım 3 — Fotoğraflar:** Fotoğraf yükleme (max 10), sıralama, kapak fotoğrafı seçimi
**Adım 4 — Önizleme:** İlanın kullanıcılara nasıl görüneceğinin önizlemesi + "Yayınla"

---

### 34. Gelen Talepler
**Kullanıcı ne görür:** Ev sahibine gelen rezervasyon istekleri.

**Her talep kartı:**
- Kiracı bilgileri (avatar, isim, üniversite)
- Talep edilen tarihler
- Toplam tutar
- "Onayla" / "Reddet" butonları
- Kiracıya mesaj gönder butonu

---

### 35. Takvim (Müsaitlik)
**Kullanıcı ne görür:** Aylık takvim görünümü.

**İçerik:**
- Yeşil = müsait günler
- Kırmızı = dolu günler
- Sarı = bekleyen talepler
- Tıklayarak müsaitlik aç/kapat

---

### 36. Kazançlar
**Kullanıcı ne görür:** Gelir raporu.

**İçerik:**
- Toplam kazanç (aylık/yıllık)
- Grafik (son 6 ay trendi)
- İlan bazlı dağılım
- Komisyon detayları
- Ödeme geçmişi

---

### 37. Favoriler
**Kullanıcı ne görür:** Kaydettiği ilanların listesi.

**İçerik:**
- Şehre göre filtre tabları
- İlan kartları (fotoğraf, fiyat, konum, kalp butonu)
- "İncele" + "Karşılaştır" butonları
- Boşsa: "Henüz favorilerin yok, ilanları keşfet!"

---

### 38. Karşılaştırma
**Kullanıcı ne görür:** Favori ilanların yan yana karşılaştırması.

**İçerik:**
- Üstte ilan kartları (yatay, max 3)
- Karşılaştırma tablosu: Fiyat, konum, oda tipi, eşyalı, WiFi, rating, eşleşme
- Kazanan vurgusu (en iyi değer yeşil)
- "Rezervasyon Yap" butonu kazanan için

---

### 39. Rezervasyonlarım
**Kullanıcı ne görür:** Geçmiş ve aktif rezervasyonları.

**Filtre tabları:** Aktif, Geçmiş, İptal Edilen
**Her rezervasyon kartı:**
- İlan fotoğrafı + başlık + konum
- Tarihler + toplam ödeme
- Durum badge'i (Onaylandı ✓, Beklemede ⏳, İptal ✗)
- "Mesaj Gönder" + "İptal Et" butonları

---

### 40. Bütçe Hesaplayıcı
**Kullanıcı ne görür:** Interaktif maliyet hesaplama aracı.

**İçerik:**
- Şehir seçici
- Süre seçici (ay)
- Slider'lar: kira bütçesi, yemek, ulaşım, eğlence
- Otomatik hesaplanan toplam aylık + toplam dönem maliyeti
- Şehir ortalamasıyla karşılaştırma
- "Bu bütçeye uygun ilanları göster" butonu

---

## 🏗️ Teknik Altyapı

**Web:** Next.js 15, React 19, Tailwind CSS 4
**Mobil:** React Native / Expo
**Backend:** Supabase (Auth, Database, Storage, Realtime, Edge Functions)
**Harita:** Mapbox veya Google Maps
**Ödeme:** Stripe
**Bildirim:** Supabase Realtime + Push Notifications
**Çeviri:** Google Translate API veya DeepL
**Deploy:** Vercel (web) + EAS (mobil)

---

## 📊 Veritabanı Tabloları (Taslak)

1. profiles — kullanıcı profilleri, rozetler
2. cities — şehir bilgileri, rehber verisi
3. neighborhoods — mahalle detayları
4. listings — kiralama ilanları
5. listing_images — ilan fotoğrafları
6. bookings — rezervasyonlar
7. reviews — değerlendirmeler
8. favorites — favori ilanlar
9. conversations — sohbet thread'leri
10. messages — mesajlar
11. posts — topluluk postları
12. post_comments — post yorumları
13. post_likes — post beğenileri
14. events — etkinlikler
15. event_participants — etkinlik katılımcıları
16. roommate_profiles — oda arkadaşı tercihleri
17. roommate_likes — eşleşme beğenileri
18. roommate_skips — geçilenler
19. notifications — bildirimler
20. mentor_profiles — mentor bilgileri
21. city_faqs — şehir SSS
22. host_applications — ev sahibi başvuruları
23. earnings — kazanç kayıtları

---

## ✅ Onay

Bu plan onaylandıktan sonra Pipeline V2 başlayacak:
1. Backend (schema + hooks)
2. Backend test
3. Web tasarım (gerçek veriyle)
4. Mobil uygulama
5. QA döngüsü
6. Jüri
7. Deploy

**Onaylıyor musun?** (Değişiklik istersen söyle, güncelleriz)
