'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useStorage } from '@/hooks/useStorage';
import {
  ArrowLeft,
  Camera,
  Save,
  Loader2,
  X,
  Plus,
  GraduationCap,
  MapPin,
  Globe,
  BookOpen,
} from 'lucide-react';
import AutocompleteField from '@/components/AutocompleteField';
import { UNIVERSITIES } from '@/lib/universities';
import { useToast } from '@/components/Toast';

const CITIES = [
  'İstanbul', 'Barcelona', 'Lizbon', 'Berlin',
  'Ankara', 'İzmir', 'Antalya', 'Bursa',
  'Madrid', 'Paris', 'Londra', 'Amsterdam',
  'Roma', 'Milano', 'Viyana', 'Prag',
  'Münih', 'Hamburg', 'Brüksel', 'Budapeşte',
  'Varşova', 'Atina', 'Dublin', 'Kopenhag',
  'Stockholm', 'Oslo', 'Helsinki', 'Zürih',
];

const COUNTRIES = [
  'Türkiye', 'İspanya', 'Portekiz', 'Almanya',
  'Fransa', 'İtalya', 'İngiltere', 'Hollanda',
  'Belçika', 'Avusturya', 'Çekya', 'Polonya',
  'Yunanistan', 'İrlanda', 'Danimarka', 'İsveç',
  'Norveç', 'Finlandiya', 'İsviçre', 'Macaristan',
  'Romanya', 'Hırvatistan', 'ABD', 'Kanada',
  'Brezilya', 'Arjantin', 'Meksika', 'Japonya',
  'Güney Kore', 'Çin', 'Hindistan', 'Rusya',
];

const MAJORS = [
  'Bilgisayar Mühendisliği', 'Yazılım Mühendisliği', 'Elektrik-Elektronik Mühendisliği',
  'Makine Mühendisliği', 'Endüstri Mühendisliği', 'İnşaat Mühendisliği',
  'Mimarlık', 'Tıp', 'Hukuk', 'İşletme', 'Ekonomi', 'Psikoloji',
  'Sosyoloji', 'Uluslararası İlişkiler', 'Siyaset Bilimi',
  'İletişim', 'Gazetecilik', 'Grafik Tasarım', 'Endüstriyel Tasarım',
  'Güzel Sanatlar', 'Müzik', 'Matematik', 'Fizik', 'Kimya', 'Biyoloji',
  'Çevre Mühendisliği', 'Gıda Mühendisliği', 'Tarih', 'Felsefe',
  'Türk Dili ve Edebiyatı', 'İngiliz Dili ve Edebiyatı', 'Eğitim Bilimleri',
  'Yönetim Bilimleri', 'Finans', 'Pazarlama', 'Hemşirelik', 'Eczacılık',
  'Diş Hekimliği', 'Veterinerlik', 'Moleküler Biyoloji',
];

const interestOptions = [
  'Müzik', 'Spor', 'Seyahat', 'Yemek', 'Teknoloji', 'Sanat',
  'Film', 'Kitap', 'Yoga', 'Dans', 'Fotoğraf', 'Doğa',
];

export default function EditProfilePage() {
  return (
    <AuthGuard>
      <EditProfileContent />
    </AuthGuard>
  );
}

function EditProfileContent() {
  const router = useRouter();
  const { user, profile, updateProfile } = useAuth();
  const { upload, uploading } = useStorage();
  const { toast } = useToast();

  const [form, setForm] = useState({
    full_name: '',
    university: '',
    major: '',
    bio: '',
    home_city: '',
    home_country: '',
    phone: '',
    interests: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        university: profile.university ?? '',
        major: profile.major ?? '',
        bio: profile.bio ?? '',
        home_city: profile.home_city ?? '',
        home_country: profile.home_country ?? '',
        phone: profile.phone ?? '',
        interests: profile.interests ?? [],
      });
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setAvatarPreview(URL.createObjectURL(file));
    try {
      const result = await upload(file, 'avatars', user.id);
      if (result.data) {
        await updateProfile({ avatar_url: result.data.url });
      } else {
        toast('Fotoğraf yüklenemedi, lütfen tekrar deneyin', 'error');
        setAvatarPreview(profile?.avatar_url ?? null);
      }
    } catch {
      toast('Fotoğraf yüklenirken bir hata oluştu', 'error');
      setAvatarPreview(profile?.avatar_url ?? null);
    }
  };

  const toggleInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSave = async () => {
    setValidationError(null);

    // Validation
    if (!form.full_name.trim()) {
      setValidationError('Ad Soyad zorunludur');
      return;
    }
    if (form.phone && !/^\+?[0-9\s\-()]{7,20}$/.test(form.phone)) {
      setValidationError('Geçerli bir telefon numarası girin');
      return;
    }
    if (form.bio.length > 300) {
      setValidationError('Hakkında alanı en fazla 300 karakter olabilir');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        full_name: form.full_name || null,
        university: form.university || null,
        major: form.major || null,
        bio: form.bio || null,
        home_city: form.home_city || null,
        home_country: form.home_country || null,
        phone: form.phone || null,
        interests: form.interests,
      });
      setSaving(false);
      toast('Kaydedildi \u2713', 'success');
      setTimeout(() => router.back(), 800);
    } catch {
      setSaving(false);
      toast('Profil kaydedilemedi, lütfen tekrar deneyin', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]"
        style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full active:opacity-70"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="Geri"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold flex-1" style={{ color: 'var(--color-text-primary)' }}>
          Profil Düzenle
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold active:scale-95 transition-transform"
          style={{
            background: 'var(--gradient-primary)',
            color: 'var(--color-text-inverse)',
          }}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Kaydet
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {validationError && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium"
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: 'var(--color-error)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            {validationError}
          </div>
        )}
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }}
              />
            ) : (
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold"
                style={{
                  background: 'var(--gradient-dark)',
                  color: 'var(--color-text-inverse)',
                }}
              >
                {(form.full_name || 'K').charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center shadow-md"
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
              }}
              aria-label="Fotoğraf değiştir"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          <Field label="Ad Soyad" value={form.full_name} onChange={(v) => setForm((p) => ({ ...p, full_name: v }))} />
          <AutocompleteField
            label="Üniversite"
            placeholder="Üniversite seçin veya yazın"
            value={form.university}
            onChange={(v) => setForm((p) => ({ ...p, university: v }))}
            options={UNIVERSITIES}
            icon={<GraduationCap size={16} />}
            allowCustom
          />
          <AutocompleteField
            label="Bölüm"
            placeholder="Bölüm seçin veya yazın"
            value={form.major}
            onChange={(v) => setForm((p) => ({ ...p, major: v }))}
            options={MAJORS}
            icon={<BookOpen size={16} />}
            allowCustom
          />
          <AutocompleteField
            label="Şehir"
            placeholder="Şehir seçin veya yazın"
            value={form.home_city}
            onChange={(v) => setForm((p) => ({ ...p, home_city: v }))}
            options={CITIES}
            icon={<MapPin size={16} />}
            allowCustom
          />
          <AutocompleteField
            label="Ülke"
            placeholder="Ülke seçin veya yazın"
            value={form.home_country}
            onChange={(v) => setForm((p) => ({ ...p, home_country: v }))}
            options={COUNTRIES}
            icon={<Globe size={16} />}
            allowCustom
          />
          <PhoneField value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label
                className="text-xs font-semibold"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Hakkında
              </label>
              <span
                className="text-[11px] font-medium"
                style={{
                  color: form.bio.length > 300 ? 'var(--color-error)' : 'var(--color-text-muted)',
                }}
              >
                {form.bio.length}/300
              </span>
            </div>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              maxLength={300}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              placeholder="Kendinizi kısaca tanıtın..."
            />
          </div>

          {/* Interests */}
          <div>
            <label
              className="block text-xs font-semibold mb-2 px-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              İlgi Alanları
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => {
                const selected = form.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: selected ? 'var(--color-primary)' : 'var(--color-bg-card)',
                      color: selected ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                      border: selected ? 'none' : '1px solid var(--color-border)',
                    }}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold mb-1.5 px-1"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      />
    </div>
  );
}

const COUNTRY_CODES = [
  { code: '+90', flag: '🇹🇷', country: 'Türkiye' },
  { code: '+49', flag: '🇩🇪', country: 'Almanya' },
  { code: '+33', flag: '🇫🇷', country: 'Fransa' },
  { code: '+34', flag: '🇪🇸', country: 'İspanya' },
  { code: '+39', flag: '🇮🇹', country: 'İtalya' },
  { code: '+31', flag: '🇳🇱', country: 'Hollanda' },
  { code: '+44', flag: '🇬🇧', country: 'İngiltere' },
  { code: '+1', flag: '🇺🇸', country: 'ABD' },
  { code: '+43', flag: '🇦🇹', country: 'Avusturya' },
  { code: '+32', flag: '🇧🇪', country: 'Belçika' },
  { code: '+48', flag: '🇵🇱', country: 'Polonya' },
  { code: '+420', flag: '🇨🇿', country: 'Çekya' },
  { code: '+46', flag: '🇸🇪', country: 'İsveç' },
  { code: '+47', flag: '🇳🇴', country: 'Norveç' },
  { code: '+45', flag: '🇩🇰', country: 'Danimarka' },
  { code: '+351', flag: '🇵🇹', country: 'Portekiz' },
];

function PhoneField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Parse existing value to detect country code
  const detected = COUNTRY_CODES.find((c) => value.startsWith(c.code));
  const selectedCode = detected?.code ?? '+90';
  const localNumber = detected ? value.slice(detected.code.length).trim() : value.replace(/^\+?\d{1,3}\s*/, '');

  const handleCodeChange = (newCode: string) => {
    onChange(`${newCode} ${localNumber}`);
  };

  const handleNumberChange = (num: string) => {
    onChange(`${selectedCode} ${num}`);
  };

  return (
    <div>
      <label
        className="block text-xs font-semibold mb-1.5 px-1"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Telefon
      </label>
      <div className="flex gap-2">
        <select
          value={selectedCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="px-2 py-2.5 rounded-xl text-sm outline-none w-[100px] shrink-0"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder="5XX XXX XX XX"
          className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>
    </div>
  );
}
