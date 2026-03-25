'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useHostPanel } from '@/hooks/useHostPanel';
import { useBooking } from '@/hooks/useBooking';
import { currencySymbol } from '@/lib/currency-utils';
import {
  ArrowLeft,
  Home,
  DollarSign,
  Star,
  MessageCircle,
  PlusCircle,
  Calendar,
  TrendingUp,
  Clock,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function HostDashboardPage() {
  return (
    <AuthGuard>
      <HostDashboardContent />
    </AuthGuard>
  );
}

function HostDashboardContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { stats, loading, fetchStats } = useHostPanel(user?.id);
  const { bookings, fetchHostBookings } = useBooking(user?.id);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (profile && !profile.is_host) {
      setRedirecting(true);
      router.replace('/host/apply');
      return;
    }
    if (user?.id) {
      fetchStats();
      fetchHostBookings(user.id);
    }
  }, [profile, authLoading, fetchStats, fetchHostBookings, user?.id, router]);

  if (authLoading || (loading && !stats) || redirecting) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-dvh">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (profile && !profile.is_host) return null;

  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-4"
        style={{ background: 'var(--gradient-dark)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-full active:opacity-70"
            style={{ color: 'var(--color-text-inverse)' }}
            aria-label="Geri"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-inverse)' }}>
            Ev Sahibi Paneli
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            icon={<Home size={18} />}
            label="Aktif Ilan"
            value={String(stats?.activeListings ?? 0)}
            color="#3B82F6"
          />
          <StatCard
            icon={<DollarSign size={18} />}
            label="Bu Ay Kazanç"
            value={`${stats?.monthlyEarnings ?? 0} ${currencySymbol(stats?.currency)}`}
            color="#22C55E"
          />
          <StatCard
            icon={<Star size={18} />}
            label="Ortalama Puan"
            value={String(stats?.averageRating ?? '0.0')}
            color="#F59E0B"
          />
          <StatCard
            icon={<MessageCircle size={18} />}
            label="Yanıtlama"
            value={`${stats?.responseRate ?? 0}%`}
            color="#8B5CF6"
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {/* Quick Actions */}
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Hızlı İşlemler
        </p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          <QuickAction href="/listing/new" icon={<PlusCircle size={20} />} label="Yeni Ilan" />
          <QuickAction href="/host/calendar" icon={<Calendar size={20} />} label="Takvim" />
          <QuickAction href="/messages" icon={<MessageCircle size={20} />} label="Mesajlar" />
        </div>

        {/* Pending Bookings */}
        <div className="flex items-center justify-between mb-2 px-1">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Gelen Talepler
          </p>
          <Link
            href="/host/bookings"
            className="text-xs font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            Tümü
          </Link>
        </div>

        {pendingBookings.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-8 rounded-xl mb-4"
            style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
          >
            <Clock size={24} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Bekleyen talep yok
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {pendingBookings.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 px-3 py-3 rounded-xl"
                style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
              >
                {b.user?.avatar_url ? (
                  <img src={b.user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.user?.full_name ?? 'Misafir')}&background=F26522&color=fff&size=200`; }} />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0"
                    style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
                  >
                    {(b.user?.full_name ?? 'M').charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {b.user?.full_name ?? 'Misafir'}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(b.check_in).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    {' - '}
                    {new Date(b.check_out).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                  {b.total_price} {currencySymbol(b.listing?.currency)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Links */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
        >
          <NavLink href="/host/bookings" icon={<Clock size={18} />} label="Gelen Talepler" color="#F59E0B" border />
          <NavLink href="/host/earnings" icon={<TrendingUp size={18} />} label="Kazançlar" color="#22C55E" border />
          <NavLink href="/host/calendar" icon={<Calendar size={18} />} label="Takvim" color="#3B82F6" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="px-3 py-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.1)' }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div style={{ color }}>{icon}</div>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {label}
        </span>
      </div>
      <p className="text-lg font-bold" style={{ color: 'var(--color-text-inverse)' }}>
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 py-3 rounded-xl active:scale-95 transition-transform"
      style={{
        background: 'var(--color-bg-card)',
        boxShadow: 'var(--shadow-sm)',
        color: 'var(--color-primary)',
      }}
    >
      {icon}
      <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
    </Link>
  );
}

function NavLink({
  href,
  icon,
  label,
  color,
  border,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  border?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 active:opacity-70"
      style={{ borderBottom: border ? '1px solid var(--color-border)' : 'none' }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: `${color}15` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <span className="flex-1 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {label}
      </span>
      <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
    </Link>
  );
}
