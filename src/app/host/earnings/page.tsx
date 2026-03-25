'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useHostPanel } from '@/hooks/useHostPanel';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Loader2,
  BarChart3,
  Minus,
} from 'lucide-react';
import { formatPrice, currencySymbol as getCurrencySymbol } from '@/lib/currency-utils';

export default function EarningsPage() {
  return (
    <AuthGuard>
      <EarningsContent />
    </AuthGuard>
  );
}

function EarningsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { stats, earnings, loading, fetchStats, fetchEarnings } = useHostPanel(user?.id);
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchStats();
    fetchEarnings();
  }, [fetchStats, fetchEarnings]);

  const totalNet = useMemo(
    () => earnings.reduce((sum, e) => sum + Number(e.net_amount), 0),
    [earnings]
  );

  const totalCommission = useMemo(
    () => earnings.reduce((sum, e) => sum + Number(e.commission), 0),
    [earnings]
  );

  const totalGross = useMemo(
    () => earnings.reduce((sum, e) => sum + Number(e.amount), 0),
    [earnings]
  );

  // Derive currency symbol from the first earning's booking listing
  const currencyCode = useMemo(() => {
    for (const e of earnings) {
      const listing = (e.booking as unknown as { listing?: { currency?: string } })?.listing;
      if (listing?.currency) return listing.currency;
    }
    return 'TRY';
  }, [earnings]);

  const symbol = getCurrencySymbol(currencyCode);

  // Filter earnings by selected period
  const filteredEarnings = useMemo(() => {
    const now = new Date();
    if (period === 'monthly') {
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return earnings.filter((e) => e.period === currentPeriod);
    }
    // yearly: filter by current year
    const currentYear = String(now.getFullYear());
    return earnings.filter((e) => (e.period ?? '').startsWith(currentYear));
  }, [earnings, period]);

  // Group by period for chart mockup
  const periodGroups = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredEarnings.forEach((e) => {
      const key = e.period ?? 'Belirsiz';
      groups[key] = (groups[key] ?? 0) + Number(e.net_amount);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  }, [filteredEarnings]);

  const maxEarning = Math.max(...periodGroups.map(([, v]) => v), 1);

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
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Kazançlar
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && earnings.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        ) : (
          <>
            {/* Total Earnings Card */}
            <div
              className="rounded-xl p-5 mb-4"
              style={{ background: 'var(--gradient-dark)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Toplam Kazanç
                </p>
                <div className="flex gap-1">
                  {(['monthly', 'yearly'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                      style={{
                        background: period === p ? 'rgba(255,255,255,0.2)' : 'transparent',
                        color: period === p ? 'white' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {p === 'monthly' ? 'Aylık' : 'Yıllık'}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: 'white' }}>
                {formatPrice(period === 'monthly' ? (stats?.monthlyEarnings ?? 0) : totalNet)} {symbol}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp size={14} style={{ color: '#4ADE80' }} />
                <span className="text-xs" style={{ color: '#4ADE80' }}>
                  Toplam: {formatPrice(totalNet)} {symbol}
                </span>
              </div>
            </div>

            {/* Chart Mockup */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={16} style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Kazanç Trendi
                </p>
              </div>

              {periodGroups.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Henüz kazanç verisi yok
                  </p>
                </div>
              ) : (
                <div className="flex items-end justify-between gap-2 h-40">
                  {periodGroups.map(([label, value]) => {
                    const pct = Math.max((value / maxEarning) * 100, 4);
                    return (
                      <div key={label} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                          {value > 0 ? formatPrice(value) : '0'}
                        </span>
                        <div className="w-full flex flex-col items-center justify-end h-28">
                          <div
                            className="w-full max-w-[32px] rounded-t-md transition-all"
                            style={{
                              height: `${pct}%`,
                              background: 'var(--gradient-primary)',
                            }}
                          />
                        </div>
                        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          {label.split('-')[1] ?? label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Commission Details */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Detaylar
              </p>
              <div className="flex flex-col gap-2.5">
                <DetailRow label="Brüt Kazanç" value={`${formatPrice(totalGross)} ${symbol}`} icon={<DollarSign size={14} />} />
                <DetailRow label="Komisyon" value={`-${formatPrice(totalCommission)} ${symbol}`} icon={<Minus size={14} />} negative />
                <div className="h-px" style={{ background: 'var(--color-border)' }} />
                <DetailRow label="Net Kazanç" value={`${formatPrice(totalNet)} ${symbol}`} icon={<TrendingUp size={14} />} bold />
              </div>
            </div>

            {/* Per-listing Breakdown */}
            {filteredEarnings.length > 0 && (
              <div
                className="rounded-xl p-4"
                style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
              >
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Son İşlemler
                </p>
                <div className="flex flex-col gap-2">
                  {filteredEarnings.slice(0, 10).map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between py-2"
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Rezervasyon #{e.booking_id?.slice(0, 8) ?? '-'}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                          {e.period ?? new Date(e.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>
                        +{formatPrice(Number(e.net_amount))} {symbol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
  negative,
  bold,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  negative?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div style={{ color: negative ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
          {icon}
        </div>
        <span
          className={`text-sm ${bold ? 'font-semibold' : ''}`}
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </span>
      </div>
      <span
        className={`text-sm ${bold ? 'font-bold' : 'font-medium'}`}
        style={{
          color: negative
            ? 'var(--color-error)'
            : bold
              ? 'var(--color-success)'
              : 'var(--color-text-primary)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
