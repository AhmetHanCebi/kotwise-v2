'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useRoommates } from '@/hooks/useRoommates';
import {
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  Cigarette,
  Loader2,
  CheckCircle,
} from 'lucide-react';

const SLEEP_OPTIONS = [
  { value: 'early_bird', label: 'Erken kalkarım', icon: Sun },
  { value: 'night_owl', label: 'Gece kuşuyum', icon: Moon },
];

const CLEANLINESS_OPTIONS = [
  { value: 'very_clean', label: 'Çok temiz' },
  { value: 'clean', label: 'Temiz' },
  { value: 'moderate', label: 'Orta' },
  { value: 'messy', label: 'Dağınık' },
];

const INTEREST_OPTIONS = [
  'music', 'sports', 'travel', 'cooking', 'photography', 'gaming',
  'reading', 'art', 'dancing', 'yoga', 'hiking', 'swimming',
  'cycling', 'fitness', 'technology', 'writing',
];

const INTEREST_TR: Record<string, string> = {
  music: 'Müzik', sports: 'Spor', cooking: 'Yemek', reading: 'Okuma',
  travel: 'Seyahat', gaming: 'Oyun', photography: 'Fotoğrafçılık', art: 'Sanat',
  dancing: 'Dans', yoga: 'Yoga', hiking: 'Doğa Yürüyüşü', swimming: 'Yüzme',
  cycling: 'Bisiklet', fitness: 'Fitness', technology: 'Teknoloji', writing: 'Yazarlık',
};

export default function CreateRoommateProfilePage() {
  return (
    <AuthGuard>
      <CreateRoommateProfileContent />
    </AuthGuard>
  );
}

function CreateRoommateProfileContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { upsertProfile } = useRoommates(user?.id);

  const [sleepSchedule, setSleepSchedule] = useState('');
  const [cleanliness, setCleanliness] = useState('');
  const [smoking, setSmoking] = useState(false);
  const [exchangeCity, setExchangeCity] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = async () => {
    if (!sleepSchedule || !cleanliness) {
      setError('Uyku düzeni ve temizlik tercihini seçin');
      return;
    }
    setSaving(true);
    setError('');
    const result = await upsertProfile({
      user_id: user!.id,
      sleep_schedule: sleepSchedule,
      cleanliness,
      smoking,
      exchange_city: exchangeCity || null,
      interests,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/roommates');
    }
  };

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
          Roommate Profili Oluştur
        </h1>
      </div>

      <div className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        {/* Sleep Schedule */}
        <Section title="Uyku Düzeni">
          <div className="flex gap-3">
            {SLEEP_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = sleepSchedule === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSleepSchedule(opt.value)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: selected ? 'var(--color-primary)' : 'var(--color-bg-card)',
                    color: selected ? 'white' : 'var(--color-text-secondary)',
                    border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}
                >
                  <Icon size={16} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Cleanliness */}
        <Section title="Temizlik Tercihi">
          <div className="flex flex-wrap gap-2">
            {CLEANLINESS_OPTIONS.map((opt) => {
              const selected = cleanliness === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setCleanliness(opt.value)}
                  className="px-4 py-2 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: selected ? 'var(--color-primary)' : 'var(--color-bg-card)',
                    color: selected ? 'white' : 'var(--color-text-secondary)',
                    border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}
                >
                  <Sparkles size={12} className="inline mr-1" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Smoking */}
        <Section title="Sigara">
          <div className="flex gap-3">
            {[
              { value: false, label: 'İçmem' },
              { value: true, label: 'İçerim' },
            ].map((opt) => {
              const selected = smoking === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  onClick={() => setSmoking(opt.value)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: selected ? 'var(--color-primary)' : 'var(--color-bg-card)',
                    color: selected ? 'white' : 'var(--color-text-secondary)',
                    border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}
                >
                  <Cigarette size={16} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Exchange City */}
        <Section title="Exchange Şehri (opsiyonel)">
          <input
            type="text"
            value={exchangeCity}
            onChange={(e) => setExchangeCity(e.target.value)}
            placeholder="ör: Berlin, Münih, Barcelona"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </Section>

        {/* Interests */}
        <Section title="İlgi Alanları">
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: selected ? 'var(--color-primary)' : 'var(--color-bg-card)',
                    color: selected ? 'white' : 'var(--color-text-secondary)',
                    border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}
                >
                  {INTEREST_TR[interest] ?? interest}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Bio */}
        <Section title="Hakkında (opsiyonel)">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Kendini kısaca tanıt, oda arkadaşın seni tanısın..."
            rows={4}
            maxLength={300}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          <p className="text-[11px] mt-1 text-right" style={{ color: 'var(--color-text-muted)' }}>
            {bio.length}/300
          </p>
        </Section>

        {error && (
          <div
            className="mt-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--color-error)' }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Bottom Save Button */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 px-4 py-3"
        style={{
          background: 'color-mix(in srgb, var(--color-bg-card) 95%, transparent)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--color-border)',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: 'var(--gradient-primary)', color: 'white' }}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Profili Oluştur
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--color-text-muted)' }}>
        {title}
      </p>
      {children}
    </div>
  );
}
