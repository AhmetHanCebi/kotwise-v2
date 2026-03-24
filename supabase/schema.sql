-- ============================================================
-- KOTWISE V2 — Complete Database Schema
-- 23 Tables, Enums, RLS, Indexes, Triggers
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE room_type AS ENUM ('studio', 'single', 'shared', 'apartment');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE message_type AS ENUM ('text', 'image', 'location', 'voice', 'system');
CREATE TYPE notification_type AS ENUM ('message', 'match', 'booking', 'price', 'review', 'event', 'community', 'system');
CREATE TYPE post_type AS ENUM ('text', 'photo', 'question', 'tip');
CREATE TYPE event_category AS ENUM ('coffee', 'sports', 'language', 'city_tour', 'party', 'study', 'food', 'other');
CREATE TYPE host_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE mentor_status AS ENUM ('active', 'inactive');

-- ============================================================
-- HELPER: updated_at trigger function
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. PROFILES
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  university TEXT,
  major TEXT,
  bio TEXT,
  home_city TEXT,
  home_country TEXT,
  exchange_city_id UUID,
  languages TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  is_host BOOLEAN DEFAULT FALSE,
  is_mentor BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_exchange_city ON profiles(exchange_city_id);
CREATE INDEX idx_profiles_university ON profiles(university);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. CITIES
-- ============================================================

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  population INTEGER,
  avg_rent NUMERIC(10,2),
  student_count INTEGER,
  safety_score NUMERIC(3,1),
  currency TEXT,
  timezone TEXT,
  image_url TEXT,
  transport_info JSONB DEFAULT '{}',
  cost_breakdown JSONB DEFAULT '{}',
  tips TEXT[] DEFAULT '{}',
  emergency_info JSONB DEFAULT '{}',
  visa_info JSONB DEFAULT '{}',
  cultural_notes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cities_country ON cities(country);
CREATE INDEX idx_cities_name ON cities(name);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by everyone" ON cities
  FOR SELECT USING (true);
CREATE POLICY "Only admins can modify cities" ON cities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_verified = true)
  );

CREATE TRIGGER cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add FK from profiles to cities (deferred because cities didn't exist yet)
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_exchange_city
  FOREIGN KEY (exchange_city_id) REFERENCES cities(id) ON DELETE SET NULL;

-- ============================================================
-- 3. NEIGHBORHOODS
-- ============================================================

CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vibe TEXT,
  avg_rent NUMERIC(10,2),
  safety NUMERIC(3,1),
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_neighborhoods_city ON neighborhoods(city_id);

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Neighborhoods are viewable by everyone" ON neighborhoods
  FOR SELECT USING (true);

CREATE TRIGGER neighborhoods_updated_at
  BEFORE UPDATE ON neighborhoods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. CITY_FAQS
-- ============================================================

CREATE TABLE city_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_city_faqs_city ON city_faqs(city_id);
CREATE INDEX idx_city_faqs_category ON city_faqs(category);

ALTER TABLE city_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FAQs are viewable by everyone" ON city_faqs
  FOR SELECT USING (true);

CREATE TRIGGER city_faqs_updated_at
  BEFORE UPDATE ON city_faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. LISTINGS
-- ============================================================

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  price_per_month NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  room_type room_type DEFAULT 'single',
  max_guests INTEGER DEFAULT 1,
  is_furnished BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  match_score NUMERIC(5,2) DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  included_utilities TEXT[] DEFAULT '{}',
  university_name TEXT,
  university_distance_km NUMERIC(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_listings_host ON listings(host_id);
CREATE INDEX idx_listings_city ON listings(city_id);
CREATE INDEX idx_listings_neighborhood ON listings(neighborhood_id);
CREATE INDEX idx_listings_price ON listings(price_per_month);
CREATE INDEX idx_listings_room_type ON listings(room_type);
CREATE INDEX idx_listings_active ON listings(is_active);
CREATE INDEX idx_listings_rating ON listings(rating DESC);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings are viewable by everyone" ON listings
  FOR SELECT USING (is_active = true OR host_id = auth.uid());
CREATE POLICY "Hosts can insert own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = host_id);

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. LISTING_IMAGES
-- ============================================================

CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);

ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listing images are viewable by everyone" ON listing_images
  FOR SELECT USING (true);
CREATE POLICY "Hosts can manage listing images" ON listing_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.host_id = auth.uid())
  );

CREATE TRIGGER listing_images_updated_at
  BEFORE UPDATE ON listing_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 7. BOOKINGS
-- ============================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  service_fee NUMERIC(10,2) DEFAULT 0,
  status booking_status DEFAULT 'pending',
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  guest_university TEXT,
  special_requests TEXT,
  confirmation_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_listing ON bookings(listing_id);
CREATE INDEX idx_bookings_host ON bookings(host_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_confirmation ON bookings(confirmation_number);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = host_id);
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users and hosts can update bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = host_id);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate confirmation number on insert
CREATE OR REPLACE FUNCTION generate_confirmation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_number IS NULL THEN
    NEW.confirmation_number = 'KW-' || upper(substring(gen_random_uuid()::text from 1 for 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_confirmation_number
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION generate_confirmation_number();

-- ============================================================
-- 8. REVIEWS
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating NUMERIC(3,2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(listing_id, user_id)
);

CREATE INDEX idx_reviews_listing ON reviews(listing_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update listing rating/review_count on review changes
CREATE OR REPLACE FUNCTION update_listing_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_listing_id UUID;
BEGIN
  target_listing_id = COALESCE(NEW.listing_id, OLD.listing_id);
  UPDATE listings SET
    rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE listing_id = target_listing_id), 0),
    review_count = (SELECT COUNT(*) FROM reviews WHERE listing_id = target_listing_id)
  WHERE id = target_listing_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_update_listing_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_listing_rating();

-- ============================================================
-- 9. FAVORITES
-- ============================================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_listing ON favorites(listing_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER favorites_updated_at
  BEFORE UPDATE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 10. CONVERSATIONS
-- ============================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids UUID[] NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  is_group BOOLEAN DEFAULT FALSE,
  group_name TEXT,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_participants ON conversations USING GIN(participant_ids);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = ANY(participant_ids));
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = ANY(participant_ids));

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 11. MESSAGES
-- ============================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type message_type DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = FALSE;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participant_ids)
    )
  );
CREATE POLICY "Users can send messages to own conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participant_ids)
    )
  );
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update conversation last_message on new message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET
    last_message_text = NEW.content,
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- ============================================================
-- 12. POSTS
-- ============================================================

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type post_type DEFAULT 'text',
  images TEXT[] DEFAULT '{}',
  location_name TEXT,
  hashtags TEXT[] DEFAULT '{}',
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_city ON posts(city_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX idx_posts_type ON posts(type);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 13. POST_COMMENTS
-- ============================================================

CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_user ON post_comments(user_id);
CREATE INDEX idx_post_comments_parent ON post_comments(parent_id);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" ON post_comments
  FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON post_comments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON post_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER post_comments_updated_at
  BEFORE UPDATE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update post comment_count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
DECLARE
  target_post_id UUID;
BEGIN
  target_post_id = COALESCE(NEW.post_id, OLD.post_id);
  UPDATE posts SET comment_count = (
    SELECT COUNT(*) FROM post_comments WHERE post_id = target_post_id
  ) WHERE id = target_post_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_comments_update_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- ============================================================
-- 14. POST_LIKES
-- ============================================================

CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" ON post_likes
  FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER post_likes_updated_at
  BEFORE UPDATE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update post like_count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
DECLARE
  target_post_id UUID;
BEGIN
  target_post_id = COALESCE(NEW.post_id, OLD.post_id);
  UPDATE posts SET like_count = (
    SELECT COUNT(*) FROM post_likes WHERE post_id = target_post_id
  ) WHERE id = target_post_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_likes_update_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- ============================================================
-- 15. EVENTS
-- ============================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category event_category DEFAULT 'other',
  date DATE NOT NULL,
  time TIME NOT NULL,
  location_name TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  image_url TEXT,
  max_participants INTEGER,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_city ON events(city_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own events" ON events
  FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete own events" ON events
  FOR DELETE USING (auth.uid() = organizer_id);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 16. EVENT_PARTICIPANTS
-- ============================================================

CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'joined',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_user ON event_participants(user_id);

ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event participants are viewable by everyone" ON event_participants
  FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave events" ON event_participants
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER event_participants_updated_at
  BEFORE UPDATE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update event participant_count
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
DECLARE
  target_event_id UUID;
BEGIN
  target_event_id = COALESCE(NEW.event_id, OLD.event_id);
  UPDATE events SET participant_count = (
    SELECT COUNT(*) FROM event_participants WHERE event_id = target_event_id
  ) WHERE id = target_event_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_participants_update_count
  AFTER INSERT OR DELETE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION update_event_participant_count();

-- ============================================================
-- 17. ROOMMATE_PROFILES
-- ============================================================

CREATE TABLE roommate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sleep_schedule TEXT,
  cleanliness TEXT,
  smoking BOOLEAN DEFAULT FALSE,
  guests_policy TEXT,
  pets_policy TEXT,
  study_preference TEXT,
  interests TEXT[] DEFAULT '{}',
  exchange_city TEXT,
  exchange_start DATE,
  exchange_end DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_roommate_profiles_user ON roommate_profiles(user_id);
CREATE INDEX idx_roommate_profiles_city ON roommate_profiles(exchange_city);

ALTER TABLE roommate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roommate profiles are viewable by authenticated users" ON roommate_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage own roommate profile" ON roommate_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER roommate_profiles_updated_at
  BEFORE UPDATE ON roommate_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 18. ROOMMATE_LIKES
-- ============================================================

CREATE TABLE roommate_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  liked_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, liked_user_id)
);

CREATE INDEX idx_roommate_likes_user ON roommate_likes(user_id);
CREATE INDEX idx_roommate_likes_liked ON roommate_likes(liked_user_id);

ALTER TABLE roommate_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own likes" ON roommate_likes
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = liked_user_id);
CREATE POLICY "Users can create likes" ON roommate_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON roommate_likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER roommate_likes_updated_at
  BEFORE UPDATE ON roommate_likes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 19. ROOMMATE_SKIPS
-- ============================================================

CREATE TABLE roommate_skips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skipped_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, skipped_user_id)
);

CREATE INDEX idx_roommate_skips_user ON roommate_skips(user_id);

ALTER TABLE roommate_skips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skips" ON roommate_skips
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create skips" ON roommate_skips
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own skips" ON roommate_skips
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER roommate_skips_updated_at
  BEFORE UPDATE ON roommate_skips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 20. NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type DEFAULT 'system',
  title TEXT NOT NULL,
  description TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  related_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 21. MENTOR_PROFILES
-- ============================================================

CREATE TABLE mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  languages TEXT[] DEFAULT '{}',
  expertise TEXT[] DEFAULT '{}',
  status mentor_status DEFAULT 'active',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mentor_profiles_user ON mentor_profiles(user_id);
CREATE INDEX idx_mentor_profiles_city ON mentor_profiles(city_id);
CREATE INDEX idx_mentor_profiles_status ON mentor_profiles(status);

ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active mentor profiles are viewable by everyone" ON mentor_profiles
  FOR SELECT USING (status = 'active' OR user_id = auth.uid());
CREATE POLICY "Users can manage own mentor profile" ON mentor_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER mentor_profiles_updated_at
  BEFORE UPDATE ON mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 22. HOST_APPLICATIONS
-- ============================================================

CREATE TABLE host_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status host_status DEFAULT 'pending',
  id_document_url TEXT,
  address TEXT,
  rooms INTEGER,
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_host_applications_user ON host_applications(user_id);
CREATE INDEX idx_host_applications_status ON host_applications(status);

ALTER TABLE host_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON host_applications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create applications" ON host_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending applications" ON host_applications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE TRIGGER host_applications_updated_at
  BEFORE UPDATE ON host_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update profile is_host on application approval
CREATE OR REPLACE FUNCTION handle_host_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE profiles SET is_host = true WHERE id = NEW.user_id;
    NEW.reviewed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER host_applications_approval
  BEFORE UPDATE ON host_applications
  FOR EACH ROW EXECUTE FUNCTION handle_host_approval();

-- ============================================================
-- 23. EARNINGS
-- ============================================================

CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  commission NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(10,2) NOT NULL,
  period TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_earnings_host ON earnings(host_id);
CREATE INDEX idx_earnings_booking ON earnings(booking_id);
CREATE INDEX idx_earnings_period ON earnings(period);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view own earnings" ON earnings
  FOR SELECT USING (auth.uid() = host_id);

CREATE TRIGGER earnings_updated_at
  BEFORE UPDATE ON earnings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- REALTIME: Enable for key tables
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('messages', 'messages', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies
CREATE POLICY "Avatar images are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Listing images are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'listings');
CREATE POLICY "Hosts can upload listing images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Post images are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Users can upload post images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Message attachments accessible by conversation members" ON storage.objects
  FOR SELECT USING (bucket_id = 'messages' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can upload message attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'messages' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Document uploads are private" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
