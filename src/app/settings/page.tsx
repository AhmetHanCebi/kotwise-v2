'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  Globe,
  DollarSign,
  Moon,
  Bell,
  MessageCircle,
  Heart,
  Home,
  Calendar,
  Shield,
  Eye,
  Trash2,
  Info,
  FileText,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Mail,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

interface SettingsData {
  language: string;
  currency: string;
  darkMode: boolean;
  notifs: { messages: boolean; bookings: boolean; events: boolean; promotions: boolean };
  privacyPublicProfile: boolean;
  privacyOnlineStatus: boolean;
}

const DEFAULT_SETTINGS: SettingsData = {
  language: 'tr',
  currency: 'TRY',
  darkMode: false,
  notifs: { messages: true, bookings: true, events: true, promotions: false },
  privacyPublicProfile: true,
  privacyOnlineStatus: true,
};

function SettingsContent() {
  const router = useRouter();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();

  // Load settings from localStorage as immediate fallback
  const loadSetting = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const v = localStorage.getItem(`kotwise_${key}`);
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  };
  const saveSetting = (key: string, value: unknown) => {
    try { localStorage.setItem(`kotwise_${key}`, JSON.stringify(value)); } catch { /* ignore */ }
  };

  // Track which toggle just saved (for "Kaydedildi" fade feedback)
  const [savedField, setSavedField] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);

  const showSavedFeedback = useCallback((field: string) => {
    setSavedField(field);
    setErrorField(null);
    const timer = setTimeout(() => setSavedField(null), 1500);
    return () => clearTimeout(timer);
  }, []);

  const showErrorFeedback = useCallback((field: string) => {
    setErrorField(field);
    setSavedField(null);
    const timer = setTimeout(() => setErrorField(null), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Save all settings to profile.settings JSONB column
  const saveSettingsToProfile = async (settings: SettingsData, field?: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ settings } as Record<string, unknown>)
        .eq('id', user.id);
      if (error) throw error;
      if (field) showSavedFeedback(field);
      return true;
    } catch {
      if (field) showErrorFeedback(field);
      return false;
    }
  };

  const [language, setLanguage] = useState(() => loadSetting('language', DEFAULT_SETTINGS.language));
  const [currency, setCurrency] = useState(() => loadSetting('currency', DEFAULT_SETTINGS.currency));
  const [darkMode, setDarkMode] = useState(() => loadSetting('darkMode', DEFAULT_SETTINGS.darkMode));
  const [notifs, setNotifs] = useState(() => loadSetting('notifs', DEFAULT_SETTINGS.notifs));
  const [privacyPublicProfile, setPrivacyPublicProfile] = useState(() => loadSetting('privacyPublicProfile', DEFAULT_SETTINGS.privacyPublicProfile));
  const [privacyOnlineStatus, setPrivacyOnlineStatus] = useState(() => loadSetting('privacyOnlineStatus', DEFAULT_SETTINGS.privacyOnlineStatus));
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Load settings from profile on mount
  useEffect(() => {
    if (!user || settingsLoaded) return;

    const loadFromProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single();

        const s = data?.settings as SettingsData | null;
        if (s && typeof s === 'object') {
          if (s.language) { setLanguage(s.language); saveSetting('language', s.language); }
          if (s.currency) { setCurrency(s.currency); saveSetting('currency', s.currency); }
          if (typeof s.darkMode === 'boolean') { setDarkMode(s.darkMode); saveSetting('darkMode', s.darkMode); }
          if (s.notifs) { setNotifs(s.notifs); saveSetting('notifs', s.notifs); }
          if (typeof s.privacyPublicProfile === 'boolean') { setPrivacyPublicProfile(s.privacyPublicProfile); saveSetting('privacyPublicProfile', s.privacyPublicProfile); }
          if (typeof s.privacyOnlineStatus === 'boolean') { setPrivacyOnlineStatus(s.privacyOnlineStatus); saveSetting('privacyOnlineStatus', s.privacyOnlineStatus); }

          // Apply dark mode from profile settings
          if (s.darkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
          }
        }
      } catch {
        // Use localStorage fallback
      }
      setSettingsLoaded(true);
    };

    loadFromProfile();
  }, [user, settingsLoaded]);

  // Helper to get current settings object
  const getCurrentSettings = (): SettingsData => ({
    language, currency, darkMode, notifs, privacyPublicProfile, privacyOnlineStatus,
  });

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveSetting('notifs', next);
      const settings = { ...getCurrentSettings(), notifs: next };
      saveSettingsToProfile(settings, `notif_${key}`);
      return next;
    });
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast('Hesabınızı silmek için şifrenizi girin', 'error');
      return;
    }
    setDeleting(true);
    try {
      if (!user?.email) throw new Error('No email');
      const { supabase } = await import('@/lib/supabase');

      // Re-authenticate to verify password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: deletePassword,
      });
      if (authError) {
        toast('Şifre hatalı. Lütfen tekrar deneyin.', 'error');
        setDeleting(false);
        return;
      }

      const userId = user.id;

      // Delete user-related data from tables in dependency order
      await Promise.all([
        supabase.from('notifications').delete().eq('user_id', userId),
        supabase.from('favorites').delete().eq('user_id', userId),
        supabase.from('post_likes').delete().eq('user_id', userId),
        supabase.from('post_comments').delete().eq('user_id', userId),
        supabase.from('event_participants').delete().eq('user_id', userId),
        supabase.from('roommate_likes').delete().eq('user_id', userId),
        supabase.from('roommate_skips').delete().eq('user_id', userId),
        supabase.from('messages').delete().eq('sender_id', userId),
      ]);

      await Promise.all([
        supabase.from('posts').delete().eq('user_id', userId),
        supabase.from('reviews').delete().eq('user_id', userId),
        supabase.from('bookings').delete().eq('user_id', userId),
        supabase.from('roommate_profiles').delete().eq('user_id', userId),
        supabase.from('mentor_profiles').delete().eq('user_id', userId),
        supabase.from('host_applications').delete().eq('user_id', userId),
      ]);

      // Delete profile
      await supabase.from('profiles').delete().eq('id', userId);

      // Delete auth user via edge function
      // NOTE: auth.admin.deleteUser requires server-side. Call edge function.
      await supabase.functions.invoke('delete-user', { body: { userId } });

      await signOut();
      router.replace('/login');
    } catch {
      setDeleting(false);
      toast('Hesap silme sırasında bir hata oluştu', 'error');
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
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Ayarlar
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Hesap Section */}
        <SectionTitle title="Hesap" />
        <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <Globe size={18} style={{ color: 'var(--color-info)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Dil</span>
            </div>
            <select
              value={language}
              onChange={(e) => { setLanguage(e.target.value); saveSetting('language', e.target.value); saveSettingsToProfile({ ...getCurrentSettings(), language: e.target.value }); toast('Dil tercihiniz kaydedildi', 'success'); }}
              className="text-sm font-medium bg-transparent outline-none cursor-pointer"
              style={{ color: 'var(--color-primary)' }}
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <DollarSign size={18} style={{ color: 'var(--color-warning)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Para Birimi</span>
            </div>
            <select
              value={currency}
              onChange={(e) => { setCurrency(e.target.value); saveSetting('currency', e.target.value); saveSettingsToProfile({ ...getCurrentSettings(), currency: e.target.value }); toast('Para birimi tercihiniz kaydedildi', 'success'); }}
              className="text-sm font-medium bg-transparent outline-none cursor-pointer"
              style={{ color: 'var(--color-primary)' }}
            >
              <option value="EUR">EUR</option>
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <ToggleRow
            icon={<Moon size={18} style={{ color: '#6366F1' }} />}
            label="Karanlık Tema"
            value={darkMode}
            fieldId="darkMode"
            savedField={savedField}
            errorField={errorField}
            onChange={() => {
              const next = !darkMode;
              setDarkMode(next);
              saveSetting('darkMode', next);
              saveSettingsToProfile({ ...getCurrentSettings(), darkMode: next }, 'darkMode');
              // Apply dark mode to document
              if (next) {
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
              } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
              }
            }}
          />
        </div>

        {/* Bildirimler Section */}
        <SectionTitle title="Bildirim Tercihleri" />
        <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}>
          <ToggleRow
            icon={<MessageCircle size={18} style={{ color: '#3B82F6' }} />}
            label="Mesajlar"
            value={notifs.messages}
            onChange={() => toggleNotif('messages')}
            fieldId="notif_messages"
            savedField={savedField}
            errorField={errorField}
            border
          />
          <ToggleRow
            icon={<Home size={18} style={{ color: '#8B5CF6' }} />}
            label="Rezervasyonlar"
            value={notifs.bookings}
            onChange={() => toggleNotif('bookings')}
            fieldId="notif_bookings"
            savedField={savedField}
            errorField={errorField}
            border
          />
          <ToggleRow
            icon={<Calendar size={18} style={{ color: '#22C55E' }} />}
            label="Etkinlikler"
            value={notifs.events}
            onChange={() => toggleNotif('events')}
            fieldId="notif_events"
            savedField={savedField}
            errorField={errorField}
            border
          />
          <ToggleRow
            icon={<Heart size={18} style={{ color: 'var(--color-error)' }} />}
            label="Promosyonlar"
            value={notifs.promotions}
            onChange={() => toggleNotif('promotions')}
            fieldId="notif_promotions"
            savedField={savedField}
            errorField={errorField}
          />
        </div>

        {/* Gizlilik Section */}
        <SectionTitle title="Gizlilik" />
        <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}>
          <ToggleRow
            icon={<Eye size={18} style={{ color: '#06B6D4' }} />}
            label="Profili Herkese Göster"
            value={privacyPublicProfile}
            onChange={() => { const next = !privacyPublicProfile; setPrivacyPublicProfile(next); saveSetting('privacyPublicProfile', next); saveSettingsToProfile({ ...getCurrentSettings(), privacyPublicProfile: next }, 'privacyPublicProfile'); }}
            fieldId="privacyPublicProfile"
            savedField={savedField}
            errorField={errorField}
            border
          />
          <ToggleRow
            icon={<Shield size={18} style={{ color: '#22C55E' }} />}
            label="Çevrimiçi Durumu Göster"
            value={privacyOnlineStatus}
            onChange={() => { const next = !privacyOnlineStatus; setPrivacyOnlineStatus(next); saveSetting('privacyOnlineStatus', next); saveSettingsToProfile({ ...getCurrentSettings(), privacyOnlineStatus: next }, 'privacyOnlineStatus'); }}
            fieldId="privacyOnlineStatus"
            savedField={savedField}
            errorField={errorField}
          />
        </div>

        {/* Yardim Section */}
        <div id="yardim">
          <SectionTitle title="Yardım & Destek" />
          <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}>
            <LinkRow icon={<MessageCircle size={18} style={{ color: '#06B6D4' }} />} label="Sıkça Sorulan Sorular" border onClick={() => router.push('/settings/faq')} />
            <LinkRow icon={<Mail size={18} style={{ color: '#3B82F6' }} />} label="Destek Ekibiyle İletişim" onClick={() => window.open('mailto:destek@kotwise.com')} />
          </div>
        </div>

        {/* Hakkinda Section */}
        <SectionTitle title="Hakkında" />
        <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}>
          <InfoRow icon={<Info size={18} style={{ color: '#6B7280' }} />} label="Sürüm" value="2.0.0" border />
          <LinkRow icon={<FileText size={18} style={{ color: '#6B7280' }} />} label="Kullanım Koşulları" border onClick={() => router.push('/settings/terms')} />
          <LinkRow icon={<Shield size={18} style={{ color: '#6B7280' }} />} label="Gizlilik Politikası" onClick={() => router.push('/settings/privacy')} />
        </div>

        {/* Danger Zone */}
        <SectionTitle title="Tehlikeli Bölge" />
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:opacity-70"
          style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <Trash2 size={18} style={{ color: 'var(--color-error)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
            Hesabı Sil
          </span>
        </button>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteConfirm(false)} />
            <div
              className="relative w-full max-w-sm p-5 rounded-2xl"
              style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.1)' }}
                >
                  <AlertTriangle size={28} style={{ color: 'var(--color-error)' }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Hesabı Sil
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none mt-2"
                  style={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                <div className="flex gap-2 w-full mt-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5"
                    style={{
                      background: 'var(--color-error)',
                      color: 'var(--color-text-inverse)',
                    }}
                  >
                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
      style={{ color: 'var(--color-text-muted)' }}
    >
      {title}
    </p>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
  border,
  fieldId,
  savedField,
  errorField,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: () => void;
  border?: boolean;
  fieldId?: string;
  savedField?: string | null;
  errorField?: string | null;
}) {
  const isSaved = fieldId != null && savedField === fieldId;
  const isError = fieldId != null && errorField === fieldId;

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: border ? '1px solid var(--color-border)' : 'none' }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </span>
        {isSaved && (
          <span
            className="text-[11px] font-medium animate-fade-in-up"
            style={{ color: 'var(--color-success)', animation: 'fadeInOut 1.5s ease-in-out forwards' }}
          >
            Kaydedildi
          </span>
        )}
        {isError && (
          <span
            className="text-[11px] font-medium animate-fade-in-up"
            style={{ color: 'var(--color-error)' }}
          >
            Hata!
          </span>
        )}
      </div>
      <button
        onClick={onChange}
        className="w-11 h-6 rounded-full relative transition-colors"
        style={{
          background: isError
            ? 'var(--color-error)'
            : value
              ? 'var(--color-primary)'
              : 'var(--color-border)',
        }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
          style={{ left: value ? '22px' : '2px' }}
        />
      </button>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  border,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  border?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: border ? '1px solid var(--color-border)' : 'none' }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      </div>
      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {value}
      </span>
    </div>
  );
}

function LinkRow({
  icon,
  label,
  border,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  border?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 w-full active:opacity-70"
      style={{ borderBottom: border ? '1px solid var(--color-border)' : 'none' }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      </div>
      <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
    </button>
  );
}
