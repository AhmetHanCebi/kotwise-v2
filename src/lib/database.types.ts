// ============================================================
// KOTWISE V2 — Complete TypeScript Types for all 23 tables
// ============================================================

// Enum types
export type RoomType = 'studio' | 'single' | 'shared' | 'apartment';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type MessageType = 'text' | 'image' | 'location' | 'voice' | 'system';
export type NotificationType = 'message' | 'match' | 'booking' | 'price' | 'review' | 'event' | 'community' | 'system';
export type PostType = 'text' | 'photo' | 'question' | 'tip';
export type EventCategory = 'coffee' | 'sports' | 'language' | 'city_tour' | 'party' | 'study' | 'food' | 'other';
export type HostStatus = 'pending' | 'approved' | 'rejected';
export type MentorStatus = 'active' | 'inactive';

// ============================================================
// Row types (what you get back from a SELECT)
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  university: string | null;
  major: string | null;
  bio: string | null;
  home_city: string | null;
  home_country: string | null;
  exchange_city_id: string | null;
  languages: string[];
  interests: string[];
  exchange_university: string | null;
  exchange_start: string | null;
  exchange_end: string | null;
  budget: number | null;
  is_host: boolean;
  is_mentor: boolean;
  is_verified: boolean;
  onboarding_completed: boolean;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  country_code: string;
  population: number | null;
  avg_rent: number | null;
  student_count: number | null;
  safety_score: number | null;
  currency: string | null;
  timezone: string | null;
  image_url: string | null;
  transport_info: Record<string, unknown>;
  cost_breakdown: Record<string, unknown>;
  tips: string[];
  emergency_info: Record<string, unknown>;
  visa_info: Record<string, unknown>;
  cultural_notes: string[];
  created_at: string;
  updated_at: string;
}

export interface Neighborhood {
  id: string;
  city_id: string;
  name: string;
  vibe: string | null;
  avg_rent: number | null;
  safety: number | null;
  image_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CityFaq {
  id: string;
  city_id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  host_id: string;
  city_id: string;
  neighborhood_id: string | null;
  title: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_month: number;
  currency: string;
  room_type: RoomType;
  max_guests: number;
  is_furnished: boolean;
  is_verified: boolean;
  rating: number;
  review_count: number;
  match_score: number;
  amenities: string[];
  included_utilities: string[];
  university_name: string | null;
  university_distance_km: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  order: number;
  is_cover: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  listing_id: string;
  host_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  service_fee: number;
  status: BookingStatus;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guest_university: string | null;
  special_requests: string | null;
  confirmation_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  listing_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  listing_id: string | null;
  city_id: string | null;
  is_group: boolean;
  group_name: string | null;
  last_message_text: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: MessageType;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  city_id: string;
  content: string;
  type: PostType;
  images: string[];
  location_name: string | null;
  hashtags: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  city_id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  date: string;
  time: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  max_participants: number | null;
  participant_count: number;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RoommateProfile {
  id: string;
  user_id: string;
  sleep_schedule: string | null;
  cleanliness: string | null;
  smoking: boolean;
  guests_policy: string | null;
  pets_policy: string | null;
  study_preference: string | null;
  interests: string[];
  exchange_city: string | null;
  exchange_start: string | null;
  exchange_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoommateLike {
  id: string;
  user_id: string;
  liked_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface RoommateSkip {
  id: string;
  user_id: string;
  skipped_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  description: string | null;
  is_read: boolean;
  related_id: string | null;
  related_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MentorProfile {
  id: string;
  user_id: string;
  city_id: string;
  languages: string[];
  expertise: string[];
  status: MentorStatus;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface HostApplication {
  id: string;
  user_id: string;
  status: HostStatus;
  id_document_url: string | null;
  address: string | null;
  rooms: number | null;
  notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Earning {
  id: string;
  host_id: string;
  booking_id: string | null;
  amount: number;
  commission: number;
  net_amount: number;
  period: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Insert types (what you send for INSERT)
// ============================================================

export type ProfileInsert = Partial<Profile> & Pick<Profile, 'id' | 'email'>;
export type CityInsert = Partial<City> & Pick<City, 'name' | 'country' | 'country_code'>;
export type NeighborhoodInsert = Partial<Neighborhood> & Pick<Neighborhood, 'city_id' | 'name'>;
export type CityFaqInsert = Partial<CityFaq> & Pick<CityFaq, 'city_id' | 'question' | 'answer'>;
export type ListingInsert = Partial<Listing> & Pick<Listing, 'host_id' | 'city_id' | 'title' | 'price_per_month'>;
export type ListingImageInsert = Partial<ListingImage> & Pick<ListingImage, 'listing_id' | 'url'>;
export type BookingInsert = Partial<Booking> & Pick<Booking, 'user_id' | 'listing_id' | 'host_id' | 'check_in' | 'check_out' | 'total_price'>;
export type ReviewInsert = Partial<Review> & Pick<Review, 'listing_id' | 'user_id' | 'rating'>;
export type FavoriteInsert = Pick<Favorite, 'user_id' | 'listing_id'>;
export type ConversationInsert = Partial<Conversation> & Pick<Conversation, 'participant_ids'>;
export type MessageInsert = Partial<Message> & Pick<Message, 'conversation_id' | 'sender_id' | 'content'>;
export type PostInsert = Partial<Post> & Pick<Post, 'user_id' | 'city_id' | 'content'>;
export type PostCommentInsert = Partial<PostComment> & Pick<PostComment, 'post_id' | 'user_id' | 'content'>;
export type PostLikeInsert = Pick<PostLike, 'post_id' | 'user_id'>;
export type EventInsert = Partial<Event> & Pick<Event, 'organizer_id' | 'city_id' | 'title' | 'date' | 'time'>;
export type EventParticipantInsert = Pick<EventParticipant, 'event_id' | 'user_id'>;
export type RoommateProfileInsert = Partial<RoommateProfile> & Pick<RoommateProfile, 'user_id'>;
export type RoommateLikeInsert = Pick<RoommateLike, 'user_id' | 'liked_user_id'>;
export type RoommateSkipInsert = Pick<RoommateSkip, 'user_id' | 'skipped_user_id'>;
export type NotificationInsert = Partial<Notification> & Pick<Notification, 'user_id' | 'title'>;
export type MentorProfileInsert = Partial<MentorProfile> & Pick<MentorProfile, 'user_id' | 'city_id'>;
export type HostApplicationInsert = Partial<HostApplication> & Pick<HostApplication, 'user_id'>;
export type EarningInsert = Partial<Earning> & Pick<Earning, 'host_id' | 'amount' | 'net_amount'>;

// ============================================================
// Update types (what you send for UPDATE — all fields optional)
// ============================================================

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;
export type CityUpdate = Partial<Omit<City, 'id' | 'created_at'>>;
export type NeighborhoodUpdate = Partial<Omit<Neighborhood, 'id' | 'created_at'>>;
export type CityFaqUpdate = Partial<Omit<CityFaq, 'id' | 'created_at'>>;
export type ListingUpdate = Partial<Omit<Listing, 'id' | 'created_at'>>;
export type ListingImageUpdate = Partial<Omit<ListingImage, 'id' | 'created_at'>>;
export type BookingUpdate = Partial<Omit<Booking, 'id' | 'created_at'>>;
export type ReviewUpdate = Partial<Omit<Review, 'id' | 'created_at'>>;
export type ConversationUpdate = Partial<Omit<Conversation, 'id' | 'created_at'>>;
export type MessageUpdate = Partial<Omit<Message, 'id' | 'created_at'>>;
export type PostUpdate = Partial<Omit<Post, 'id' | 'created_at'>>;
export type PostCommentUpdate = Partial<Omit<PostComment, 'id' | 'created_at'>>;
export type EventUpdate = Partial<Omit<Event, 'id' | 'created_at'>>;
export type RoommateProfileUpdate = Partial<Omit<RoommateProfile, 'id' | 'created_at'>>;
export type NotificationUpdate = Partial<Omit<Notification, 'id' | 'created_at'>>;
export type MentorProfileUpdate = Partial<Omit<MentorProfile, 'id' | 'created_at'>>;
export type HostApplicationUpdate = Partial<Omit<HostApplication, 'id' | 'created_at'>>;
export type EarningUpdate = Partial<Omit<Earning, 'id' | 'created_at'>>;

// ============================================================
// Joined/enriched types (commonly needed in the UI)
// ============================================================

export interface ListingWithImages extends Listing {
  listing_images?: { url: string; is_cover: boolean; order?: number }[];
}

export interface ListingWithDetails extends Listing {
  host: Profile;
  city: City;
  neighborhood: Neighborhood | null;
  images: ListingImage[];
  reviews: (Review & { user: Profile })[];
}

export interface BookingWithDetails extends Booking {
  listing: Listing & { images: ListingImage[] };
  host: Profile;
  user: Profile;
}

export interface ConversationWithDetails extends Conversation {
  participants: Profile[];
  listing: Listing | null;
}

export interface PostWithDetails extends Post {
  user: Profile;
  city: City;
  comments: (PostComment & { user: Profile })[];
  is_liked: boolean;
}

export interface EventWithDetails extends Event {
  organizer: Profile;
  city: City;
  participants: (EventParticipant & { user: Profile })[];
  is_joined: boolean;
}

export interface RoommateProfileWithUser extends RoommateProfile {
  user: Profile;
}

export interface MentorProfileWithUser extends MentorProfile {
  user: Profile;
  city: City;
}

export interface EarningWithBooking extends Earning {
  booking: Booking | null;
}

// ============================================================
// Database type (for Supabase client generic)
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      cities: {
        Row: City;
        Insert: CityInsert;
        Update: CityUpdate;
      };
      neighborhoods: {
        Row: Neighborhood;
        Insert: NeighborhoodInsert;
        Update: NeighborhoodUpdate;
      };
      city_faqs: {
        Row: CityFaq;
        Insert: CityFaqInsert;
        Update: CityFaqUpdate;
      };
      listings: {
        Row: Listing;
        Insert: ListingInsert;
        Update: ListingUpdate;
      };
      listing_images: {
        Row: ListingImage;
        Insert: ListingImageInsert;
        Update: ListingImageUpdate;
      };
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
      };
      reviews: {
        Row: Review;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
      favorites: {
        Row: Favorite;
        Insert: FavoriteInsert;
        Update: Record<string, never>;
      };
      conversations: {
        Row: Conversation;
        Insert: ConversationInsert;
        Update: ConversationUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: PostUpdate;
      };
      post_comments: {
        Row: PostComment;
        Insert: PostCommentInsert;
        Update: PostCommentUpdate;
      };
      post_likes: {
        Row: PostLike;
        Insert: PostLikeInsert;
        Update: Record<string, never>;
      };
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: EventUpdate;
      };
      event_participants: {
        Row: EventParticipant;
        Insert: EventParticipantInsert;
        Update: Record<string, never>;
      };
      roommate_profiles: {
        Row: RoommateProfile;
        Insert: RoommateProfileInsert;
        Update: RoommateProfileUpdate;
      };
      roommate_likes: {
        Row: RoommateLike;
        Insert: RoommateLikeInsert;
        Update: Record<string, never>;
      };
      roommate_skips: {
        Row: RoommateSkip;
        Insert: RoommateSkipInsert;
        Update: Record<string, never>;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      mentor_profiles: {
        Row: MentorProfile;
        Insert: MentorProfileInsert;
        Update: MentorProfileUpdate;
      };
      host_applications: {
        Row: HostApplication;
        Insert: HostApplicationInsert;
        Update: HostApplicationUpdate;
      };
      earnings: {
        Row: Earning;
        Insert: EarningInsert;
        Update: EarningUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      room_type: RoomType;
      booking_status: BookingStatus;
      message_type: MessageType;
      notification_type: NotificationType;
      post_type: PostType;
      event_category: EventCategory;
      host_status: HostStatus;
      mentor_status: MentorStatus;
    };
  };
}
