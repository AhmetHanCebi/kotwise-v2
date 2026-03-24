'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  MapPin,
  ChevronRight,
  Home as HomeIcon,
  Calendar,
  Heart,
  MessageCircle,
  Star,
  Users,
  Shield,
  CreditCard,
  Phone,
  Globe,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCities } from '@/hooks/useCities';
import { useListings } from '@/hooks/useListings';
import { useEvents } from '@/hooks/useEvents';
import { usePosts } from '@/hooks/usePosts';
import { useNotifications } from '@/hooks/useNotifications';
import BottomNav from '@/components/BottomNav';
import CitySelector from '@/components/CitySelector';
import type { City, Listing, PostWithDetails } from '@/lib/database.types';
import type { EventWithDetails } from '@/lib/database.types';

const countryFlags: Record<string, string> = {
  ES: '🇪🇸', PT: '🇵🇹', DE: '🇩🇪', FR: '🇫🇷', IT: '🇮🇹', CZ: '🇨🇿',
  PL: '🇵🇱', NL: '🇳🇱', AT: '🇦🇹', HU: '🇭🇺', DK: '🇩🇰', SE: '🇸🇪',
  NO: '🇳🇴', FI: '🇫🇮', IE: '🇮🇪', GB: '🇬🇧', GR: '🇬🇷', HR: '🇭🇷',
  TR: '🇹🇷', JP: '🇯🇵', KR: '🇰🇷',
};

type PostFilter = 'city' | 'country' | 'all';

// --------------- Skeleton Components ---------------

function ListingCardSkeleton() {
  return (
    <div
      className="flex-shrink-0 w-[260px] rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="h-36 animate-shimmer" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 w-3/4 rounded animate-shimmer" />
        <div className="h-3 w-1/2 rounded animate-shimmer" />
        <div className="h-4 w-1/3 rounded animate-shimmer" />
      </div>
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div
      className="flex-shrink-0 w-[220px] rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="h-4 w-1/3 rounded animate-shimmer" />
      <div className="h-5 w-full rounded animate-shimmer" />
      <div className="h-3 w-2/3 rounded animate-shimmer" />
      <div className="h-8 w-full rounded-lg animate-shimmer" />
    </div>
  );
}

function PostCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full animate-shimmer" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-3.5 w-24 rounded animate-shimmer" />
          <div className="h-3 w-16 rounded animate-shimmer" />
        </div>
      </div>
      <div className="h-4 w-full rounded animate-shimmer" />
      <div className="h-4 w-3/4 rounded animate-shimmer" />
    </div>
  );
}

// --------------- Card Components ---------------

function ListingCard({ listing }: { listing: Listing & { listing_images?: { url: string; is_cover: boolean }[] } }) {
  const coverImage = (listing as unknown as { listing_images?: { url: string; is_cover: boolean }[] })
    .listing_images?.find((img) => img.is_cover)?.url
    ?? (listing as unknown as { listing_images?: { url: string }[] }).listing_images?.[0]?.url;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="flex-shrink-0 w-[260px] rounded-2xl overflow-hidden transition-transform active:scale-[0.98]"
      style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden" style={{ background: '#F3F4F6' }}>
        {coverImage ? (
          <img src={coverImage} alt={listing.title} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/F26522/white?text=Kotwise'; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HomeIcon size={32} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        )}
        {/* Price badge */}
        <div
          className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          €{listing.price_per_month}/ay
        </div>
        {/* Rating */}
        {listing.rating > 0 && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
          >
            <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
            {listing.rating.toFixed(1)}
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-3">
        <h3
          className="text-sm font-semibold truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {listing.title}
        </h3>
        <p
          className="text-xs mt-0.5 flex items-center gap-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <MapPin size={12} />
          {listing.address ?? 'Konum belirtilmemiş'}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
          >
            {listing.room_type === 'studio' && 'Stüdyo'}
            {listing.room_type === 'single' && 'Tek Oda'}
            {listing.room_type === 'shared' && 'Paylaşımlı'}
            {listing.room_type === 'apartment' && 'Daire'}
          </span>
          {listing.is_furnished && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: '#F0FDF4', color: 'var(--color-success)' }}
            >
              Mobilyalı
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EventCard({ event }: { event: EventWithDetails }) {
  const categoryLabels: Record<string, string> = {
    coffee: 'Kahve', sports: 'Spor', language: 'Dil', city_tour: 'Şehir Turu',
    party: 'Parti', study: 'Çalışma', food: 'Yemek', other: 'Diğer',
  };
  const categoryColors: Record<string, string> = {
    coffee: '#92400E', sports: '#166534', language: '#1E40AF', city_tour: '#7C3AED',
    party: '#BE185D', study: '#0E7490', food: '#C2410C', other: '#6B7280',
  };
  const categoryBgs: Record<string, string> = {
    coffee: '#FEF3C7', sports: '#DCFCE7', language: '#DBEAFE', city_tour: '#EDE9FE',
    party: '#FCE7F3', study: '#CFFAFE', food: '#FFEDD5', other: '#F3F4F6',
  };

  const eventDate = new Date(event.date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('tr-TR', { month: 'short' });

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex-shrink-0 w-[220px] rounded-2xl p-4 flex flex-col gap-2.5 transition-transform active:scale-[0.98]"
      style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: categoryBgs[event.category] ?? '#F3F4F6',
            color: categoryColors[event.category] ?? '#6B7280',
          }}
        >
          {categoryLabels[event.category] ?? 'Etkinlik'}
        </span>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
            {day}
          </span>
          <span className="text-[10px] uppercase" style={{ color: 'var(--color-text-muted)' }}>
            {month}
          </span>
        </div>
      </div>
      <h3
        className="text-sm font-semibold line-clamp-2 leading-snug"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {event.title}
      </h3>
      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        <MapPin size={12} />
        <span className="truncate">{event.location_name ?? 'Konum belirtilmemiş'}</span>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <Users size={12} />
          <span>{event.participant_count} katılımcı</span>
        </div>
        {event.time && (
          <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
            {event.time}
          </span>
        )}
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: PostWithDetails }) {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}dk`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}sa`;
    const days = Math.floor(hours / 24);
    return `${days}g`;
  };

  return (
    <Link
      href={`/community/${post.id}`}
      className="rounded-2xl p-4 flex flex-col gap-3 transition-transform active:scale-[0.99]"
      style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {post.user?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {post.user?.full_name ?? 'Anonim'}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {timeAgo(post.created_at)}
          </p>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
        >
          {post.type === 'question' && 'Soru'}
          {post.type === 'tip' && 'İpucu'}
          {post.type === 'photo' && 'Fotoğraf'}
          {post.type === 'text' && 'Paylaşım'}
        </span>
      </div>

      {/* Content */}
      <p
        className="text-sm leading-relaxed line-clamp-3"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {post.content}
      </p>

      {/* Images */}
      {post.images?.length > 0 && (
        <div className="h-40 rounded-xl overflow-hidden" style={{ background: '#F3F4F6' }}>
          <img
            src={post.images[0]}
            alt="Gönderi görseli"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/F26522/white?text=Kotwise'; }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 pt-1">
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <Heart size={14} />
          {post.like_count}
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <MessageCircle size={14} />
          {post.comment_count}
        </span>
      </div>
    </Link>
  );
}

// --------------- Empty States ---------------

function EmptyState({ icon: Icon, message }: { icon: typeof MapPin; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <Icon size={28} style={{ color: 'var(--color-text-muted)' }} />
      <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
        {message}
      </p>
    </div>
  );
}

// --------------- Section Header ---------------

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2
        className="text-base font-bold"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-xs font-semibold"
          style={{ color: 'var(--color-primary)' }}
        >
          Tümü
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

// --------------- HOME PAGE ---------------

export default function HomePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { city, getById, selectedCityId } = useCities();
  const { listings, loading: listingsLoading, search: searchListings } = useListings();
  const { events, loading: eventsLoading, fetchEvents } = useEvents(user?.id);
  const { posts, loading: postsLoading, fetchFeed } = usePosts(user?.id);
  const { unreadCount } = useNotifications(user?.id);

  const [cityOpen, setCityOpen] = useState(false);
  const [activeCityName, setActiveCityName] = useState<string>('');
  const [activeCityCode, setActiveCityCode] = useState<string>('');
  const [activeCityId, setActiveCityId] = useState<string>('');
  const [postFilter, setPostFilter] = useState<PostFilter>('city');

  // Initial city load from profile
  useEffect(() => {
    if (profile?.exchange_city_id && !activeCityId) {
      setActiveCityId(profile.exchange_city_id);
      getById(profile.exchange_city_id);
    }
  }, [profile, activeCityId, getById]);

  // When city data is loaded, set name/code
  useEffect(() => {
    if (city) {
      setActiveCityName(city.name);
      setActiveCityCode(city.country_code);
    }
  }, [city]);

  // Fetch data when city changes
  useEffect(() => {
    if (activeCityId) {
      searchListings({ city_id: activeCityId, limit: 10, sort_by: 'newest' });
      fetchEvents(activeCityId, { limit: 10 });
      fetchFeed(activeCityId, 1, 5, undefined);
    }
  }, [activeCityId, searchListings, fetchEvents, fetchFeed]);

  // Re-fetch posts when postFilter changes
  useEffect(() => {
    if (!activeCityId) return;
    if (postFilter === 'city') {
      fetchFeed(activeCityId, 1, 5, undefined);
    } else if (postFilter === 'country') {
      fetchFeed(activeCityId, 1, 5, activeCityCode || undefined);
    } else {
      fetchFeed(activeCityId, 1, 5, '__ALL__');
    }
  }, [postFilter, activeCityId, activeCityCode, fetchFeed]);

  const handleCitySelect = useCallback(
    (cityId: string, cityName: string, countryCode: string) => {
      setActiveCityId(cityId);
      setActiveCityName(cityName);
      setActiveCityCode(countryCode);
      getById(cityId);
    },
    [getById],
  );

  // Loading state
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-dvh">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
  })();

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Kullanıcı';

  return (
    <div
      className="flex-1 flex flex-col min-h-dvh pb-20"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* ========== TOP BAR ========== */}
      <div
        className="px-5 pt-[env(safe-area-inset-top)] pb-4"
        style={{ background: 'var(--gradient-dark)' }}
      >
        <div className="pt-4 flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-xs font-medium">{greeting}</p>
            <h1 className="text-white text-lg font-bold">{firstName} 👋</h1>
          </div>
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-full transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)' }}
            aria-label="Bildirimler"
          >
            <Bell size={20} style={{ color: '#FFFFFF' }} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                style={{ background: 'var(--color-error)' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* City button */}
        <button
          onClick={() => setCityOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl mb-3 transition-colors"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          <span className="text-base">
            {activeCityCode ? countryFlags[activeCityCode] ?? '🌍' : '🌍'}
          </span>
          <span className="text-sm font-semibold text-white">
            {activeCityName || 'Şehir Seç'}
          </span>
          <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>

        {/* Search bar */}
        <Link
          href="/search"
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Search size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {activeCityName ? `${activeCityName}'da ara...` : 'Bu şehirde ara...'}
          </span>
        </Link>
      </div>

      {/* ========== CITY INFO BAND ========== */}
      {city && (
        <div className="px-5 -mt-1">
          <div
            className="rounded-2xl p-4 mt-3"
            style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-md)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {city.name}, {city.country}
                </span>
              </div>
              <Link
                href={`/city/${activeCityId}`}
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                Şehir Rehberi
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {city.avg_rent != null && (
                <div className="flex flex-col items-center py-2 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Ort. Kira</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>€{city.avg_rent}</span>
                </div>
              )}
              {city.student_count != null && (
                <div className="flex flex-col items-center py-2 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Öğrenci</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{city.student_count.toLocaleString('tr-TR')}</span>
                </div>
              )}
              {city.safety_score != null && (
                <div className="flex flex-col items-center py-2 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Güvenlik</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{city.safety_score}/10</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== LISTINGS SECTION ========== */}
      <section className="mt-6 px-5">
        <SectionHeader title="Bu Şehirdeki İlanlar" href="/search" />
        {listingsLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {Array.from({ length: 3 }).map((_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState icon={HomeIcon} message="Bu şehirde henüz ilan yok" />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>

      {/* ========== EVENTS SECTION ========== */}
      <section className="mt-6 px-5">
        <SectionHeader title="Yaklaşan Etkinlikler" href="/events" />
        {eventsLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <EmptyState icon={Calendar} message="Yaklaşan etkinlik yok" />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {events.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>

      {/* ========== POSTS SECTION ========== */}
      <section className="mt-6 px-5">
        <SectionHeader title="Topluluktan" href="/community" />
        {/* Filter tabs */}
        <div className="flex gap-2 mb-3">
          {([
            { key: 'city' as PostFilter, label: 'Şehir' },
            { key: 'country' as PostFilter, label: 'Ülke' },
            { key: 'all' as PostFilter, label: 'Tümü' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPostFilter(tab.key)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: postFilter === tab.key ? 'var(--color-primary)' : 'var(--color-bg-card)',
                color: postFilter === tab.key ? '#FFFFFF' : 'var(--color-text-secondary)',
                border: postFilter === tab.key ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {postsLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState icon={MessageCircle} message="Henüz paylaşım yok" />
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>

      {/* ========== COUNTRY INFO SECTION ========== */}
      {city && (
        <section className="mt-6 px-5 mb-6">
          <SectionHeader title="Ülke Bilgileri" />
          <div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{countryFlags[city.country_code] ?? '🌍'}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {city.country}
              </span>
            </div>

            {/* Visa info */}
            {city.visa_info && Object.keys(city.visa_info).length > 0 && (
              <div className="flex items-start gap-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#EFF6FF' }}>
                  <Shield size={16} style={{ color: 'var(--color-info)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>Vize Bilgisi</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {(city.visa_info as Record<string, string>).summary ?? 'Detaylı bilgi için şehir rehberine bakın'}
                  </p>
                </div>
              </div>
            )}

            {/* Currency */}
            {city.currency && (
              <div className="flex items-start gap-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F0FDF4' }}>
                  <CreditCard size={16} style={{ color: 'var(--color-success)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>Para Birimi</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{city.currency}</p>
                </div>
              </div>
            )}

            {/* Emergency */}
            {city.emergency_info && Object.keys(city.emergency_info).length > 0 && (
              <div className="flex items-start gap-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FEF2F2' }}>
                  <Phone size={16} style={{ color: 'var(--color-error)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>Acil Durum</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {(city.emergency_info as Record<string, string>).police && `Polis: ${(city.emergency_info as Record<string, string>).police}`}
                    {(city.emergency_info as Record<string, string>).ambulance && ` | Ambulans: ${(city.emergency_info as Record<string, string>).ambulance}`}
                  </p>
                </div>
              </div>
            )}

            {/* Timezone */}
            {city.timezone && (
              <div className="flex items-start gap-3 py-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FFF7ED' }}>
                  <Globe size={16} style={{ color: 'var(--color-warning)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>Saat Dilimi</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{city.timezone}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* No city selected state */}
      {!activeCityId && !authLoading && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: '#FFF7ED' }}
          >
            <MapPin size={36} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2
            className="text-lg font-bold text-center"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Şehir Seçin
          </h2>
          <p
            className="text-sm text-center max-w-[260px]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Erasmus şehrinizi seçerek size özel ilanları, etkinlikleri ve topluluk paylaşımlarını görün.
          </p>
          <button
            onClick={() => setCityOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-transform active:scale-[0.98]"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <MapPin size={18} />
            Şehir Seç
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <BottomNav />

      {/* City Selector Modal */}
      <CitySelector
        isOpen={cityOpen}
        onClose={() => setCityOpen(false)}
        onSelect={handleCitySelect}
        userId={user?.id}
      />
    </div>
  );
}
