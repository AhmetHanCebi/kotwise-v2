'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRoommates } from '@/hooks/useRoommates';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  MapPin,
  GraduationCap,
  CalendarRange,
  Moon,
  Sun,
  Sparkles,
  Cigarette,
  Dog,
  Users,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import type { RoommateProfileWithUser } from '@/lib/database.types';

const INTEREST_EMOJIS: Record<string, string> = {
  music: '🎵', sports: '⚽', travel: '✈️', cooking: '🍳',
  photography: '📷', gaming: '🎮', reading: '📚', art: '🎨',
  dancing: '💃', cinema: '🎬', yoga: '🧘', hiking: '🥾',
};

function matchPercentage(a: string[], b: string[]): number {
  if (!a?.length || !b?.length) return Math.floor(Math.random() * 30 + 60);
  const common = a.filter((i) => b.includes(i));
  return Math.min(99, Math.floor((common.length / Math.max(a.length, b.length)) * 100) + 50);
}

export default function RoommateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, profile: myProfile } = useAuth();
  const { like, getProfileById } = useRoommates(user?.id);
  const [profileData, setProfileData] = useState<RoommateProfileWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchNotif, setMatchNotif] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getProfileById(id);
      setProfileData(data);
      setLoading(false);
    }
    load();
  }, [id, getProfileById]);

  const handleLike = useCallback(async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    const result = await like(id);
    if (result.isMatch) {
      setMatchNotif(true);
      setTimeout(() => setMatchNotif(false), 3000);
    }
  }, [user, id, like, router]);

  const handleMessage = () => {
    router.push(`/messages?to=${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3 px-4">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Profil bulunamadı.</p>
        <button onClick={() => router.back()} className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
          Geri dön
        </button>
      </div>
    );
  }

  const p = profileData;
  const match = matchPercentage(myProfile?.interests ?? [], p.interests ?? []);

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Match notification */}
      {matchNotif && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-lg animate-fade-in-up text-center"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <p className="text-lg font-bold" style={{ color: 'var(--color-text-inverse)' }}>Eşleşme!</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>İkiniz de birbirinizi beğendiniz!</p>
        </div>
      )}

      {/* Avatar hero */}
      <div className="relative">
        <div className="h-72 overflow-hidden" style={{ background: 'var(--gradient-dark)' }}>
          {p.user?.avatar_url ? (
            <img src={p.user.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {p.user?.full_name?.[0] ?? '?'}
              </span>
            </div>
          )}
          {/* Gradient ring effect */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, transparent 50%, var(--color-bg) 100%)',
            }}
          />
        </div>
        <button
          onClick={() => router.back()}
          className="absolute top-[env(safe-area-inset-top)] left-4 mt-3 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          aria-label="Geri"
        >
          <ArrowLeft size={20} style={{ color: '#fff' }} />
        </button>

        {/* Match badge */}
        <div
          className="absolute bottom-6 right-4 px-4 py-2 rounded-2xl"
          style={{ background: 'var(--color-success)', boxShadow: 'var(--shadow-md)' }}
        >
          <span className="text-sm font-bold text-white">%{match} Uyum</span>
        </div>
      </div>

      {/* Profile info */}
      <div className="px-4 -mt-6 relative z-10 flex flex-col gap-4 pb-28">
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
        >
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {p.user?.full_name ?? 'Anonim'}
          </h1>

          {p.user?.university && (
            <div className="flex items-center gap-2 mt-1">
              <GraduationCap size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {p.user.university}
                {p.user.major ? ` - ${p.user.major}` : ''}
              </span>
            </div>
          )}

          {/* Exchange info */}
          {p.exchange_city && (
            <div className="flex items-center gap-2 mt-2 p-3 rounded-xl" style={{ background: 'var(--color-primary)' + '10' }}>
              <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                {p.user?.home_city ?? ''}
              </span>
              <ArrowRight size={14} style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                {p.exchange_city}
              </span>
            </div>
          )}

          {(p.exchange_start || p.exchange_end) && (
            <div className="flex items-center gap-2 mt-2">
              <CalendarRange size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {p.exchange_start ? new Date(p.exchange_start).toLocaleDateString('tr-TR') : '?'}
                {' - '}
                {p.exchange_end ? new Date(p.exchange_end).toLocaleDateString('tr-TR') : '?'}
              </span>
            </div>
          )}
        </div>

        {/* Interests */}
        {p.interests?.length > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              İlgi Alanları
            </h3>
            <div className="flex flex-wrap gap-2">
              {p.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: (myProfile?.interests ?? []).includes(interest)
                      ? 'var(--color-success)' + '20'
                      : 'var(--color-bg)',
                    color: (myProfile?.interests ?? []).includes(interest)
                      ? 'var(--color-success)'
                      : 'var(--color-text-secondary)',
                    border: `1px solid ${(myProfile?.interests ?? []).includes(interest) ? 'var(--color-success)' + '40' : 'var(--color-border)'}`,
                  }}
                >
                  {INTEREST_EMOJIS[interest] ?? ''} {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Habits / compatibility */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Yaşam Tarzı
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {p.sleep_schedule && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                {p.sleep_schedule === 'early_bird' ? <Sun size={16} style={{ color: 'var(--color-warning)' }} /> : <Moon size={16} style={{ color: 'var(--color-info)' }} />}
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {p.sleep_schedule === 'early_bird' ? 'Erken kalkar' : 'Gece kuşu'}
                </span>
              </div>
            )}
            {p.cleanliness && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                <Sparkles size={16} style={{ color: 'var(--color-success)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {p.cleanliness}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <Cigarette size={16} style={{ color: p.smoking ? 'var(--color-error)' : 'var(--color-success)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {p.smoking ? 'Sigara içer' : 'Sigara içmez'}
              </span>
            </div>
            {p.guests_policy && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                <Users size={16} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {p.guests_policy}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {p.user?.bio && (
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Hakkında
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {p.user.bio}
            </p>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] glass-effect z-40 px-4 py-4 pb-[env(safe-area-inset-bottom)]"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="flex gap-3">
          <button
            onClick={handleMessage}
            className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-primary)',
              border: '2px solid var(--color-primary)',
            }}
          >
            <MessageCircle size={18} />
            Mesaj Gönder
          </button>
          <button
            onClick={handleLike}
            className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-transform active:scale-[0.98]"
            style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
          >
            <Heart size={18} />
            Beğen
          </button>
        </div>
      </div>
    </div>
  );
}
