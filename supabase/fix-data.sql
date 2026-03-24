-- ============================================================
-- DATA FIX SCRIPT - Run via Supabase SQL Editor
-- Fixes: Turkish chars, participant_count, like_count, comment_count,
--        city transport_info/cost_breakdown/tips/cultural_notes
-- ============================================================

-- ============================================================
-- FIX 1: Istanbul city data (transport, cost, tips, cultural_notes, name)
-- ============================================================

UPDATE cities SET
  name = 'İstanbul',
  country = 'Türkiye',
  transport_info = '{"metro": "İstanbul Metro - 7 hat, İstanbulkart ile aylık 1.200 TL", "bus": "İETT otobüsleri tüm şehri kapsar", "ferry": "Vapur ile Avrupa-Asya arası ulaşım", "taxi": "BiTaksi veya Uber uygulamaları", "tip": "İstanbulkart mutlaka alın, tüm toplu taşımada geçerli"}'::jsonb,
  cost_breakdown = '{"rent": "12.000-25.000 TL/ay", "food": "3.000-5.000 TL/ay", "transport": "1.200 TL/ay", "utilities": "1.500-2.500 TL/ay", "phone": "200-400 TL/ay", "entertainment": "1.500-3.000 TL/ay", "total_estimate": "19.000-36.000 TL/ay"}'::jsonb,
  tips = ARRAY['İstanbulkart ile tüm toplu taşıma araçlarını kullanabilirsiniz', 'Kadıköy ve Beşiktaş öğrenci dostu semtlerdir', 'Su faturası genellikle kiraya dahildir', 'Pazarlardan alışveriş yapmak market fiyatlarının yarısına denk gelir', 'HES kodu ile hastanelere ücretsiz giriş yapabilirsiniz'],
  cultural_notes = ARRAY['Çay ikram etmek Türk misafirperverliğinin simgesidir', 'Evlere girerken ayakkabıları çıkarmak yaygındır', 'Pazarlık kültürü hâlâ yaşamaktadır, özellikle Kapalıçarşı''da', 'Ramazan ayında gündüz yeme-içme konusunda hassas olunmalıdır']
WHERE id = 'c0000001-0000-4000-a000-000000000001';

-- Barcelona
UPDATE cities SET
  country = 'İspanya',
  transport_info = '{"metro": "TMB Metro - 12 hat, T-Casual 10 yolculuk 11.35€", "bus": "TMB otobüsleri gece dahil çalışır", "tram": "Tramvia - sahil hattı", "bike": "Bicing paylaşımlı bisiklet sistemi 50€/yıl", "tip": "T-Jove trimestral kartı 25 yaş altı öğrenciler için en ekonomik seçenek"}'::jsonb,
  cost_breakdown = '{"rent": "800-1.300€/ay", "food": "200-350€/ay", "transport": "40-55€/ay", "utilities": "80-120€/ay", "phone": "15-25€/ay", "entertainment": "100-200€/ay", "total_estimate": "1.235-2.050€/ay"}'::jsonb,
  tips = ARRAY['Siesta kültürü var, 14:00-17:00 arası birçok dükkan kapalıdır', 'Plajda değerli eşyalarınıza dikkat edin, yankesicilik yaygın', 'İspanyolca bilmek hayatı çok kolaylaştırır, Katalanca da yaygın', 'Mercat de la Boqueria turistik, yerel pazarları tercih edin', 'Gece hayatı genellikle gece 00:00''dan sonra başlar'],
  cultural_notes = ARRAY['Akşam yemeği genellikle 21:00-22:00 arası yenir', 'Pazar günleri çoğu dükkan kapalıdır', 'Çift yanak öpmesi yaygın selamlaşma şeklidir', 'Katalanca öğrenmek yerelleri memnun eder']
WHERE id = 'c0000001-0000-4000-a000-000000000002';

-- Lisbon
UPDATE cities SET
  transport_info = '{"metro": "Metropolitano de Lisboa - 4 hat", "tram": "Tarihi 28 numaralı tramvay", "bus": "Carris otobüsleri", "train": "CP trenleri Sintra ve Cascais''e", "tip": "Viva Viagem kartı alın, tüm toplu taşımada geçerli"}'::jsonb,
  cost_breakdown = '{"rent": "600-1.000€/ay", "food": "200-300€/ay", "transport": "40€/ay", "utilities": "80-120€/ay", "phone": "15-20€/ay", "entertainment": "80-150€/ay", "total_estimate": "1.015-1.630€/ay"}'::jsonb,
  tips = ARRAY['Pastéis de Belém mutlaka deneyin', 'Alfama''da kaybolmak en güzel keşif yoludur', 'Sintra günübirlik gezi için ideal', 'Öğrenci kartı ile müzelere indirimli giriş'],
  cultural_notes = ARRAY['Fado müziği Portekiz kültürünün önemli parçasıdır', 'Saudade kavramı Portekizlilerin ruh halini yansıtır', 'Öğle yemeği genellikle uzun sürer', 'Portekizliler çok misafirperverdir']
WHERE id = 'c0000001-0000-4000-a000-000000000003';

-- Berlin
UPDATE cities SET
  transport_info = '{"ubahn": "U-Bahn metro sistemi - 10 hat", "sbahn": "S-Bahn banliyö treni", "bus": "BVG otobüsleri 7/24 çalışır", "tram": "Doğu Berlin''de tramvay ağı", "tip": "Semesterticket ile 6 ay boyunca sınırsız toplu taşıma"}'::jsonb,
  cost_breakdown = '{"rent": "600-1.000€/ay", "food": "200-300€/ay", "transport": "29€/ay (Deutschlandticket)", "utilities": "100-150€/ay", "phone": "10-20€/ay", "entertainment": "80-150€/ay", "total_estimate": "1.019-1.650€/ay"}'::jsonb,
  tips = ARRAY['Pfand sistemi: şişeleri iade ederek para alabilirsiniz', 'Pazar günleri marketler kapalıdır, önceden alışveriş yapın', 'Anmeldung (adres kaydı) ilk hafta mutlaka yapılmalı', 'Döner Berlin''in ünlü sokak yemeğidir'],
  cultural_notes = ARRAY['Almanlar dakikliğe çok önem verir', 'Pazar günleri sessiz olmak önemlidir (Ruhetag)', 'Nakit ödeme hâlâ çok yaygındır, kart her yerde geçmez', 'Bisiklet kullanımı çok yaygın, bisiklet yollarına dikkat']
WHERE id = 'c0000001-0000-4000-a000-000000000004';


-- ============================================================
-- FIX 2: Profile Turkish characters
-- ============================================================

UPDATE profiles SET full_name = 'Ayşe Yılmaz', university = 'Marmara Üniversitesi', home_city = 'İstanbul', home_country = 'Türkiye'
WHERE full_name = 'Ayse Yilmaz';

UPDATE profiles SET home_city = 'İstanbul', home_country = 'Türkiye'
WHERE full_name = 'Mehmet Kaya';

UPDATE profiles SET major = 'Uluslararası İlişkiler', home_country = 'Almanya'
WHERE full_name = 'Anna Schmidt';

UPDATE profiles SET major = 'Endüstriyel Tasarım', home_country = 'İtalya'
WHERE full_name = 'Marco Rossi';

UPDATE profiles SET major = 'Çevre Mühendisliği', home_country = 'Almanya'
WHERE full_name = 'Sophie Muller';

UPDATE profiles SET full_name = 'Sophie Müller'
WHERE full_name = 'Sophie Muller';

UPDATE profiles SET major = 'Mimarlık', home_country = 'İspanya'
WHERE full_name = 'Carlos Martinez';

UPDATE profiles SET full_name = 'Carlos Martínez'
WHERE full_name = 'Carlos Martinez';

UPDATE profiles SET full_name = 'Fatma Şahin', university = 'İstanbul Üniversitesi', major = 'Tıp', home_city = 'İstanbul', home_country = 'Türkiye'
WHERE full_name = 'Fatma Sahin';

UPDATE profiles SET major = 'Yazılım Mühendisliği'
WHERE full_name = 'Pedro Santos';

UPDATE profiles SET major = 'Sosyoloji', home_country = 'Almanya'
WHERE full_name = 'Lena Weber';

UPDATE profiles SET major = 'Ekonomi', home_country = 'İtalya'
WHERE full_name = 'Giulia Romano';

UPDATE profiles SET full_name = 'Emre Yıldız', university = 'Sabancı Üniversitesi', major = 'Yönetim Bilimleri', home_city = 'İstanbul', home_country = 'Türkiye'
WHERE full_name = 'Emre Yildiz';

UPDATE profiles SET full_name = 'Deniz Aydın', university = 'İTÜ', major = 'Bilgisayar Mühendisliği', home_city = 'İstanbul', home_country = 'Türkiye'
WHERE full_name = 'Deniz Aydin';

UPDATE profiles SET full_name = 'Can Özkan'
WHERE id = 'e135fa88-6e69-4853-8614-9a128a786b68';

UPDATE profiles SET full_name = 'Ramazan Durmuş'
WHERE full_name = 'Ramazan Durmus';

UPDATE profiles SET full_name = 'Ahmet Han Çebi'
WHERE id = '7bc0b4bd-607a-494b-a1e7-fe64c05981e3';

UPDATE profiles SET full_name = 'María García', major = 'Psikoloji', home_country = 'İspanya'
WHERE full_name = 'Maria Garcia';

UPDATE profiles SET home_country = 'İspanya'
WHERE id = 'c71fd4b3-dcfe-4f92-b517-2abbcea151bf';


-- ============================================================
-- FIX 3: Event participant_count from actual data
-- ============================================================

UPDATE events SET participant_count = (
  SELECT COUNT(*) FROM event_participants WHERE event_id = events.id
);


-- ============================================================
-- FIX 4: Post like_count and comment_count from actual data
-- ============================================================

UPDATE posts SET
  like_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id),
  comment_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = posts.id);


-- ============================================================
-- FIX 5: Event titles with Turkish chars
-- ============================================================

UPDATE events SET title = 'Language Exchange Night - Türkçe/Almanca'
WHERE id = 'f0000001-0000-4000-a000-000000000002';

UPDATE events SET title = 'İstanbul City Tour for Erasmus Students'
WHERE id = 'f0000001-0000-4000-a000-000000000003';

UPDATE events SET title = 'Berlin Study Group - Kütüphane Buluşması'
WHERE id = 'f0000001-0000-4000-a000-000000000006';

UPDATE events SET title = 'Boğazda Tekne Turu'
WHERE id = 'f0000001-0000-4000-a000-000000000008';

UPDATE events SET title = 'Tempelhofer Feld Bisiklet Turu'
WHERE id = 'f0000001-0000-4000-a000-000000000009';


-- ============================================================
-- FIX 6: Notification descriptions with Turkish chars
-- ============================================================

UPDATE notifications SET description = 'Gönderine 12 beğeni aldı!'
WHERE description LIKE '%begeni%' OR description LIKE '%Gonderine%';

UPDATE notifications SET description = 'Yeni bir mesajınız var'
WHERE description LIKE '%mesajiniz%';


-- ============================================================
-- FIX 7: City FAQ Turkish characters
-- ============================================================

UPDATE city_faqs SET
  question = 'İstanbul''da öğrenci olarak aylık ne kadar harcama yapılır?',
  answer = 'Ortalama aylık harcama kira dahil 19.000-36.000 TL arasındadır. Kira en büyük kalem olup 12.000-25.000 TL arasında değişir. Yemek 3.000-5.000 TL, ulaşım İstanbulkart ile 1.200 TL civarıdır.'
WHERE city_id = 'c0000001-0000-4000-a000-000000000001' AND category = 'maliyet';

UPDATE city_faqs SET
  question = 'İstanbul''da en güvenli öğrenci semtleri nereler?',
  answer = 'Kadıköy (Moda dahil), Beşiktaş ve Cihangir öğrenciler için en popüler ve güvenli semtlerdir. Kadıköy Asya yakasında, Beşiktaş ve Cihangir Avrupa yakasındadır.'
WHERE city_id = 'c0000001-0000-4000-a000-000000000001' AND category = 'konaklama';

UPDATE city_faqs SET
  question = 'İstanbulkart nasıl alınır?',
  answer = 'Metro istasyonları ve bazı büfelerde satılır. Kart ücreti yaklaşık 70 TL''dir. HES kodu ile kişiselleştirilip öğrenci indirimi uygulanabilir.'
WHERE city_id = 'c0000001-0000-4000-a000-000000000001' AND category = 'ulaşım';

UPDATE city_faqs SET
  question = 'İstanbul''da yabancı öğrenci olarak sağlık sigortası gerekli mi?',
  answer = 'Evet, ikamet izni başvurusu için geçerli sağlık sigortası zorunludur. SGK''ya kayıt olabilir veya özel sigorta yaptırabilirsiniz. Erasmus öğrencileri genellikle Avrupa Sağlık Kartı kullanır.'
WHERE city_id = 'c0000001-0000-4000-a000-000000000001' AND category = 'sağlık';


-- ============================================================
-- FIX 8: Broken Unsplash image URLs in listing_images
-- 5 broken URLs: typo, expired, or invalid photo IDs
-- ============================================================

-- Fix 1: photo-1502672260266-1c1ef2d93688 (broken)
UPDATE listing_images SET url = REPLACE(url, 'photo-1502672260266-1c1ef2d93688', 'photo-1560185007-cde436f6a4d0')
WHERE url LIKE '%photo-1502672260266-1c1ef2d93688%';

-- Fix 2: photo-1554995207-c18c203602cb (broken)
UPDATE listing_images SET url = REPLACE(url, 'photo-1554995207-c18c203602cb', 'photo-1484154218962-a197022b5858')
WHERE url LIKE '%photo-1554995207-c18c203602cb%';

-- Fix 3: photo-1560448204-61dc36dc98c8 (broken)
UPDATE listing_images SET url = REPLACE(url, 'photo-1560448204-61dc36dc98c8', 'photo-1556020685-ae41abfc9365')
WHERE url LIKE '%photo-1560448204-61dc36dc98c8%';

-- Fix 4: photo-1598928506311-c55ez637a5 (TYPO - invalid photo ID)
UPDATE listing_images SET url = REPLACE(url, 'photo-1598928506311-c55ez637a5', 'photo-1600585154340-be6161a56a0c')
WHERE url LIKE '%photo-1598928506311-c55ez637a5%';

-- Fix 5: photo-1560448076-28a11c8a93a7 (broken)
UPDATE listing_images SET url = REPLACE(url, 'photo-1560448076-28a11c8a93a7', 'photo-1586023492125-27b2c045efd7')
WHERE url LIKE '%photo-1560448076-28a11c8a93a7%';


-- Verify results
SELECT 'events' as table_name, id, participant_count FROM events LIMIT 5;
SELECT 'posts' as table_name, id, like_count, comment_count FROM posts LIMIT 5;
SELECT 'profiles' as table_name, id, full_name FROM profiles WHERE full_name LIKE '%zkan%' OR full_name LIKE '%Aydin%' OR full_name LIKE '%Yilmaz%';
SELECT 'cities' as table_name, id, name, country FROM cities;
