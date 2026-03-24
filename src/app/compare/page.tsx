'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Star, MapPin, Wifi, Sofa, Home,
  Trophy, ChevronRight, Heart,
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/AuthGuard';
import type { Listing, ListingWithImages, Favorite } from '@/lib/database.types';
import { getCoverImage, handleListingImageError } from '@/lib/image-utils';

type FavoriteWithListing = Favorite & {
  listing: ListingWithImages;
};

interface CompareRow {
  label: string;
  key: string;
  getValue: (l: Listing) => string | number;
  format?: (v: string | number) => string;
  higherIsBetter?: boolean;
  lowerIsBetter?: boolean;
}

const COMPARE_ROWS: CompareRow[] = [
  {
    label: 'Fiyat',
    key: 'price',
    getValue: (l) => l.price_per_month,
    format: (v) => `${Number(v).toLocaleString('tr-TR')} TL/ay`,
    lowerIsBetter: true,
  },
  {
    label: 'Konum',
    key: 'location',
    getValue: (l) => l.university_name || l.address || '-',
  },
  {
    label: 'Oda Tipi',
    key: 'roomType',
    getValue: (l) => {
      const labels: Record<string, string> = {
        studio: 'Stüdyo', single: 'Tek Kişilik', shared: 'Paylaşımlı', apartment: 'Daire',
      };
      return labels[l.room_type] || l.room_type;
    },
  },
  {
    label: 'Eşyalı',
    key: 'furnished',
    getValue: (l) => l.is_furnished ? 'Evet' : 'Hayır',
  },
  {
    label: 'WiFi',
    key: 'wifi',
    getValue: (l) => l.amenities?.includes('wifi') ? 'Var' : 'Yok',
  },
  {
    label: 'Puan',
    key: 'rating',
    getValue: (l) => l.rating,
    format: (v) => Number(v) > 0 ? `${Number(v).toFixed(1)} / 5` : 'Henüz yok',
    higherIsBetter: true,
  },
  {
    label: 'Eşleşme',
    key: 'match',
    getValue: (l) => l.match_score,
    format: (v) => Number(v) > 0 ? `%${v}` : '-',
    higherIsBetter: true,
  },
  {
    label: 'Max Kişi',
    key: 'maxGuests',
    getValue: (l) => l.max_guests,
    format: (v) => `${v} kişi`,
  },
];

export default function ComparePage() {
  return (
    <AuthGuard>
      <CompareContent />
    </AuthGuard>
  );
}

function CompareContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { favorites } = useFavorites(user?.id);

  const typedFavorites = favorites as FavoriteWithListing[];
  const compareListings = typedFavorites
    .filter((f) => f.listing)
    .map((f) => f.listing)
    .slice(0, 4);

  /* Find winner for each row */
  const getWinner = (row: CompareRow): number | null => {
    if (compareListings.length < 2) return null;
    if (!row.higherIsBetter && !row.lowerIsBetter) return null;

    const values = compareListings.map((l) => {
      const v = row.getValue(l);
      return typeof v === 'number' ? v : NaN;
    });

    if (values.some(isNaN)) return null;

    if (row.higherIsBetter) {
      const max = Math.max(...values);
      if (values.filter((v) => v === max).length === 1) {
        return values.indexOf(max);
      }
    }
    if (row.lowerIsBetter) {
      const min = Math.min(...values);
      if (values.filter((v) => v === min).length === 1) {
        return values.indexOf(min);
      }
    }
    return null;
  };

  if (compareListings.length < 2) {
    return (
      <div
        className="min-h-dvh flex flex-col max-w-[430px] mx-auto"
        style={{ background: 'var(--color-bg)' }}
      >
        <div
          className="px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-3 flex items-center gap-3"
          style={{
            background: 'var(--color-bg-card)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-bg)' }}
            aria-label="Geri"
          >
            <ArrowLeft size={18} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <h1 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Karşılaştır
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <Heart size={40} style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-base font-semibold text-center" style={{ color: 'var(--color-text-primary)' }}>
            Karşılaştırma için en az 2 favori ilan gerekli
          </p>
          <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
            Beğendiğin ilanları favorilere ekleyerek karşılaştırabilirsin.
          </p>
          <Link
            href="/search"
            className="px-6 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            İlanları Keşfet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh flex flex-col max-w-[430px] mx-auto"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-3"
        style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-bg)' }}
            aria-label="Geri"
          >
            <ArrowLeft size={18} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <h1 className="flex-1 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            İlan Karşılaştırma
          </h1>
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {compareListings.length} ilan
          </span>
        </div>
      </div>

      {/* Horizontal Listing Cards */}
      <div className="px-4 py-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {compareListings.map((listing) => {
            const coverImg = getCoverImage(listing);

            return (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="shrink-0 rounded-xl overflow-hidden"
                style={{
                  width: compareListings.length === 2 ? 'calc(50% - 6px)' : 160,
                  background: 'var(--color-bg-card)',
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={coverImg} alt={listing.title} className="w-full h-full object-cover" loading="lazy" onError={(e) => handleListingImageError(e, listing.id)} />
                </div>
                <div className="p-2">
                  <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {listing.title}
                  </p>
                  <p className="text-[11px] font-bold mt-0.5" style={{ color: 'var(--color-primary)' }}>
                    {listing.price_per_month.toLocaleString('tr-TR')} TL
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="px-4 pb-8">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          {COMPARE_ROWS.map((row, rowIdx) => {
            const winner = getWinner(row);

            return (
              <div
                key={row.key}
                style={{
                  borderBottom: rowIdx < COMPARE_ROWS.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                {/* Row Label */}
                <div
                  className="px-4 py-2"
                  style={{ background: 'var(--color-bg)' }}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    {row.label}
                  </span>
                </div>

                {/* Values */}
                <div className="flex">
                  {compareListings.map((listing, colIdx) => {
                    const rawValue = row.getValue(listing);
                    const displayValue = row.format ? row.format(rawValue) : String(rawValue);
                    const isWinner = winner === colIdx;

                    return (
                      <div
                        key={listing.id}
                        className="flex-1 px-3 py-2.5 text-center relative"
                        style={{
                          borderRight: colIdx < compareListings.length - 1 ? '1px solid var(--color-border)' : 'none',
                          background: isWinner ? 'rgba(34,197,94,0.06)' : 'transparent',
                        }}
                      >
                        <span
                          className="text-xs font-medium"
                          style={{
                            color: isWinner ? 'var(--color-success)' : 'var(--color-text-primary)',
                            fontWeight: isWinner ? 700 : 500,
                          }}
                        >
                          {displayValue}
                        </span>
                        {isWinner && (
                          <Trophy
                            size={10}
                            className="absolute top-1 right-1"
                            style={{ color: 'var(--color-success)' }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-8">
        <div className="flex flex-col gap-2">
          {compareListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/booking?listingId=${listing.id}`}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {listing.title}
                </p>
                <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--color-primary)' }}>
                  {listing.price_per_month.toLocaleString('tr-TR')} TL/ay
                </p>
              </div>
              <div
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold shrink-0"
                style={{ background: 'var(--gradient-primary)', color: 'white' }}
              >
                Rezervasyon Yap
                <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
