'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useBooking } from '@/hooks/useBooking';
import { useListings } from '@/hooks/useListings';
import { useI18n } from '@/lib/i18n';
import {
  Edit3,
  CalendarCheck,
  PlusCircle,
  Home,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  Heart,
  Calendar,
  BadgeCheck,
  GraduationCap,
  Loader2,
} from 'lucide-react';

const menuItemDefs = [
  { href: '/profile/edit', key: 'editProfile' as const, icon: Edit3, color: '#3B82F6' },
  { href: '/favorites', key: 'favorites' as const, icon: Heart, color: 'var(--color-error)' },
  { href: '/profile/bookings', key: 'myBookings' as const, icon: CalendarCheck, color: '#8B5CF6' },
  { href: '/listing/new', key: 'createListing' as const, icon: PlusCircle, color: 'var(--color-success)' },
  { href: '/host/apply', key: 'becomeHost' as const, icon: Home, color: 'var(--color-warning)' },
  { href: '/notifications', key: 'notifications' as const, icon: Bell, color: 'var(--color-error)' },
  { href: '/settings', key: 'settings' as const, icon: Settings, color: '#6B7280' },
  { href: '/settings/faq', key: 'help' as const, icon: HelpCircle, color: '#06B6D4' },
];

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { t } = useI18n();
  const router = useRouter();
  const { profile, loading, signOut, user } = useAuth();
  const { favorites } = useFavorites(user?.id);
  const { bookings } = useBooking(user?.id);
  const { listings, search: searchListings } = useListings();

  // Fetch host listings count and compute average rating
  useEffect(() => {
    if (user?.id) {
      searchListings({ host_id: user.id, limit: 100 });
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const listingCount = listings.length;
  const avgRating = useMemo(() => {
    const rated = listings.filter((l) => (l.rating ?? 0) > 0);
    if (rated.length === 0) return null;
    const sum = rated.reduce((acc, l) => acc + (l.rating ?? 0), 0);
    return (sum / rated.length).toFixed(1);
  }, [listings]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-dvh">
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: 'var(--color-primary)' }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-20 page-enter" style={{ background: 'var(--color-bg)' }}>
      {/* Dark Gradient Header */}
      <div
        className="px-5 pt-[calc(env(safe-area-inset-top)+24px)] pb-8 relative"
        style={{ background: 'var(--gradient-dark)' }}
      >
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? ''}
                className="w-24 h-24 rounded-full object-cover border-4"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'var(--color-text-inverse)',
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                {(profile?.full_name ?? 'K').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <h1
            className="text-xl font-bold mb-0.5"
            style={{ color: 'var(--color-text-inverse)' }}
          >
            {profile?.full_name ?? 'Kullanıcı'}
          </h1>

          {/* University Info */}
          {profile?.university && (
            <p
              className="text-sm mb-1"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {profile.university}
            </p>
          )}

          {/* Profile Completion */}
          {(() => {
            const fields = [
              profile?.full_name,
              profile?.avatar_url,
              profile?.university,
              profile?.bio,
              profile?.exchange_city_id,
              profile?.phone,
              profile?.interests?.length ? true : null,
            ];
            const filled = fields.filter(Boolean).length;
            const total = fields.length;
            const pct = Math.round((filled / total) * 100);
            return (
              <div className="w-full mt-2 mb-1">
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: pct >= 80 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                      color: pct >= 80 ? 'var(--color-success)' : '#F59E0B',
                    }}
                  >
                    {t.profile.completion.replace('%{pct}', String(pct))}
                  </span>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 80 ? '#4ADE80' : '#FBBF24',
                    }}
                  />
                </div>
                {pct < 80 && (
                  <Link
                    href="/profile/edit"
                    className="block text-center text-[11px] font-medium mt-1.5"
                    style={{ color: '#FBBF24' }}
                  >
                    {t.profile.completeProfile}
                  </Link>
                )}
              </div>
            );
          })()}

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2">
            {profile?.is_verified && (
              <span
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(34,197,94,0.2)', color: '#4ADE80' }}
              >
                <BadgeCheck size={12} />
                Doğrulanmış
              </span>
            )}
            {profile?.is_host && (
              <span
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(245,158,11,0.2)', color: '#FBBF24' }}
              >
                <Star size={12} />
                Super Ev Sahibi
              </span>
            )}
            {profile?.is_mentor && (
              <span
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(99,102,241,0.2)', color: '#A5B4FC' }}
              >
                <GraduationCap size={12} />
                Mentor
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div
        className="mx-4 -mt-5 rounded-xl px-4 py-3 flex items-center justify-around"
        style={{
          background: 'var(--color-bg-card)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {[
          { label: t.profile.stats.listings, value: String(listingCount), icon: Home },
          { label: t.profile.stats.favorites, value: String(favorites?.length ?? 0), icon: Heart },
          { label: t.profile.stats.bookings, value: String(bookings?.length ?? 0), icon: Calendar },
          { label: t.profile.stats.rating, value: avgRating ?? '-', icon: Star },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-0.5">
            <stat.icon size={16} style={{ color: 'var(--color-primary)' }} />
            <span
              className="text-base font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {stat.value}
            </span>
            <span
              className="text-[10px]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bio */}
      {profile?.bio && (
        <div
          className="mx-4 mt-4 p-4 rounded-xl"
          style={{
            background: 'var(--color-bg-card)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.profile.about}
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {profile.bio}
          </p>
        </div>
      )}

      {/* Menu */}
      <div
        className="mx-4 mt-4 rounded-xl overflow-hidden"
        style={{
          background: 'var(--color-bg-card)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {menuItemDefs.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3.5 active:opacity-70 transition-opacity"
            style={{
              borderBottom:
                i < menuItemDefs.length - 1
                  ? '1px solid var(--color-border)'
                  : 'none',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${item.color}15` }}
            >
              <item.icon size={17} style={{ color: item.color }} />
            </div>
            <span
              className="flex-1 text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t.profile[item.key]}
            </span>
            <ChevronRight
              size={18}
              style={{ color: 'var(--color-text-muted)' }}
            />
          </Link>
        ))}
      </div>

      {/* Sign Out */}
      <div className="mx-4 mt-4 mb-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl w-full active:opacity-70 transition-opacity"
          style={{
            background: 'var(--color-bg-card)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)' }}
          >
            <LogOut size={17} style={{ color: 'var(--color-error)' }} />
          </div>
          <span
            className="flex-1 text-sm font-medium text-left"
            style={{ color: 'var(--color-error)' }}
          >
            {t.profile.logout}
          </span>
          <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
