'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMentors } from '@/hooks/useMentors';
import { useCities } from '@/hooks/useCities';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import {
  MessageCircle,
  MapPin,
  Globe,
  Loader2,
  Plus,
  GraduationCap,
  Users,
  X,
  Check,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

const LANGUAGE_OPTIONS = [
  'Türkçe', 'İngilizce', 'Almanca', 'Fransızca', 'İspanyolca',
  'İtalyanca', 'Portekizce', 'Hollandaca', 'Rusça', 'Arapça',
  'Çince', 'Japonca', 'Korece', 'Lehçe', 'Çekçe', 'İsveççe',
];

const EXPERTISE_OPTIONS = [
  'Konaklama', 'Ulaşım', 'Vize/Belgeler', 'Üniversite',
  'Dil', 'Kültür', 'Bütçe', 'Sosyal Hayat',
];

export default function MentorsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { mentors, loading, fetchMentors, apply } = useMentors();
  const { toast } = useToast();
  const { cities, selectedCityId, fetchCities } = useCities();
  const [activeCityId, setActiveCityId] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyForm, setApplyForm] = useState({
    cityId: '',
    bio: '',
    languages: [] as string[],
    customLang: '',
    expertise: [] as string[],
  });

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
    router.push(`/messages/new?to=${mentorUserId}`);
  };

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      <PageHeader
        title="Mentor Bul"
        glass
        sticky
        rightContent={<GraduationCap size={22} style={{ color: 'var(--color-primary)' }} />}
      />

      {/* City filter */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-2 scrollbar-hide">
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

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 p-4 pb-24">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        )}

        {!loading && mentors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(242,101,34,0.08)' }}
            >
              <GraduationCap size={36} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Bu şehirde henüz mentor yok
              </p>
              <p className="text-sm max-w-[280px]" style={{ color: 'var(--color-text-secondary)' }}>
                Bu şehirde deneyimin var mı? Yeni gelen öğrencilere rehberlik ederek topluluğa katkı sağla!
              </p>
            </div>
            <button
              onClick={() => {
                if (!user) { router.push('/login'); return; }
                setShowApplyModal(true);
              }}
              className="px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
              style={{ background: 'var(--gradient-primary)', color: 'white' }}
            >
              <Plus size={16} />
              Mentor Ol
            </button>
          </div>
        )}

        {mentors.map((mentor, i) => (
          <Link
            key={mentor.id}
            href={`/mentors/${mentor.id}`}
            className="rounded-2xl p-4 animate-fade-in-up block"
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
                  <img src={mentor.user.avatar_url} alt={mentor.user?.full_name ?? 'Mentor'} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.user?.full_name ?? 'Mentor')}&background=F26522&color=fff&size=200`; }} />
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
                      background: 'color-mix(in srgb, var(--color-secondary) 6%, transparent)',
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
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMessage(mentor.user_id); }}
              className="w-full mt-3 h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98]"
              style={{
                background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              <MessageCircle size={16} />
              Mesaj Gönder
            </button>
          </Link>
        ))}
      </div>

      {/* Mentor application FAB */}
      <button
        onClick={() => {
          if (!user) { router.push('/login'); return; }
          setShowApplyModal(true);
        }}
        className="fixed bottom-24 right-4 flex items-center gap-2 px-5 h-12 rounded-full shadow-lg z-40 transition-transform active:scale-90"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <Plus size={20} style={{ color: 'var(--color-text-inverse)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-inverse)' }}>
          Mentor Ol
        </span>
      </button>

      {/* Mentor Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowApplyModal(false)} />
          <div
            className="relative w-full max-w-[430px] rounded-t-3xl p-5 pb-8 max-h-[85dvh] overflow-y-auto animate-fade-in-up"
            style={{ background: 'var(--color-bg-card)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Mentor Başvurusu</h3>
              <button onClick={() => setShowApplyModal(false)} className="p-1.5 rounded-full" style={{ color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* City */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Şehir *</label>
                <select
                  value={applyForm.cityId}
                  onChange={(e) => setApplyForm(p => ({ ...p, cityId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  <option value="">Şehir seçin</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}, {c.country}</option>)}
                </select>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Diller</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map(lang => {
                    const selected = applyForm.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setApplyForm(p => ({
                          ...p,
                          languages: selected ? p.languages.filter(l => l !== lang) : [...p.languages, lang],
                        }))}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{
                          background: selected ? 'var(--color-info)' : 'var(--color-bg)',
                          color: selected ? 'white' : 'var(--color-text-secondary)',
                          border: `1px solid ${selected ? 'var(--color-info)' : 'var(--color-border)'}`,
                        }}
                      >
                        {selected && <Check size={12} />}
                        {lang}
                      </button>
                    );
                  })}
                </div>
                {/* Custom language input */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Diğer dil ekle..."
                    value={applyForm.customLang}
                    onChange={(e) => setApplyForm(p => ({ ...p, customLang: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = applyForm.customLang.trim();
                        if (val && !applyForm.languages.includes(val)) {
                          setApplyForm(p => ({ ...p, languages: [...p.languages, val], customLang: '' }));
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = applyForm.customLang.trim();
                      if (val && !applyForm.languages.includes(val)) {
                        setApplyForm(p => ({ ...p, languages: [...p.languages, val], customLang: '' }));
                      }
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-primary)' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Expertise */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Uzmanlık Alanları</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE_OPTIONS.map(tag => {
                    const selected = applyForm.expertise.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => setApplyForm(p => ({
                          ...p,
                          expertise: selected ? p.expertise.filter(t => t !== tag) : [...p.expertise, tag],
                        }))}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{
                          background: selected ? 'var(--color-primary)' : 'var(--color-bg)',
                          color: selected ? 'white' : 'var(--color-text-secondary)',
                          border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        }}
                      >
                        {selected && <Check size={12} />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Hakkında</label>
                <textarea
                  value={applyForm.bio}
                  onChange={(e) => setApplyForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Deneyimlerinizi ve nasıl yardımcı olabileceğinizi anlatın..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <button
                onClick={async () => {
                  if (!user || !applyForm.cityId) {
                    toast('Lütfen şehir seçin', 'error');
                    return;
                  }
                  setApplyLoading(true);
                  const result = await apply({
                    user_id: user.id,
                    city_id: applyForm.cityId,
                    languages: applyForm.languages,
                    expertise: applyForm.expertise,
                    bio: applyForm.bio || null,
                  });
                  setApplyLoading(false);
                  if (result.error) {
                    toast(result.error, 'error');
                  } else {
                    toast('Mentor başvurunuz alındı!', 'success');
                    setShowApplyModal(false);
                    fetchMentors(activeCityId ?? undefined);
                  }
                }}
                disabled={applyLoading}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: 'var(--gradient-primary)', color: 'white' }}
              >
                {applyLoading ? <Loader2 size={16} className="animate-spin" /> : <GraduationCap size={16} />}
                Başvuruyu Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
