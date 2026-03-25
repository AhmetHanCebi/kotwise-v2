'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  MessageCircle,
  MapPin,
  Globe,
  Loader2,
  GraduationCap,
  Star,
} from 'lucide-react';

interface MentorDetail {
  id: string;
  user_id: string;
  bio: string | null;
  languages: string[];
  expertise: string[];
  status: string;
  user: {
    full_name: string | null;
    avatar_url: string | null;
    university: string | null;
    bio: string | null;
  } | null;
  city: {
    name: string;
    country: string;
  } | null;
}

export default function MentorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [mentor, setMentor] = useState<MentorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentor = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('mentor_profiles')
          .select('*, user:profiles!mentor_profiles_user_id_fkey(*), city:cities!mentor_profiles_city_id_fkey(*)')
          .eq('id', id)
          .single();

        if (!error && data) {
          setMentor(data as unknown as MentorDetail);
        }
      } catch {
        // Error fetching mentor
      }
      setLoading(false);
    };
    fetchMentor();
  }, [id]);

  const handleMessage = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (mentor) {
      router.push(`/messages?to=${mentor.user_id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: 'var(--color-bg)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3 px-4" style={{ background: 'var(--color-bg)' }}>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Mentor bulunamadi.
        </p>
        <button
          onClick={() => router.back()}
          className="text-sm font-medium"
          style={{ color: 'var(--color-primary)' }}
        >
          Geri don
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="glass-effect sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <button onClick={() => router.back()} className="p-1" aria-label="Geri">
          <ArrowLeft size={22} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <h1 className="text-base font-semibold flex-1" style={{ color: 'var(--color-text-primary)' }}>
          Mentor Profili
        </h1>
      </header>

      <div className="flex-1 px-4 py-6">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden"
            style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
          >
            {mentor.user?.avatar_url ? (
              <img
                src={mentor.user.avatar_url}
                alt={mentor.user?.full_name ?? 'Mentor'}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.user?.full_name ?? 'M')}&background=F26522&color=fff&size=200`;
                }}
              />
            ) : (
              (mentor.user?.full_name?.[0] ?? '?')
            )}
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {mentor.user?.full_name ?? 'Mentor'}
          </h2>
          {mentor.user?.university && (
            <div className="flex items-center gap-1.5">
              <GraduationCap size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {mentor.user.university}
              </span>
            </div>
          )}
          {mentor.city && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {mentor.city.name}, {mentor.city.country}
              </span>
            </div>
          )}
        </div>

        {/* Languages */}
        {mentor.languages?.length > 0 && (
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Globe size={16} style={{ color: 'var(--color-info)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Diller
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {mentor.languages.join(', ')}
            </p>
          </div>
        )}

        {/* Expertise */}
        {mentor.expertise?.length > 0 && (
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} style={{ color: 'var(--color-warning)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Uzmanlik Alanlari
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'color-mix(in srgb, var(--color-secondary) 8%, transparent)',
                    color: 'var(--color-secondary)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {mentor.bio && (
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Hakkinda
            </span>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
              {mentor.bio}
            </p>
          </div>
        )}

        {/* Message CTA */}
        <button
          onClick={handleMessage}
          className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-[0.98]"
          style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
        >
          <MessageCircle size={18} />
          Mesaj Gonder
        </button>
      </div>
    </div>
  );
}
