-- ============================================================
-- KOTWISE V2 — Comprehensive Seed Data
-- 20 Users, 25 Listings, 30 Reviews, 15 Posts, 10 Events,
-- 20 Conversations, 20 Notifications, 5 Roommate Profiles,
-- 3 Mentor Profiles, 10 Favorites, 5 Bookings
-- ============================================================

-- ============================================================
-- IMPORTANT: AUTH USER CREATION GUIDE
-- ============================================================
--
-- Supabase does NOT allow inserting directly into auth.users via SQL.
-- You MUST create these 20 users via the Supabase Dashboard first:
--
-- Go to: Supabase Dashboard > Authentication > Users > Add User
-- Create each user with "Auto Confirm" enabled.
--
-- After creating ALL users, copy each user's UUID from the Dashboard
-- and replace the placeholder UUIDs below.
--
-- ┌────┬───────────────────┬──────────────────────┬──────────────────────────────────────┐
-- │ #  │ Name              │ Email                │ Placeholder UUID                     │
-- ├────┼───────────────────┼──────────────────────┼──────────────────────────────────────┤
-- │  1 │ Deniz Aydın       │ deniz@kotwise.com    │ 27d578d1-8263-42dd-a63c-081b58b395d3 │
-- │  2 │ Elif Kara         │ elif@kotwise.com     │ a8add0f9-6394-45aa-a960-437d094c6501 │
-- │  3 │ Can Özkan         │ can@kotwise.com      │ e135fa88-6e69-4853-8614-9a128a786b68 │
-- │  4 │ Zeynep Demir      │ zeynep@kotwise.com   │ a8f8d0ec-73d9-4d02-8679-efa9a0d59716 │
-- │  5 │ Ayşe Yılmaz       │ ayse@kotwise.com     │ 8e6e1fee-9c40-433e-b8eb-6273b96b0d02 │
-- │  6 │ Mehmet Kaya       │ mehmet@kotwise.com   │ b4ef7afc-fade-4258-9b97-e38b4fafe5a1 │
-- │  7 │ Maria García      │ maria@kotwise.com    │ 4e27ed2f-0ca3-4394-9e63-947a9cdd4dde │
-- │  8 │ Lucas Silva       │ lucas@kotwise.com    │ 8fd73484-9c91-426d-a5ca-5f5926c4529c │
-- │  9 │ Anna Schmidt      │ anna@kotwise.com     │ 1d5113ae-a798-42f3-8570-1641e3a62687 │
-- │ 10 │ Marco Rossi       │ marco@kotwise.com    │ f98f2b0c-3ec6-4998-9231-8de8cd2d9db0 │
-- │ 11 │ Sophie Müller     │ sophie@kotwise.com   │ ffcba7da-3d0a-4547-98cf-c802572a7244 │
-- │ 12 │ Carlos Martínez   │ carlos@kotwise.com   │ c71fd4b3-dcfe-4f92-b517-2abbcea151bf │
-- │ 13 │ Fatma Şahin       │ fatma@kotwise.com    │ 5993993a-4131-4c6c-b52d-27d2030512b1 │
-- │ 14 │ Pedro Santos      │ pedro@kotwise.com    │ 1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb │
-- │ 15 │ Lena Weber        │ lena@kotwise.com     │ 0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a │
-- │ 16 │ Mert Acar         │ mert@kotwise.com     │ ade644ae-6211-4482-b8d8-456881e4b1b8 │
-- │ 17 │ Giulia Romano     │ giulia@kotwise.com   │ c7cce9d9-765e-40bd-99b3-40bc64681cb2 │
-- │ 18 │ Emre Yıldız       │ emre@kotwise.com     │ 231b92fb-bbc7-44b8-ae9c-f0c705255e71 │
-- │ 19 │ Clara Dubois      │ clara@kotwise.com    │ b3684764-5ea7-4b10-b01a-8adba3932f0d │
-- │ 20 │ Ali Demir         │ ali@kotwise.com      │ 64feebd7-416d-4c27-bef9-b07190d0c87c │
-- └────┴───────────────────┴──────────────────────┴──────────────────────────────────────┘
--
-- Password suggestion for all test accounts: KotwiseTest2026!
--
-- AFTER creating users and replacing UUIDs, run this entire SQL file
-- in Supabase Dashboard > SQL Editor.
--
-- NOTE: The handle_new_user() trigger will auto-create basic profiles
-- when users sign up. The UPDATE statements below will enrich those
-- profiles with additional data. If running seed AFTER signup, use
-- the UPDATE approach. If you disabled the trigger, use INSERT.
--
-- ============================================================

-- ============================================================
-- STEP 0: Disable triggers temporarily for bulk insert
-- (Run as superuser / service_role)
-- ============================================================

-- We'll use INSERT ... ON CONFLICT for profiles since the trigger
-- may have already created them.

BEGIN;

-- ============================================================
-- STEP 1: CITIES (4 cities)
-- ============================================================

INSERT INTO cities (id, name, country, country_code, population, avg_rent, student_count, safety_score, currency, timezone, image_url, transport_info, cost_breakdown, tips, emergency_info, visa_info, cultural_notes) VALUES

-- Istanbul
('c0000001-0000-4000-a000-000000000001', 'İstanbul', 'Türkiye', 'TR', 15840900, 18000.00, 850000, 7.5, 'TRY', 'Europe/Istanbul',
 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200',
 '{"metro": "İstanbul Metro - 7 hat, İstanbulkart ile aylık 1.200 TL", "bus": "İETT otobüsleri tüm şehri kapsar", "ferry": "Vapur ile Avrupa-Asya arası ulaşım", "taxi": "BiTaksi veya Uber uygulamaları", "tip": "İstanbulkart mutlaka alın, tüm toplu taşımada geçerli"}',
 '{"rent": "12.000-25.000 TL/ay", "food": "3.000-5.000 TL/ay", "transport": "1.200 TL/ay (İstanbulkart)", "utilities": "1.500-2.500 TL/ay", "phone": "200-400 TL/ay", "entertainment": "1.500-3.000 TL/ay", "total_estimate": "19.000-36.000 TL/ay"}',
 ARRAY['İstanbulkart ile tüm toplu taşıma araçlarını kullanabilirsiniz', 'Kadıköy ve Beşiktaş öğrenci dostu semtlerdir', 'Su faturası genellikle kiraya dahildir', 'Pazarlardan alışveriş yapmak market fiyatlarının yarısına denk gelir', 'HES kodu ile hastanelere ücretsiz giriş yapabilirsiniz'],
 '{"police": "155", "ambulance": "112", "fire": "110", "embassy_tr": "+90 312 455 5555", "hospital": "En yakın devlet hastanesi: Cerrahpaşa Tıp Fakültesi"}',
 '{"erasmus": "Erasmus+ öğrencileri için oturma izni gerekmez (90 güne kadar)", "residence_permit": "90 gün üzeri kalış için ikamet izni başvurusu yapılmalıdır", "documents": "Pasaport, kabul mektubu, sağlık sigortası, banka hesap özeti"}',
 ARRAY['Çay ikram etmek Türk misafirperverliğinin simgesidir', 'Evlere girerken ayakkabıları çıkarmak yaygındır', 'Pazarlık kültürü hâlâ yaşamaktadır, özellikle Kapalıçarşı''da', 'Ramazan ayında gündüz yeme-içme konusunda hassas olunmalıdır']),

-- Barcelona
('c0000001-0000-4000-a000-000000000002', 'Barcelona', 'İspanya', 'ES', 1636762, 35000.00, 220000, 7.8, 'EUR', 'Europe/Madrid',
 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200',
 '{"metro": "TMB Metro - 12 hat, T-Casual 10 yolculuk 11.35€", "bus": "TMB otobüsleri gece dahil çalışır", "tram": "Tramvia - sahil hattı", "bike": "Bicing paylaşımlı bisiklet sistemi 50€/yıl", "tip": "T-Jove trimestral kartı 25 yaş altı öğrenciler için en ekonomik seçenek"}',
 '{"rent": "800-1.300€/ay (28.000-45.000 TL)", "food": "200-350€/ay", "transport": "40-55€/ay", "utilities": "80-120€/ay", "phone": "15-25€/ay", "entertainment": "100-200€/ay", "total_estimate": "1.235-2.050€/ay"}',
 ARRAY['Siesta kültürü var, 14:00-17:00 arası birçok dükkan kapalıdır', 'Plajda değerli eşyalarınıza dikkat edin, yankesicilik yaygın', 'İspanyolca bilmek hayatı çok kolaylaştırır, Katalanca da yaygın', 'Mercat de la Boqueria turistik, yerel pazarları tercih edin', 'Gece hayatı genellikle gece 00:00''dan sonra başlar'],
 '{"police": "092 (yerel) / 091 (ulusal)", "ambulance": "061", "fire": "080", "embassy_tr": "+34 91 319 8064", "hospital": "Hospital Clínic de Barcelona"}',
 '{"erasmus": "NIE numarası alınmalıdır (Número de Identidad de Extranjero)", "residence_permit": "AB vatandaşları için kayıt yeterli, diğerleri vize gerekli", "documents": "NIE başvurusu için randevu: sede.administracionespublicas.gob.es"}',
 ARRAY['Akşam yemeği genellikle 21:00-22:00 arasında yenir', 'Selamlaşmada iki yanaktan öpme yaygındır', 'Katalanlar ve İspanyollar arasında kültürel hassasiyetler vardır', 'Pazar günleri çoğu dükkan kapalıdır']),

-- Lisbon
('c0000001-0000-4000-a000-000000000003', 'Lizbon', 'Portekiz', 'PT', 545796, 28000.00, 130000, 8.5, 'EUR', 'Europe/Lisbon',
 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200',
 '{"metro": "Metropolitano de Lisboa - 4 hat, Viva Viagem kartı", "bus": "Carris otobüsleri ve tramvaylar", "tram": "28 numaralı tramvay ikonik ama çok kalabalık", "train": "CP trenleri banliyö bağlantısı", "tip": "Navegante kartı aylık 40€ ile sınırsız ulaşım, öğrencilere indirimli"}',
 '{"rent": "600-1.000€/ay (22.000-35.000 TL)", "food": "150-250€/ay", "transport": "40€/ay (Navegante)", "utilities": "60-100€/ay", "phone": "10-20€/ay", "entertainment": "80-150€/ay", "total_estimate": "940-1.560€/ay"}',
 ARRAY['Lizbon Avrupa''nın en güvenli başkentlerinden biridir', 'Pastéis de Belém için Belém''e gidin, ama asıl lezzet yerel pastelaria''larda', 'Alfama ve Bairro Alto gece hayatı için popüler', 'Portekizce öğrenmek çok değerli, herkes İngilizce bilmez', 'Tejo nehri kıyısında ücretsiz açık hava etkinlikleri sık düzenlenir'],
 '{"police": "112 (genel acil)", "ambulance": "112", "fire": "112", "embassy_tr": "+351 21 352 1035", "hospital": "Hospital de Santa Maria"}',
 '{"erasmus": "SEF''e kayıt olunmalı (Serviço de Estrangeiros e Fronteiras)", "residence_permit": "AB vatandaşları kayıt, diğerleri oturma izni başvurusu", "documents": "NIF (vergi numarası) mutlaka alınmalı, banka hesabı için gerekli"}',
 ARRAY['Saudade kavramı Portekiz kültürünün özüdür - nostaljik bir özlem', 'Fado müziği UNESCO mirasıdır, Alfama''da canlı dinlenebilir', 'Yemeklerde bacalhau (tuzlu morina) çok yaygındır', 'Portekizliler dakik olmayabilir, 15 dakika tolerans normaldir']),

-- Berlin
('c0000001-0000-4000-a000-000000000004', 'Berlin', 'Almanya', 'DE', 3748148, 32000.00, 200000, 8.0, 'EUR', 'Europe/Berlin',
 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200',
 '{"metro": "U-Bahn - 10 hat, BVG aylık bilet", "sbahn": "S-Bahn - banliyö trenleri", "bus": "BVG otobüsleri 24 saat çalışır", "bike": "Bisiklet şehri, Swapfiets aylık kiralama 20€", "tip": "Semester Ticket ile 6 ay sınırsız ulaşım ~200€, üniversite kaydıyla otomatik gelir"}',
 '{"rent": "700-1.100€/ay (25.000-40.000 TL)", "food": "200-300€/ay", "transport": "0€ (Semester Ticket) veya 49€/ay (Deutschlandticket)", "utilities": "80-150€/ay", "phone": "10-15€/ay", "entertainment": "80-150€/ay", "total_estimate": "1.070-1.715€/ay"}',
 ARRAY['Anmeldung (adres kaydı) en önemli ilk iş, herşey buna bağlı', 'Nakit ödeme hâlâ çok yaygın, kartlı ödeme her yerde geçmez', 'Pazar günleri marketler kapalıdır, cumartesi alışveriş yapın', 'Kiralık ev bulmak çok zor, erken başlayın ve WG-Gesucht kullanın', 'Döner Kebab Berlin''in sokak yemeğidir, 5-7€ arası'],
 '{"police": "110", "ambulance": "112", "fire": "112", "embassy_tr": "+49 30 275 850", "hospital": "Charité - Universitätsmedizin Berlin"}',
 '{"erasmus": "Anmeldung sonrası ikâmet izni başvurusu yapılmalı", "residence_permit": "Ausländerbehörde''den randevu alınmalı, bekleme süresi uzun olabilir", "documents": "Anmeldung belgesi, sağlık sigortası, banka hesabı, pasaport"}',
 ARRAY['Almanlar dakikliğe çok önem verir, randevulara geç kalmayın', 'Pazar günleri gürültü yapmak yasaktır (Ruhetag)', 'Çöp ayrıştırma zorunludur: Restmüll, Biomüll, Papier, Gelber Sack', 'Bahşiş genellikle %5-10 arasındadır, yuvarlama yaygın']);

-- ============================================================
-- STEP 2: NEIGHBORHOODS (14 neighborhoods, 3-4 per city)
-- ============================================================

INSERT INTO neighborhoods (id, city_id, name, vibe, avg_rent, safety, image_url, description) VALUES

-- Istanbul neighborhoods
('b0000001-0000-4000-a000-000000000001', 'c0000001-0000-4000-a000-000000000001', 'Kadıköy', 'Canlı, bohemian, öğrenci dostu', 15000.00, 8.0,
 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800',
 'İstanbul''un Asya yakasındaki en popüler öğrenci semti. Barlar sokağı, sahil yürüyüşü, çarşı ve pazar kültürüyle renkli bir yaşam sunar.'),

('b0000001-0000-4000-a000-000000000002', 'c0000001-0000-4000-a000-000000000001', 'Beşiktaş', 'Merkezi, hareketli, üniversite bölgesi', 20000.00, 7.5,
 'https://images.unsplash.com/photo-1569174942822-4ad8e2c0b782?w=800',
 'Boğaziçi Üniversitesi''ne yakın, Avrupa yakasının en canlı semtlerinden biri. Çarşı bölgesi, balık pazarı ve sahil keyfi.'),

('b0000001-0000-4000-a000-000000000003', 'c0000001-0000-4000-a000-000000000001', 'Cihangir', 'Sanatsal, kozmopolit, trendy', 22000.00, 8.0,
 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800',
 'Taksim''e yürüme mesafesinde, kafeler ve sanat galerilerinin buluştuğu semitler. Boğaz manzarası ve kedi dostu sokaklar.'),

('b0000001-0000-4000-a000-000000000004', 'c0000001-0000-4000-a000-000000000001', 'Moda', 'Sakin, romantik, sahil', 18000.00, 8.5,
 'https://images.unsplash.com/photo-1568781269371-c2bedc77cc61?w=800',
 'Kadıköy''ün sahil bölgesi. Moda sahil yolu, bağımsız kitapçılar ve butik kafeler. Gün batımı izlemek için ideal.'),

-- Barcelona neighborhoods
('b0000001-0000-4000-a000-000000000005', 'c0000001-0000-4000-a000-000000000002', 'Gràcia', 'Bohem, sanatsal, yerel', 32000.00, 8.0,
 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800',
 'Barcelona''nın en otantik semti. Küçük meydanlar, bağımsız dükkanlar ve güçlü topluluk hissi. Üniversiteye yakın.'),

('b0000001-0000-4000-a000-000000000006', 'c0000001-0000-4000-a000-000000000002', 'Eixample', 'Modernist, merkezi, geniş caddeler', 38000.00, 7.5,
 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800',
 'Gaudí mimarisiyle ünlü semit. Düzenli sokak planı, alışveriş ve restoranlar. Şehrin tam merkezinde.'),

('b0000001-0000-4000-a000-000000000007', 'c0000001-0000-4000-a000-000000000002', 'Poble Sec', 'Uygun fiyatlı, lokal, Montjuïc etekleri', 28000.00, 7.0,
 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
 'Montjuïc tepesinin eteklerinde, Barcelona''nın en uygun fiyatlı merkezi semtlerinden biri. Tapas barları ve yerel atmosfer.'),

-- Lisbon neighborhoods
('b0000001-0000-4000-a000-000000000008', 'c0000001-0000-4000-a000-000000000003', 'Alfama', 'Tarihi, otantik, fado müziği', 25000.00, 7.5,
 'https://images.unsplash.com/photo-1548707309-dcebeab426c8?w=800',
 'Lizbon''un en eski mahallesi. Dar sokaklar, fado barları ve panoramik manzaralar. Turistik ama büyüleyici.'),

('b0000001-0000-4000-a000-000000000009', 'c0000001-0000-4000-a000-000000000003', 'Arroios', 'Çokkültürlü, öğrenci dostu, uygun fiyat', 22000.00, 7.0,
 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
 'Lizbon''un en kozmopolit semti. Çeşitli mutfaklar, uygun fiyatlar ve merkezi konum. Öğrenciler arasında popüler.'),

('b0000001-0000-4000-a000-000000000010', 'c0000001-0000-4000-a000-000000000003', 'Santos', 'Gece hayatı, nehir kenarı, genç', 27000.00, 7.5,
 'https://images.unsplash.com/photo-1513735492284-ecf18d81de76?w=800',
 'Tejo nehri kıyısında, canlı gece hayatı ve sahil barlarıyla ünlü. Erasmus öğrencilerinin buluşma noktası.'),

-- Berlin neighborhoods
('b0000001-0000-4000-a000-000000000011', 'c0000001-0000-4000-a000-000000000004', 'Kreuzberg', 'Alternatif, çokkültürlü, canlı', 30000.00, 7.0,
 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800',
 'Berlin''in en kozmopolit semti. Türk marketleri, street art, gece hayatı ve kanal kenarı yaşam. Öğrencilerin favorisi.'),

('b0000001-0000-4000-a000-000000000012', 'c0000001-0000-4000-a000-000000000004', 'Neukölln', 'Trendy, uygun fiyat, genç', 25000.00, 6.5,
 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=800',
 'Hızla değişen, genç ve yaratıcı bir semt. Uygun fiyatlı kafeler, barlar ve Türk/Arap marketleri.'),

('b0000001-0000-4000-a000-000000000013', 'c0000001-0000-4000-a000-000000000004', 'Friedrichshain', 'Parti, East Side Gallery, genç', 28000.00, 7.0,
 'https://images.unsplash.com/photo-1546726747-421c6d69c929?w=800',
 'East Side Gallery ve efsanevi gece kulüplerinin bulunduğu semt. Simon-Dach-Straße bar caddesi meşhur.'),

('b0000001-0000-4000-a000-000000000014', 'c0000001-0000-4000-a000-000000000004', 'Mitte', 'Merkezi, turistik, kültürel', 35000.00, 8.0,
 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800',
 'Berlin''in kalbi. Müzeler, tarihi yapılar ve Alexanderplatz. Merkezi ama daha pahalı.');

-- ============================================================
-- STEP 3: CITY FAQs (4-5 per city = ~18 total)
-- ============================================================

INSERT INTO city_faqs (city_id, question, answer, category, "order") VALUES

-- Istanbul FAQs
('c0000001-0000-4000-a000-000000000001', 'İstanbul''da öğrenci olarak aylık ne kadar harcama yapılır?', 'Ortalama aylık harcama kira dahil 19.000-36.000 TL arasındadır. Kira en büyük kalem olup 12.000-25.000 TL arasında değişir. Yemek 3.000-5.000 TL, ulaşım İstanbulkart ile 1.200 TL civarıdır.', 'maliyet', 1),
('c0000001-0000-4000-a000-000000000001', 'İstanbul''da en güvenli öğrenci semtleri nereler?', 'Kadıköy (Moda dahil), Beşiktaş ve Cihangir öğrenciler için en popüler ve güvenli semtlerdir. Kadıköy Asya yakasında, Beşiktaş ve Cihangir Avrupa yakasındadır.', 'konaklama', 2),
('c0000001-0000-4000-a000-000000000001', 'İstanbulkart nasıl alınır?', 'Metro istasyonları ve bazı büfelerde satılır. Kart ücreti yaklaşık 70 TL''dir. HES kodu ile kişiselleştirilip öğrenci indirimi uygulanabilir.', 'ulaşım', 3),
('c0000001-0000-4000-a000-000000000001', 'İstanbul''da yabancı öğrenci olarak sağlık sigortası gerekli mi?', 'Evet, ikamet izni başvurusu için geçerli sağlık sigortası zorunludur. SGK''ya kayıt olabilir veya özel sigorta yaptırabilirsiniz. Erasmus öğrencileri genellikle Avrupa Sağlık Kartı kullanır.', 'sağlık', 4),
('c0000001-0000-4000-a000-000000000001', 'İstanbul''da Türkçe bilmeden yaşanabilir mi?', 'Üniversite çevresinde ve turistik bölgelerde İngilizce ile idare edilebilir, ancak günlük yaşamda temel Türkçe bilmek hayatı çok kolaylaştırır. Tandem dil değişimi grupları çok yaygındır.', 'genel', 5),

-- Barcelona FAQs
('c0000001-0000-4000-a000-000000000002', 'Barcelona''da NIE numarası nasıl alınır?', 'NIE (Número de Identidad de Extranjero) için online randevu alınmalıdır. Gerekli belgeler: pasaport, başvuru formu (EX-15), kabul mektubu ve 12€ harç. İşlem 2-4 hafta sürebilir.', 'vize', 1),
('c0000001-0000-4000-a000-000000000002', 'Barcelona''da en uygun fiyatlı semtler?', 'Poble Sec, Sants ve Horta-Guinardó merkeze yakın ve nispeten uygun semtlerdir. Gràcia popüler ama fiyatlar artıyor. Eixample merkezi ama pahalı.', 'konaklama', 2),
('c0000001-0000-4000-a000-000000000002', 'Barcelona''da İspanyolca bilmek zorunlu mu?', 'Üniversitede İngilizce programlar var ama günlük yaşamda İspanyolca (ve Katalanca) bilmek çok avantajlı. Ücretsiz dil kursları belediye tarafından sunulmaktadır.', 'genel', 3),
('c0000001-0000-4000-a000-000000000002', 'Plajlar güvenli mi?', 'Barceloneta ve diğer plajlar genel olarak güvenlidir ancak yankesicilik yaygındır. Değerli eşyaları plaja götürmeyin veya nöbetleşe gözetleyin.', 'güvenlik', 4),

-- Lisbon FAQs
('c0000001-0000-4000-a000-000000000003', 'Lizbon''da NIF numarası nasıl alınır?', 'NIF (Número de Identificação Fiscal) vergi dairesinden (Finanças) alınır. Banka hesabı, telefon hattı ve kira sözleşmesi için gereklidir. Pasaport ve adres belgesiyle başvurulur.', 'vize', 1),
('c0000001-0000-4000-a000-000000000003', 'Lizbon''da toplu taşıma nasıl çalışır?', 'Navegante kartı aylık 40€ ile tüm toplu taşımayı kapsar (metro, otobüs, tram, tren). Öğrencilere indirim uygulanır. 28 numaralı tramvay turistik, günlük kullanım için metro daha pratik.', 'ulaşım', 2),
('c0000001-0000-4000-a000-000000000003', 'Lizbon güvenli bir şehir mi?', 'Lizbon, Avrupa''nın en güvenli başkentlerinden biridir. Yine de turistik bölgelerde (Alfama, Baixa) yankesiciliğe karşı dikkatli olun. Gece yalnız dolaşmak genel olarak güvenlidir.', 'güvenlik', 3),
('c0000001-0000-4000-a000-000000000003', 'Lizbon''da Erasmus topluluğu aktif mi?', 'Çok aktif! ESN Lisboa ve birçok Erasmus organizasyonu düzenli etkinlikler, geziler ve partiler düzenler. Erasmus Corner barı buluşma noktasıdır.', 'genel', 4),
('c0000001-0000-4000-a000-000000000003', 'Portekiz''de sağlık sistemi nasıl?', 'AB vatandaşları EHIC kartıyla kamu sağlık hizmetlerinden yararlanabilir. Diğerleri için özel sigorta önerilir. Acil servisler herkese açıktır.', 'sağlık', 5),

-- Berlin FAQs
('c0000001-0000-4000-a000-000000000004', 'Anmeldung nedir ve nasıl yapılır?', 'Anmeldung, Berlin''e taşındıktan sonraki 14 gün içinde yapılması gereken adres kaydıdır. Bürgeramt''tan randevu alınır. Kiracı onay belgesi (Wohnungsgeberbestätigung) gereklidir. Banka hesabı, telefon hattı ve her şey buna bağlıdır.', 'vize', 1),
('c0000001-0000-4000-a000-000000000004', 'Berlin''de ev bulmak gerçekten çok zor mu?', 'Evet, konut krizi ciddidir. WG-Gesucht.de, Immobilienscout24 ve Facebook grupları en yaygın kaynaklardır. En az 2-3 ay önceden aramaya başlayın. WG (Wohngemeinschaft = ev arkadaşlığı) en popüler seçenektir.', 'konaklama', 2),
('c0000001-0000-4000-a000-000000000004', 'Semester Ticket ne işe yarar?', 'Üniversiteye kayıt olduğunuzda otomatik olarak alırsınız (~200€/6 ay). Berlin AB ve Brandenburg bölgesinde sınırsız toplu taşıma sağlar. Ayrıca Deutschlandticket (49€/ay) alternatifi de var.', 'ulaşım', 3),
('c0000001-0000-4000-a000-000000000004', 'Berlin''de Türk toplumu var mı?', 'Berlin, Avrupa''nın en büyük Türk diasporasına ev sahipliği yapar. Kreuzberg ve Neukölln''de yoğun Türk nüfusu, marketler, restoranlar ve kültürel etkinlikler bulunur.', 'genel', 4);

-- ============================================================
-- STEP 4: PROFILES (20 users)
-- These will UPDATE existing profiles created by the auth trigger,
-- or INSERT if trigger was not active.
-- ============================================================

INSERT INTO profiles (id, email, full_name, avatar_url, phone, university, major, bio, home_city, home_country, exchange_city_id, languages, interests, is_host, is_mentor, is_verified, onboarding_completed) VALUES

('27d578d1-8263-42dd-a63c-081b58b395d3', 'deniz@kotwise.com', 'Deniz Aydın',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
 '+90 532 111 0001', 'İTÜ', 'Bilgisayar Mühendisliği',
 'İTÜ''de bilgisayar mühendisliği okuyorum, Barcelona''da Erasmus yapıyorum. Yazılım ve müzikle ilgileniyorum.',
 'İstanbul', 'Türkiye', 'c0000001-0000-4000-a000-000000000002',
 ARRAY['Türkçe', 'İngilizce', 'İspanyolca (Temel)'], ARRAY['Yazılım', 'Müzik', 'Futbol', 'Fotoğrafçılık'],
 false, false, true, true),

('a8add0f9-6394-45aa-a960-437d094c6501', 'elif@kotwise.com', 'Elif Kara',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
 '+90 533 111 0002', 'Boğaziçi Üniversitesi', 'İşletme',
 'Boğaziçi İşletme mezunuyum, Lizbon''da MBA yapıyorum. Seyahat ve gastronomi tutkunu.',
 'İstanbul', 'Türkiye', 'c0000001-0000-4000-a000-000000000003',
 ARRAY['Türkçe', 'İngilizce', 'Portekizce (Temel)'], ARRAY['Seyahat', 'Gastronomi', 'Yoga', 'Kitap'],
 false, false, true, true),

('e135fa88-6e69-4853-8614-9a128a786b68', 'can@kotwise.com', 'Can Özkan',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
 '+90 535 111 0003', 'ODTÜ', 'Makine Mühendisliği',
 'ODTÜ''de makine mühendisliği okuyorum, Berlin TU''da Erasmus. Bisiklet ve doğa sporları meraklısı.',
 'Ankara', 'Türkiye', 'c0000001-0000-4000-a000-000000000004',
 ARRAY['Türkçe', 'İngilizce', 'Almanca (Orta)'], ARRAY['Bisiklet', 'Doğa Sporları', 'Fotoğrafçılık', 'Müzik'],
 false, false, true, true),

('a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 'zeynep@kotwise.com', 'Zeynep Demir',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
 '+90 536 111 0004', 'Ege Üniversitesi', 'Mimarlık',
 'Mimarlık öğrencisiyim, Milano Politecnico''da değişim programındayım. Tasarım ve sanat ilgi alanlarım.',
 'İzmir', 'Türkiye', 'c0000001-0000-4000-a000-000000000002',
 ARRAY['Türkçe', 'İngilizce', 'İtalyanca (Temel)'], ARRAY['Mimarlık', 'Sanat', 'Tasarım', 'Resim'],
 false, false, true, true),

('8e6e1fee-9c40-433e-b8eb-6273b96b0d02', 'ayse@kotwise.com', 'Ayşe Yılmaz',
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
 '+90 537 111 0005', 'Marmara Üniversitesi', 'Hukuk',
 'İstanbul''da ev sahibi olarak öğrencilere yardımcı oluyorum. Kadıköy''de 3+1 dairemde oda kiralıyorum.',
 'İstanbul', 'Türkiye', NULL,
 ARRAY['Türkçe', 'İngilizce'], ARRAY['Hukuk', 'Kitap', 'Yemek Yapma', 'Bahçecilik'],
 true, false, true, true),

('b4ef7afc-fade-4258-9b97-e38b4fafe5a1', 'mehmet@kotwise.com', 'Mehmet Kaya',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
 '+90 538 111 0006', NULL, NULL,
 'İstanbul''da 2 daire kiralıyorum. Erasmus öğrencilerine ev bulma konusunda 5 yıllık tecrübem var.',
 'İstanbul', 'Türkiye', NULL,
 ARRAY['Türkçe', 'İngilizce', 'Almanca (Temel)'], ARRAY['Emlak', 'Seyahat', 'Futbol'],
 true, false, true, true),

('4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'maria@kotwise.com', 'Maria García',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
 '+34 611 111 0007', 'Universitat de Barcelona', 'Psikoloji',
 'Barcelona''da doğup büyüdüm, UB''de psikoloji okuyorum. Erasmus öğrencilerine ev ve rehberlik sağlıyorum.',
 'Barcelona', 'İspanya', NULL,
 ARRAY['İspanyolca', 'Katalanca', 'İngilizce', 'Türkçe (Temel)'], ARRAY['Psikoloji', 'Flamenco', 'Yüzme', 'Sinema'],
 true, false, true, true),

('8fd73484-9c91-426d-a5ca-5f5926c4529c', 'lucas@kotwise.com', 'Lucas Silva',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
 '+351 911 111 0008', 'Universidade de Lisboa', 'Tarih',
 'Lizbon''lu ev sahibiyim. Alfama''da restore edilmiş tarihi bir binada dairelerim var.',
 'Lizbon', 'Portekiz', NULL,
 ARRAY['Portekizce', 'İngilizce', 'İspanyolca'], ARRAY['Tarih', 'Fado', 'Sörf', 'Şarap'],
 true, false, true, true),

('1d5113ae-a798-42f3-8570-1641e3a62687', 'anna@kotwise.com', 'Anna Schmidt',
 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
 '+49 151 111 0009', 'Freie Universität Berlin', 'Uluslararası İlişkiler',
 'FU Berlin''de uluslararası ilişkiler okuyorum. Kreuzberg''de yaşıyorum ve şehri çok seviyorum.',
 'Berlin', 'Almanya', NULL,
 ARRAY['Almanca', 'İngilizce', 'Fransızca'], ARRAY['Politika', 'Fotoğrafçılık', 'Bisiklet', 'Tiyatro'],
 false, false, true, true),

('f98f2b0c-3ec6-4998-9231-8de8cd2d9db0', 'marco@kotwise.com', 'Marco Rossi',
 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face',
 '+39 333 111 0010', 'Politecnico di Milano', 'Endüstriyel Tasarım',
 'Milano Politecnico''da endüstriyel tasarım okuyorum. Tasarım ve İtalyan mutfağı konusunda yardımcı olabilirim.',
 'Milano', 'İtalya', NULL,
 ARRAY['İtalyanca', 'İngilizce'], ARRAY['Tasarım', 'Yemek', 'Moda', 'Futbol'],
 false, false, true, true),

('ffcba7da-3d0a-4547-98cf-c802572a7244', 'sophie@kotwise.com', 'Sophie Müller',
 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face',
 '+49 152 111 0011', 'TU Berlin', 'Çevre Mühendisliği',
 'TU Berlin''de çevre mühendisliği bitirdim, şimdi İstanbul''da staj yapıyorum. Sürdürülebilirlik tutkunu.',
 'Berlin', 'Almanya', 'c0000001-0000-4000-a000-000000000001',
 ARRAY['Almanca', 'İngilizce', 'Türkçe (Orta)'], ARRAY['Çevre', 'Sürdürülebilirlik', 'Yoga', 'Trekking'],
 false, false, true, true),

('c71fd4b3-dcfe-4f92-b517-2abbcea151bf', 'carlos@kotwise.com', 'Carlos Martínez',
 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face',
 '+34 622 111 0012', 'Universitat Politècnica de Catalunya', 'Mimarlık',
 'Barcelona''da mimarlık okudum, şimdi Gràcia''da dairem var. Öğrencilere uygun fiyatla oda kiralıyorum.',
 'Barcelona', 'İspanya', NULL,
 ARRAY['İspanyolca', 'Katalanca', 'İngilizce'], ARRAY['Mimarlık', 'Basketbol', 'Müzik', 'Seyahat'],
 true, false, true, true),

('5993993a-4131-4c6c-b52d-27d2030512b1', 'fatma@kotwise.com', 'Fatma Şahin',
 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face',
 '+90 539 111 0013', 'İstanbul Üniversitesi', 'Tıp',
 'İstanbul Üniversitesi Tıp Fakültesi mezunuyum. 3 yıl Erasmus deneyimim var, mentor olarak yardımcı oluyorum.',
 'İstanbul', 'Türkiye', NULL,
 ARRAY['Türkçe', 'İngilizce', 'Almanca', 'İspanyolca (Temel)'], ARRAY['Tıp', 'Mentorluk', 'Gönüllülük', 'Müzik'],
 false, true, true, true),

('1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb', 'pedro@kotwise.com', 'Pedro Santos',
 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&h=200&fit=crop&crop=face',
 '+351 912 111 0014', 'Instituto Superior Técnico', 'Yazılım Mühendisliği',
 'IST''de yazılım mühendisliği okudum. Arroios''da 2 odalı dairemde Erasmus öğrencilerine oda veriyorum.',
 'Lizbon', 'Portekiz', NULL,
 ARRAY['Portekizce', 'İngilizce', 'İspanyolca'], ARRAY['Yazılım', 'Sörf', 'Gitar', 'Fotoğrafçılık'],
 true, false, true, true),

('0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a', 'lena@kotwise.com', 'Lena Weber',
 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face',
 '+49 153 111 0015', 'Humboldt-Universität zu Berlin', 'Sosyoloji',
 'HU Berlin''de sosyoloji okuyorum. Kreuzberg''de WG''de yaşıyorum ve yeni insanlarla tanışmayı seviyorum.',
 'Berlin', 'Almanya', NULL,
 ARRAY['Almanca', 'İngilizce', 'İspanyolca (Orta)'], ARRAY['Sosyoloji', 'Müzik', 'Dans', 'Sinema'],
 false, false, true, true),

('ade644ae-6211-4482-b8d8-456881e4b1b8', 'mert@kotwise.com', 'Mert Acar',
 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=200&h=200&fit=crop&crop=face',
 '+90 540 111 0016', 'Hacettepe Üniversitesi', 'Elektrik-Elektronik Mühendisliği',
 'Hacettepe EE mezunuyum, Barcelona UPC''de yüksek lisans yapıyorum. Teknoloji ve müzik tutkunuyum.',
 'Ankara', 'Türkiye', 'c0000001-0000-4000-a000-000000000002',
 ARRAY['Türkçe', 'İngilizce', 'İspanyolca (Orta)'], ARRAY['Teknoloji', 'Müzik', 'Basketbol', 'Oyun'],
 false, false, true, true),

('c7cce9d9-765e-40bd-99b3-40bc64681cb2', 'giulia@kotwise.com', 'Giulia Romano',
 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop&crop=face',
 '+39 334 111 0017', 'Università Bocconi', 'Ekonomi',
 'Bocconi''de ekonomi okudum, Milano''da dairem var. Uluslararası öğrencilere ev ve şehir rehberliği sunuyorum.',
 'Milano', 'İtalya', NULL,
 ARRAY['İtalyanca', 'İngilizce', 'Fransızca'], ARRAY['Ekonomi', 'Moda', 'Yemek', 'Sanat'],
 true, false, true, true),

('231b92fb-bbc7-44b8-ae9c-f0c705255e71', 'emre@kotwise.com', 'Emre Yıldız',
 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=face',
 '+90 541 111 0018', 'Sabancı Üniversitesi', 'Yönetim Bilimleri',
 'Sabancı Yönetim Bilimleri mezunuyum. Beşiktaş''ta dairem var, öğrencilere oda kiralıyorum.',
 'İstanbul', 'Türkiye', NULL,
 ARRAY['Türkçe', 'İngilizce'], ARRAY['İş', 'Girişimcilik', 'Tenis', 'Seyahat'],
 true, false, true, true),

('b3684764-5ea7-4b10-b01a-8adba3932f0d', 'clara@kotwise.com', 'Clara Dubois',
 'https://images.unsplash.com/photo-1502767089025-6572583495f9?w=200&h=200&fit=crop&crop=face',
 '+33 611 111 0019', 'Sorbonne Université', 'Felsefe',
 'Sorbonne''da felsefe okudum, Barcelona''dan Berlin''e taşınıyorum. Kültürlerarası deneyimler biriktiriyorum.',
 'Barcelona', 'Fransa', 'c0000001-0000-4000-a000-000000000004',
 ARRAY['Fransızca', 'İspanyolca', 'İngilizce', 'Almanca (Temel)'], ARRAY['Felsefe', 'Edebiyat', 'Tiyatro', 'Şarap'],
 false, false, true, true),

('64feebd7-416d-4c27-bef9-b07190d0c87c', 'ali@kotwise.com', 'Ali Demir',
 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=200&h=200&fit=crop&crop=face',
 '+90 542 111 0020', 'Dokuz Eylül Üniversitesi', 'Turizm',
 'İzmir''de turizm okudum, Lizbon''da Erasmus yapıyorum. Sörf ve deniz sporlarıyla ilgileniyorum.',
 'İzmir', 'Türkiye', 'c0000001-0000-4000-a000-000000000003',
 ARRAY['Türkçe', 'İngilizce', 'Portekizce (Temel)'], ARRAY['Sörf', 'Turizm', 'Fotoğrafçılık', 'Yüzme'],
 false, false, true, true)

ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  phone = EXCLUDED.phone,
  university = EXCLUDED.university,
  major = EXCLUDED.major,
  bio = EXCLUDED.bio,
  home_city = EXCLUDED.home_city,
  home_country = EXCLUDED.home_country,
  exchange_city_id = EXCLUDED.exchange_city_id,
  languages = EXCLUDED.languages,
  interests = EXCLUDED.interests,
  is_host = EXCLUDED.is_host,
  is_mentor = EXCLUDED.is_mentor,
  is_verified = EXCLUDED.is_verified,
  onboarding_completed = EXCLUDED.onboarding_completed;

-- ============================================================
-- STEP 5: LISTINGS (25 listings across 4 cities)
-- ============================================================

INSERT INTO listings (id, host_id, city_id, neighborhood_id, title, description, address, latitude, longitude, price_per_month, currency, room_type, max_guests, is_furnished, is_verified, amenities, included_utilities, university_name, university_distance_km, is_active) VALUES

-- ISTANBUL LISTINGS (7)
('d0000001-0000-4000-a000-000000000001', '8e6e1fee-9c40-433e-b8eb-6273b96b0d02', 'c0000001-0000-4000-a000-000000000001', 'b0000001-0000-4000-a000-000000000001',
 'Kadıköy Moda - Deniz Manzaralı Oda',
 'Moda sahiline 5 dakika yürüme mesafesinde, aydınlık ve ferah bir oda. Ortak mutfak ve banyo. Tüm mobilyalar mevcut.',
 'Caferağa Mah. Moda Cad. No:42, Kadıköy', 40.9865, 29.0250,
 14000.00, 'TRY', 'single', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Klima', 'Balkon', 'Deniz Manzarası'],
 ARRAY['Su', 'İnternet', 'Doğalgaz'],
 'Marmara Üniversitesi', 3.5, true),

('d0000001-0000-4000-a000-000000000002', '8e6e1fee-9c40-433e-b8eb-6273b96b0d02', 'c0000001-0000-4000-a000-000000000001', 'b0000001-0000-4000-a000-000000000001',
 'Kadıköy Merkez - Geniş Stüdyo Daire',
 'Kadıköy çarşıya yürüme mesafesinde, tam donanımlı stüdyo daire. Metro durağına 3 dakika.',
 'Rasimpaşa Mah. Söğütlüçeşme Cad. No:18, Kadıköy', 40.9901, 29.0237,
 18000.00, 'TRY', 'studio', 2, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Bulaşık Makinesi', 'Klima', 'Otopark'],
 ARRAY['Su', 'İnternet'],
 'İTÜ', 8.0, true),

('d0000001-0000-4000-a000-000000000003', 'b4ef7afc-fade-4258-9b97-e38b4fafe5a1', 'c0000001-0000-4000-a000-000000000001', 'b0000001-0000-4000-a000-000000000002',
 'Beşiktaş - Boğaz Manzaralı Oda',
 'Boğaziçi Üniversitesi''ne 10 dakika mesafede, Boğaz manzaralı ferah oda. Sessiz ve güvenli bir sokakta.',
 'Sinanpaşa Mah. Beşiktaş Cad. No:55, Beşiktaş', 41.0431, 29.0054,
 22000.00, 'TRY', 'single', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Klima', 'Boğaz Manzarası', 'Güvenlik'],
 ARRAY['Su', 'İnternet', 'Doğalgaz', 'Elektrik'],
 'Boğaziçi Üniversitesi', 1.5, true),

('d0000001-0000-4000-a000-000000000004', 'b4ef7afc-fade-4258-9b97-e38b4fafe5a1', 'c0000001-0000-4000-a000-000000000001', 'b0000001-0000-4000-a000-000000000003',
 'Cihangir - Sanatsal Stüdyo',
 'Taksim''e 10 dakika, Cihangir''in kalbinde sanatsal bir stüdyo daire. Kafeler ve galeriler kapınızın önünde.',
 'Firuzağa Mah. Cihangir Cad. No:12, Beyoğlu', 41.0320, 28.9830,
 25000.00, 'TRY', 'studio', 2, true, false,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Klima', 'Şehir Manzarası', 'Asansör'],
 ARRAY['Su', 'İnternet'],
 'İstanbul Üniversitesi', 4.0, true),

('d0000001-0000-4000-a000-000000000005', '231b92fb-bbc7-44b8-ae9c-f0c705255e71', 'c0000001-0000-4000-a000-000000000001', 'b0000001-0000-4000-a000-000000000002',
 'Beşiktaş - Öğrenci Evi Paylaşımlı Oda',
 'Beşiktaş çarşıya 5 dakika, 3 öğrencinin yaşadığı dairede paylaşımlı oda. Uygun fiyat, harika konum.',
 'Abbasağa Mah. Süleyman Seba Cad. No:88, Beşiktaş', 41.0448, 29.0012,
 12000.00, 'TRY', 'shared', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Ortak Mutfak', 'Balkon'],
 ARRAY['Su', 'İnternet', 'Doğalgaz'],
 'Boğaziçi Üniversitesi', 2.0, true),

('d0000001-0000-4000-a000-000000000006', '231b92fb-bbc7-44b8-ae9c-f0c705255e71', 'c0000001-0000-4000-a000-000000000001', 'b0000001-0000-4000-a000-000000000004',
 'Moda Sahil - Romantik Çatı Katı',
 'Moda sahil yoluna bakan çatı katı dairesi. Terastan Adalar manzarası, huzurlu bir ortam.',
 'Caferağa Mah. Moda İskelesi Yolu No:7, Kadıköy', 40.9810, 29.0280,
 20000.00, 'TRY', 'apartment', 2, true, false,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Teras', 'Deniz Manzarası', 'Klima'],
 ARRAY['Su', 'İnternet'],
 'Marmara Üniversitesi', 4.0, true),

('d0000001-0000-4000-a000-000000000007', '8e6e1fee-9c40-433e-b8eb-6273b96b0d02', 'c0000001-0000-4000-a000-000000000001', 'b0000001-0000-4000-a000-000000000001',
 'Kadıköy - Ekonomik Öğrenci Odası',
 'Kadıköy metrosuna 2 dakika, sessiz bir dairede ekonomik oda. Yeni başlayanlar için ideal.',
 'Osmanağa Mah. Bahariye Cad. No:92, Kadıköy', 40.9879, 29.0289,
 13000.00, 'TRY', 'single', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Klima'],
 ARRAY['Su', 'İnternet'],
 'Marmara Üniversitesi', 2.0, true),

-- BARCELONA LISTINGS (6)
('d0000001-0000-4000-a000-000000000008', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'c0000001-0000-4000-a000-000000000002', 'b0000001-0000-4000-a000-000000000005',
 'Gràcia - Güneşli Balkonlu Oda',
 'Gràcia''nın kalbinde, Plaza del Sol''a yürüme mesafesinde güneşli oda. Ev sahibi Maria''dan yerel ipuçları bonus.',
 'Carrer de Verdi 45, Gràcia', 41.4027, 2.1570,
 30000.00, 'TRY', 'single', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Balkon', 'Güneşli', 'Merkezi Konum'],
 ARRAY['Su', 'İnternet', 'Elektrik'],
 'Universitat de Barcelona', 2.0, true),

('d0000001-0000-4000-a000-000000000009', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'c0000001-0000-4000-a000-000000000002', 'b0000001-0000-4000-a000-000000000005',
 'Gràcia - Bohem Stüdyo Daire',
 'Sanatsal bir semtte, bağımsız stüdyo daire. Küçük ama fonksiyonel, kendi mutfak ve banyonuz var.',
 'Carrer de Torrent de l''Olla 78, Gràcia', 41.4015, 2.1558,
 38000.00, 'TRY', 'studio', 2, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Klima', 'Mutfak', 'Kendi Banyo'],
 ARRAY['Su', 'İnternet', 'Elektrik', 'Gaz'],
 'Universitat de Barcelona', 2.5, true),

('d0000001-0000-4000-a000-000000000010', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf', 'c0000001-0000-4000-a000-000000000002', 'b0000001-0000-4000-a000-000000000006',
 'Eixample - Modernist Dairede Oda',
 'Gaudí''nin eserlerine komşu, yüksek tavanlı modernist bir dairede geniş oda. Metro durağına 1 dakika.',
 'Carrer de Mallorca 320, Eixample', 41.3970, 2.1680,
 35000.00, 'TRY', 'single', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Klima', 'Yüksek Tavan', 'Metro Yakını', 'Asansör'],
 ARRAY['Su', 'İnternet'],
 'UPC', 3.0, true),

('d0000001-0000-4000-a000-000000000011', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf', 'c0000001-0000-4000-a000-000000000002', 'b0000001-0000-4000-a000-000000000007',
 'Poble Sec - Uygun Fiyatlı Paylaşımlı Oda',
 'Montjuïc tepesinin eteklerinde, 3 kişilik paylaşımlı dairede oda. Barcelona''nın en uygun fiyatlı merkezi semtlerinden.',
 'Carrer de Blai 22, Poble Sec', 41.3740, 2.1630,
 28000.00, 'TRY', 'shared', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Ortak Teras', 'Ortak Mutfak'],
 ARRAY['Su', 'İnternet', 'Elektrik'],
 'UPC', 4.0, true),

('d0000001-0000-4000-a000-000000000012', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'c0000001-0000-4000-a000-000000000002', 'b0000001-0000-4000-a000-000000000006',
 'Eixample - Lüks 2+1 Daire',
 'Passeig de Gràcia yakınında, tamamen yenilenmiş lüks daire. Kısa süreli konaklama da mümkün.',
 'Carrer de Provença 285, Eixample', 41.3952, 2.1645,
 45000.00, 'TRY', 'apartment', 3, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Bulaşık Makinesi', 'Klima', 'Asansör', 'Güvenlik', 'Teras'],
 ARRAY['Su', 'İnternet', 'Elektrik', 'Gaz'],
 'Universitat de Barcelona', 1.5, true),

('d0000001-0000-4000-a000-000000000013', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf', 'c0000001-0000-4000-a000-000000000002', 'b0000001-0000-4000-a000-000000000007',
 'Poble Sec - Sanatçı Çatı Katı',
 'Montjuïc manzaralı çatı katı stüdyo. Aydınlık, ilham verici ve sanatsal bir ortam.',
 'Carrer de Tapioles 15, Poble Sec', 41.3725, 2.1610,
 32000.00, 'TRY', 'studio', 1, true, false,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Teras', 'Manzara', 'Doğal Işık'],
 ARRAY['Su', 'İnternet'],
 'UPC', 3.5, true),

-- LISBON LISTINGS (6)
('d0000001-0000-4000-a000-000000000014', '8fd73484-9c91-426d-a5ca-5f5926c4529c', 'c0000001-0000-4000-a000-000000000003', 'b0000001-0000-4000-a000-000000000008',
 'Alfama - Tarihi Bina, Manzaralı Oda',
 'Alfama''nın dar sokaklarında, restore edilmiş tarihi binada Tejo nehri manzaralı oda. Fado barlarına yürüme mesafesi.',
 'Rua de São Miguel 28, Alfama', 38.7120, -9.1310,
 26000.00, 'TRY', 'single', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Nehir Manzarası', 'Tarihi Bina', 'Merkezi'],
 ARRAY['Su', 'İnternet', 'Elektrik'],
 'Universidade de Lisboa', 3.0, true),

('d0000001-0000-4000-a000-000000000015', '8fd73484-9c91-426d-a5ca-5f5926c4529c', 'c0000001-0000-4000-a000-000000000003', 'b0000001-0000-4000-a000-000000000008',
 'Alfama - Azulejo Dekorlu Stüdyo',
 'Geleneksel Portekiz çinileriyle süslü, küçük ama şirin stüdyo daire. Otantik Lizbon deneyimi.',
 'Rua da Regueira 14, Alfama', 38.7112, -9.1325,
 30000.00, 'TRY', 'studio', 2, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Klima', 'Azulejo Dekor', 'Mutfak'],
 ARRAY['Su', 'İnternet', 'Elektrik', 'Gaz'],
 'Universidade de Lisboa', 3.5, true),

('d0000001-0000-4000-a000-000000000016', '1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb', 'c0000001-0000-4000-a000-000000000003', 'b0000001-0000-4000-a000-000000000009',
 'Arroios - Öğrenci Dostu Oda',
 'Metro durağına 2 dakika, süpermarkete 1 dakika. Erasmus öğrencileri için ideal, ev sahibi Pedro çok yardımsever.',
 'Avenida Almirante Reis 120, Arroios', 38.7260, -9.1370,
 22000.00, 'TRY', 'single', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Metro Yakını', 'Market Yakını'],
 ARRAY['Su', 'İnternet'],
 'Instituto Superior Técnico', 2.0, true),

('d0000001-0000-4000-a000-000000000017', '1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb', 'c0000001-0000-4000-a000-000000000003', 'b0000001-0000-4000-a000-000000000009',
 'Arroios - Paylaşımlı Erasmus Evi',
 '4 Erasmus öğrencisinin yaşadığı dairede paylaşımlı oda. Sosyal ortam ve uygun fiyat.',
 'Rua Morais Soares 45, Arroios', 38.7245, -9.1355,
 18000.00, 'TRY', 'shared', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Ortak Mutfak', 'Ortak Salon', 'Balkon'],
 ARRAY['Su', 'İnternet', 'Elektrik'],
 'Instituto Superior Técnico', 2.5, true),

('d0000001-0000-4000-a000-000000000018', '8fd73484-9c91-426d-a5ca-5f5926c4529c', 'c0000001-0000-4000-a000-000000000003', 'b0000001-0000-4000-a000-000000000010',
 'Santos - Nehir Kenarı Daire',
 'Tejo nehri kıyısında, gece hayatına yakın tam donanımlı daire. Gün batımları unutulmaz.',
 'Rua de Santos-o-Velho 18, Santos', 38.7070, -9.1520,
 35000.00, 'TRY', 'apartment', 2, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Bulaşık Makinesi', 'Klima', 'Nehir Manzarası', 'Teras'],
 ARRAY['Su', 'İnternet', 'Elektrik', 'Gaz'],
 'Universidade de Lisboa', 4.0, true),

('d0000001-0000-4000-a000-000000000019', '1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb', 'c0000001-0000-4000-a000-000000000003', 'b0000001-0000-4000-a000-000000000010',
 'Santos - Ekonomik Çatı Katı',
 'Santos gece hayatına yürüme mesafesinde, küçük ama şirin çatı katı odası. Bütçe dostu seçenek.',
 'Rua do Poço dos Negros 30, Santos', 38.7085, -9.1490,
 24000.00, 'TRY', 'single', 1, true, false,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Çatı Terası'],
 ARRAY['Su', 'İnternet'],
 'Universidade de Lisboa', 3.5, true),

-- BERLIN LISTINGS (6)
('d0000001-0000-4000-a000-000000000020', '1d5113ae-a798-42f3-8570-1641e3a62687', 'c0000001-0000-4000-a000-000000000004', 'b0000001-0000-4000-a000-000000000011',
 'Kreuzberg - Kanal Kenarı WG Odası',
 'Landwehrkanal kenarında, 3 kişilik WG''de geniş oda. Kreuzberg''in en güzel köşesinde, bisiklet dostu.',
 'Paul-Lincke-Ufer 22, Kreuzberg', 52.4955, 13.4230,
 28000.00, 'TRY', 'single', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Kanal Manzarası', 'Bisiklet Deposu', 'Ortak Mutfak'],
 ARRAY['Su', 'İnternet', 'Isıtma'],
 'Freie Universität Berlin', 5.0, true),

('d0000001-0000-4000-a000-000000000021', '1d5113ae-a798-42f3-8570-1641e3a62687', 'c0000001-0000-4000-a000-000000000004', 'b0000001-0000-4000-a000-000000000011',
 'Kreuzberg - Sanatçı Loftu',
 'Eski fabrika binasında dönüştürülmüş loft daire. Yüksek tavan, geniş pencereler ve endüstriyel şıklık.',
 'Oranienstraße 185, Kreuzberg', 52.5020, 13.4180,
 38000.00, 'TRY', 'studio', 2, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Yüksek Tavan', 'Endüstriyel Tasarım', 'Klima'],
 ARRAY['Su', 'İnternet', 'Isıtma', 'Elektrik'],
 'TU Berlin', 6.0, true),

('d0000001-0000-4000-a000-000000000022', '1d5113ae-a798-42f3-8570-1641e3a62687', 'c0000001-0000-4000-a000-000000000004', 'b0000001-0000-4000-a000-000000000012',
 'Neukölln - Uygun Fiyatlı Öğrenci Odası',
 'Neukölln''ün trendy bölgesinde, uygun fiyatlı oda. Türk marketleri ve kafeler kapınızın önünde.',
 'Weserstraße 40, Neukölln', 52.4870, 13.4330,
 25000.00, 'TRY', 'single', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Ortak Mutfak', 'Balkon'],
 ARRAY['Su', 'İnternet', 'Isıtma'],
 'Humboldt-Universität', 7.0, true),

('d0000001-0000-4000-a000-000000000023', '1d5113ae-a798-42f3-8570-1641e3a62687', 'c0000001-0000-4000-a000-000000000004', 'b0000001-0000-4000-a000-000000000013',
 'Friedrichshain - Party Bölgesi Stüdyo',
 'Simon-Dach-Straße''ye 3 dakika, East Side Gallery''ye yürüme mesafesi. Gece hayatı sevenler için ideal.',
 'Boxhagener Straße 55, Friedrichshain', 52.5120, 13.4540,
 32000.00, 'TRY', 'studio', 2, true, false,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Klima', 'Ses Yalıtımı', 'Merkezi Konum'],
 ARRAY['Su', 'İnternet', 'Isıtma'],
 'TU Berlin', 5.5, true),

('d0000001-0000-4000-a000-000000000024', '1d5113ae-a798-42f3-8570-1641e3a62687', 'c0000001-0000-4000-a000-000000000004', 'b0000001-0000-4000-a000-000000000014',
 'Mitte - Merkezi Konum, Lüks Daire',
 'Alexanderplatz''a 10 dakika, tamamen yenilenmiş lüks daire. İş ve akademi için mükemmel konum.',
 'Torstraße 120, Mitte', 52.5295, 13.4010,
 40000.00, 'TRY', 'apartment', 3, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Bulaşık Makinesi', 'Klima', 'Asansör', 'Güvenlik', 'Otopark'],
 ARRAY['Su', 'İnternet', 'Isıtma', 'Elektrik'],
 'Humboldt-Universität', 2.0, true),

('d0000001-0000-4000-a000-000000000025', '1d5113ae-a798-42f3-8570-1641e3a62687', 'c0000001-0000-4000-a000-000000000004', 'b0000001-0000-4000-a000-000000000012',
 'Neukölln - Paylaşımlı WG Odası',
 'Tempelhofer Feld''e yakın, 4 kişilik uluslararası WG''de oda. Çok kültürlü ortam.',
 'Hermannstraße 150, Neukölln', 52.4800, 13.4310,
 22000.00, 'TRY', 'shared', 1, true, true,
 ARRAY['WiFi', 'Çamaşır Makinesi', 'Ortak Mutfak', 'Bahçe', 'Bisiklet Deposu'],
 ARRAY['Su', 'İnternet', 'Isıtma'],
 'FU Berlin', 6.5, true);

-- ============================================================
-- STEP 6: LISTING IMAGES (3-5 per listing)
-- ============================================================

INSERT INTO listing_images (listing_id, url, "order", is_cover) VALUES

-- Istanbul listings images
('d0000001-0000-4000-a000-000000000001', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 0, true),
('d0000001-0000-4000-a000-000000000001', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1, false),
('d0000001-0000-4000-a000-000000000001', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800', 2, false),

('d0000001-0000-4000-a000-000000000002', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', 0, true),
('d0000001-0000-4000-a000-000000000002', 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800', 1, false),
('d0000001-0000-4000-a000-000000000002', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 2, false),
('d0000001-0000-4000-a000-000000000002', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800', 3, false),

('d0000001-0000-4000-a000-000000000003', 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800', 0, true),
('d0000001-0000-4000-a000-000000000003', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800', 1, false),
('d0000001-0000-4000-a000-000000000003', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', 2, false),

('d0000001-0000-4000-a000-000000000004', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 0, true),
('d0000001-0000-4000-a000-000000000004', 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800', 1, false),
('d0000001-0000-4000-a000-000000000004', 'https://images.unsplash.com/photo-1560448205-17d3a46c84de?w=800', 2, false),
('d0000001-0000-4000-a000-000000000004', 'https://images.unsplash.com/photo-1586105251261-72a756497a31?w=800', 3, false),

('d0000001-0000-4000-a000-000000000005', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 0, true),
('d0000001-0000-4000-a000-000000000005', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', 1, false),
('d0000001-0000-4000-a000-000000000005', 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800', 2, false),

('d0000001-0000-4000-a000-000000000006', 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800', 0, true),
('d0000001-0000-4000-a000-000000000006', 'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800', 1, false),
('d0000001-0000-4000-a000-000000000006', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800', 2, false),
('d0000001-0000-4000-a000-000000000006', 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800', 3, false),

('d0000001-0000-4000-a000-000000000007', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 0, true),
('d0000001-0000-4000-a000-000000000007', 'https://images.unsplash.com/photo-1560185008-b033106af5c8?w=800', 1, false),
('d0000001-0000-4000-a000-000000000007', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 2, false),

-- Barcelona listings images
('d0000001-0000-4000-a000-000000000008', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 0, true),
('d0000001-0000-4000-a000-000000000008', 'https://images.unsplash.com/photo-1560185127-bdf73c36e6a5?w=800', 1, false),
('d0000001-0000-4000-a000-000000000008', 'https://images.unsplash.com/photo-1585128993280-9456c19c987e?w=800', 2, false),

('d0000001-0000-4000-a000-000000000009', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 0, true),
('d0000001-0000-4000-a000-000000000009', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', 1, false),
('d0000001-0000-4000-a000-000000000009', 'https://images.unsplash.com/photo-1560185007-c43e99ee25d1?w=800', 2, false),

('d0000001-0000-4000-a000-000000000010', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800', 0, true),
('d0000001-0000-4000-a000-000000000010', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800', 1, false),
('d0000001-0000-4000-a000-000000000010', 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800', 2, false),
('d0000001-0000-4000-a000-000000000010', 'https://images.unsplash.com/photo-1560185127-6a1a6e43a155?w=800', 3, false),

('d0000001-0000-4000-a000-000000000011', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800', 0, true),
('d0000001-0000-4000-a000-000000000011', 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800', 1, false),
('d0000001-0000-4000-a000-000000000011', 'https://images.unsplash.com/photo-1560448075-57d0285e52cf?w=800', 2, false),

('d0000001-0000-4000-a000-000000000012', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 0, true),
('d0000001-0000-4000-a000-000000000012', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1, false),
('d0000001-0000-4000-a000-000000000012', 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800', 2, false),
('d0000001-0000-4000-a000-000000000012', 'https://images.unsplash.com/photo-1600566753376-12c8ab7c17a0?w=800', 3, false),
('d0000001-0000-4000-a000-000000000012', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 4, false),

('d0000001-0000-4000-a000-000000000013', 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800', 0, true),
('d0000001-0000-4000-a000-000000000013', 'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800', 1, false),
('d0000001-0000-4000-a000-000000000013', 'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800', 2, false),

-- Lisbon listings images
('d0000001-0000-4000-a000-000000000014', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 0, true),
('d0000001-0000-4000-a000-000000000014', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 1, false),
('d0000001-0000-4000-a000-000000000014', 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800', 2, false),

('d0000001-0000-4000-a000-000000000015', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800', 0, true),
('d0000001-0000-4000-a000-000000000015', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800', 1, false),
('d0000001-0000-4000-a000-000000000015', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 2, false),
('d0000001-0000-4000-a000-000000000015', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 3, false),

('d0000001-0000-4000-a000-000000000016', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 0, true),
('d0000001-0000-4000-a000-000000000016', 'https://images.unsplash.com/photo-1560448205-17d3a46c84de?w=800', 1, false),
('d0000001-0000-4000-a000-000000000016', 'https://images.unsplash.com/photo-1586105251261-72a756497a31?w=800', 2, false),

('d0000001-0000-4000-a000-000000000017', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 0, true),
('d0000001-0000-4000-a000-000000000017', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', 1, false),
('d0000001-0000-4000-a000-000000000017', 'https://images.unsplash.com/photo-1560185008-b033106af5c8?w=800', 2, false),

('d0000001-0000-4000-a000-000000000018', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 0, true),
('d0000001-0000-4000-a000-000000000018', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1, false),
('d0000001-0000-4000-a000-000000000018', 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800', 2, false),
('d0000001-0000-4000-a000-000000000018', 'https://images.unsplash.com/photo-1600566753376-12c8ab7c17a0?w=800', 3, false),

('d0000001-0000-4000-a000-000000000019', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', 0, true),
('d0000001-0000-4000-a000-000000000019', 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800', 1, false),
('d0000001-0000-4000-a000-000000000019', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800', 2, false),

-- Berlin listings images
('d0000001-0000-4000-a000-000000000020', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 0, true),
('d0000001-0000-4000-a000-000000000020', 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800', 1, false),
('d0000001-0000-4000-a000-000000000020', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', 2, false),
('d0000001-0000-4000-a000-000000000020', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 3, false),

('d0000001-0000-4000-a000-000000000021', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800', 0, true),
('d0000001-0000-4000-a000-000000000021', 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800', 1, false),
('d0000001-0000-4000-a000-000000000021', 'https://images.unsplash.com/photo-1560185127-6a1a6e43a155?w=800', 2, false),

('d0000001-0000-4000-a000-000000000022', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', 0, true),
('d0000001-0000-4000-a000-000000000022', 'https://images.unsplash.com/photo-1560185007-c43e99ee25d1?w=800', 1, false),
('d0000001-0000-4000-a000-000000000022', 'https://images.unsplash.com/photo-1560448075-57d0285e52cf?w=800', 2, false),

('d0000001-0000-4000-a000-000000000023', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 0, true),
('d0000001-0000-4000-a000-000000000023', 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800', 1, false),
('d0000001-0000-4000-a000-000000000023', 'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800', 2, false),

('d0000001-0000-4000-a000-000000000024', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 0, true),
('d0000001-0000-4000-a000-000000000024', 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800', 1, false),
('d0000001-0000-4000-a000-000000000024', 'https://images.unsplash.com/photo-1600566753376-12c8ab7c17a0?w=800', 2, false),
('d0000001-0000-4000-a000-000000000024', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 3, false),
('d0000001-0000-4000-a000-000000000024', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 4, false),

('d0000001-0000-4000-a000-000000000025', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800', 0, true),
('d0000001-0000-4000-a000-000000000025', 'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800', 1, false),
('d0000001-0000-4000-a000-000000000025', 'https://images.unsplash.com/photo-1560185127-bdf73c36e6a5?w=800', 2, false);

-- ============================================================
-- STEP 7: REVIEWS (30 reviews)
-- Note: The trigger will auto-update listing rating and review_count
-- ============================================================

INSERT INTO reviews (id, listing_id, user_id, rating, comment, created_at) VALUES

-- Reviews for Istanbul listings
('10000001-0000-4000-a000-000000000001', 'd0000001-0000-4000-a000-000000000001', 'ffcba7da-3d0a-4547-98cf-c802572a7244', 4.50,
 'Moda''da harika bir konum! Deniz manzarası gerçekten var ve Ayşe Hanım çok yardımsever. Tek eksik: sıcak su bazen kesiliyordu.', '2026-01-15 10:00:00+03'),

('10000001-0000-4000-a000-000000000002', 'd0000001-0000-4000-a000-000000000001', 'e135fa88-6e69-4853-8614-9a128a786b68', 4.80,
 'Kadıköy''de en iyi adreslerden biri. Sahile çok yakın, mobilyalar yeni ve temiz. Kesinlikle tavsiye ederim.', '2026-02-01 14:30:00+03'),

('10000001-0000-4000-a000-000000000003', 'd0000001-0000-4000-a000-000000000002', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 4.20,
 'Stüdyo çok fonksiyonel, metroyla her yere ulaşabiliyorsunuz. Fiyat-performans oranı iyi.', '2026-01-20 09:15:00+03'),

('10000001-0000-4000-a000-000000000004', 'd0000001-0000-4000-a000-000000000003', '27d578d1-8263-42dd-a63c-081b58b395d3', 5.00,
 'Boğaz manzarası muhteşem! Mehmet Bey çok ilgili, taşınırken bile yardım etti. Boğaziçi Üni''ye çok yakın.', '2026-02-10 16:00:00+03'),

('10000001-0000-4000-a000-000000000005', 'd0000001-0000-4000-a000-000000000003', 'a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 4.70,
 'Sessiz sokak, temiz daire ve harika konum. Tek sorun park yeri bulmanın zorluğu ama zaten metroya yakın.', '2026-02-15 11:45:00+03'),

('10000001-0000-4000-a000-000000000006', 'd0000001-0000-4000-a000-000000000005', '1d5113ae-a798-42f3-8570-1641e3a62687', 4.00,
 'Paylaşımlı oda beklentimi karşıladı. Oda arkadaşlarım çok tatlıydı. Fiyat İstanbul için çok uygun.', '2026-01-25 13:20:00+03'),

('10000001-0000-4000-a000-000000000007', 'd0000001-0000-4000-a000-000000000005', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a', 3.80,
 'Konum harika ama paylaşımlı banyo bazen sorun olabiliyor. Yine de fiyat düşünülünce iyi bir seçenek.', '2026-02-05 08:30:00+03'),

('10000001-0000-4000-a000-000000000008', 'd0000001-0000-4000-a000-000000000007', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 4.30,
 'Ekonomik bir seçenek arıyorsanız ideal. Metroyla her yere ulaşım var. Daire temiz ve düzenli.', '2026-02-20 15:10:00+03'),

-- Reviews for Barcelona listings
('10000001-0000-4000-a000-000000000009', 'd0000001-0000-4000-a000-000000000008', '27d578d1-8263-42dd-a63c-081b58b395d3', 4.90,
 'Maria harika bir ev sahibi! Barcelona hakkında o kadar çok şey öğrettim ki. Gràcia''da yaşamak muhteşem.', '2026-01-10 12:00:00+01'),

('10000001-0000-4000-a000-000000000010', 'd0000001-0000-4000-a000-000000000008', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 4.60,
 'Balkon güneşli, semt çok canlı. Plaza del Sol''da akşam keyfi yapılabilir. Tavsiye ederim.', '2026-02-12 10:30:00+01'),

('10000001-0000-4000-a000-000000000011', 'd0000001-0000-4000-a000-000000000008', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 4.50,
 'Gràcia''nın en güzel sokaklarından birinde. Maria yerel restoranları ve gizli mekanları gösterdi. Enfes deneyim.', '2026-03-01 14:00:00+01'),

('10000001-0000-4000-a000-000000000012', 'd0000001-0000-4000-a000-000000000009', 'a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 4.40,
 'Küçük ama her şey düşünülmüş. Kendi mutfağınız ve banyonuz olması büyük artı. Semt çok güzel.', '2026-01-28 16:20:00+01'),

('10000001-0000-4000-a000-000000000013', 'd0000001-0000-4000-a000-000000000010', '27d578d1-8263-42dd-a63c-081b58b395d3', 4.70,
 'Yüksek tavanlı modernist daire gerçekten etkileyici! Sagrada Familia''ya yürüyerek gidebiliyorsunuz.', '2026-02-18 09:45:00+01'),

('10000001-0000-4000-a000-000000000014', 'd0000001-0000-4000-a000-000000000010', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 4.30,
 'Eixample''da yaşamak ayrıcalık. Metro durağı kapının önünde. Carlos çok düzgün bir ev sahibi.', '2026-03-05 11:00:00+01'),

('10000001-0000-4000-a000-000000000015', 'd0000001-0000-4000-a000-000000000011', 'e135fa88-6e69-4853-8614-9a128a786b68', 3.90,
 'Poble Sec uygun fiyatlı ve merkezi. Paylaşımlı oda biraz küçük ama terastaki akşamlar her şeyi telafi ediyor.', '2026-01-22 13:15:00+01'),

('10000001-0000-4000-a000-000000000016', 'd0000001-0000-4000-a000-000000000012', 'a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 5.00,
 'Lüks daire inanılmaz! Her detay düşünülmüş. Passeig de Gràcia''ya 2 dakika. Erasmus dönemimin en güzel evi.', '2026-02-22 17:30:00+01'),

-- Reviews for Lisbon listings
('10000001-0000-4000-a000-000000000017', 'd0000001-0000-4000-a000-000000000014', 'a8add0f9-6394-45aa-a960-437d094c6501', 4.60,
 'Alfama''da tarihi binada yaşamak büyülü bir deneyim! Tejo manzarası muhteşem. Lucas çok nazik bir ev sahibi.', '2026-01-18 10:00:00+00'),

('10000001-0000-4000-a000-000000000018', 'd0000001-0000-4000-a000-000000000014', '64feebd7-416d-4c27-bef9-b07190d0c87c', 4.40,
 'Konum eşsiz, fado barlarına yürüyerek gidebiliyorsunuz. Tek zorluk: tepedeki sokaklar çok dik!', '2026-02-08 14:20:00+00'),

('10000001-0000-4000-a000-000000000019', 'd0000001-0000-4000-a000-000000000015', 'a8add0f9-6394-45aa-a960-437d094c6501', 4.80,
 'Azulejo dekorlu stüdyo fotoğraflardan bile güzel! Otantik Lizbon atmosferi, her şey dahil fiyat.', '2026-02-25 09:30:00+00'),

('10000001-0000-4000-a000-000000000020', 'd0000001-0000-4000-a000-000000000016', '64feebd7-416d-4c27-bef9-b07190d0c87c', 4.50,
 'Pedro harika bir ev sahibi! Metroyla her yere gidebiliyorsunuz. Arroios çok kozmopolit bir semt.', '2026-01-30 16:45:00+00'),

('10000001-0000-4000-a000-000000000021', 'd0000001-0000-4000-a000-000000000016', 'a8add0f9-6394-45aa-a960-437d094c6501', 4.20,
 'Öğrenci dostu fiyat ve konum. Market, metro her şey çok yakın. Oda biraz küçük ama yeterli.', '2026-02-15 11:10:00+00'),

('10000001-0000-4000-a000-000000000022', 'd0000001-0000-4000-a000-000000000017', '64feebd7-416d-4c27-bef9-b07190d0c87c', 4.10,
 'Erasmus evi atmosferi harika! 4 farklı ülkeden arkadaşlarla yaşamak çok eğlenceli. Fiyat çok uygun.', '2026-03-10 08:00:00+00'),

('10000001-0000-4000-a000-000000000023', 'd0000001-0000-4000-a000-000000000018', 'a8add0f9-6394-45aa-a960-437d094c6501', 4.90,
 'Tejo kenarında gün batımı izlemek paha biçilmez! Daire çok iyi donanımlı. Kesinlikle 5 yıldız.', '2026-02-28 18:00:00+00'),

-- Reviews for Berlin listings
('10000001-0000-4000-a000-000000000024', 'd0000001-0000-4000-a000-000000000020', 'e135fa88-6e69-4853-8614-9a128a786b68', 4.50,
 'Kanal kenarında yaşamak harika! WG arkadaşları çok samimi. Kreuzberg''de her şey var.', '2026-01-12 10:30:00+01'),

('10000001-0000-4000-a000-000000000025', 'd0000001-0000-4000-a000-000000000020', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 4.70,
 'Anna superb bir ev arkadaşı. Kreuzberg kanalı boyunca bisiklet sürmek günlük rutinimdi. Tavsiye!', '2026-02-20 15:00:00+01'),

('10000001-0000-4000-a000-000000000026', 'd0000001-0000-4000-a000-000000000021', 'e135fa88-6e69-4853-8614-9a128a786b68', 4.80,
 'Loft daire fotoğraflardan çok daha güzel! Endüstriyel tasarım ile modern konfor birleşmiş. Harikaydı.', '2026-03-08 12:00:00+01'),

('10000001-0000-4000-a000-000000000027', 'd0000001-0000-4000-a000-000000000022', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 4.00,
 'Neukölln''ü keşfetmek çok keyifli oldu. Fiyat Berlin için çok uygun. Türk marketleri bonus.', '2026-01-28 09:00:00+01'),

('10000001-0000-4000-a000-000000000028', 'd0000001-0000-4000-a000-000000000022', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a', 3.70,
 'Good value for money in Neukölln. The neighbourhood is vibrant but can be noisy at night. Room is basic but clean.', '2026-02-10 14:30:00+01'),

('10000001-0000-4000-a000-000000000029', 'd0000001-0000-4000-a000-000000000024', 'e135fa88-6e69-4853-8614-9a128a786b68', 4.90,
 'Mitte''de yaşamak rüya gibi! Alexanderplatz, müzeler, her şey yürüme mesafesinde. Lüks ama hak ediyor.', '2026-03-15 16:00:00+01'),

('10000001-0000-4000-a000-000000000030', 'd0000001-0000-4000-a000-000000000025', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 4.30,
 'International WG with amazing people from 4 countries. Tempelhofer Feld is perfect for weekend barbecues.', '2026-02-25 11:45:00+01');

-- ============================================================
-- STEP 8: POSTS (15 community posts)
-- ============================================================

INSERT INTO posts (id, user_id, city_id, content, type, images, location_name, hashtags, like_count, comment_count, created_at) VALUES

('e0000001-0000-4000-a000-000000000001', '27d578d1-8263-42dd-a63c-081b58b395d3', 'c0000001-0000-4000-a000-000000000002',
 'Barcelona''ya yeni geldim! Gràcia''da küçük bir odaya yerleştim. Sokaklar inanılmaz güzel, her köşede bir sürpriz var. Tavsiyelerinizi bekliyorum!',
 'text', ARRAY['https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600'], 'Gràcia, Barcelona',
 ARRAY['Barcelona', 'Erasmus', 'YeniGeldim', 'Gràcia'], 12, 3, '2026-01-08 18:30:00+01'),

('e0000001-0000-4000-a000-000000000002', 'e135fa88-6e69-4853-8614-9a128a786b68', 'c0000001-0000-4000-a000-000000000004',
 'Berlin''de en ucuz market hangisi? Lidl mi, Aldi mi, Netto mu? Haftada 50€ ile idare edebilir miyim? Tavsiyelerinizi bekliyorum.',
 'question', '{}', 'Berlin',
 ARRAY['Berlin', 'Market', 'Bütçe', 'Öğrenci'], 8, 5, '2026-01-12 14:00:00+01'),

('e0000001-0000-4000-a000-000000000003', 'a8add0f9-6394-45aa-a960-437d094c6501', 'c0000001-0000-4000-a000-000000000003',
 'Lizbon''da Pastéis de Belém yedim ve hayatımda yediğim en iyi tatlıydı! Ama yerel arkadaşlar Manteigaria''yı daha çok seviyor. Sizce hangisi daha iyi?',
 'photo', ARRAY['https://images.unsplash.com/photo-1579697096985-41fe1430e5df?w=600', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600'], 'Belém, Lizbon',
 ARRAY['Lizbon', 'PastéisDeBelém', 'Yemek', 'Portekiz'], 24, 7, '2026-01-15 11:00:00+00'),

('e0000001-0000-4000-a000-000000000004', 'a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 'c0000001-0000-4000-a000-000000000002',
 'Kadıköy''de güvenli mahalleler nereler? Özellikle kız öğrenciler için. Moda mı yoksa Yeldeğirmeni mi daha iyi?',
 'question', '{}', 'Kadıköy, İstanbul',
 ARRAY['İstanbul', 'Kadıköy', 'Güvenlik', 'EvArama'], 6, 4, '2026-01-18 09:30:00+03'),

('e0000001-0000-4000-a000-000000000005', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'c0000001-0000-4000-a000-000000000002',
 'Barcelona''da yaşamanın 5 altın kuralı: 1) NIE''ni hemen al 2) T-Casual değil T-Jove al 3) Boqueria''ya gitme, yerel pazarlara git 4) İspanyolca öğren 5) Siesta saatlerinde dükkan arama!',
 'tip', ARRAY['https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=600'], 'Barcelona',
 ARRAY['Barcelona', 'İpuçları', 'Erasmus', 'Rehber'], 35, 8, '2026-01-22 16:00:00+01'),

('e0000001-0000-4000-a000-000000000006', 'ffcba7da-3d0a-4547-98cf-c802572a7244', 'c0000001-0000-4000-a000-000000000001',
 'İstanbul''a Almanya''dan geleli 3 ay oldu ve kültür şoku hâlâ devam ediyor! Ama en güzel yanı insanların sıcaklığı. Dün komşum bize börek getirdi, Berlin''de kapı komşumu bile tanımıyordum!',
 'text', '{}', 'İstanbul',
 ARRAY['İstanbul', 'KültürŞoku', 'AlmanyadanTürkiyeye', 'KomşuKültürü'], 18, 6, '2026-02-01 20:00:00+03'),

('e0000001-0000-4000-a000-000000000007', '64feebd7-416d-4c27-bef9-b07190d0c87c', 'c0000001-0000-4000-a000-000000000003',
 'Lizbon''da sörf öğrenmeye başladım! Costa da Caparica plajı 30 dakika uzaklıkta ve dersler çok uygun (25€/saat). Birlikte gelecek var mı?',
 'photo', ARRAY['https://images.unsplash.com/photo-1502680390548-bdbac40e4ce0?w=600'], 'Costa da Caparica, Lizbon',
 ARRAY['Lizbon', 'Sörf', 'Spor', 'CostaDaCaparica'], 15, 3, '2026-02-05 15:30:00+00'),

('e0000001-0000-4000-a000-000000000008', '1d5113ae-a798-42f3-8570-1641e3a62687', 'c0000001-0000-4000-a000-000000000004',
 'Berlin''de Anmeldung randevusu alma rehberi: 1) service.berlin.de adresine her gün sabah 8''de gir 2) Tüm Bürgeramt''ları seç 3) Hızlı ol, 5 dakikada doluyor 4) Alternatif: Potsdam''da randevu daha kolay',
 'tip', '{}', 'Berlin',
 ARRAY['Berlin', 'Anmeldung', 'Bürokrasi', 'İpuçları'], 42, 11, '2026-02-08 10:00:00+01'),

('e0000001-0000-4000-a000-000000000009', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 'c0000001-0000-4000-a000-000000000002',
 'UPC''de ilk sınavım vardı bugün. İspanyolca anlayabiliyorum ama yazmak çok zor! Dil kursu önerileri var mı? Bedava veya ucuz olanlar?',
 'question', '{}', 'UPC, Barcelona',
 ARRAY['Barcelona', 'İspanyolca', 'DilKursu', 'Üniversite'], 7, 4, '2026-02-12 18:45:00+01'),

('e0000001-0000-4000-a000-000000000010', '5993993a-4131-4c6c-b52d-27d2030512b1', 'c0000001-0000-4000-a000-000000000001',
 'Erasmus''a gidecek arkadaşlara mentor olarak destek veriyorum! 3 ülkede Erasmus deneyimim var. DM atın, sorularınızı cevaplayayım. Ücretsiz!',
 'text', '{}', 'İstanbul',
 ARRAY['Erasmus', 'Mentor', 'Destek', 'Ücretsiz'], 28, 5, '2026-02-15 12:00:00+03'),

('e0000001-0000-4000-a000-000000000011', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 'c0000001-0000-4000-a000-000000000004',
 'Berlin''de kış çok soğuk ama Christmas Market''lar inanılmaz güzel! Gendarmenmarkt''taki Glühwein hayatımda içtiğim en iyi şarap olabilir.',
 'photo', ARRAY['https://images.unsplash.com/photo-1545022388-aadb04239f45?w=600', 'https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=600'], 'Gendarmenmarkt, Berlin',
 ARRAY['Berlin', 'Kış', 'ChristmasMarket', 'Glühwein'], 31, 4, '2026-02-18 19:00:00+01'),

('e0000001-0000-4000-a000-000000000012', '8fd73484-9c91-426d-a5ca-5f5926c4529c', 'c0000001-0000-4000-a000-000000000003',
 'Lizbon''da ev arayan öğrencilere tavsiyem: idealista.pt ve uniplaces.com en güvenilir siteler. Olx.pt''den kaçının, dolandırıcılık riski yüksek!',
 'tip', '{}', 'Lizbon',
 ARRAY['Lizbon', 'EvArama', 'Tavsiye', 'Dikkat'], 19, 3, '2026-02-22 14:30:00+00'),

('e0000001-0000-4000-a000-000000000013', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a', 'c0000001-0000-4000-a000-000000000004',
 'Kreuzberg''de Türk kahvaltısı yapabileceğiniz en iyi yerler: 1) Babel 2) Ora 3) Five Elephant (kahve için). Pazar günleri Maybachufer pazarına mutlaka gidin!',
 'tip', ARRAY['https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600'], 'Kreuzberg, Berlin',
 ARRAY['Berlin', 'Kreuzberg', 'TürkKahvaltısı', 'Brunch'], 22, 6, '2026-03-01 11:00:00+01'),

('e0000001-0000-4000-a000-000000000014', '27d578d1-8263-42dd-a63c-081b58b395d3', 'c0000001-0000-4000-a000-000000000002',
 'Gràcia''daki ilk Erasmus partim! 15 farklı ülkeden insan vardı. Bu deneyim hayatımı değiştiriyor gerçekten.',
 'photo', ARRAY['https://images.unsplash.com/photo-1529543544282-cba025e1ca6c?w=600'], 'Plaza del Sol, Gràcia',
 ARRAY['Barcelona', 'ErasmusParti', 'Gràcia', 'UluslararasıArkadaşlık'], 38, 9, '2026-03-05 23:30:00+01'),

('e0000001-0000-4000-a000-000000000015', 'a8add0f9-6394-45aa-a960-437d094c6501', 'c0000001-0000-4000-a000-000000000003',
 'Lizbon''da 6 aylık Erasmus dönemim bitti ve söyleyebilirim ki: en çok özleyeceğim şey Tejo kenarında gün batımı izlemek. Saudade gerçekmiş...',
 'text', ARRAY['https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600'], 'Tejo, Lizbon',
 ARRAY['Lizbon', 'Saudade', 'GünBatımı', 'ErasmusBitti'], 45, 12, '2026-03-10 19:00:00+00');

-- ============================================================
-- STEP 9: POST COMMENTS (on some posts)
-- ============================================================

INSERT INTO post_comments (id, post_id, user_id, content, created_at) VALUES

-- Comments on "Barcelona'ya yeni geldim" post
('60000001-0000-4000-a000-000000000001', 'e0000001-0000-4000-a000-000000000001', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde',
 'Hoş geldin Deniz! Gràcia''da yaşamak harika bir seçim. Verdi sokağında güzel bir pizzacı var, mutlaka dene!', '2026-01-08 19:00:00+01'),

('60000001-0000-4000-a000-000000000002', 'e0000001-0000-4000-a000-000000000001', 'ade644ae-6211-4482-b8d8-456881e4b1b8',
 'Ben de Barcelona''dayım! Beraber kahve içelim mi? UPC''de okuyorum.', '2026-01-08 20:30:00+01'),

('60000001-0000-4000-a000-000000000003', 'e0000001-0000-4000-a000-000000000001', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf',
 'Welcome! If you need any local tips, feel free to reach out. I''ve been hosting Erasmus students for years.', '2026-01-09 10:00:00+01'),

-- Comments on "Berlin'de en ucuz market" post
('60000001-0000-4000-a000-000000000004', 'e0000001-0000-4000-a000-000000000002', '1d5113ae-a798-42f3-8570-1641e3a62687',
 'Aldi ve Lidl en ucuzları. Ama Türk marketleri (Eurogida) çok daha ucuz, özellikle sebze-meyve. Kreuzberg''de çok var.', '2026-01-12 15:00:00+01'),

('60000001-0000-4000-a000-000000000005', 'e0000001-0000-4000-a000-000000000002', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a',
 'Haftalık 50€ yeterli! Ben 40€ ile idare ediyorum. Sırrım: pazar günleri Too Good To Go uygulamasından paket almak.', '2026-01-12 16:30:00+01'),

('60000001-0000-4000-a000-000000000006', 'e0000001-0000-4000-a000-000000000002', 'b3684764-5ea7-4b10-b01a-8adba3932f0d',
 'Netto en ucuzu ama kalitesi düşük. Lidl fiyat-performans şampiyonu bence. Bir de Penny var.', '2026-01-13 09:00:00+01'),

-- Comments on "Pastéis de Belém" post
('60000001-0000-4000-a000-000000000007', 'e0000001-0000-4000-a000-000000000003', '64feebd7-416d-4c27-bef9-b07190d0c87c',
 'Manteigaria kesinlikle daha iyi! Belém turistik, Manteigaria yerel favorisi. Tarçın ve pudra şeker ekle!', '2026-01-15 12:00:00+00'),

('60000001-0000-4000-a000-000000000008', 'e0000001-0000-4000-a000-000000000003', '8fd73484-9c91-426d-a5ca-5f5926c4529c',
 'Portekizli olarak söylüyorum: ikisi de güzel ama asıl lezzet küçük mahalle pastanelerinde gizli!', '2026-01-15 14:30:00+00'),

-- Comments on Barcelona tips post
('60000001-0000-4000-a000-000000000009', 'e0000001-0000-4000-a000-000000000005', '27d578d1-8263-42dd-a63c-081b58b395d3',
 'Bu listene bir şey daha eklerim: 6) Pazar günleri Bunkers del Carmel''e git, en güzel manzara orada!', '2026-01-22 17:00:00+01'),

('60000001-0000-4000-a000-000000000010', 'e0000001-0000-4000-a000-000000000005', 'ade644ae-6211-4482-b8d8-456881e4b1b8',
 'T-Jove bilgisi çok önemli, ben ilk ay T-Casual aldım ve çok fazla harcadım. Teşekkürler Maria!', '2026-01-23 10:15:00+01');

-- ============================================================
-- STEP 10: POST LIKES
-- ============================================================

INSERT INTO post_likes (post_id, user_id) VALUES
('e0000001-0000-4000-a000-000000000001', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde'),
('e0000001-0000-4000-a000-000000000001', 'ade644ae-6211-4482-b8d8-456881e4b1b8'),
('e0000001-0000-4000-a000-000000000001', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf'),
('e0000001-0000-4000-a000-000000000003', '64feebd7-416d-4c27-bef9-b07190d0c87c'),
('e0000001-0000-4000-a000-000000000003', '8fd73484-9c91-426d-a5ca-5f5926c4529c'),
('e0000001-0000-4000-a000-000000000003', '27d578d1-8263-42dd-a63c-081b58b395d3'),
('e0000001-0000-4000-a000-000000000005', '27d578d1-8263-42dd-a63c-081b58b395d3'),
('e0000001-0000-4000-a000-000000000005', 'ade644ae-6211-4482-b8d8-456881e4b1b8'),
('e0000001-0000-4000-a000-000000000005', 'a8f8d0ec-73d9-4d02-8679-efa9a0d59716'),
('e0000001-0000-4000-a000-000000000008', 'e135fa88-6e69-4853-8614-9a128a786b68'),
('e0000001-0000-4000-a000-000000000008', 'b3684764-5ea7-4b10-b01a-8adba3932f0d'),
('e0000001-0000-4000-a000-000000000008', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a'),
('e0000001-0000-4000-a000-000000000014', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde'),
('e0000001-0000-4000-a000-000000000014', 'ade644ae-6211-4482-b8d8-456881e4b1b8'),
('e0000001-0000-4000-a000-000000000014', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf'),
('e0000001-0000-4000-a000-000000000015', '64feebd7-416d-4c27-bef9-b07190d0c87c'),
('e0000001-0000-4000-a000-000000000015', '8fd73484-9c91-426d-a5ca-5f5926c4529c'),
('e0000001-0000-4000-a000-000000000015', '27d578d1-8263-42dd-a63c-081b58b395d3'),
('e0000001-0000-4000-a000-000000000015', 'e135fa88-6e69-4853-8614-9a128a786b68'),
('e0000001-0000-4000-a000-000000000010', '27d578d1-8263-42dd-a63c-081b58b395d3'),
('e0000001-0000-4000-a000-000000000010', 'a8add0f9-6394-45aa-a960-437d094c6501'),
('e0000001-0000-4000-a000-000000000010', 'e135fa88-6e69-4853-8614-9a128a786b68');

-- ============================================================
-- STEP 11: EVENTS (10 events across cities)
-- ============================================================

INSERT INTO events (id, organizer_id, city_id, title, description, category, date, time, location_name, latitude, longitude, image_url, max_participants, participant_count, created_at) VALUES

('f0000001-0000-4000-a000-000000000001', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'c0000001-0000-4000-a000-000000000002',
 'Erasmus Coffee Meetup - Barcelona',
 'Her hafta Cumartesi sabahı Gràcia''da kahve buluşması! Yeni arkadaşlar edin, şehir hakkında bilgi al. Herkes davetli.',
 'coffee', '2026-04-05', '11:00:00',
 'Federal Café, Gràcia', 41.4020, 2.1565,
 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600',
 20, 0, '2026-03-01 10:00:00+01'),

('f0000001-0000-4000-a000-000000000002', '1d5113ae-a798-42f3-8570-1641e3a62687', 'c0000001-0000-4000-a000-000000000004',
 'Language Exchange Night - Türkçe/Almanca',
 'Türkçe öğrenmek isteyen Almanlar ve Almanca öğrenmek isteyen Türkler için tandem akşamı. Bira/çay ikramı var!',
 'language', '2026-04-10', '19:00:00',
 'Südblock, Kreuzberg', 52.4965, 13.4245,
 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
 30, 0, '2026-03-05 14:00:00+01'),

('f0000001-0000-4000-a000-000000000003', '5993993a-4131-4c6c-b52d-27d2030512b1', 'c0000001-0000-4000-a000-000000000001',
 'İstanbul City Tour for Erasmus Students',
 'Sultanahmet, Kapalıçarşı, Galata ve Kadıköy''ü kapsayan tam gün şehir turu. Rehber: Fatma (3 ülke Erasmus deneyimi).',
 'city_tour', '2026-04-12', '10:00:00',
 'Sultanahmet Meydanı', 41.0054, 28.9768,
 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600',
 15, 0, '2026-03-08 09:00:00+03'),

('f0000001-0000-4000-a000-000000000004', '64feebd7-416d-4c27-bef9-b07190d0c87c', 'c0000001-0000-4000-a000-000000000003',
 'Surf Day - Lizbon Erasmus',
 'Costa da Caparica''da sörf günü! Başlangıç seviyesi dersler dahil. Ulaşım organize, sörf tahtası kiralık.',
 'sports', '2026-04-15', '09:00:00',
 'Costa da Caparica Beach', 38.6350, -9.2360,
 'https://images.unsplash.com/photo-1502680390548-bdbac40e4ce0?w=600',
 12, 0, '2026-03-10 11:00:00+00'),

('f0000001-0000-4000-a000-000000000005', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf', 'c0000001-0000-4000-a000-000000000002',
 'Tapas Tour - Poble Sec',
 'Barcelona''nın en iyi tapas barlarını keşfet! Carrer de Blai''de 5 farklı mekanda yerel lezzetler. Kişi başı ~20€.',
 'food', '2026-04-08', '20:00:00',
 'Carrer de Blai, Poble Sec', 41.3740, 2.1630,
 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600',
 15, 0, '2026-03-02 15:00:00+01'),

('f0000001-0000-4000-a000-000000000006', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a', 'c0000001-0000-4000-a000-000000000004',
 'Berlin Study Group - Kütüphane Buluşması',
 'Grimm Zentrum kütüphanesinde birlikte çalışma seansı. Sınav dönemi motivasyonu! Öğleden sonra kahve molası dahil.',
 'study', '2026-04-18', '10:00:00',
 'Jacob-und-Wilhelm-Grimm-Zentrum', 52.5197, 13.3935,
 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',
 25, 0, '2026-03-12 08:00:00+01'),

('f0000001-0000-4000-a000-000000000007', '8fd73484-9c91-426d-a5ca-5f5926c4529c', 'c0000001-0000-4000-a000-000000000003',
 'Fado Night - Alfama',
 'Alfama''nın en otantik fado barında canlı müzik gecesi. Portekiz şarabı ve petiscos dahil. Sınırlı kontenjan!',
 'other', '2026-04-20', '21:00:00',
 'Tasca do Chico, Alfama', 38.7118, -9.1315,
 'https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?w=600',
 20, 0, '2026-03-15 16:00:00+00'),

('f0000001-0000-4000-a000-000000000008', 'ffcba7da-3d0a-4547-98cf-c802572a7244', 'c0000001-0000-4000-a000-000000000001',
 'Boğaz''da Tekne Turu',
 'Erasmus öğrencileri için özel tekne turu! Boğaz köprüleri, Kız Kulesi ve sahil yalıları. Çay ve simit ikramı.',
 'city_tour', '2026-04-22', '14:00:00',
 'Eminönü İskelesi', 41.0170, 28.9710,
 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600',
 25, 0, '2026-03-18 10:00:00+03'),

('f0000001-0000-4000-a000-000000000009', 'e135fa88-6e69-4853-8614-9a128a786b68', 'c0000001-0000-4000-a000-000000000004',
 'Tempelhofer Feld Bisiklet Turu',
 'Eski havaalanı pistinde bisiklet turu! Bisikletiniz yoksa Swapfiets kiralayabilirsiniz. Sonra piknik yapıyoruz.',
 'sports', '2026-04-25', '15:00:00',
 'Tempelhofer Feld, Neukölln', 52.4736, 13.4032,
 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600',
 20, 0, '2026-03-20 12:00:00+01'),

('f0000001-0000-4000-a000-000000000010', '27d578d1-8263-42dd-a63c-081b58b395d3', 'c0000001-0000-4000-a000-000000000002',
 'Barcelona Erasmus Party - Pacha',
 'Dönem sonu Erasmus partisi! Giriş ücretsiz (Kotwise üyelerine), ilk içki hediye. Dress code: casual.',
 'party', '2026-04-28', '23:00:00',
 'Pacha Barcelona', 41.3875, 2.1920,
 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
 100, 0, '2026-03-22 18:00:00+01');

-- ============================================================
-- STEP 12: EVENT PARTICIPANTS
-- ============================================================

INSERT INTO event_participants (event_id, user_id, status) VALUES

-- Coffee meetup Barcelona
('f0000001-0000-4000-a000-000000000001', '27d578d1-8263-42dd-a63c-081b58b395d3', 'joined'),
('f0000001-0000-4000-a000-000000000001', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 'joined'),
('f0000001-0000-4000-a000-000000000001', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 'joined'),
('f0000001-0000-4000-a000-000000000001', 'a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 'joined'),

-- Language exchange Berlin
('f0000001-0000-4000-a000-000000000002', 'e135fa88-6e69-4853-8614-9a128a786b68', 'joined'),
('f0000001-0000-4000-a000-000000000002', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a', 'joined'),
('f0000001-0000-4000-a000-000000000002', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 'joined'),
('f0000001-0000-4000-a000-000000000002', 'ffcba7da-3d0a-4547-98cf-c802572a7244', 'joined'),

-- City tour Istanbul
('f0000001-0000-4000-a000-000000000003', 'ffcba7da-3d0a-4547-98cf-c802572a7244', 'joined'),
('f0000001-0000-4000-a000-000000000003', '1d5113ae-a798-42f3-8570-1641e3a62687', 'joined'),

-- Surf day Lisbon
('f0000001-0000-4000-a000-000000000004', 'a8add0f9-6394-45aa-a960-437d094c6501', 'joined'),
('f0000001-0000-4000-a000-000000000004', '64feebd7-416d-4c27-bef9-b07190d0c87c', 'joined'),

-- Tapas tour Barcelona
('f0000001-0000-4000-a000-000000000005', '27d578d1-8263-42dd-a63c-081b58b395d3', 'joined'),
('f0000001-0000-4000-a000-000000000005', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 'joined'),
('f0000001-0000-4000-a000-000000000005', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'joined'),

-- Study group Berlin
('f0000001-0000-4000-a000-000000000006', 'e135fa88-6e69-4853-8614-9a128a786b68', 'joined'),
('f0000001-0000-4000-a000-000000000006', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 'joined'),

-- Fado night Lisbon
('f0000001-0000-4000-a000-000000000007', 'a8add0f9-6394-45aa-a960-437d094c6501', 'joined'),
('f0000001-0000-4000-a000-000000000007', '64feebd7-416d-4c27-bef9-b07190d0c87c', 'joined'),

-- Boat tour Istanbul
('f0000001-0000-4000-a000-000000000008', '1d5113ae-a798-42f3-8570-1641e3a62687', 'joined'),
('f0000001-0000-4000-a000-000000000008', '5993993a-4131-4c6c-b52d-27d2030512b1', 'joined'),

-- Bike tour Berlin
('f0000001-0000-4000-a000-000000000009', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a', 'joined'),
('f0000001-0000-4000-a000-000000000009', '1d5113ae-a798-42f3-8570-1641e3a62687', 'joined'),
('f0000001-0000-4000-a000-000000000009', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 'joined'),

-- Erasmus party Barcelona
('f0000001-0000-4000-a000-000000000010', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 'joined'),
('f0000001-0000-4000-a000-000000000010', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'joined'),
('f0000001-0000-4000-a000-000000000010', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf', 'joined'),
('f0000001-0000-4000-a000-000000000010', 'a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 'joined'),
('f0000001-0000-4000-a000-000000000010', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 'joined');

-- ============================================================
-- STEP 13: CONVERSATIONS & MESSAGES (20 conversations)
-- ============================================================

-- Conversation 1: Deniz asks Maria about Gràcia listing
INSERT INTO conversations (id, participant_ids, listing_id, is_group, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000001',
 ARRAY['27d578d1-8263-42dd-a63c-081b58b395d3', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde']::UUID[],
 'd0000001-0000-4000-a000-000000000008', false,
 'Harika, o zaman cumartesi görüşmek üzere!', '2026-01-06 15:00:00+01');

INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000001', '27d578d1-8263-42dd-a63c-081b58b395d3', 'Merhaba Maria! Gràcia''daki ilanınızı gördüm, oda hâlâ müsait mi?', 'text', true, '2026-01-05 10:00:00+01'),
('70000001-0000-4000-a000-000000000001', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'Hola Deniz! Evet, şubat başından itibaren müsait. Ne zaman geliyorsun?', 'text', true, '2026-01-05 11:30:00+01'),
('70000001-0000-4000-a000-000000000001', '27d578d1-8263-42dd-a63c-081b58b395d3', 'Ocak sonunda gelmeyi planlıyorum. Oda fotoğraftaki gibi mi? Balkon gerçekten güneşli mi?', 'text', true, '2026-01-05 12:00:00+01'),
('70000001-0000-4000-a000-000000000001', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'Evet, aynen öyle! Sabahları güneş direkt balkona vuruyor. İstersen video atabilirim.', 'text', true, '2026-01-05 14:00:00+01'),
('70000001-0000-4000-a000-000000000001', '27d578d1-8263-42dd-a63c-081b58b395d3', 'Çok iyi olur! Bir de semt hakkında bilgi alabilir miyim? Güvenli mi?', 'text', true, '2026-01-06 09:00:00+01'),
('70000001-0000-4000-a000-000000000001', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'Gràcia çok güvenli ve sakin. Gece bile rahatça yürüyebilirsin. İstersen cumartesi gel göstereyim.', 'text', true, '2026-01-06 10:30:00+01'),
('70000001-0000-4000-a000-000000000001', '27d578d1-8263-42dd-a63c-081b58b395d3', 'Harika, o zaman cumartesi görüşmek üzere!', 'text', true, '2026-01-06 15:00:00+01');

-- Conversation 2: Elif asks Lucas about Alfama listing
INSERT INTO conversations (id, participant_ids, listing_id, is_group, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000002',
 ARRAY['a8add0f9-6394-45aa-a960-437d094c6501', '8fd73484-9c91-426d-a5ca-5f5926c4529c']::UUID[],
 'd0000001-0000-4000-a000-000000000014', false,
 'Kesinlikle! Lizbon seni büyüleyecek.', '2026-01-10 16:00:00+00');

INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000002', 'a8add0f9-6394-45aa-a960-437d094c6501', 'Merhaba Lucas! Alfama''daki tarihi binadaki oda hâlâ müsait mi?', 'text', true, '2026-01-08 14:00:00+00'),
('70000001-0000-4000-a000-000000000002', '8fd73484-9c91-426d-a5ca-5f5926c4529c', 'Olá Elif! Yes, available from February. Are you studying at UL?', 'text', true, '2026-01-08 15:30:00+00'),
('70000001-0000-4000-a000-000000000002', 'a8add0f9-6394-45aa-a960-437d094c6501', 'Evet, MBA programına başlıyorum. Tejo manzarası gerçekten var mı?', 'text', true, '2026-01-09 10:00:00+00'),
('70000001-0000-4000-a000-000000000002', '8fd73484-9c91-426d-a5ca-5f5926c4529c', 'Absolutely! Let me send you a photo from the window. The sunset view is amazing.', 'text', true, '2026-01-09 11:00:00+00'),
('70000001-0000-4000-a000-000000000002', 'a8add0f9-6394-45aa-a960-437d094c6501', 'Harika! Kira her şey dahil mi? NIF almam lazım mı önce?', 'text', true, '2026-01-10 09:00:00+00'),
('70000001-0000-4000-a000-000000000002', '8fd73484-9c91-426d-a5ca-5f5926c4529c', 'Utilities included. Yes, you need NIF. I can help you with the process, I know the system well.', 'text', true, '2026-01-10 14:00:00+00'),
('70000001-0000-4000-a000-000000000002', 'a8add0f9-6394-45aa-a960-437d094c6501', 'Çok teşekkürler, çok yardımcı oluyorsun! Şubatta görüşmek üzere.', 'text', true, '2026-01-10 15:00:00+00'),
('70000001-0000-4000-a000-000000000002', '8fd73484-9c91-426d-a5ca-5f5926c4529c', 'Kesinlikle! Lizbon seni büyüleyecek.', 'text', true, '2026-01-10 16:00:00+00');

-- Conversation 3: Can asks Anna about Kreuzberg WG
INSERT INTO conversations (id, participant_ids, listing_id, is_group, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000003',
 ARRAY['e135fa88-6e69-4853-8614-9a128a786b68', '1d5113ae-a798-42f3-8570-1641e3a62687']::UUID[],
 'd0000001-0000-4000-a000-000000000020', false,
 'Süper, o zaman görüşelim!', '2026-01-08 12:00:00+01');

INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000003', 'e135fa88-6e69-4853-8614-9a128a786b68', 'Merhaba Anna! Kreuzberg''deki WG odası hâlâ müsait mi? Ben ODTÜ''den geliyorum.', 'text', true, '2026-01-07 10:00:00+01'),
('70000001-0000-4000-a000-000000000003', '1d5113ae-a798-42f3-8570-1641e3a62687', 'Hallo Can! Ja, das Zimmer ist frei ab Februar. Studierst du an der TU?', 'text', true, '2026-01-07 12:00:00+01'),
('70000001-0000-4000-a000-000000000003', 'e135fa88-6e69-4853-8614-9a128a786b68', 'Evet, TU Berlin''de Erasmus yapacağım. WG nasıl, kaç kişisiniz?', 'text', true, '2026-01-07 14:30:00+01'),
('70000001-0000-4000-a000-000000000003', '1d5113ae-a798-42f3-8570-1641e3a62687', 'We are 3 people - me (German), one Italian, and the room is for you! Very international :)', 'text', true, '2026-01-08 09:00:00+01'),
('70000001-0000-4000-a000-000000000003', 'e135fa88-6e69-4853-8614-9a128a786b68', 'Kulağa harika geliyor! Anmeldung için yardımcı olabilir misiniz?', 'text', true, '2026-01-08 10:00:00+01'),
('70000001-0000-4000-a000-000000000003', '1d5113ae-a798-42f3-8570-1641e3a62687', 'Natürlich! Wohnungsgeberbestätigung hazırlayacağım. Gel önce evi gör, sonra karar verirsin.', 'text', true, '2026-01-08 11:00:00+01'),
('70000001-0000-4000-a000-000000000003', 'e135fa88-6e69-4853-8614-9a128a786b68', 'Süper, o zaman görüşelim!', 'text', true, '2026-01-08 12:00:00+01');

-- Conversation 4: Zeynep interested in Barcelona apartment
INSERT INTO conversations (id, participant_ids, listing_id, is_group, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000004',
 ARRAY['a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf']::UUID[],
 'd0000001-0000-4000-a000-000000000010', false,
 'Tamam, hazırlanıyorum!', '2026-01-15 14:00:00+01');

INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000004', 'a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 'Hola Carlos! Eixample''daki modernist daire çok güzel görünüyor. Müsait mi?', 'text', true, '2026-01-14 10:00:00+01'),
('70000001-0000-4000-a000-000000000004', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf', 'Hola Zeynep! Sí, está disponible. Mimarlık öğrencisi olarak bu daireyi çok seveceksin!', 'text', true, '2026-01-14 12:00:00+01'),
('70000001-0000-4000-a000-000000000004', 'a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 'Tavanlardaki süslemeler orijinal mi? Fotoğraflar inanılmaz!', 'text', true, '2026-01-15 09:00:00+01'),
('70000001-0000-4000-a000-000000000004', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf', 'Sí, 1920''lerden kalma orijinal tavan süslemeleri. Gel, yarın göstereyim mi?', 'text', true, '2026-01-15 11:00:00+01'),
('70000001-0000-4000-a000-000000000004', 'a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 'Tamam, hazırlanıyorum!', 'text', true, '2026-01-15 14:00:00+01');

-- Conversation 5: Ali asks Pedro about Arroios room
INSERT INTO conversations (id, participant_ids, listing_id, is_group, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000005',
 ARRAY['64feebd7-416d-4c27-bef9-b07190d0c87c', '1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb']::UUID[],
 'd0000001-0000-4000-a000-000000000016', false,
 'Obrigado Pedro! See you soon!', '2026-01-12 16:00:00+00');

INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000005', '64feebd7-416d-4c27-bef9-b07190d0c87c', 'Merhaba Pedro! Arroios''daki odanız hâlâ müsait mi? Ben Ali, İzmir''den geliyorum.', 'text', true, '2026-01-11 10:00:00+00'),
('70000001-0000-4000-a000-000000000005', '1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb', 'Olá Ali! Yes, available! Are you coming for Erasmus? What''s your university?', 'text', true, '2026-01-11 14:00:00+00'),
('70000001-0000-4000-a000-000000000005', '64feebd7-416d-4c27-bef9-b07190d0c87c', 'Evet, UL''de turizm yüksek lisansı yapacağım. Sörf yapabileceğim bir plaj yakında mı?', 'text', true, '2026-01-12 09:00:00+00'),
('70000001-0000-4000-a000-000000000005', '1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb', 'Costa da Caparica 30 min by bus! I surf there every weekend. We can go together!', 'text', true, '2026-01-12 11:00:00+00'),
('70000001-0000-4000-a000-000000000005', '64feebd7-416d-4c27-bef9-b07190d0c87c', 'Obrigado Pedro! See you soon!', 'text', true, '2026-01-12 16:00:00+00');

-- Conversation 6: Mert asks about Barcelona room
INSERT INTO conversations (id, participant_ids, listing_id, is_group, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000006',
 ARRAY['ade644ae-6211-4482-b8d8-456881e4b1b8', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde']::UUID[],
 'd0000001-0000-4000-a000-000000000008', false,
 'Muchas gracias Maria!', '2026-01-20 12:00:00+01');

INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000006', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 'Merhaba Maria! Ben Mert, Ankara''dan geliyorum. Gràcia''daki oda müsait mi?', 'text', true, '2026-01-18 10:00:00+01'),
('70000001-0000-4000-a000-000000000006', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'Hola Mert! Bir oda kaldı, hızlı davranmalısın. Ne zaman geliyorsun?', 'text', true, '2026-01-18 14:00:00+01'),
('70000001-0000-4000-a000-000000000006', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 'Şubat başında. UPC yakın mı dairenize?', 'text', true, '2026-01-19 09:00:00+01'),
('70000001-0000-4000-a000-000000000006', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'Metro ile 15 dakika. L3 hattıyla direkt gidiyorsun. Çok kolay!', 'text', true, '2026-01-19 12:00:00+01'),
('70000001-0000-4000-a000-000000000006', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 'Muchas gracias Maria!', 'text', true, '2026-01-20 12:00:00+01');

-- Conversation 7: Sophie asks Ayse about Istanbul room
INSERT INTO conversations (id, participant_ids, listing_id, is_group, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000007',
 ARRAY['ffcba7da-3d0a-4547-98cf-c802572a7244', '8e6e1fee-9c40-433e-b8eb-6273b96b0d02']::UUID[],
 'd0000001-0000-4000-a000-000000000001', false,
 'Tschüss! Görüşürüz!', '2026-01-25 14:00:00+03');

INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000007', 'ffcba7da-3d0a-4547-98cf-c802572a7244', 'Merhaba Ayşe Hanım! Ben Sophie, Berlin''den geliyorum. Moda''daki odanız müsait mi?', 'text', true, '2026-01-22 10:00:00+03'),
('70000001-0000-4000-a000-000000000007', '8e6e1fee-9c40-433e-b8eb-6273b96b0d02', 'Hoş geldin Sophie! Evet, şubattan itibaren müsait. Türkçen çok iyi!', 'text', true, '2026-01-22 12:00:00+03'),
('70000001-0000-4000-a000-000000000007', 'ffcba7da-3d0a-4547-98cf-c802572a7244', 'Teşekkürler! 2 yıldır öğreniyorum. Daire denize yakın mı gerçekten?', 'text', true, '2026-01-23 09:00:00+03'),
('70000001-0000-4000-a000-000000000007', '8e6e1fee-9c40-433e-b8eb-6273b96b0d02', '5 dakika yürüyüş! Sabahları sahilde koşu yapabilirsin. Çok huzurlu bir yer.', 'text', true, '2026-01-24 10:00:00+03'),
('70000001-0000-4000-a000-000000000007', 'ffcba7da-3d0a-4547-98cf-c802572a7244', 'Wunderbar! Ben istiyorum bu odayı. Depozito ne kadar?', 'text', true, '2026-01-25 09:00:00+03'),
('70000001-0000-4000-a000-000000000007', '8e6e1fee-9c40-433e-b8eb-6273b96b0d02', 'Bir aylık kira kadar, yani 14.000 TL. Gel bir çay içelim, evi göstereyim!', 'text', true, '2026-01-25 11:00:00+03'),
('70000001-0000-4000-a000-000000000007', 'ffcba7da-3d0a-4547-98cf-c802572a7244', 'Tschüss! Görüşürüz!', 'text', true, '2026-01-25 14:00:00+03');

-- Conversation 8: Clara asks Anna about Berlin room
INSERT INTO conversations (id, participant_ids, listing_id, is_group, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000008',
 ARRAY['b3684764-5ea7-4b10-b01a-8adba3932f0d', '1d5113ae-a798-42f3-8570-1641e3a62687']::UUID[],
 'd0000001-0000-4000-a000-000000000021', false,
 'Parfait! A bientôt!', '2026-02-05 16:00:00+01');

INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000008', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 'Bonjour Anna! I saw the loft in Kreuzberg, it looks incredible! Is it still available?', 'text', true, '2026-02-03 10:00:00+01'),
('70000001-0000-4000-a000-000000000008', '1d5113ae-a798-42f3-8570-1641e3a62687', 'Hi Clara! Yes, it is! Are you moving from Barcelona? The loft is really special.', 'text', true, '2026-02-03 14:00:00+01'),
('70000001-0000-4000-a000-000000000008', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 'Oui, Barcelona was great but Berlin calls! The industrial design looks amazing in photos.', 'text', true, '2026-02-04 09:00:00+01'),
('70000001-0000-4000-a000-000000000008', '1d5113ae-a798-42f3-8570-1641e3a62687', 'It is even better in person! High ceilings, huge windows. Come see it this weekend?', 'text', true, '2026-02-04 15:00:00+01'),
('70000001-0000-4000-a000-000000000008', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 'Parfait! A bientôt!', 'text', true, '2026-02-05 16:00:00+01');

-- Conversation 9: Deniz and Mert - Barcelona Türk öğrenciler
INSERT INTO conversations (id, participant_ids, is_group, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000009',
 ARRAY['27d578d1-8263-42dd-a63c-081b58b395d3', 'ade644ae-6211-4482-b8d8-456881e4b1b8']::UUID[],
 false,
 'Döner yiyelim mi bugün?', '2026-02-10 13:00:00+01');

INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000009', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 'Selam Deniz! Ben de Barcelona''da Türk öğrenciyim. Tanışalım mı?', 'text', true, '2026-02-08 10:00:00+01'),
('70000001-0000-4000-a000-000000000009', '27d578d1-8263-42dd-a63c-081b58b395d3', 'Tabii, çok güzel olur! Hangi üniversitedesin?', 'text', true, '2026-02-08 11:00:00+01'),
('70000001-0000-4000-a000-000000000009', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 'UPC''deyim. Sen İTÜ''den geldin diye gördüm profilinde. Hemşehri!', 'text', true, '2026-02-09 10:00:00+01'),
('70000001-0000-4000-a000-000000000009', '27d578d1-8263-42dd-a63c-081b58b395d3', 'Döner yiyelim mi bugün?', 'text', true, '2026-02-10 13:00:00+01');

-- Conversation 10: Elif and Ali - Lizbon Türk öğrenciler
INSERT INTO conversations (id, participant_ids, is_group, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000010',
 ARRAY['a8add0f9-6394-45aa-a960-437d094c6501', '64feebd7-416d-4c27-bef9-b07190d0c87c']::UUID[],
 false,
 'Tamam, hazırım!', '2026-02-15 14:00:00+00');

INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000010', '64feebd7-416d-4c27-bef9-b07190d0c87c', 'Selam Elif! Lizbon''da Türk öğrenci bulmak ne güzel! Sörf yapmak ister misin?', 'text', true, '2026-02-12 09:00:00+00'),
('70000001-0000-4000-a000-000000000010', 'a8add0f9-6394-45aa-a960-437d094c6501', 'Hiç denemedim ama çok istiyorum! Ne zaman gidiyorsun?', 'text', true, '2026-02-13 10:00:00+00'),
('70000001-0000-4000-a000-000000000010', '64feebd7-416d-4c27-bef9-b07190d0c87c', 'Cumartesi Costa da Caparica''ya gidiyoruz, başlangıç dersi 25€. Gel!', 'text', true, '2026-02-14 14:00:00+00'),
('70000001-0000-4000-a000-000000000010', 'a8add0f9-6394-45aa-a960-437d094c6501', 'Tamam, hazırım!', 'text', true, '2026-02-15 14:00:00+00');

-- Conversation 11: Event group chat - Coffee Meetup Barcelona
INSERT INTO conversations (id, participant_ids, is_group, group_name, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000011',
 ARRAY['4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', '27d578d1-8263-42dd-a63c-081b58b395d3', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 'b3684764-5ea7-4b10-b01a-8adba3932f0d']::UUID[],
 true, 'Coffee Meetup Barcelona',
 'See you all Saturday!', '2026-04-03 18:00:00+01');

INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000011', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'Hola a todos! This Saturday at Federal Café, 11am. Everyone confirmed?', 'text', true, '2026-04-01 10:00:00+01'),
('70000001-0000-4000-a000-000000000011', '27d578d1-8263-42dd-a63c-081b58b395d3', 'Ben geliyorum!', 'text', true, '2026-04-01 12:00:00+01'),
('70000001-0000-4000-a000-000000000011', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 'Count me in!', 'text', true, '2026-04-02 09:00:00+01'),
('70000001-0000-4000-a000-000000000011', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 'See you all Saturday!', 'text', true, '2026-04-03 18:00:00+01');

-- Conversation 12: Event group chat - Language Exchange Berlin
INSERT INTO conversations (id, participant_ids, is_group, group_name, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000012',
 ARRAY['1d5113ae-a798-42f3-8570-1641e3a62687', 'e135fa88-6e69-4853-8614-9a128a786b68', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a', 'ffcba7da-3d0a-4547-98cf-c802572a7244']::UUID[],
 true, 'Tandem Abend Berlin',
 'Prost ve Şerefe diyelim!', '2026-04-08 20:00:00+01');

INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000012', '1d5113ae-a798-42f3-8570-1641e3a62687', 'Tandem akşamı hazırlıkları tamam! Südblock''ta masalar ayırtıldı. Bira ve çay var.', 'text', true, '2026-04-06 10:00:00+01'),
('70000001-0000-4000-a000-000000000012', 'e135fa88-6e69-4853-8614-9a128a786b68', 'Harika! Ben Türkçe öğretmeye hazırım. Almanca pratik yapmak istiyorum!', 'text', true, '2026-04-07 09:00:00+01'),
('70000001-0000-4000-a000-000000000012', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a', 'Ich bringe Kuchen mit! Pasta getiriyorum :)', 'text', true, '2026-04-07 14:00:00+01'),
('70000001-0000-4000-a000-000000000012', 'ffcba7da-3d0a-4547-98cf-c802572a7244', 'Prost ve Şerefe diyelim!', 'text', true, '2026-04-08 20:00:00+01');

-- Conversations 13-20: Shorter conversations
INSERT INTO conversations (id, participant_ids, listing_id, is_group, last_message_text, last_message_at) VALUES
('70000001-0000-4000-a000-000000000013', ARRAY['a8f8d0ec-73d9-4d02-8679-efa9a0d59716', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde']::UUID[], 'd0000001-0000-4000-a000-000000000009', false, 'Evet, hâlâ müsait!', '2026-02-20 10:00:00+01'),
('70000001-0000-4000-a000-000000000014', ARRAY['e135fa88-6e69-4853-8614-9a128a786b68', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a']::UUID[], NULL, false, 'Tempelhofer''da buluşalım!', '2026-02-22 15:00:00+01'),
('70000001-0000-4000-a000-000000000015', ARRAY['a8add0f9-6394-45aa-a960-437d094c6501', '1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb']::UUID[], 'd0000001-0000-4000-a000-000000000017', false, 'Tabii, gel göstereyim!', '2026-02-25 12:00:00+00'),
('70000001-0000-4000-a000-000000000016', ARRAY['ffcba7da-3d0a-4547-98cf-c802572a7244', 'b4ef7afc-fade-4258-9b97-e38b4fafe5a1']::UUID[], 'd0000001-0000-4000-a000-000000000003', false, 'Anlaştık!', '2026-03-01 14:00:00+03'),
('70000001-0000-4000-a000-000000000017', ARRAY['b3684764-5ea7-4b10-b01a-8adba3932f0d', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a']::UUID[], NULL, false, 'Berlin''de buluşalım!', '2026-03-05 10:00:00+01'),
('70000001-0000-4000-a000-000000000018', ARRAY['64feebd7-416d-4c27-bef9-b07190d0c87c', '8fd73484-9c91-426d-a5ca-5f5926c4529c']::UUID[], 'd0000001-0000-4000-a000-000000000018', false, 'Tejo manzarası harika!', '2026-03-08 16:00:00+00'),
('70000001-0000-4000-a000-000000000019', ARRAY['27d578d1-8263-42dd-a63c-081b58b395d3', '5993993a-4131-4c6c-b52d-27d2030512b1']::UUID[], NULL, false, 'Teşekkürler Fatma Hocam!', '2026-03-10 11:00:00+03'),
('70000001-0000-4000-a000-000000000020', ARRAY['ade644ae-6211-4482-b8d8-456881e4b1b8', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf']::UUID[], 'd0000001-0000-4000-a000-000000000011', false, 'Harika, pazartesi gel!', '2026-03-12 14:00:00+01');

-- Short messages for conversations 13-20
INSERT INTO messages (conversation_id, sender_id, content, type, is_read, created_at) VALUES
('70000001-0000-4000-a000-000000000013', 'a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 'Merhaba! Bohem stüdyo daire hâlâ müsait mi?', 'text', true, '2026-02-19 10:00:00+01'),
('70000001-0000-4000-a000-000000000013', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'Evet, hâlâ müsait!', 'text', true, '2026-02-20 10:00:00+01'),

('70000001-0000-4000-a000-000000000014', 'e135fa88-6e69-4853-8614-9a128a786b68', 'Lena, bisiklet turu var mı bu hafta sonu?', 'text', true, '2026-02-21 10:00:00+01'),
('70000001-0000-4000-a000-000000000014', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a', 'Tempelhofer''da buluşalım!', 'text', true, '2026-02-22 15:00:00+01'),

('70000001-0000-4000-a000-000000000015', 'a8add0f9-6394-45aa-a960-437d094c6501', 'Paylaşımlı Erasmus evinde yer var mı?', 'text', true, '2026-02-24 09:00:00+00'),
('70000001-0000-4000-a000-000000000015', '1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb', 'Tabii, gel göstereyim!', 'text', true, '2026-02-25 12:00:00+00'),

('70000001-0000-4000-a000-000000000016', 'ffcba7da-3d0a-4547-98cf-c802572a7244', 'Beşiktaş''taki Boğaz manzaralı oda kaça?', 'text', true, '2026-02-28 10:00:00+03'),
('70000001-0000-4000-a000-000000000016', 'b4ef7afc-fade-4258-9b97-e38b4fafe5a1', 'Anlaştık!', 'text', true, '2026-03-01 14:00:00+03'),

('70000001-0000-4000-a000-000000000017', 'b3684764-5ea7-4b10-b01a-8adba3932f0d', 'Barcelona''dan Berlin''e taşınıyorum, buluşalım mı?', 'text', true, '2026-03-04 10:00:00+01'),
('70000001-0000-4000-a000-000000000017', '0a92a65a-3f6b-4dfe-b73c-fbbd7f1ac16a', 'Berlin''de buluşalım!', 'text', true, '2026-03-05 10:00:00+01'),

('70000001-0000-4000-a000-000000000018', '64feebd7-416d-4c27-bef9-b07190d0c87c', 'Santos dairesi hâlâ müsait mi?', 'text', true, '2026-03-07 10:00:00+00'),
('70000001-0000-4000-a000-000000000018', '8fd73484-9c91-426d-a5ca-5f5926c4529c', 'Tejo manzarası harika!', 'text', true, '2026-03-08 16:00:00+00'),

('70000001-0000-4000-a000-000000000019', '27d578d1-8263-42dd-a63c-081b58b395d3', 'Fatma Hocam, Erasmus başvurusu hakkında soru sorabilir miyim?', 'text', true, '2026-03-09 10:00:00+03'),
('70000001-0000-4000-a000-000000000019', '5993993a-4131-4c6c-b52d-27d2030512b1', 'Tabii Deniz, her zaman sorabilirsin!', 'text', true, '2026-03-09 14:00:00+03'),
('70000001-0000-4000-a000-000000000019', '27d578d1-8263-42dd-a63c-081b58b395d3', 'Teşekkürler Fatma Hocam!', 'text', true, '2026-03-10 11:00:00+03'),

('70000001-0000-4000-a000-000000000020', 'ade644ae-6211-4482-b8d8-456881e4b1b8', 'Poble Sec''teki paylaşımlı oda için gelebilir miyim?', 'text', true, '2026-03-11 10:00:00+01'),
('70000001-0000-4000-a000-000000000020', 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf', 'Harika, pazartesi gel!', 'text', true, '2026-03-12 14:00:00+01');

-- ============================================================
-- STEP 14: NOTIFICATIONS (20 notifications)
-- ============================================================

INSERT INTO notifications (user_id, type, title, description, is_read, related_id, related_type, created_at) VALUES

('27d578d1-8263-42dd-a63c-081b58b395d3', 'message', 'Yeni mesaj: Maria García', 'Maria: "Hola Deniz! Evet, şubat başından itibaren müsait."', false, '70000001-0000-4000-a000-000000000001', 'conversation', '2026-01-05 11:30:00+01'),
('27d578d1-8263-42dd-a63c-081b58b395d3', 'community', 'Gönderine 12 beğeni!', '"Barcelona''ya yeni geldim!" gönderine 12 kişi beğendi.', true, 'e0000001-0000-4000-a000-000000000001', 'post', '2026-01-10 18:00:00+01'),
('27d578d1-8263-42dd-a63c-081b58b395d3', 'event', 'Coffee Meetup yaklaşıyor!', 'Erasmus Coffee Meetup - Barcelona etkinliği 5 Nisan''da. Hazır mısın?', false, 'f0000001-0000-4000-a000-000000000001', 'event', '2026-04-03 09:00:00+01'),

('a8add0f9-6394-45aa-a960-437d094c6501', 'message', 'Yeni mesaj: Lucas Silva', 'Lucas: "Kesinlikle! Lizbon seni büyüleyecek."', true, '70000001-0000-4000-a000-000000000002', 'conversation', '2026-01-10 16:00:00+00'),
('a8add0f9-6394-45aa-a960-437d094c6501', 'booking', 'Rezervasyon onaylandı!', 'Alfama - Tarihi Bina, Manzaralı Oda rezervasyonunuz onaylandı.', true, NULL, 'booking', '2026-01-15 10:00:00+00'),

('e135fa88-6e69-4853-8614-9a128a786b68', 'message', 'Yeni mesaj: Anna Schmidt', 'Anna: "Natürlich! Wohnungsgeberbestätigung hazırlayacağım."', true, '70000001-0000-4000-a000-000000000003', 'conversation', '2026-01-08 11:00:00+01'),
('e135fa88-6e69-4853-8614-9a128a786b68', 'event', 'Language Exchange yaklaşıyor!', 'Türkçe/Almanca Tandem Akşamı 10 Nisan''da Südblock''ta.', false, 'f0000001-0000-4000-a000-000000000002', 'event', '2026-04-08 09:00:00+01'),

('8e6e1fee-9c40-433e-b8eb-6273b96b0d02', 'review', 'Yeni değerlendirme!', 'Sophie Müller ilanınıza 4.5 puan verdi: "Moda''da harika bir konum!"', true, 'd0000001-0000-4000-a000-000000000001', 'listing', '2026-01-15 10:00:00+03'),
('8e6e1fee-9c40-433e-b8eb-6273b96b0d02', 'message', 'Yeni mesaj: Sophie Müller', 'Sophie: "Merhaba Ayşe Hanım! Moda''daki odanız müsait mi?"', false, '70000001-0000-4000-a000-000000000007', 'conversation', '2026-01-22 10:00:00+03'),

('4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'review', 'Yeni değerlendirme!', 'Deniz Aydın ilanınıza 4.9 puan verdi: "Maria harika bir ev sahibi!"', true, 'd0000001-0000-4000-a000-000000000008', 'listing', '2026-01-10 12:00:00+01'),
('4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'community', 'Gönderine 35 beğeni!', '"Barcelona''da yaşamanın 5 altın kuralı" gönderine 35 kişi beğendi.', true, 'e0000001-0000-4000-a000-000000000005', 'post', '2026-01-25 16:00:00+01'),

('1d5113ae-a798-42f3-8570-1641e3a62687', 'message', 'Yeni mesaj: Can Özkan', 'Can: "Süper, o zaman görüşelim!"', true, '70000001-0000-4000-a000-000000000003', 'conversation', '2026-01-08 12:00:00+01'),
('1d5113ae-a798-42f3-8570-1641e3a62687', 'community', 'Gönderine 42 beğeni!', '"Anmeldung randevusu alma rehberi" gönderine 42 kişi beğendi.', true, 'e0000001-0000-4000-a000-000000000008', 'post', '2026-02-10 10:00:00+01'),

('5993993a-4131-4c6c-b52d-27d2030512b1', 'system', 'Mentor profiliniz aktif!', 'Mentor profiliniz onaylandı. Artık öğrencilere yardımcı olabilirsiniz.', true, NULL, 'mentor', '2026-01-01 10:00:00+03'),

('ade644ae-6211-4482-b8d8-456881e4b1b8', 'match', 'Ev arkadaşı eşleşmesi!', 'Deniz Aydın ile %85 uyumluluk! Barcelona''da ev arkadaşı arıyor.', false, '27d578d1-8263-42dd-a63c-081b58b395d3', 'roommate', '2026-02-01 10:00:00+01'),

('b3684764-5ea7-4b10-b01a-8adba3932f0d', 'event', 'Bike Tour kayıtların açıldı!', 'Tempelhofer Feld Bisiklet Turu 25 Nisan''da. Hemen kaydol!', false, 'f0000001-0000-4000-a000-000000000009', 'event', '2026-03-20 12:00:00+01'),

('64feebd7-416d-4c27-bef9-b07190d0c87c', 'price', 'Fiyat düşüşü!', 'Arroios - Öğrenci Dostu Oda fiyatı 24.000 TL''den 22.000 TL''ye düştü.', false, 'd0000001-0000-4000-a000-000000000016', 'listing', '2026-02-01 10:00:00+00'),

('8fd73484-9c91-426d-a5ca-5f5926c4529c', 'review', 'Yeni değerlendirme!', 'Elif Kara ilanınıza 4.6 puan verdi: "Alfama''da yaşamak büyülü!"', true, 'd0000001-0000-4000-a000-000000000014', 'listing', '2026-01-18 10:00:00+00'),

('1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb', 'message', 'Yeni mesaj: Ali Demir', 'Ali: "Obrigado Pedro! See you soon!"', true, '70000001-0000-4000-a000-000000000005', 'conversation', '2026-01-12 16:00:00+00'),

('ffcba7da-3d0a-4547-98cf-c802572a7244', 'event', 'City Tour kaydınız onaylandı!', 'İstanbul City Tour 12 Nisan''da Sultanahmet''te başlıyor.', false, 'f0000001-0000-4000-a000-000000000003', 'event', '2026-03-10 10:00:00+03');

-- ============================================================
-- STEP 15: ROOMMATE PROFILES (5 profiles)
-- ============================================================

INSERT INTO roommate_profiles (user_id, sleep_schedule, cleanliness, smoking, guests_policy, pets_policy, study_preference, interests, exchange_city, exchange_start, exchange_end) VALUES

('27d578d1-8263-42dd-a63c-081b58b395d3', 'Gece kuşu (00:00-08:00)', 'Orta düzey temiz', false,
 'Misafirler haftada 1-2 kez olabilir', 'Kedi olabilir', 'Kafede çalışmayı tercih ederim',
 ARRAY['Yazılım', 'Müzik', 'Futbol', 'Film'],
 'Barcelona', '2026-02-01', '2026-07-30'),

('e135fa88-6e69-4853-8614-9a128a786b68', 'Erken kalkan (06:00-22:00)', 'Çok temiz', false,
 'Misafirler önceden haber verilerek gelebilir', 'Hayır', 'Evde sessiz ortamda çalışırım',
 ARRAY['Bisiklet', 'Doğa', 'Fotoğrafçılık', 'Almanca pratik'],
 'Berlin', '2026-02-01', '2026-07-30'),

('ade644ae-6211-4482-b8d8-456881e4b1b8', 'Gece kuşu (01:00-09:00)', 'Orta düzey temiz', false,
 'Misafirler her zaman hoş geldi', 'Kedi/köpek olabilir', 'Kütüphanede çalışırım genelde',
 ARRAY['Teknoloji', 'Müzik', 'Basketbol', 'Oyun'],
 'Barcelona', '2026-02-01', '2026-07-30'),

('b3684764-5ea7-4b10-b01a-8adba3932f0d', 'Normal (23:00-07:00)', 'Temiz', false,
 'Bazen misafir gelebilir', 'Küçük evcil hayvan olabilir', 'Hem evde hem kafede çalışırım',
 ARRAY['Felsefe', 'Edebiyat', 'Tiyatro', 'Yemek yapma'],
 'Berlin', '2026-03-01', '2026-08-30'),

('64feebd7-416d-4c27-bef9-b07190d0c87c', 'Erken kalkan (05:30-22:00)', 'Orta düzey temiz', false,
 'Misafirler haftada 1 kez', 'Hayır', 'Dışarıda çalışmayı severim',
 ARRAY['Sörf', 'Fotoğrafçılık', 'Yüzme', 'Turizm'],
 'Lizbon', '2026-02-01', '2026-07-30');

-- ============================================================
-- STEP 16: MENTOR PROFILES (3 mentors)
-- ============================================================

INSERT INTO mentor_profiles (user_id, city_id, languages, expertise, status, bio) VALUES

('5993993a-4131-4c6c-b52d-27d2030512b1', 'c0000001-0000-4000-a000-000000000001',
 ARRAY['Türkçe', 'İngilizce', 'Almanca', 'İspanyolca (Temel)'],
 ARRAY['Erasmus başvurusu', 'İkamet izni', 'Sağlık sigortası', 'Bütçe yönetimi', 'Kültür şoku'],
 'active',
 '3 farklı ülkede Erasmus deneyimim var (Almanya, İspanya, Portekiz). Tıp fakültesi mezunuyum ve yurtdışında sağlık sistemi konusunda uzmanım. Erasmus''a gidecek öğrencilere ücretsiz mentorluk yapıyorum.'),

('4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'c0000001-0000-4000-a000-000000000002',
 ARRAY['İspanyolca', 'Katalanca', 'İngilizce', 'Türkçe (Temel)'],
 ARRAY['Barcelona şehir rehberi', 'NIE başvurusu', 'Konut bulma', 'İspanyolca öğrenme'],
 'active',
 'Barcelona''da doğup büyüdüm ve 5 yıldır Erasmus öğrencilerine yardımcı oluyorum. NIE başvurusu, ev bulma ve şehri keşfetme konusunda çok deneyimliyim.'),

('8fd73484-9c91-426d-a5ca-5f5926c4529c', 'c0000001-0000-4000-a000-000000000003',
 ARRAY['Portekizce', 'İngilizce', 'İspanyolca'],
 ARRAY['Lizbon şehir rehberi', 'NIF başvurusu', 'Konut bulma', 'Sörf noktaları'],
 'active',
 'Lizbon''lu öğretmen ve ev sahibiyim. Alfama''da tarihi binam var. Öğrencilere NIF alımı, banka hesabı açma ve şehri keşfetme konusunda yardımcı oluyorum.');

-- ============================================================
-- STEP 17: FAVORITES (10 favorites)
-- ============================================================

INSERT INTO favorites (user_id, listing_id) VALUES
('27d578d1-8263-42dd-a63c-081b58b395d3', 'd0000001-0000-4000-a000-000000000008'),  -- Deniz likes Gràcia room
('27d578d1-8263-42dd-a63c-081b58b395d3', 'd0000001-0000-4000-a000-000000000009'),  -- Deniz likes Gràcia studio
('a8add0f9-6394-45aa-a960-437d094c6501', 'd0000001-0000-4000-a000-000000000014'), -- Elif likes Alfama room
('a8add0f9-6394-45aa-a960-437d094c6501', 'd0000001-0000-4000-a000-000000000018'), -- Elif likes Santos apartment
('e135fa88-6e69-4853-8614-9a128a786b68', 'd0000001-0000-4000-a000-000000000020'), -- Can likes Kreuzberg WG
('e135fa88-6e69-4853-8614-9a128a786b68', 'd0000001-0000-4000-a000-000000000021'), -- Can likes Kreuzberg loft
('a8f8d0ec-73d9-4d02-8679-efa9a0d59716', 'd0000001-0000-4000-a000-000000000010'), -- Zeynep likes Eixample room
('ffcba7da-3d0a-4547-98cf-c802572a7244', 'd0000001-0000-4000-a000-000000000001'), -- Sophie likes Moda room
('b3684764-5ea7-4b10-b01a-8adba3932f0d', 'd0000001-0000-4000-a000-000000000021'), -- Clara likes Kreuzberg loft
('64feebd7-416d-4c27-bef9-b07190d0c87c', 'd0000001-0000-4000-a000-000000000016'); -- Ali likes Arroios room

-- ============================================================
-- STEP 18: BOOKINGS (5 bookings)
-- ============================================================

INSERT INTO bookings (id, user_id, listing_id, host_id, check_in, check_out, total_price, service_fee, status, guest_name, guest_email, guest_phone, guest_university, special_requests) VALUES

('20000001-0000-4000-a000-000000000001',
 '27d578d1-8263-42dd-a63c-081b58b395d3', 'd0000001-0000-4000-a000-000000000008', '4e27ed2f-0ca3-4394-9e63-947a9cdd4dde',
 '2026-02-01', '2026-07-30',
 180000.00, 9000.00, 'confirmed',
 'Deniz Aydın', 'deniz@kotwise.com', '+90 532 111 0001', 'İTÜ',
 'Sessiz bir oda tercih ederim. Balkonlu olursa çok sevinirim.'),

('20000001-0000-4000-a000-000000000002',
 'a8add0f9-6394-45aa-a960-437d094c6501', 'd0000001-0000-4000-a000-000000000014', '8fd73484-9c91-426d-a5ca-5f5926c4529c',
 '2026-02-01', '2026-07-30',
 156000.00, 7800.00, 'confirmed',
 'Elif Kara', 'elif@kotwise.com', '+90 533 111 0002', 'Boğaziçi Üniversitesi',
 'NIF başvurusunda yardım isterim.'),

('20000001-0000-4000-a000-000000000003',
 'e135fa88-6e69-4853-8614-9a128a786b68', 'd0000001-0000-4000-a000-000000000020', '1d5113ae-a798-42f3-8570-1641e3a62687',
 '2026-02-01', '2026-07-30',
 168000.00, 8400.00, 'confirmed',
 'Can Özkan', 'can@kotwise.com', '+90 535 111 0003', 'ODTÜ',
 'Anmeldung belgesi için yardım isterim.'),

('20000001-0000-4000-a000-000000000004',
 'ffcba7da-3d0a-4547-98cf-c802572a7244', 'd0000001-0000-4000-a000-000000000001', '8e6e1fee-9c40-433e-b8eb-6273b96b0d02',
 '2026-02-01', '2026-07-30',
 84000.00, 4200.00, 'completed',
 'Sophie Müller', 'sophie@kotwise.com', '+49 152 111 0011', 'TU Berlin',
 'Sahile yakın olması çok güzel!'),

('20000001-0000-4000-a000-000000000005',
 '64feebd7-416d-4c27-bef9-b07190d0c87c', 'd0000001-0000-4000-a000-000000000016', '1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb',
 '2026-02-15', '2026-07-30',
 121000.00, 6050.00, 'pending',
 'Ali Demir', 'ali@kotwise.com', '+90 542 111 0020', 'Dokuz Eylül Üniversitesi',
 'Sörf tahtası koyabilecek bir yer var mı?');

-- ============================================================
-- STEP 19: HOST APPLICATIONS (for hosts)
-- ============================================================

INSERT INTO host_applications (user_id, status, address, rooms, notes, reviewed_at) VALUES
('8e6e1fee-9c40-433e-b8eb-6273b96b0d02', 'approved', 'Caferağa Mah. Moda Cad. No:42, Kadıköy', 2, 'Moda''da 3+1 dairem var, 2 oda kiraya veriyorum.', '2025-12-01 10:00:00+03'),
('b4ef7afc-fade-4258-9b97-e38b4fafe5a1', 'approved', 'Sinanpaşa Mah. Beşiktaş Cad. No:55, Beşiktaş', 3, 'Beşiktaş ve Cihangir''de 2 dairem var.', '2025-12-05 10:00:00+03'),
('4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', 'approved', 'Carrer de Verdi 45, Gràcia', 2, 'Gràcia''da 2+1 dairem var.', '2025-12-10 10:00:00+01'),
('8fd73484-9c91-426d-a5ca-5f5926c4529c', 'approved', 'Rua de São Miguel 28, Alfama', 3, 'Alfama''da tarihi binada 3 dairem var.', '2025-12-15 10:00:00+00'),
('c71fd4b3-dcfe-4f92-b517-2abbcea151bf', 'approved', 'Carrer de Mallorca 320, Eixample', 2, 'Eixample ve Poble Sec''te dairelerim var.', '2025-12-20 10:00:00+01'),
('1d6b5ea7-cac7-4c6e-b3d1-f49a43df46eb', 'approved', 'Avenida Almirante Reis 120, Arroios', 2, 'Arroios ve Santos''ta dairelerim var.', '2025-12-25 10:00:00+00'),
('c7cce9d9-765e-40bd-99b3-40bc64681cb2', 'approved', 'Via Montenapoleone 15, Milano', 1, 'Milano merkezde dairem var.', '2025-12-28 10:00:00+01'),
('231b92fb-bbc7-44b8-ae9c-f0c705255e71', 'approved', 'Abbasağa Mah. Süleyman Seba Cad. No:88, Beşiktaş', 2, 'Beşiktaş ve Moda''da dairelerim var.', '2025-12-30 10:00:00+03');

-- ============================================================
-- STEP 20: EARNINGS (for confirmed/completed bookings)
-- ============================================================

INSERT INTO earnings (host_id, booking_id, amount, commission, net_amount, period) VALUES
('4e27ed2f-0ca3-4394-9e63-947a9cdd4dde', '20000001-0000-4000-a000-000000000001', 180000.00, 18000.00, 162000.00, '2026-02'),
('8fd73484-9c91-426d-a5ca-5f5926c4529c', '20000001-0000-4000-a000-000000000002', 156000.00, 15600.00, 140400.00, '2026-02'),
('1d5113ae-a798-42f3-8570-1641e3a62687', '20000001-0000-4000-a000-000000000003', 168000.00, 16800.00, 151200.00, '2026-02'),
('8e6e1fee-9c40-433e-b8eb-6273b96b0d02', '20000001-0000-4000-a000-000000000004', 84000.00, 8400.00, 75600.00, '2026-02');

COMMIT;

-- ============================================================
-- VERIFICATION QUERIES (run after seed to verify data)
-- ============================================================

-- Uncomment these to verify:
-- SELECT 'profiles' AS tablo, COUNT(*) AS sayi FROM profiles
-- UNION ALL SELECT 'cities', COUNT(*) FROM cities
-- UNION ALL SELECT 'neighborhoods', COUNT(*) FROM neighborhoods
-- UNION ALL SELECT 'city_faqs', COUNT(*) FROM city_faqs
-- UNION ALL SELECT 'listings', COUNT(*) FROM listings
-- UNION ALL SELECT 'listing_images', COUNT(*) FROM listing_images
-- UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
-- UNION ALL SELECT 'posts', COUNT(*) FROM posts
-- UNION ALL SELECT 'post_comments', COUNT(*) FROM post_comments
-- UNION ALL SELECT 'post_likes', COUNT(*) FROM post_likes
-- UNION ALL SELECT 'events', COUNT(*) FROM events
-- UNION ALL SELECT 'event_participants', COUNT(*) FROM event_participants
-- UNION ALL SELECT 'conversations', COUNT(*) FROM conversations
-- UNION ALL SELECT 'messages', COUNT(*) FROM messages
-- UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
-- UNION ALL SELECT 'roommate_profiles', COUNT(*) FROM roommate_profiles
-- UNION ALL SELECT 'mentor_profiles', COUNT(*) FROM mentor_profiles
-- UNION ALL SELECT 'favorites', COUNT(*) FROM favorites
-- UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
-- UNION ALL SELECT 'host_applications', COUNT(*) FROM host_applications
-- UNION ALL SELECT 'earnings', COUNT(*) FROM earnings;
