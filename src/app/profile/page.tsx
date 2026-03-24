'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useBooking } from '@/hooks/useBooking';
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
  Award,
  BadgeCheck,
  GraduationCap,
  Loader2,
} from 'lucide-react';

const menuItems = [
  { href: '/profile/edit', label: 'Profil Düzenle', icon: Edit3, color: '#3B82F6' },
  { href: '/profile/bookings', label: 'Rezervasyonlarım', icon: CalendarCheck, color: '#8B5CF6' },
  { href: '/listing/new', label: 'İlan Oluştur', icon: PlusCircle, color: '#22C55E' },
  { href: '/host/apply', label: 'Ev Sahibi Ol', icon: Home, color: '#F59E0B' },
  { href: '/notifications', label: 'Bildirimler', icon: Bell, color: '#EF4444' },
  { href: '/settings', label: 'Ayarlar', icon: Settings, color: '#6B7280' },
  { href: '/settings#yardim', label: 'Yardım', icon: HelpCircle, color: '#06B6D4' },
];

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { profile, loading, signOut, user } = useAuth();
  const { favorites } = useFavorites(user?.id);
  const { bookings } = useBooking(user?.id);

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
    <div className="flex flex-col flex-1 pb-20" style={{ background: 'var(--color-bg)' }}>
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
          { label: 'İlanlar', value: '0', icon: Home },
          { label: 'Favoriler', value: String(favorites?.length ?? 0), icon: Heart },
          { label: 'Rezervasyonlar', value: String(bookings?.length ?? 0), icon: Calendar },
          { label: 'Puan', value: '0.0', icon: Star },
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
            Hakkında
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
        {menuItems.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3.5 active:opacity-70 transition-opacity"
            style={{
              borderBottom:
                i < menuItems.length - 1
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
              {item.label}
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
            Çıkış Yap
          </span>
          <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
