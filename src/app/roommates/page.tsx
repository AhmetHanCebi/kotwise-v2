'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { getAvatarPlaceholder, handleAvatarError } from '@/lib/image-utils';

const INTEREST_EMOJIS: Record<string, string> = {
  music: '🎵', sports: '⚽', travel: '✈️', cooking: '🍳',
  photography: '📷', gaming: '🎮', reading: '📚', art: '🎨',
  dancing: '💃', cinema: '🎬', yoga: '🧘', hiking: '🥾',
};

const INTEREST_TR: Record<string, string> = {
  music: 'Müzik', sports: 'Spor', cooking: 'Yemek', reading: 'Okuma',
  travel: 'Seyahat', gaming: 'Oyun', photography: 'Fotoğrafçılık', art: 'Sanat',
  movies: 'Film', fitness: 'Fitness', technology: 'Teknoloji', dancing: 'Dans',
  yoga: 'Yoga', hiking: 'Doğa Yürüyüşü', swimming: 'Yüzme', cycling: 'Bisiklet',
  writing: 'Yazarlık', gardening: 'Bahçecilik',
};

const CLEANLINESS_TR: Record<string, string> = {
  very_clean: 'Çok temiz', clean: 'Temiz', moderate: 'Orta', messy: 'Dağınık',
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

interface MatchInput {
  interests?: string[];
  sleep_schedule?: string | null;
  cleanliness?: string | null;
  smoking?: boolean | null;
  exchange_city?: string | null;
}

function matchPercentage(my: MatchInput, their: MatchInput): number {
  let score = 0;
  let maxScore = 0;

  // Interest similarity (weight: 50)
  const myInterests = my.interests ?? [];
  const theirInterests = their.interests ?? [];
  if (myInterests.length > 0 && theirInterests.length > 0) {
    const common = myInterests.filter((i) => theirInterests.includes(i));
    score += (common.length / Math.max(myInterests.length, theirInterests.length)) * 50;
    maxScore += 50;
  }

  // Sleep schedule match (weight: 20)
  if (my.sleep_schedule && their.sleep_schedule) {
    score += my.sleep_schedule === their.sleep_schedule ? 20 : 5;
    maxScore += 20;
  }

  // Cleanliness match (weight: 15)
  if (my.cleanliness && their.cleanliness) {
    score += my.cleanliness === their.cleanliness ? 15 : 5;
    maxScore += 15;
  }

  // Smoking preference (weight: 15)
  if (my.smoking !== null && my.smoking !== undefined && their.smoking !== null && their.smoking !== undefined) {
    score += my.smoking === their.smoking ? 15 : 0;
    maxScore += 15;
  }

  // Same exchange city bonus
  if (my.exchange_city && their.exchange_city && my.exchange_city === their.exchange_city) {
    score += 10;
    maxScore += 10;
  }

  // If we have no data to compare, give a base score of 50
  if (maxScore === 0) return 50;

  return Math.min(99, Math.max(10, Math.round((score / maxScore) * 100)));
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
  const { profiles, myProfile, loading, fetchProfiles, fetchMyProfile, like, skip } = useRoommates(user?.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandBio, setExpandBio] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [matchNotif, setMatchNotif] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Touch handling state
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const [dragX, setDragX] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchProfiles();
      fetchMyProfile();
    }
  }, [user?.id, fetchProfiles, fetchMyProfile]);

  const currentProfile = profiles[currentIndex] ?? null;

  const handleAction = useCallback(async (action: 'like' | 'skip') => {
    if (!currentProfile || isAnimating) return;

    setIsAnimating(true);
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
      setPhotoIndex(0);
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
    }, 300);
  }, [currentProfile, like, skip, isAnimating]);

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

  const myMatchInput: MatchInput = {
    interests: myProfile?.interests?.length ? myProfile.interests : (profile?.interests ?? []),
    sleep_schedule: myProfile?.sleep_schedule,
    cleanliness: myProfile?.cleanliness,
    smoking: myProfile?.smoking,
    exchange_city: myProfile?.exchange_city,
  };
  const theirMatchInput: MatchInput = currentProfile ? {
    interests: currentProfile.interests ?? [],
    sleep_schedule: currentProfile.sleep_schedule,
    cleanliness: currentProfile.cleanliness,
    smoking: currentProfile.smoking,
    exchange_city: currentProfile.exchange_city,
  } : { interests: [] };
  const match = currentProfile ? matchPercentage(myMatchInput, theirMatchInput) : 0;

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

      {/* Profile creation CTA */}
      {!loading && !myProfile && (
        <div className="px-4 py-3">
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: 'rgba(242,101,34,0.06)', border: '1px solid rgba(242,101,34,0.15)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <UserPlus size={18} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Profilini oluştur
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Diğer öğrenciler seni keşfedebilsin!
              </p>
            </div>
            <Link
              href="/roommates/create"
              className="px-4 py-2 rounded-xl text-xs font-bold shrink-0"
              style={{ background: 'var(--gradient-primary)', color: 'white' }}
            >
              Oluştur
            </Link>
          </div>
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
                {(() => {
                  const photos: string[] = [];
                  if (currentProfile.user?.avatar_url) photos.push(currentProfile.user.avatar_url);
                  if (currentProfile.photos?.length) {
                    photos.push(...currentProfile.photos);
                  }
                  if (photos.length === 0) photos.push(getAvatarPlaceholder(currentProfile.user_id));
                  const idx = photoIndex % photos.length;
                  return (
                    <>
                      <img
                        src={photos[idx]}
                        alt={currentProfile.user?.full_name ?? 'Kullanıcı'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => handleAvatarError(e, currentProfile.user_id, currentProfile.user?.full_name ?? undefined)}
                      />
                      {photos.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => (i - 1 + photos.length) % photos.length); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10"
                            style={{ background: 'rgba(0,0,0,0.4)' }}
                            aria-label="Önceki fotoğraf"
                          >
                            <ChevronLeft size={16} color="white" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => (i + 1) % photos.length); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10"
                            style={{ background: 'rgba(0,0,0,0.4)' }}
                            aria-label="Sonraki fotoğraf"
                          >
                            <ChevronRight size={16} color="white" />
                          </button>
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                            {photos.map((_, i) => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i === idx ? 'white' : 'rgba(255,255,255,0.4)' }} />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Match badge */}
                <div
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: match >= 60 ? 'var(--color-success)' : match >= 30 ? 'var(--color-warning)' : 'var(--color-text-muted)', color: '#fff' }}
                >
                  {`%${match} Uyum`}
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
                    {(() => {
                      const age = calculateAge(currentProfile.user?.birth_date);
                      return age ? <span className="text-lg font-normal opacity-80 ml-2">{age}</span> : null;
                    })()}
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
                          background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {INTEREST_EMOJIS[interest] ?? ''} {INTEREST_TR[interest] ?? interest.charAt(0).toUpperCase() + interest.slice(1)}
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
                      {CLEANLINESS_TR[currentProfile.cleanliness] ?? currentProfile.cleanliness}
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
                disabled={isAnimating}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '2px solid var(--color-error)',
                  opacity: isAnimating ? 0.5 : 1,
                }}
                aria-label="Geç"
              >
                <XIcon size={26} style={{ color: 'var(--color-error)' }} />
              </button>

              <Link
                href={currentProfile ? `/roommates/${currentProfile.user_id}` : '#'}
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '2px solid var(--color-info)',
                }}
                aria-label="Profili gör"
              >
                <MessageCircle size={22} style={{ color: 'var(--color-info)' }} />
              </Link>

              <button
                onClick={() => handleAction('like')}
                disabled={isAnimating}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90"
                style={{
                  background: 'var(--gradient-primary)',
                  opacity: isAnimating ? 0.5 : 1,
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
