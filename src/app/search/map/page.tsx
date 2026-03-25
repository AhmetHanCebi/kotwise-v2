'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, List, X, Star, MapPin,
} from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useCities } from '@/hooks/useCities';
import ListingMap from '@/components/ListingMap';
import type { Listing } from '@/lib/database.types';
import { getCoverImage, handleListingImageError } from '@/lib/image-utils';
import { formatCurrency } from '@/lib/currency-utils';

// Fallback coordinates if DB has no data
const DEFAULT_CENTER = { lat: 41.3874, lng: 2.1686 }; // Barcelona

type ListingWithImages = Listing & {
  listing_images?: { url: string; is_cover: boolean; order: number }[];
};

export default function MapSearchPage() {
  return (
    <Suspense>
      <MapSearchContent />
    </Suspense>
  );
}

function MapSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { listings, loading, search } = useListings();
  const { cities, fetchCities } = useCities();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const cityIdParam = searchParams.get('city') || undefined;

  useEffect(() => {
    fetchCities();
    search({ limit: 50, city_id: cityIdParam });
  }, [cityIdParam]); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine center from selected city using DB coordinates
  const selectedCity = cities.find((c) => c.id === cityIdParam);
  const cityCenter = selectedCity?.latitude != null && selectedCity?.longitude != null
    ? { lat: selectedCity.latitude, lng: selectedCity.longitude }
    : DEFAULT_CENTER;

  const selectedListing = (listings as ListingWithImages[]).find(
    (l) => l.id === selectedId
  );

  const mapListings = (listings as ListingWithImages[]).map((l) => ({
    id: l.id,
    title: l.title,
    price_per_month: l.price_per_month,
    lat: l.latitude,
    lng: l.longitude,
    address: l.address,
    university_name: l.university_name,
    rating: l.rating,
    currency: l.currency,
  }));

  return (
    <div
      className="fixed inset-0 flex flex-col max-w-[430px] mx-auto"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Top Bar */}
      <div
        className="relative z-20 flex items-center gap-3 px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-3"
        style={{
          background: 'color-mix(in srgb, var(--color-bg-card) 92%, transparent)',
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
          href={cityIdParam ? `/search?city=${cityIdParam}` : '/search'}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-bg)' }}
          aria-label="Liste görünümü"
        >
          <List size={18} style={{ color: 'var(--color-text-primary)' }} />
        </Link>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        <ListingMap
          listings={mapListings}
          center={cityCenter}
          zoom={13}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
        />

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
                  onError={(e) => handleListingImageError(e, selectedListing.id)}
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
                    {formatCurrency(selectedListing.price_per_month, selectedListing.currency)}
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
      </div>
    </div>
  );
}
