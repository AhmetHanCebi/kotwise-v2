'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Shield,
  Users,
  Loader2,
} from 'lucide-react';
import { useCities } from '@/hooks/useCities';
import { formatCurrencyRaw } from '@/lib/currency-utils';
import BottomNav from '@/components/BottomNav';

export default function CityListPage() {
  const router = useRouter();
  const { cities, loading, fetchCities } = useCities();

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  return (
    <div
      className="min-h-dvh flex flex-col max-w-[430px] mx-auto pb-24"
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
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Şehir Rehberi
          </h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        ) : cities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(242,101,34,0.1)' }}
            >
              <MapPin size={28} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Henüz şehir bulunamadı
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Şehir verileri yükleniyor veya henüz eklenmemiş
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/city/${city.id}`}
                className="flex gap-3 p-3 rounded-xl transition-transform active:scale-[0.98]"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--gradient-dark)' }}>
                  {city.image_url && (
                    <img
                      src={city.image_url}
                      alt={city.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {city.name}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {city.country}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {city.student_count && city.student_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Users size={12} style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                          {city.student_count.toLocaleString('tr-TR')} öğrenci
                        </span>
                      </div>
                    )}
                    {city.safety_score && city.safety_score > 0 && (
                      <div className="flex items-center gap-1">
                        <Shield
                          size={12}
                          style={{
                            color: city.safety_score >= 8 ? 'var(--color-success)' : city.safety_score >= 5 ? 'var(--color-warning)' : 'var(--color-error)',
                          }}
                        />
                        <span className="text-[11px] font-medium" style={{
                          color: city.safety_score >= 8 ? 'var(--color-success)' : city.safety_score >= 5 ? 'var(--color-warning)' : 'var(--color-error)',
                        }}>
                          {city.safety_score}/10
                        </span>
                      </div>
                    )}
                  </div>
                  {city.avg_rent && city.avg_rent > 0 && (
                    <p className="text-xs font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
                      ~{formatCurrencyRaw(city.avg_rent && city.avg_rent > 1000 ? Math.round(city.avg_rent / 100) : city.avg_rent!, city.currency)}/ay
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
