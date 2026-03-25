'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, X, MapPin, Star, Heart,
  ArrowUpDown, ChevronDown, Wifi, Wind, Tv, Car,
  UtensilsCrossed, Waves, Loader2, Home, Map,
} from 'lucide-react';
import { useListings, type ListingFilters } from '@/hooks/useListings';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import type { RoomType, Listing } from '@/lib/database.types';
import { getCoverImage as getCoverImg, handleListingImageError } from '@/lib/image-utils';
import BottomNav from '@/components/BottomNav';

import { formatCurrency } from '@/lib/currency-utils';
import { ROOM_TYPE_LABELS } from '@/lib/constants';

const ROOM_TYPES: { value: RoomType; label: string; icon: React.ReactNode }[] = (
  Object.entries(ROOM_TYPE_LABELS) as [RoomType, string][]
).map(([value, label]) => ({ value, label, icon: <Home size={18} /> }));

const SORT_OPTIONS: { value: ListingFilters['sort_by']; label: string }[] = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'price_asc', label: 'Fiyat (Düşük)' },
  { value: 'price_desc', label: 'Fiyat (Yüksek)' },
  { value: 'rating', label: 'Puan' },
  { value: 'match_score', label: 'Eşleşme' },
];

const AMENITIES = [
  { key: 'wifi', label: 'WiFi', icon: <Wifi size={16} /> },
  { key: 'klima', label: 'Klima', icon: <Wind size={16} /> },
  { key: 'tv', label: 'TV', icon: <Tv size={16} /> },
  { key: 'otopark', label: 'Otopark', icon: <Car size={16} /> },
  { key: 'mutfak', label: 'Mutfak', icon: <UtensilsCrossed size={16} /> },
  { key: 'camasir', label: 'Çamaşır', icon: <Waves size={16} /> },
];

type ListingWithImages = Listing & {
  listing_images?: { url: string; is_cover: boolean; order: number }[];
};

function getCoverImage(listing: ListingWithImages): string {
  return getCoverImg(listing);
}

const PAGE_SIZE = 10;

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { listings, loading, totalCount, search } = useListings();
  const { isFavorite, toggle: toggleFavorite } = useFavorites(user?.id);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState<ListingFilters>(() => ({
    search: searchParams.get('q') || undefined,
    city_id: searchParams.get('city') || undefined,
    sort_by: (searchParams.get('sort') as ListingFilters['sort_by']) || 'newest',
    min_price: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    max_price: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    room_type: (searchParams.get('roomType') as RoomType) || undefined,
    amenities: searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : [],
  }));
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  });

  // Sync filters to URL search params
  const syncFiltersToUrl = useCallback(
    (f: ListingFilters) => {
      const params = new URLSearchParams();
      if (f.search) params.set('q', f.search);
      if (f.city_id) params.set('city', f.city_id);
      if (f.room_type) params.set('roomType', f.room_type);
      if (f.min_price != null) params.set('minPrice', String(f.min_price));
      if (f.max_price != null) params.set('maxPrice', String(f.max_price));
      if (f.sort_by && f.sort_by !== 'newest') params.set('sort', f.sort_by);
      if (f.amenities && f.amenities.length > 0) params.set('amenities', f.amenities.join(','));
      const qs = params.toString();
      router.replace(`/search${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router]
  );

  const doSearch = useCallback(
    (f: ListingFilters, append = false) => {
      search({ ...f, limit: PAGE_SIZE }, { append });
    },
    [search]
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    doSearch({ ...filters, page: 1 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update hasMore when listings/totalCount change
  useEffect(() => {
    if (listings.length >= totalCount && totalCount > 0) {
      setHasMore(false);
    }
  }, [listings.length, totalCount]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    doSearch({ ...filters, page: nextPage }, true);
  }, [loading, hasMore, page, filters, doSearch]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = observerRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && listings.length > 0 && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, listings.length, hasMore, loading]);

  const handleSearch = () => {
    const updated = { ...filters, search: query || undefined };
    setFilters(updated);
    setPage(1);
    setHasMore(true);
    doSearch({ ...updated, page: 1 });
    syncFiltersToUrl(updated);
  };

  const handleFilterApply = () => {
    const updated: ListingFilters = {
      ...filters,
      min_price: priceRange.min ? Number(priceRange.min) : undefined,
      max_price: priceRange.max ? Number(priceRange.max) : undefined,
    };
    setFilters(updated);
    setPage(1);
    setHasMore(true);
    doSearch({ ...updated, page: 1 });
    syncFiltersToUrl(updated);
    setShowFilters(false);
  };

  const handleSortChange = (sort: ListingFilters['sort_by']) => {
    const updated = { ...filters, sort_by: sort };
    setFilters(updated);
    setPage(1);
    setHasMore(true);
    doSearch({ ...updated, page: 1 });
    syncFiltersToUrl(updated);
    setShowSort(false);
  };

  const handleRoomTypeToggle = (type: RoomType) => {
    setFilters((prev) => ({
      ...prev,
      room_type: prev.room_type === type ? undefined : type,
    }));
  };

  const handleAmenityToggle = (key: string) => {
    setFilters((prev) => {
      const current = prev.amenities || [];
      const next = current.includes(key)
        ? current.filter((a) => a !== key)
        : [...current, key];
      return { ...prev, amenities: next };
    });
  };

  const activeFilterCount = [
    filters.room_type,
    filters.min_price,
    filters.max_price,
    (filters.amenities?.length ?? 0) > 0,
  ].filter(Boolean).length;

  return (
    <div
      className="min-h-dvh flex flex-col max-w-[430px] mx-auto relative"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Search Header */}
      <div
        className="sticky top-0 z-30 px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-3"
        style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Search Bar */}
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2.5"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Şehir, üniversite veya mahalle ara..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                const updated = { ...filters, search: undefined };
                setFilters(updated);
                setPage(1);
                setHasMore(true);
                doSearch({ ...updated, page: 1 });
                syncFiltersToUrl(updated);
              }}
              aria-label="Aramayı temizle"
            >
              <X size={16} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          )}
        </div>

        {/* Filter Chips Row */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors"
            style={{
              background: activeFilterCount > 0 ? 'var(--color-primary)' : 'var(--color-bg)',
              color: activeFilterCount > 0 ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
              border: `1px solid ${activeFilterCount > 0 ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            <SlidersHorizontal size={14} />
            Filtreler
            {activeFilterCount > 0 && (
              <span
                className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                style={{ background: 'rgba(255,255,255,0.3)' }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Button */}
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shrink-0"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <ArrowUpDown size={14} />
            {SORT_OPTIONS.find((s) => s.value === filters.sort_by)?.label || 'Sırala'}
            <ChevronDown size={12} />
          </button>

          {/* Quick Chips */}
          {ROOM_TYPES.map((rt) => (
            <button
              key={rt.value}
              onClick={() => {
                const updated = {
                  ...filters,
                  room_type: filters.room_type === rt.value ? undefined : rt.value,
                };
                setFilters(updated);
                setPage(1);
                setHasMore(true);
                doSearch({ ...updated, page: 1 });
                syncFiltersToUrl(updated);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors"
              style={{
                background: filters.room_type === rt.value ? 'var(--color-secondary)' : 'var(--color-bg)',
                color: filters.room_type === rt.value ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                border: `1px solid ${filters.room_type === rt.value ? 'var(--color-secondary)' : 'var(--color-border)'}`,
              }}
            >
              {rt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Dropdown */}
      {showSort && (
        <div
          className="absolute top-[130px] left-4 right-4 z-40 rounded-xl overflow-hidden animate-fade-in-up"
          style={{
            background: 'var(--color-bg-card)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSortChange(opt.value)}
              className="w-full text-left px-4 py-3 text-sm transition-colors"
              style={{
                background: filters.sort_by === opt.value ? 'var(--color-bg)' : 'transparent',
                color: filters.sort_by === opt.value ? 'var(--color-primary)' : 'var(--color-text-primary)',
                fontWeight: filters.sort_by === opt.value ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div
          className="z-30 px-4 py-4 animate-fade-in-up"
          style={{
            background: 'var(--color-bg-card)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* Price Range */}
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Fiyat Aralığı
          </p>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
            <span style={{ color: 'var(--color-text-muted)' }}>—</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Room Type Grid */}
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Oda Tipi
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {ROOM_TYPES.map((rt) => (
              <button
                key={rt.value}
                onClick={() => handleRoomTypeToggle(rt.value)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: filters.room_type === rt.value ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: filters.room_type === rt.value ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  border: `1px solid ${filters.room_type === rt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                {rt.icon}
                {rt.label}
              </button>
            ))}
          </div>

          {/* Amenities */}
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Olanaklar
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {AMENITIES.map((am) => {
              const selected = filters.amenities?.includes(am.key);
              return (
                <button
                  key={am.key}
                  onClick={() => handleAmenityToggle(am.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={{
                    background: selected ? 'var(--color-secondary)' : 'var(--color-bg)',
                    color: selected ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                    border: `1px solid ${selected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                  }}
                >
                  {am.icon}
                  {am.label}
                </button>
              );
            })}
          </div>

          {/* Apply */}
          <button
            onClick={handleFilterApply}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: 'var(--gradient-primary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            {totalCount} ilan göster
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="px-4 py-3">
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {loading ? `${totalCount > 0 ? totalCount : ''} ilan aranıyor...` : `${totalCount} ilan bulundu`}
        </p>
      </div>

      {/* Listing Cards */}
      <div className="flex-1 px-4 pb-32 flex flex-col gap-4">
        {loading && listings.length === 0 ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="aspect-[4/3] animate-shimmer" />
                <div className="p-3 flex flex-col gap-2">
                  <div className="h-4 w-3/4 rounded animate-shimmer" />
                  <div className="h-3 w-1/2 rounded animate-shimmer" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 rounded-full animate-shimmer" />
                    <div className="h-5 w-16 rounded-full animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-bg)' }}
            >
              <Search size={28} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Aramanızla eşleşen ilan bulunamadı
            </p>
            <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Filtrelerinizi değiştirmeyi veya farklı bir arama yapmayı deneyin.
            </p>
          </div>
        ) : (
          <>
            {(listings as ListingWithImages[]).map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorite={isFavorite(listing.id)}
                onToggleFavorite={() => toggleFavorite(listing.id)}
              />
            ))}

            {/* Loading spinner for next page */}
            {loading && listings.length > 0 && (
              <div className="flex justify-center py-6">
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              </div>
            )}

            {/* All loaded message */}
            {!hasMore && listings.length > 0 && (
              <p
                className="text-center text-xs py-6"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Tüm ilanlar yüklendi
              </p>
            )}

            {/* Infinite scroll trigger */}
            <div ref={observerRef} className="h-4" />
          </>
        )}
      </div>

      {/* Map FAB */}
      <Link
        href="/search/map"
        className="fixed z-40 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
        style={{
          bottom: 'calc(80px + env(safe-area-inset-bottom))',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-secondary)',
          color: 'var(--color-text-inverse)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <Map size={18} />
        <span className="text-sm font-semibold">Harita</span>
      </Link>

      <BottomNav />
    </div>
  );
}

/* ──────────── Listing Card ──────────── */
function ListingCard({
  listing,
  isFavorite: isFav,
  onToggleFavorite,
}: {
  listing: ListingWithImages;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="rounded-2xl overflow-hidden animate-fade-in-up block"
      style={{
        background: 'var(--color-bg-card)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={getCoverImage(listing)}
          alt={listing.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => handleListingImageError(e, listing.id)}
        />
        {/* Match Badge */}
        {listing.match_score > 0 && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{
              background: 'var(--gradient-primary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            %{listing.match_score} Eşleşme
          </div>
        )}
        {/* Heart */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
          }}
          aria-label="Favorilere ekle"
        >
          <Heart
            size={16}
            fill={isFav ? '#EF4444' : 'transparent'}
            color={isFav ? '#EF4444' : 'white'}
          />
        </button>
        {/* Room Type Badge */}
        <div
          className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide"
          style={{
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            backdropFilter: 'blur(4px)',
          }}
        >
          {ROOM_TYPE_LABELS[listing.room_type] ?? listing.room_type}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {listing.title}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={12} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                {listing.university_name || listing.address || 'Konum bilgisi'}
              </span>
            </div>
          </div>
          {listing.rating > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={12} fill="var(--color-warning)" color="var(--color-warning)" />
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {listing.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span
            className="text-base font-bold"
            style={{ color: 'var(--color-primary)' }}
          >
            {formatCurrency(listing.price_per_month, listing.currency)}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            /ay
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-primary)" }} /></div>}>
      <SearchContent />
    </Suspense>
  );
}
