'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, List, X, Star, MapPin,
} from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import type { Listing } from '@/lib/database.types';

type ListingWithImages = Listing & {
  listing_images?: { url: string; is_cover: boolean; order: number }[];
};

/* Scattered balloon positions to simulate a real map */
const BALLOON_POSITIONS = [
  { top: '18%', left: '22%' },
  { top: '28%', left: '58%' },
  { top: '38%', left: '35%' },
  { top: '48%', left: '72%' },
  { top: '55%', left: '15%' },
  { top: '62%', left: '48%' },
  { top: '32%', left: '82%' },
  { top: '72%', left: '30%' },
  { top: '22%', left: '45%' },
  { top: '44%', left: '55%' },
  { top: '68%', left: '68%' },
  { top: '78%', left: '50%' },
];

function getCoverImage(listing: ListingWithImages): string {
  const imgs = listing.listing_images;
  if (!imgs || imgs.length === 0) {
    return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop';
  }
  const cover = imgs.find((i) => i.is_cover);
  return cover?.url || imgs[0]?.url || '';
}

export default function MapSearchPage() {
  const router = useRouter();
  const { listings, loading, search } = useListings();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    search({ limit: 12 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedListing = (listings as ListingWithImages[]).find(
    (l) => l.id === selectedId
  );

  return (
    <div
      className="fixed inset-0 flex flex-col max-w-[430px] mx-auto"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Top Bar */}
      <div
        className="relative z-20 flex items-center gap-3 px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-3"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
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
        <h1
          className="flex-1 text-base font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Harita Görünümü
        </h1>
        <Link
          href="/search"
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-bg)' }}
          aria-label="Liste görünümü"
        >
          <List size={18} style={{ color: 'var(--color-text-primary)' }} />
        </Link>
      </div>

      {/* Map Area (Static Placeholder) */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, #E8F0E8 0%, #D4E4D4 25%, #E0E8D8 50%, #D8DCC8 75%, #E4E8D8 100%)
            `,
          }}
        >
          {/* Simulated map elements */}
          {/* Roads */}
          <div
            className="absolute"
            style={{
              top: '30%', left: 0, right: 0, height: 3,
              background: 'rgba(200,200,200,0.6)',
              transform: 'rotate(-5deg)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: '55%', left: 0, right: 0, height: 2,
              background: 'rgba(200,200,200,0.5)',
              transform: 'rotate(3deg)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: 0, bottom: 0, left: '40%', width: 3,
              background: 'rgba(200,200,200,0.6)',
              transform: 'rotate(8deg)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: 0, bottom: 0, left: '70%', width: 2,
              background: 'rgba(200,200,200,0.5)',
              transform: 'rotate(-3deg)',
            }}
          />
          {/* Park/Green areas */}
          <div
            className="absolute rounded-full"
            style={{
              top: '15%', left: '60%', width: 60, height: 40,
              background: 'rgba(134,188,134,0.3)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              top: '65%', left: '20%', width: 80, height: 50,
              background: 'rgba(134,188,134,0.25)',
            }}
          />
          {/* Water */}
          <div
            className="absolute"
            style={{
              bottom: 0, left: 0, right: 0, height: '12%',
              background: 'linear-gradient(180deg, rgba(147,197,225,0.2) 0%, rgba(147,197,225,0.4) 100%)',
            }}
          />
        </div>

        {/* Price Balloons */}
        {(listings as ListingWithImages[]).slice(0, 12).map((listing, idx) => {
          const pos = BALLOON_POSITIONS[idx % BALLOON_POSITIONS.length];
          const isSelected = selectedId === listing.id;

          return (
            <button
              key={listing.id}
              onClick={() => setSelectedId(isSelected ? null : listing.id)}
              className="absolute z-10 transition-all duration-200"
              style={{
                top: pos.top,
                left: pos.left,
                transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.15)' : 'scale(1)'}`,
              }}
            >
              <div
                className="relative px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
                style={{
                  background: isSelected ? 'var(--color-secondary)' : 'var(--color-bg-card)',
                  color: isSelected ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  boxShadow: isSelected
                    ? '0 4px 16px rgba(27,42,74,0.3)'
                    : 'var(--shadow-md)',
                  border: `1.5px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                }}
              >
                {listing.price_per_month.toLocaleString('tr-TR')} TL
                {/* Triangle pointer */}
                <div
                  className="absolute left-1/2 -bottom-1.5"
                  style={{
                    width: 0, height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: `6px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-bg-card)'}`,
                    transform: 'translateX(-50%)',
                  }}
                />
              </div>
            </button>
          );
        })}

        {/* Mini Card Popup */}
        {selectedListing && (
          <div
            className="absolute bottom-6 left-4 right-4 z-20 rounded-2xl overflow-hidden animate-fade-in-up"
            style={{
              background: 'var(--color-bg-card)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <button
              onClick={() => setSelectedId(null)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              aria-label="Kapat"
            >
              <X size={14} color="white" />
            </button>
            <Link href={`/listing/${selectedListing.id}`} className="flex">
              <div className="w-28 h-28 shrink-0 overflow-hidden">
                <img
                  src={getCoverImage(selectedListing)}
                  alt={selectedListing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                <div>
                  <h3
                    className="text-sm font-semibold truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {selectedListing.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={11} style={{ color: 'var(--color-text-muted)' }} />
                    <span className="text-[11px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      {selectedListing.university_name || selectedListing.address || 'Konum'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                    {selectedListing.price_per_month.toLocaleString('tr-TR')} TL
                    <span className="text-[10px] font-normal" style={{ color: 'var(--color-text-muted)' }}>
                      {' '}/ay
                    </span>
                  </span>
                  {selectedListing.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Star size={11} fill="var(--color-warning)" color="var(--color-warning)" />
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {selectedListing.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Map attribution placeholder */}
        <div
          className="absolute bottom-2 right-2 text-[9px] px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(255,255,255,0.7)',
            color: 'var(--color-text-muted)',
          }}
        >
          Harita yakında aktif olacak
        </div>
      </div>
    </div>
  );
}
