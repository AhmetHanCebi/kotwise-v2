'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBudget } from '@/hooks/useBudget';
import {
  ArrowLeft,
  Calculator,
  Home,
  Utensils,
  Bus,
  PartyPopper,
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
  Search,
  Loader2,
  ChevronDown,
} from 'lucide-react';

const categories = [
  { key: 'rent', label: 'Kira', icon: Home, color: '#F26522' },
  { key: 'food', label: 'Yemek', icon: Utensils, color: '#22C55E' },
  { key: 'transport', label: 'Ulaşım', icon: Bus, color: '#3B82F6' },
  { key: 'entertainment', label: 'Eğlence', icon: PartyPopper, color: '#8B5CF6' },
  { key: 'other', label: 'Diğer', icon: MoreHorizontal, color: '#6B7280' },
] as const;

type CategoryKey = (typeof categories)[number]['key'];

const defaultAmounts: Record<CategoryKey, number> = {
  rent: 500,
  food: 200,
  transport: 50,
  entertainment: 100,
  other: 50,
};

export default function BudgetPage() {
  const router = useRouter();
  const { cities, loading: loadingCities, fetchCities } = useBudget();
  const [selectedCity, setSelectedCity] = useState<(typeof cities)[number] | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [duration, setDuration] = useState(5);
  const [amounts, setAmounts] = useState<Record<CategoryKey, number>>(defaultAmounts);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const q = citySearch.toLowerCase();
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [cities, citySearch]);

  const monthlyTotal = useMemo(
    () => Object.values(amounts).reduce((sum, v) => sum + v, 0),
    [amounts]
  );

  const periodTotal = monthlyTotal * duration;

  const cityAvgRent = selectedCity?.avg_rent ?? null;
  const comparison = cityAvgRent
    ? amounts.rent - cityAvgRent
    : null;

  const updateAmount = (key: CategoryKey, value: number) => {
    setAmounts((prev) => ({ ...prev, [key]: value }));
  };

  const handleShowListings = () => {
    const params = new URLSearchParams();
    params.set('maxPrice', String(amounts.rent));
    if (selectedCity) params.set('city', selectedCity.id);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]"
        style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}
      >
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full active:opacity-70"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="Geri"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Calculator size={20} style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Bütçe Hesaplayıcı
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* City Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1.5 px-1" style={{ color: 'var(--color-text-secondary)' }}>
            Şehir
          </label>
          <button
            onClick={() => setShowCityPicker(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: selectedCity ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            }}
          >
            {selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : 'Şehir seçin...'}
            <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Duration Slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Süre
            </label>
            <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
              {duration} Ay
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={12}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full accent-[var(--color-primary)]"
          />
          <div className="flex justify-between px-1">
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>1 Ay</span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>12 Ay</span>
          </div>
        </div>

        {/* Category Sliders */}
        <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--color-text-muted)' }}>
          Aylık Giderler
        </p>
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.key} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon size={16} style={{ color: cat.color }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {cat.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: cat.color }}>
                    {amounts[cat.key]} EUR
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={cat.key === 'rent' ? 1500 : 500}
                  step={10}
                  value={amounts[cat.key]}
                  onChange={(e) => updateAmount(cat.key, Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: cat.color }}
                />
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: 'var(--gradient-dark)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Aylık Toplam</span>
            <span className="text-xl font-bold" style={{ color: 'white' }}>{monthlyTotal} EUR</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {duration} Aylık Toplam
            </span>
            <span className="text-xl font-bold" style={{ color: 'white' }}>{periodTotal} EUR</span>
          </div>
        </div>

        {/* City Comparison */}
        {selectedCity && cityAvgRent !== null && (
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {selectedCity.name} Kıyaslama
            </p>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Şehir Ort. Kira
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {cityAvgRent} EUR
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Sizin Bütçeniz
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                {amounts.rent} EUR
              </span>
            </div>
            {comparison !== null && (
              <div className="flex items-center gap-1.5 mt-2">
                {comparison > 0 ? (
                  <>
                    <TrendingUp size={14} style={{ color: 'var(--color-error)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-error)' }}>
                      Ortalamadan {comparison} EUR yüksek
                    </span>
                  </>
                ) : comparison < 0 ? (
                  <>
                    <TrendingDown size={14} style={{ color: 'var(--color-success)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-success)' }}>
                      Ortalamadan {Math.abs(comparison)} EUR düşük
                    </span>
                  </>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Şehir ortalamasıyla aynı
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleShowListings}
          className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mb-4"
          style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
        >
          <Search size={16} />
          Bu bütçeye uygun ilanları göster
        </button>
      </div>

      {/* City Picker Modal */}
      {showCityPicker && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCityPicker(false)} />
          <div
            className="relative mt-auto w-full max-w-[430px] mx-auto rounded-t-2xl flex flex-col"
            style={{ background: 'var(--color-bg-card)', maxHeight: '70vh' }}
          >
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Şehir Seç
                </h3>
                <button
                  onClick={() => setShowCityPicker(false)}
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Kapat
                </button>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
              >
                <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Şehir ara..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-[env(safe-area-inset-bottom)]">
              {loadingCities ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                </div>
              ) : filteredCities.length === 0 ? (
                <p className="text-center py-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Şehir bulunamadı
                </p>
              ) : (
                filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCity(city);
                      setShowCityPicker(false);
                      setCitySearch('');
                    }}
                    className="flex items-center justify-between w-full py-3 active:opacity-70"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                  >
                    <div>
                      <p className="text-sm font-medium text-left" style={{ color: 'var(--color-text-primary)' }}>
                        {city.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {city.country}
                      </p>
                    </div>
                    {city.avg_rent && (
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        Ort. {city.avg_rent} EUR
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
