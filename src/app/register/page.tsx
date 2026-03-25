'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  GraduationCap,
  MapPin,
  Camera,
  Check,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStorage } from '@/hooks/useStorage';
import { useToast } from '@/components/Toast';
import AutocompleteField from '@/components/AutocompleteField';
import { UNIVERSITIES, MAJORS } from '@/lib/universities';

const INTERESTS = [
  'Müzik', 'Spor', 'Seyahat', 'Yemek', 'Film', 'Fotoğraf',
  'Teknoloji', 'Sanat', 'Doğa', 'Kitap', 'Yoga', 'Dans',
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithApple, updateProfile } = useAuth();
  const { upload } = useStorage();
  const { toast } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Step 1
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [exchangeUni, setExchangeUni] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Step 3
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [budget, setBudget] = useState('');

  const validateStep1 = useCallback(() => {
    if (!fullName.trim()) return 'Ad Soyad gerekli';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'Geçerli bir e-posta girin';
    if (password.length < 6) return 'Şifre en az 6 karakter olmalı';
    return null;
  }, [fullName, email, password]);

  const validateStep2 = useCallback(() => {
    if (!university.trim()) return 'Üniversite gerekli';
    if (startDate && endDate) {
      if (endDate <= startDate) return 'Bitiş tarihi başlangıçtan sonra olmalı';
    }
    if (startDate) {
      const today = new Date().toISOString().split('T')[0];
      if (startDate < today) return 'Başlangıç tarihi geçmişte olamaz';
    }
    return null;
  }, [university, startDate, endDate]);

  const handleNext = useCallback(async () => {
    setError(null);

    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
      setStep(3);
    } else {
      // Final submit
      setLoading(true);
      const result = await signUp(email, password, { full_name: fullName });
      if ('error' in result && result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      // Upload avatar if selected
      let avatarUrl: string | null = null;
      if (avatarFile && result.data && typeof result.data === 'object' && result.data !== null && 'user' in (result.data as Record<string, unknown>) && (result.data as Record<string, unknown>).user) {
        try {
          const uploadResult = await upload(avatarFile, 'avatars', ((result.data as Record<string, unknown>).user as { id: string }).id);
          if (uploadResult.data) {
            avatarUrl = uploadResult.data.url;
          }
        } catch {
          // Avatar upload failed but registration can continue
          toast('Profil fotoğrafı yüklenemedi, daha sonra tekrar deneyebilirsiniz', 'error');
        }
      }

      // Update profile with additional info
      try {
        await updateProfile({
          full_name: fullName,
          university,
          major: major || null,
          exchange_university: exchangeUni || null,
          exchange_start: startDate || null,
          exchange_end: endDate || null,
          budget: budget ? Number(budget) : null,
          interests: selectedInterests,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        });
      } catch {
        toast('Profil bilgileri kaydedilemedi, daha sonra düzenleyebilirsiniz', 'error');
      }

      setLoading(false);
      router.push('/');
    }
  }, [step, validateStep1, validateStep2, signUp, updateProfile, email, password, fullName, university, major, exchangeUni, startDate, endDate, budget, selectedInterests, router]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
    else router.back();
  }, [step, router]);

  const toggleInterest = useCallback((interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  }, []);

  return (
    <div
      className="flex-1 flex flex-col min-h-dvh"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:opacity-70 transition-colors"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="Geri"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <p
            className="text-xs font-semibold"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Adım {step}/3
          </p>
          <h1
            className="text-lg font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {step === 1 && 'Hesap Oluştur'}
            {step === 2 && 'Üniversite Bilgileri'}
            {step === 3 && 'Kişiselleştir'}
          </h1>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-6">
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--color-border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(step / 3) * 100}%`,
              background: 'var(--gradient-primary)',
            }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-5 pb-6 overflow-y-auto">
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium"
            style={{
              background: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
              color: 'var(--color-error)',
              border: '1px solid color-mix(in srgb, var(--color-error) 25%, transparent)',
            }}
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4 animate-fade-in-up">
            {/* Full Name */}
            <div>
              <label
                className="text-sm font-semibold mb-1.5 block"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Ad Soyad
              </label>
              <div
                className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <User size={18} style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Adınız ve soyadınız"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                className="text-sm font-semibold mb-1.5 block"
                style={{ color: 'var(--color-text-primary)' }}
              >
                E-posta
              </label>
              <div
                className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Mail size={18} style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="text-sm font-semibold mb-1.5 block"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Şifre
              </label>
              <div
                className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Lock size={18} style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--color-text-primary)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: 'var(--color-text-muted)' }}
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Social sign-up */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>veya</span>
                <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
              </div>
              <button
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch {
                    toast('Google ile giriş yapılamadı, lütfen tekrar deneyin', 'error');
                  }
                }}
                className="flex items-center justify-center gap-3 h-13 rounded-xl text-sm font-semibold transition-colors "
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google ile devam et
              </button>
              <button
                onClick={async () => {
                  try {
                    await signInWithApple();
                  } catch {
                    toast('Apple ile giriş yapılamadı, lütfen tekrar deneyin', 'error');
                  }
                }}
                className="flex items-center justify-center gap-3 h-13 rounded-xl text-sm font-semibold transition-colors "
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple ile devam et
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 animate-fade-in-up">
            <AutocompleteField
              label="Üniversite"
              placeholder="Üniversiteniz"
              value={university}
              onChange={setUniversity}
              options={UNIVERSITIES}
              icon={<GraduationCap size={18} />}
              allowCustom
            />

            <AutocompleteField
              label="Bölüm"
              placeholder="Bölümünüz (isteğe bağlı)"
              value={major}
              onChange={setMajor}
              options={MAJORS}
              icon={<GraduationCap size={18} />}
              allowCustom
            />

            <AutocompleteField
              label="Değişim Üniversitesi"
              placeholder="Gideceğiniz üniversite (isteğe bağlı)"
              value={exchangeUni}
              onChange={setExchangeUni}
              options={UNIVERSITIES}
              icon={<MapPin size={18} />}
              allowCustom
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--color-text-primary)' }}>
                  Başlangıç
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--color-text-primary)' }}>
                  Bitiş
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6 animate-fade-in-up">
            {/* Photo */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-24 h-24 rounded-full flex items-center justify-center transition-transform active:scale-95 overflow-hidden"
                style={{
                  background: 'var(--color-bg)',
                  border: '2px dashed var(--color-border)',
                }}
                aria-label="Profil fotoğrafı ekle"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={28} style={{ color: 'var(--color-text-muted)' }} />
                )}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                    toast('Fotoğraf seçildi: ' + file.name, 'success');
                  }
                }}
              />
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Profil fotoğrafı ekle
              </p>
            </div>

            {/* Budget */}
            <div>
              <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--color-text-primary)' }}>
                Aylık Bütçe (EUR)
              </label>
              <div
                className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>₺</span>
                <input
                  type="number"
                  placeholder="500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="text-sm font-semibold mb-2.5 block" style={{ color: 'var(--color-text-primary)' }}>
                İlgi Alanları
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all"
                      style={{
                        background: isSelected
                          ? 'var(--color-primary)'
                          : 'var(--color-bg-card)',
                        color: isSelected
                          ? '#FFFFFF'
                          : 'var(--color-text-secondary)',
                        border: isSelected
                          ? '1px solid var(--color-primary)'
                          : '1px solid var(--color-border)',
                      }}
                    >
                      {isSelected && <Check size={14} />}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="px-5 pb-8 pt-3">
        <button
          onClick={handleNext}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {step === 3 ? 'Kaydı Tamamla' : 'Devam Et'}
              <ArrowRight size={20} />
            </>
          )}
        </button>

        {step === 1 && (
          <p className="text-center text-sm mt-4" style={{ color: 'var(--color-text-secondary)' }}>
            Zaten hesabın var mı?{' '}
            <Link
              href="/login"
              className="font-semibold"
              style={{ color: 'var(--color-primary)' }}
            >
              Giriş Yap
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
