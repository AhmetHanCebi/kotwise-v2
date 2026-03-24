'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { useCities } from '@/hooks/useCities';

const POPULAR_CITIES = [
  { name: 'Barcelona', flag: '🇪🇸' },
  { name: 'Lisbon', flag: '🇵🇹' },
  { name: 'Berlin', flag: '🇩🇪' },
  { name: 'Paris', flag: '🇫🇷' },
  { name: 'Milan', flag: '🇮🇹' },
  { name: 'Prague', flag: '🇨🇿' },
  { name: 'Warsaw', flag: '🇵🇱' },
  { name: 'Amsterdam', flag: '🇳🇱' },
  { name: 'Vienna', flag: '🇦🇹' },
  { name: 'Budapest', flag: '🇭🇺' },
  { name: 'Copenhagen', flag: '🇩🇰' },
  { name: 'Stockholm', flag: '🇸🇪' },
];

const countryFlags: Record<string, string> = {
  ES: '🇪🇸', PT: '🇵🇹', DE: '🇩🇪', FR: '🇫🇷', IT: '🇮🇹', CZ: '🇨🇿',
  PL: '🇵🇱', NL: '🇳🇱', AT: '🇦🇹', HU: '🇭🇺', DK: '🇩🇰', SE: '🇸🇪',
  NO: '🇳🇴', FI: '🇫🇮', IE: '🇮🇪', GB: '🇬🇧', GR: '🇬🇷', HR: '🇭🇷',
  RO: '🇷🇴', BG: '🇧🇬', BE: '🇧🇪', TR: '🇹🇷', JP: '🇯🇵', KR: '🇰🇷',
};

interface CitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cityId: string, cityName: string, countryCode: string) => void;
  userId?: string;
}

export default function CitySelector({ isOpen, onClose, onSelect, userId }: CitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { cities, loading, fetchCities, selectCity } = useCities();

  useEffect(() => {
    if (isOpen) {
      fetchCities();
    }
  }, [isOpen, fetchCities]);

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      fetchCities(q || undefined);
    },
    [fetchCities],
  );

  const handleSelect = useCallback(
    (cityId: string, cityName: string, countryCode: string) => {
      selectCity(cityId, userId);
      onSelect(cityId, cityName, countryCode);
      onClose();
      setSearchQuery('');
    },
    [selectCity, userId, onSelect, onClose],
  );

  const handlePopularClick = useCallback(
    (name: string) => {
      const match = cities.find(
        (c) => c.name.toLowerCase() === name.toLowerCase(),
      );
      if (match) {
        handleSelect(match.id, match.name, match.country_code);
      } else {
        handleSearch(name);
      }
    },
    [cities, handleSelect, handleSearch],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Bottom sheet */}
      <div
        className="relative w-full max-w-[430px] max-h-[85dvh] rounded-t-3xl flex flex-col animate-fade-in-up overflow-hidden"
        style={{ background: 'var(--color-bg-card)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: 'var(--color-border)' }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Şehir Seç
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors hover:bg-gray-100"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Kapat"
          >
            <X size={22} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Şehir veya ülke ara..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {/* Popular cities */}
        {!searchQuery && (
          <div className="px-5 pb-3">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Popüler Şehirler
            </p>
            <div className="grid grid-cols-3 gap-2">
              {POPULAR_CITIES.map((pc) => (
                <button
                  key={pc.name}
                  onClick={() => handlePopularClick(pc.name)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{
                    background: 'var(--color-bg)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <span className="text-base">{pc.flag}</span>
                  <span className="truncate text-xs">{pc.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* City list */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {loading ? (
            <div className="flex flex-col gap-2 py-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl animate-shimmer" />
              ))}
            </div>
          ) : cities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <MapPin
                size={32}
                style={{ color: 'var(--color-text-muted)' }}
              />
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Şehir bulunamadı
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {cities.map((city) => (
                <button
                  key={city.id}
                  onClick={() =>
                    handleSelect(city.id, city.name, city.country_code)
                  }
                  className="flex items-center gap-3 px-3 py-3.5 rounded-xl transition-colors hover:bg-gray-50 text-left"
                >
                  <span className="text-xl">
                    {countryFlags[city.country_code] ?? '🌍'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {city.name}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {city.country}
                    </p>
                  </div>
                  {city.student_count != null && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: 'var(--color-bg)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {city.student_count.toLocaleString('tr-TR')} öğrenci
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
