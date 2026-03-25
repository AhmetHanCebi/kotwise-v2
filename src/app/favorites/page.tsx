'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart, MapPin, Star, Search, Loader2, ArrowLeftRight,
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import type { ListingWithImages, Favorite } from '@/lib/database.types';
import { getCoverImage, handleListingImageError } from '@/lib/image-utils';
import { formatPrice } from '@/lib/currency-utils';

const CURRENCY_LABELS: Record<string, string> = {
  TRY: 'TL',
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
};
const displayCurrency = (code: string) => CURRENCY_LABELS[code] ?? code;

type FavoriteWithListing = Favorite & {
  listing: ListingWithImages;
};

export default function FavoritesPage() {
  return (
    <AuthGuard>
      <FavoritesContent />
    </AuthGuard>
  );
}

function FavoritesContent() {
  const { user } = useAuth();
  const { favorites, loading, toggle } = useFavorites(user?.id);
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const typedFavorites = favorites as FavoriteWithListing[];

  /* Dynamic city tabs from favorites */
  const cities = useMemo(() => {
    const citySet = new Map<string, string>();
    typedFavorites.forEach((f) => {
      if (f.listing?.city_id) {
        const listingAny = f.listing as unknown as Record<string, unknown>;
        const cityLabel = listingAny.city
          ? (listingAny.city as { name: string })?.name
          : f.listing.address?.split(',').pop()?.trim() || f.listing.city_id;
        citySet.set(f.listing.city_id, cityLabel);
      }
    });
    return Array.from(citySet.entries()).map(([id, name]) => ({ id, name }));
  }, [typedFavorites]);

  const filteredFavorites = activeCity
    ? typedFavorites.filter((f) => f.listing?.city_id === activeCity)
    : typedFavorites;

  return (
    <div
      className="min-h-dvh flex flex-col max-w-[430px] mx-auto"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 pt-[calc(16px+env(safe-area-inset-top))] pb-3"
        style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Favorilerim
          </h1>
          {filteredFavorites.length >= 2 && (
            <Link
              href="/compare"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: 'var(--color-secondary)',
                color: 'white',
              }}
            >
              <ArrowLeftRight size={13} />
              Karşılaştır
            </Link>
          )}
        </div>

        {/* City Tabs */}
        {cities.length > 1 && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveCity(null)}
              className="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors"
              style={{
                background: !activeCity ? 'var(--color-primary)' : 'var(--color-bg)',
                color: !activeCity ? 'white' : 'var(--color-text-primary)',
                border: `1px solid ${!activeCity ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              Tümü
            </button>
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setActiveCity(city.id)}
                className="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors"
                style={{
                  background: activeCity === city.id ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: activeCity === city.id ? 'white' : 'var(--color-text-primary)',
                  border: `1px solid ${activeCity === city.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                {city.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 pb-28">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Yükleniyor...</p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.08)' }}
            >
              <Heart size={28} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Henüz favorilerin yok
            </p>
            <p className="text-sm text-center max-w-[280px]" style={{ color: 'var(--color-text-secondary)' }}>
              Beğendiğin ilanları kalp ikonuna tıklayarak favorilerine ekle.
            </p>
            <Link
              href="/search"
              className="px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              <Search size={16} />
              İlanları Keşfet
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredFavorites.map((fav) => {
              const listing = fav.listing;
              if (!listing) return null;
              const coverImg = getCoverImage(listing);

              return (
                <div
                  key={fav.id}
                  className="rounded-2xl overflow-hidden animate-fade-in-up"
                  style={{
                    background: 'var(--color-bg-card)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <Link href={`/listing/${listing.id}`}>
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                      <img src={coverImg} alt={listing.title} className="w-full h-full object-cover" loading="lazy" onError={(e) => handleListingImageError(e, listing.id)} />
                      {listing.match_score > 0 && (
                        <div
                          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold"
                          style={{ background: 'var(--gradient-primary)', color: 'white' }}
                        >
                          %{listing.match_score} Eşleşme
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggle(listing.id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
                        aria-label="Favorilerden çıkar"
                      >
                        <Heart size={16} fill="#EF4444" color="#EF4444" />
                      </button>
                    </div>
                  </Link>

                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={12} style={{ color: 'var(--color-text-muted)' }} />
                          <span className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                            {listing.university_name || listing.address || 'Konum'}
                          </span>
                        </div>
                      </div>
                      {listing.rating > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Star size={12} fill="var(--color-warning)" color="var(--color-warning)" />
                          <span className="text-xs font-semibold">{listing.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>
                        {formatPrice(listing.price_per_month)} {displayCurrency(listing.currency)}
                        <span className="text-[11px] font-normal ml-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          /ay
                        </span>
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/listing/${listing.id}`}
                          className="px-4 py-2 rounded-lg text-xs font-semibold"
                          style={{
                            background: 'var(--gradient-primary)',
                            color: 'white',
                          }}
                        >
                          İncele
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
