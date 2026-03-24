# DEEP INSPECTION REPORT - Kotwise V2

**Date**: 2026-03-24
**Inspector**: Deep Inspector AI
**Server**: http://localhost:3336
**Device**: Mobile viewport 393x852

---

## CRITICAL ISSUES

### C1. Event participant_count always shows 0
- **Pages**: /events, /events/[id], / (home)
- **Details**: All events display "0/20 katilimci", "0/15 katilimci", etc. despite `event_participants` table having real data (4 participants for Coffee Meetup, 4 for Language Exchange, etc.)
- **Root cause**: The `participant_count` column in the `events` table is likely 0 and not computed from the `event_participants` join table. Either a database trigger is missing, or the column needs to be a computed/virtual field.
- **Files**: `src/app/events/page.tsx:237`, `src/hooks/useEvents.ts`

### C2. Community post comment_count and like_count show 0 despite having real data
- **Page**: /community/[id] (post detail)
- **Details**: Post detail shows "0 begeni" and "0 yorum" but there are 3 visible comments below (Ahmet Han Cebi, Ramazan Durmus, Ahmet Han Cebi). The `comment_count` and `like_count` fields in the `posts` table are stale at 0.
- **Root cause**: Same issue as C1 - counts stored as denormalized columns but never updated.
- **Files**: `src/app/community/[id]/page.tsx:204,208`

### C3. Turkish diacritics lost in database
- **Pages**: /profile, /profile/edit, /notifications, /roommates, /community/[id], SSS tab on city page
- **Details**: Seed data has proper Turkish ("Deniz Aydin" -> should be "Deniz Aydin"), but displayed data shows ASCII-only Turkish:
  - Profile: "Deniz Aydin" instead of "Deniz Aydin" (seed says "Aydin")
  - Profile edit: "Bilgisayar Muhendisligi" instead of "Muhendisligi"
  - Profile edit: "Istanbul" instead of "Istanbul", "Turkiye" instead of "Turkiye"
  - Notifications: "Gonderine 12 begeni" instead of "Gonderine 12 begeni"
  - Roommates: "Can Ozkan" displayed with broken character (diamond question mark before "zkan")
  - SSS tab: "ogrenci", "alinir", "saglik", "sigortasi", "yasanabilir" - all missing Turkish special characters
- **Root cause**: The database data lost Turkish diacritics (O, u, i, s, c, g) during seeding or migration. The `full_name` field in `profiles` table contains ASCII-only versions.
- **Impact**: App looks broken/unprofessional to Turkish users.

---

## HIGH ISSUES

### H1. Favorite listings show "Kotwise" orange placeholder instead of real images
- **Page**: /favorites
- **Details**: Both favorite listing cards show large orange "Kotwise" placeholder text. The `listing_images` are either empty or the URLs are failing.
- **Files**: `src/app/favorites/page.tsx:152-154`, `src/hooks/useFavorites.ts:24`

### H2. Booking card shows "Kotwise" placeholder image
- **Page**: /profile/bookings
- **Details**: The booking card for "Gracia - Gunesli Balkonlu Oda" shows orange "Kotwise" placeholder. The `booking.listing.images` join is not returning image data.
- **Files**: `src/app/profile/bookings/page.tsx:142-143`

### H3. City page missing "Ilanlar" tab
- **Page**: /city/[id]
- **Details**: The city detail page has tabs: Bilgi, Mahalleler, Ulasim, Maliyet, SSS. There is NO "Ilanlar" (Listings) tab. Users cannot see listings for this city from the city page.
- **Files**: `src/app/city/[id]/page.tsx:28-34` - TABS array only has 5 tabs, no listings tab.

### H4. City "Bilgi", "Ulasim", "Maliyet" tabs show empty "henuz eklenmedi" messages
- **Page**: /city/c0000001-0000-4000-a000-000000000001 (Istanbul)
- **Details**: Bilgi tab shows "Bilgi henuz eklenmedi.", Ulasim shows "Ulasim bilgisi henuz eklenmedi.", Maliyet shows "Maliyet bilgisi henuz eklenmedi." Only Mahalleler and SSS have real data.
- **Root cause**: The `cultural_notes`, `tips`, `transport_info`, and `cost_breakdown` fields are null/empty in the database for Istanbul.

### H5. Search page initial loading state - spinner persists for several seconds
- **Page**: /search
- **Details**: When first visiting /search, it shows "Araniyor..." text and "Ilanlar yukleniyor..." with a spinner. After scrolling, data loads. The initial load takes too long.
- **Impact**: Users may think the page is broken.

### H6. Compare page shows "WiFi: Yok" for both listings
- **Page**: /compare
- **Details**: Both compared listings show WiFi = "Yok". If these listings actually have WiFi, this is wrong data. The `ESME` label is also cut off by the N button overlay (should be "BESME" or similar).

### H7. Home page city auto-select not visible
- **Page**: / (home)
- **Details**: Test detected no city name visible on the home page (CITY_AUTOSELECT: []). The city selector exists but may not be highlighting the selected city clearly.

### H8. Event time format shows seconds
- **Pages**: /events
- **Details**: Events show times like "11:00:00", "20:00:00", "23:00:00" with unnecessary seconds. Should be "11:00", "20:00", "23:00".
- **Files**: `src/app/events/page.tsx:208` - displays `{ev.time}` raw from database.

---

## MEDIUM ISSUES

### M1. Roommate card "Can Ozkan" - broken character rendering
- **Pages**: /roommates, /roommates/[id]
- **Details**: The name shows as "Can [diamond]zkan" where the Turkish "O" (O with umlaut) renders as a replacement character. This is a Unicode encoding issue in the displayed data.

### M2. Profile stats show "0.0" for Puan (rating)
- **Page**: /profile
- **Details**: Stats row shows: 0 Ilanlar, 2 Favoriler, 0 Rezervasyonlar, 0.0 Puan. The "0.0" format is odd - should be "0" or "-" when no ratings exist.

### M3. Community page shows "Topluluk" heading duplicated at bottom
- **Page**: /community
- **Details**: When scrolled down, there's a "Topluluk" label appearing near the bottom nav, creating visual confusion.

### M4. Messages page - no timestamps for "simdi" conversations
- **Page**: /messages
- **Details**: The Coffee Meetup conversation shows "simdi" but other timestamps show "10 Mar", "10 Sub", "6 Oca" which is fine. No AM/PM or time-of-day for recent messages.

### M5. Bottom nav overlaps with N button (Next.js devtools)
- **Pages**: Multiple pages
- **Details**: The "N" (Next.js devtools) button in the bottom-left corner overlaps with the bottom navigation. While this is dev-only, it makes testing harder.

### M6. Search/map page - no real map tiles visible
- **Page**: /search/map
- **Details**: The map shows price bubbles (22.000 TL, 18.000 TL, etc.) floating on a very faint/empty background. There's a message "Harita yakinda aktif olacak" at the bottom. The map background is almost invisible.

### M7. Listing detail - review username shows broken character
- **Page**: /listing/[id]
- **Details**: Review by "Can Ozkan" shows as "Can [diamond]zkan" same as roommate card.

### M8. Community new post page shows "Deniz Aydon" (not "Aydin")
- **Page**: /community/new
- **Details**: The author name above the text area shows "Deniz Aydon" with a possible character rendering issue (the "i" might be displayed as "o" with a dot).

### M9. Event detail shows "Katilimcilar (0)" but displays 4 avatar circles
- **Page**: /events/[id]
- **Details**: Event detail for Coffee Meetup shows "Katilimcilar (0)" header but below it shows 4 colored avatar circles (M, C, Z, A). The count doesn't match the displayed avatars.

### M10. Booking price shows "180000 TRY" without formatting
- **Page**: /profile/bookings
- **Details**: The booking card shows "180000 TRY" instead of "180.000 TRY" or "180.000 TL". Missing thousand-separator formatting and inconsistent currency label (TRY vs TL).

### M11. Home page listings section shows only 1 card
- **Page**: / (home)
- **Details**: "Bu Sehirdeki Ilanlar" section detected only 1 listing card. Should show more to give users a preview.

### M12. Compare page - "ESME" label cut off by navigation
- **Page**: /compare
- **Details**: The row label text "ESME" (likely "BESME" or another attribute) is partially hidden by the bottom N button.

---

## LOW ISSUES

### L1. Listing detail "Benzer Ilanlar" images are very small
- **Page**: /listing/[id]
- **Details**: The similar listings at the bottom use very small card images. Could benefit from larger thumbnails.

### L2. Profile page "Yardim" link cut off by bottom nav
- **Page**: /profile
- **Details**: The "Yardim" menu item at the bottom of the profile page is partially hidden behind the bottom navigation bar.

### L3. Budget page city selector defaulting to empty "Sehir secin..."
- **Page**: /budget
- **Details**: The city dropdown shows "Sehir secin..." by default. Could auto-select user's preferred city.

### L4. Hashtags on community post page use camelCase without proper Turkish
- **Page**: /community/new
- **Details**: Hashtags like #ErasmusHayati, #OgrenciYasam, #SehirKesfi, #YurtDisiEgitim, #BursIpuclari, #YemekTarifleri, #KulturSoku use ASCII-only Turkish.

### L5. Mentors page shows only 1 mentor
- **Page**: /mentors
- **Details**: Only Maria Garcia from Barcelona is shown. Very limited content.

### L6. Events new page - date format placeholder "dd.mm.yyyy"
- **Page**: /events/new
- **Details**: Shows "dd.mm.yyyy" as placeholder which is fine, but no date picker calendar is visible.

### L7. Host/apply page "Devam" button looks disabled/muted
- **Page**: /host/apply
- **Details**: The "Devam >" button at the bottom has a muted appearance.

### L8. Listing new page step indicators not styled as numbered steps
- **Page**: /listing/new
- **Details**: The 4-step progress indicators are shown as colored bars but test found 0 explicit step indicator elements.

### L9. Notifications show "simdi" for Coffee Meetup but "10 Oca" and "5 Oca" for others
- **Page**: /notifications
- **Details**: Time format inconsistency - some show "simdi", others show date. A relative time format would be more consistent.

---

## WHAT'S WORKING WELL (DO NOT BREAK)

1. **Welcome page** - Clean design, good gradient, stats counters (2.500+, 45+, 12.000+), Turkish text correct
2. **Onboarding flow** - 3 steps working with "Devam Et" button, step indicators visible, good icons
3. **Login page** - Clean form, Google/Apple social login buttons, "Sifremi Unuttum" link, "Kayit Ol" link at bottom
4. **Forgot password page** - Simple and clear design
5. **Bottom navigation** - Present on all main pages (Ana Sayfa, Kesfet, Topluluk, Mesajlar, Profil)
6. **Messages system** - Conversation list with avatars, timestamps, chat bubbles with sent/received distinction, group chat support, "Cevrimi^i" (online) indicator
7. **Settings page** - Complete with language, currency, dark theme, notification toggles, privacy settings, version number
8. **City page Mahalleler tab** - Beautiful neighborhood cards with images (Besiktas, Cihangir, Kadikoy, Moda) with safety scores and rent prices
9. **City page SSS tab** - FAQ accordion working with expand/collapse
10. **Budget calculator** - Interactive sliders for Kira, Yemek, Ulasim, Eglence, Diger with EUR totals
11. **Listing detail page** - Image carousel, host info with "SUPERHOST" badge, amenity icons, price display, description, reviews, similar listings, "Rezervasyon Yap" CTA
12. **Event detail page** - Cover image, date formatting (5 Nisan 2026, Pazar), organizer info, "Etkinlik Sohbeti" section, "Ayril" button
13. **Community post detail** - Post content, hashtags, comments with timestamps, "Yorum yaz..." input
14. **Roommate detail** - Compatibility percentage, interest tags, lifestyle traits (Gece kusu, Cok temiz, Sigara icmez), action buttons
15. **Profile page** - Avatar image loading, verified badge, menu items with icons
16. **Profile edit** - All fields populated (name, university, department, city, country, phone, about), interest chips, photo upload
17. **Host calendar** - Calendar rendering with month navigation, day states (Musait, Dolu, Beklemede)
18. **Host earnings** - Clean earnings display with Brut/Komisyon/Net breakdown
19. **Compare page** - Side-by-side comparison with all attributes (Fiyat, Konum, Oda Tipi, Esyali, WiFi, Puan, Max Kisi)
20. **Community new post** - Form with photo/location attachment, hashtag selection
21. **Event create form** - Complete form with category, city, date/time pickers, description, max participants

---

## SUMMARY

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 8 |
| MEDIUM | 12 |
| LOW | 9 |
| **TOTAL** | **32** |

**Top priorities to fix:**
1. Fix Turkish diacritics in database (C3) - affects almost every page
2. Fix participant_count and like_count/comment_count computations (C1, C2)
3. Fix favorite and booking listing images (H1, H2)
4. Add "Ilanlar" tab to city page (H3)
5. Fix event time format to remove seconds (H8)
6. Populate Istanbul Bilgi/Ulasim/Maliyet data (H4)
