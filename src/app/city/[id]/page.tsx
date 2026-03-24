'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCities } from '@/hooks/useCities';
import {
  ArrowLeft,
  MapPin,
  Users,
  Shield,
  DollarSign,
  Bus,
  Train,
  Home,
  ChevronDown,
  ChevronUp,
  Search,
  Loader2,
  Info,
  Building,
  Compass,
  HelpCircle,
  Banknote,
} from 'lucide-react';

type TabKey = 'info' | 'neighborhoods' | 'transport' | 'cost' | 'faq';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'info', label: 'Bilgi', icon: Info },
  { key: 'neighborhoods', label: 'Mahalleler', icon: Building },
  { key: 'transport', label: 'Ulaşım', icon: Bus },
  { key: 'cost', label: 'Maliyet', icon: Banknote },
  { key: 'faq', label: 'SSS', icon: HelpCircle },
];

function SafetyBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const color =
    score >= 8 ? 'var(--color-success)' : score >= 5 ? 'var(--color-warning)' : 'var(--color-error)';
  return (
    <div className="flex items-center gap-1">
      <Shield size={14} style={{ color }} />
      <span className="text-xs font-bold" style={{ color }}>
        {score}/10
      </span>
    </div>
  );
}

export default function CityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { city, loading, getById } = useCities();
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  useEffect(() => {
    getById(id);
  }, [id, getById]);

  if (loading && !city) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!city) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3 px-4">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Şehir bulunamadı.</p>
        <button onClick={() => router.back()} className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
          Geri dön
        </button>
      </div>
    );
  }

  const costBreakdown = city.cost_breakdown ?? {};
  const transportInfo = city.transport_info ?? {};
  const costEntries = Object.entries(costBreakdown).filter(([, v]) => typeof v === 'number') as [string, number][];
  const costTotal = costEntries.reduce((sum, [, v]) => sum + v, 0) || 1;

  const COST_COLORS = ['#F26522', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Hero */}
      <div className="relative">
        <div className="h-52 overflow-hidden" style={{ background: 'var(--gradient-dark)' }}>
          {city.image_url && (
            <img src={city.image_url} alt={`${city.name} şehir manzarası`} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x400/F26522/white?text=Kotwise'; }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <button
          onClick={() => router.back()}
          className="absolute top-[env(safe-area-inset-top)] left-4 mt-3 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          aria-label="Geri"
        >
          <ArrowLeft size={20} style={{ color: '#fff' }} />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{city.country_code ? getFlagEmoji(city.country_code) : ''}</span>
            <h1 className="text-2xl font-bold text-white">{city.name}</h1>
          </div>
          <p className="text-sm text-white/70 mt-0.5">{city.country}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2 px-4 -mt-4 relative z-10">
        {[
          { icon: Users, label: 'Nüfus', value: city.population ? `${(city.population / 1000000).toFixed(1)}M` : '-' },
          { icon: Home, label: 'Ort. Kira', value: city.avg_rent ? `${city.avg_rent}${city.currency ?? ''}` : '-' },
          { icon: Compass, label: 'Öğrenci', value: city.student_count ? `${Math.round(city.student_count / 1000)}K` : '-' },
          { icon: Shield, label: 'Güvenlik', value: city.safety_score ? `${city.safety_score}/10` : '-' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 py-3 rounded-xl"
              style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
            >
              <Icon size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {stat.value}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto px-4 mt-4 scrollbar-hide">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all"
              style={{
                background: isActive ? 'var(--color-primary)' : 'var(--color-bg-card)',
                color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 py-4 pb-8">
        {/* INFO tab */}
        {activeTab === 'info' && (
          <div className="flex flex-col gap-4 animate-fade-in-up">
            {city.cultural_notes?.length > 0 && (
              <div
                className="rounded-2xl p-4"
                style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
              >
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Kültür Notları
                </h3>
                <ul className="flex flex-col gap-2">
                  {city.cultural_notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5"
                        style={{ background: 'var(--color-primary)' + '14', color: 'var(--color-primary)' }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {note}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {city.tips?.length > 0 && (
              <div
                className="rounded-2xl p-4"
                style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
              >
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Öğrenci İpuçları
                </h3>
                <ul className="flex flex-col gap-2">
                  {city.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-base">💡</span>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {tip}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* NEIGHBORHOODS tab */}
        {activeTab === 'neighborhoods' && (
          <div className="flex flex-col gap-3 animate-fade-in-up">
            {city.neighborhoods.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                Mahalle bilgisi henüz eklenmedi.
              </p>
            )}
            {city.neighborhoods.map((n) => (
              <div
                key={n.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
              >
                {n.image_url && (
                  <div className="h-32 overflow-hidden">
                    <img src={n.image_url} alt={`${n.name} mahallesi`} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/F26522/white?text=Kotwise'; }} />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {n.name}
                    </h3>
                    <SafetyBadge score={n.safety} />
                  </div>
                  {n.vibe && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {n.vibe}
                    </p>
                  )}
                  {n.description && (
                    <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {n.description}
                    </p>
                  )}
                  {n.avg_rent && (
                    <div className="flex items-center gap-1 mt-2">
                      <DollarSign size={12} style={{ color: 'var(--color-success)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--color-success)' }}>
                        Ort. {n.avg_rent}{city.currency ?? ''}/ay
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TRANSPORT tab */}
        {activeTab === 'transport' && (
          <div className="flex flex-col gap-3 animate-fade-in-up">
            {Object.keys(transportInfo).length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                Ulaşım bilgisi henüz eklenmedi.
              </p>
            ) : (
              Object.entries(transportInfo).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start gap-3 p-4 rounded-2xl"
                  style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--color-info)' + '14' }}
                  >
                    {key.toLowerCase().includes('metro') || key.toLowerCase().includes('tren') ? (
                      <Train size={20} style={{ color: 'var(--color-info)' }} />
                    ) : (
                      <Bus size={20} style={{ color: 'var(--color-info)' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text-primary)' }}>
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* COST tab */}
        {activeTab === 'cost' && (
          <div className="flex flex-col gap-4 animate-fade-in-up">
            {costEntries.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                Maliyet bilgisi henüz eklenmedi.
              </p>
            ) : (
              <>
                {/* Stacked bar */}
                <div
                  className="rounded-2xl p-4"
                  style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
                >
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                    Aylık Maliyet Dağılımı
                  </h3>
                  <div className="flex rounded-full overflow-hidden h-5">
                    {costEntries.map(([key, val], i) => (
                      <div
                        key={key}
                        className="h-full transition-all"
                        style={{
                          width: `${(val / costTotal) * 100}%`,
                          background: COST_COLORS[i % COST_COLORS.length],
                        }}
                        title={`${key}: ${val}`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                    {costEntries.map(([key, val], i) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: COST_COLORS[i % COST_COLORS.length] }}
                        />
                        <span className="text-xs capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                          {val}{city.currency ?? ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div
                  className="rounded-2xl p-4 flex items-center justify-between"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <span className="text-sm font-medium text-white/90">Toplam Tahmini</span>
                  <span className="text-xl font-bold text-white">
                    {costTotal}{city.currency ?? ''}/ay
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* FAQ tab */}
        {activeTab === 'faq' && (
          <div className="flex flex-col gap-2 animate-fade-in-up">
            {city.faqs.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                SSS henüz eklenmedi.
              </p>
            )}
            {city.faqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
              >
                <button
                  onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-medium flex-1 pr-2" style={{ color: 'var(--color-text-primary)' }}>
                    {faq.question}
                  </span>
                  {openFaqId === faq.id ? (
                    <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} />
                  ) : (
                    <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </button>
                {openFaqId === faq.id && (
                  <div className="px-4 pb-4">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-6">
        <button
          onClick={() => router.push(`/search?city=${id}`)}
          className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98]"
          style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
        >
          <Search size={18} />
          Bu Şehirde Ara
        </button>
      </div>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
