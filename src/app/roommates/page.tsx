'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRoommates } from '@/hooks/useRoommates';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import {
  X as XIcon,
  Heart,
  MessageCircle,
  Loader2,
  Moon,
  Sun,
  Sparkles,
  BookOpen,
  Cigarette,
  Dog,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const INTEREST_EMOJIS: Record<string, string> = {
  music: '🎵', sports: '⚽', travel: '✈️', cooking: '🍳',
  photography: '📷', gaming: '🎮', reading: '📚', art: '🎨',
  dancing: '💃', cinema: '🎬', yoga: '🧘', hiking: '🥾',
};

const HABIT_ICONS: Record<string, React.ElementType> = {
  early_bird: Sun,
  night_owl: Moon,
  studious: BookOpen,
  social: Users,
  clean: Sparkles,
  smoker: Cigarette,
  pet_lover: Dog,
};

function calculateAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function matchPercentage(myInterests: string[], theirInterests: string[]): number {
  if (!myInterests?.length || !theirInterests?.length) return Math.floor(Math.random() * 30 + 60);
  const common = myInterests.filter((i) => theirInterests.includes(i));
  return Math.min(99, Math.floor((common.length / Math.max(myInterests.length, theirInterests.length)) * 100) + 50);
}

export default function RoommatesPageWrapper() {
  return (
    <AuthGuard>
      <RoommatesPage />
    </AuthGuard>
  );
}

function RoommatesPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { profiles, loading, fetchProfiles, like, skip } = useRoommates(user?.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandBio, setExpandBio] = useState(false);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [matchNotif, setMatchNotif] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Touch handling state
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const [dragX, setDragX] = useState(0);

  useEffect(() => {
    if (user?.id) fetchProfiles();
  }, [user?.id, fetchProfiles]);

  const currentProfile = profiles[currentIndex] ?? null;

  const handleAction = useCallback(async (action: 'like' | 'skip') => {
    if (!currentProfile) return;

    setSwipeDir(action === 'like' ? 'right' : 'left');

    setTimeout(async () => {
      if (action === 'like') {
        const result = await like(currentProfile.user_id);
        if (result.isMatch) {
          setMatchNotif(true);
          setTimeout(() => setMatchNotif(false), 3000);
        }
      } else {
        await skip(currentProfile.user_id);
      }
      setSwipeDir(null);
      setDragX(0);
      setExpandBio(false);
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  }, [currentProfile, like, skip]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
    setDragX(touchCurrentX.current - touchStartX.current);
  };

  const handleTouchEnd = () => {
    if (Math.abs(dragX) > 100) {
      handleAction(dragX > 0 ? 'like' : 'skip');
    } else {
      setDragX(0);
    }
  };

  const match = currentProfile
    ? matchPercentage(profile?.interests ?? [], currentProfile.interests ?? [])
    : 0;

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="glass-effect sticky top-0 z-40 flex items-center justify-between px-4 h-14"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Arkadaş Bul
        </h1>
        <Heart size={22} style={{ color: 'var(--color-primary)' }} />
      </header>

      {/* Match notification */}
      {matchNotif && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-lg animate-fade-in-up text-center"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <p className="text-lg font-bold" style={{ color: 'var(--color-text-inverse)' }}>
            Eşleşme!
          </p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
            İkiniz de birbirinizi beğendiniz!
          </p>
        </div>
      )}

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-4 py-4 pb-24">
        {loading && profiles.length === 0 && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Profiller yükleniyor...</p>
          </div>
        )}

        {!loading && !currentProfile && (
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <Users size={48} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Şu an gösterilecek profil kalmadı. Daha sonra tekrar dene!
            </p>
          </div>
        )}

        {currentProfile && (
          <div className="w-full max-w-sm">
            {/* Swipe card */}
            <div
              ref={cardRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="rounded-3xl overflow-hidden transition-transform"
              style={{
                background: 'var(--color-bg-card)',
                boxShadow: 'var(--shadow-lg)',
                transform: swipeDir
                  ? `translateX(${swipeDir === 'right' ? '120%' : '-120%'}) rotate(${swipeDir === 'right' ? '15' : '-15'}deg)`
                  : `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
                transition: swipeDir ? 'transform 0.3s ease-out' : dragX === 0 ? 'transform 0.2s ease-out' : 'none',
              }}
            >
              {/* Photo */}
              <div className="relative h-80 overflow-hidden" style={{ background: 'var(--gradient-dark)' }}>
                {currentProfile.user?.avatar_url ? (
                  <img
                    src={currentProfile.user.avatar_url}
                    alt={currentProfile.user?.full_name ?? 'Kullanıcı'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {currentProfile.user?.full_name?.[0] ?? '?'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Match badge */}
                <div
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'var(--color-success)', color: '#fff' }}
                >
                  %{match} Uyum
                </div>

                {/* Swipe indicators */}
                {dragX > 40 && (
                  <div className="absolute top-4 left-4 px-4 py-2 rounded-xl border-2 border-green-400 rotate-[-15deg]">
                    <span className="text-xl font-bold text-green-400">BEĞEN</span>
                  </div>
                )}
                {dragX < -40 && (
                  <div className="absolute top-4 right-4 px-4 py-2 rounded-xl border-2 border-red-400 rotate-[15deg]">
                    <span className="text-xl font-bold text-red-400">GEÇ</span>
                  </div>
                )}

                {/* Name overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white">
                    {currentProfile.user?.full_name ?? 'Anonim'}
                    {currentProfile.user?.bio && (
                      <span className="text-lg font-normal opacity-80 ml-2">
                        {/* Age placeholder - from profile metadata if available */}
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    {currentProfile.user?.university ?? ''}
                    {currentProfile.exchange_city ? ` → ${currentProfile.exchange_city}` : ''}
                  </p>
                </div>
              </div>

              {/* Info section */}
              <div className="p-4 flex flex-col gap-3">
                {/* Interests */}
                {currentProfile.interests?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: 'var(--color-primary)' + '14',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {INTEREST_EMOJIS[interest] ?? ''} {interest}
                      </span>
                    ))}
                  </div>
                )}

                {/* Habits */}
                <div className="flex items-center gap-3">
                  {currentProfile.sleep_schedule && (
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {currentProfile.sleep_schedule === 'early_bird' ? <Sun size={14} /> : <Moon size={14} />}
                      {currentProfile.sleep_schedule === 'early_bird' ? 'Erken kalkar' : 'Gece kuşu'}
                    </div>
                  )}
                  {currentProfile.cleanliness && (
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      <Sparkles size={14} />
                      {currentProfile.cleanliness}
                    </div>
                  )}
                  {currentProfile.smoking && (
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      <Cigarette size={14} />
                      Sigara içer
                    </div>
                  )}
                </div>

                {/* Bio */}
                {currentProfile.user?.bio && (
                  <div>
                    <p
                      className={`text-sm leading-relaxed ${!expandBio ? 'line-clamp-2' : ''}`}
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {currentProfile.user.bio}
                    </p>
                    {currentProfile.user.bio.length > 100 && (
                      <button
                        onClick={() => setExpandBio(!expandBio)}
                        className="flex items-center gap-0.5 text-xs font-medium mt-1"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {expandBio ? (
                          <>Daha az <ChevronUp size={12} /></>
                        ) : (
                          <>Devamını oku <ChevronDown size={12} /></>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <button
                onClick={() => handleAction('skip')}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '2px solid var(--color-error)',
                }}
                aria-label="Geç"
              >
                <XIcon size={26} style={{ color: 'var(--color-error)' }} />
              </button>

              <button
                onClick={() => {
                  if (currentProfile) router.push(`/roommates/${currentProfile.user_id}`);
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '2px solid var(--color-info)',
                }}
                aria-label="Mesaj gönder"
              >
                <MessageCircle size={22} style={{ color: 'var(--color-info)' }} />
              </button>

              <button
                onClick={() => handleAction('like')}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90"
                style={{
                  background: 'var(--gradient-primary)',
                }}
                aria-label="Beğen"
              >
                <Heart size={26} fill="#fff" style={{ color: '#fff' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
