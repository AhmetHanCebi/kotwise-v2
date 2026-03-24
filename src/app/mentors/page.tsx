'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMentors } from '@/hooks/useMentors';
import { useCities } from '@/hooks/useCities';
import BottomNav from '@/components/BottomNav';
import {
  MessageCircle,
  Star,
  MapPin,
  Globe,
  Loader2,
  Plus,
  GraduationCap,
  Users,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function MentorsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { mentors, loading, fetchMentors } = useMentors();
  const { toast } = useToast();
  const { cities, selectedCityId, fetchCities } = useCities();
  const [activeCityId, setActiveCityId] = useState<string | null>(null);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (selectedCityId && !activeCityId) setActiveCityId(selectedCityId);
    else if (cities.length > 0 && !activeCityId) setActiveCityId(cities[0].id);
  }, [selectedCityId, cities, activeCityId]);

  useEffect(() => {
    fetchMentors(activeCityId ?? undefined);
  }, [activeCityId, fetchMentors]);

  const handleMessage = (mentorUserId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/messages?to=${mentorUserId}`);
  };

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="glass-effect sticky top-0 z-40 px-4 pt-[env(safe-area-inset-top)]"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between h-14">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Mentor Bul
          </h1>
          <GraduationCap size={22} style={{ color: 'var(--color-primary)' }} />
        </div>

        {/* City filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => { setActiveCityId(null); fetchMentors(); }}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: !activeCityId ? 'var(--color-primary)' : 'var(--color-bg-card)',
              color: !activeCityId ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
              border: `1px solid ${!activeCityId ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            Tümü
          </button>
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => setActiveCityId(city.id)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: activeCityId === city.id ? 'var(--color-primary)' : 'var(--color-bg-card)',
                color: activeCityId === city.id ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                border: `1px solid ${activeCityId === city.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              {city.name}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 p-4 pb-24">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        )}

        {!loading && mentors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users size={48} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Bu şehirde henüz mentor yok.
              <br />
              Sen mentor olmak ister misin?
            </p>
          </div>
        )}

        {mentors.map((mentor, i) => (
          <div
            key={mentor.id}
            className="rounded-2xl p-4 animate-fade-in-up"
            style={{
              background: 'var(--color-bg-card)',
              boxShadow: 'var(--shadow-card)',
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold overflow-hidden flex-shrink-0"
                style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
              >
                {mentor.user?.avatar_url ? (
                  <img src={mentor.user.avatar_url} alt={mentor.user?.full_name ?? 'Mentor'} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }} />
                ) : (
                  (mentor.user?.full_name?.[0] ?? '?')
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {mentor.user?.full_name ?? 'Mentor'}
                </h3>
                <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                  <MapPin size={11} />
                  {mentor.city?.name ?? ''}'da yaşadı
                </p>

                {/* Languages */}
                {mentor.languages?.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Globe size={11} style={{ color: 'var(--color-info)' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {mentor.languages.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Expertise tags */}
            {mentor.expertise?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {mentor.expertise.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{
                      background: 'var(--color-secondary)' + '10',
                      color: 'var(--color-secondary)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bio preview */}
            {mentor.bio && (
              <p className="text-xs mt-2 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {mentor.bio}
              </p>
            )}

            {/* Message button */}
            <button
              onClick={() => handleMessage(mentor.user_id)}
              className="w-full mt-3 h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98]"
              style={{
                background: 'var(--color-primary)' + '14',
                color: 'var(--color-primary)',
              }}
            >
              <MessageCircle size={16} />
              Mesaj Gönder
            </button>
          </div>
        ))}
      </div>

      {/* Mentor application FAB */}
      <button
        onClick={() => toast('Mentor başvurusu yakında aktif olacak', 'info')}
        className="fixed bottom-24 right-4 flex items-center gap-2 px-5 h-12 rounded-full shadow-lg z-40 transition-transform active:scale-90"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <Plus size={20} style={{ color: 'var(--color-text-inverse)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-inverse)' }}>
          Mentor Ol
        </span>
      </button>

      <BottomNav />
    </div>
  );
}
