'use client';

import { useState } from 'react';
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
  BellOff,
  MessageCircle,
  Heart,
  Home,
  Calendar,
  Shield,
  Eye,
  EyeOff,
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

function SettingsContent() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState('tr');
  const [currency, setCurrency] = useState('EUR');
  const [darkMode, setDarkMode] = useState(false);
  const [notifs, setNotifs] = useState({
    messages: true,
    bookings: true,
    events: true,
    promotions: false,
  });
  const [privacyPublicProfile, setPrivacyPublicProfile] = useState(true);
  const [privacyOnlineStatus, setPrivacyOnlineStatus] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // In production this would call an API endpoint
    await signOut();
    router.replace('/login');
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
              onChange={(e) => { setLanguage(e.target.value); toast('Bu özellik yakında aktif olacak', 'info'); }}
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
              onChange={(e) => { setCurrency(e.target.value); toast('Bu özellik yakında aktif olacak', 'info'); }}
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
            onChange={() => { setDarkMode(!darkMode); toast('Bu özellik yakında aktif olacak', 'info'); }}
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
            border
          />
          <ToggleRow
            icon={<Home size={18} style={{ color: '#8B5CF6' }} />}
            label="Rezervasyonlar"
            value={notifs.bookings}
            onChange={() => toggleNotif('bookings')}
            border
          />
          <ToggleRow
            icon={<Calendar size={18} style={{ color: '#22C55E' }} />}
            label="Etkinlikler"
            value={notifs.events}
            onChange={() => toggleNotif('events')}
            border
          />
          <ToggleRow
            icon={<Heart size={18} style={{ color: '#EF4444' }} />}
            label="Promosyonlar"
            value={notifs.promotions}
            onChange={() => toggleNotif('promotions')}
          />
        </div>

        {/* Gizlilik Section */}
        <SectionTitle title="Gizlilik" />
        <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}>
          <ToggleRow
            icon={<Eye size={18} style={{ color: '#06B6D4' }} />}
            label="Profili Herkese Göster"
            value={privacyPublicProfile}
            onChange={() => { setPrivacyPublicProfile(!privacyPublicProfile); toast('Ayarlarınız kaydedildi', 'success'); }}
            border
          />
          <ToggleRow
            icon={<Shield size={18} style={{ color: '#22C55E' }} />}
            label="Çevrimiçi Durumu Göster"
            value={privacyOnlineStatus}
            onChange={() => { setPrivacyOnlineStatus(!privacyOnlineStatus); toast('Ayarlarınız kaydedildi', 'success'); }}
          />
        </div>

        {/* Yardim Section */}
        <div id="yardim">
          <SectionTitle title="Yardım & Destek" />
          <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}>
            <LinkRow icon={<MessageCircle size={18} style={{ color: '#06B6D4' }} />} label="Sıkça Sorulan Sorular" border onClick={() => toast('SSS sayfası yakında eklenecek', 'info')} />
            <LinkRow icon={<Mail size={18} style={{ color: '#3B82F6' }} />} label="Destek Ekibiyle İletişim" onClick={() => toast('destek@kotwise.com adresine e-posta gönderebilirsiniz', 'info')} />
          </div>
        </div>

        {/* Hakkinda Section */}
        <SectionTitle title="Hakkında" />
        <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}>
          <InfoRow icon={<Info size={18} style={{ color: '#6B7280' }} />} label="Sürüm" value="2.0.0" border />
          <LinkRow icon={<FileText size={18} style={{ color: '#6B7280' }} />} label="Kullanım Koşulları" border onClick={() => toast('Kullanım koşulları sayfası yakında eklenecek', 'info')} />
          <LinkRow icon={<Shield size={18} style={{ color: '#6B7280' }} />} label="Gizlilik Politikası" onClick={() => toast('Gizlilik politikası sayfası yakında eklenecek', 'info')} />
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
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: () => void;
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
      <button
        onClick={onChange}
        className="w-11 h-6 rounded-full relative transition-colors"
        style={{ background: value ? 'var(--color-primary)' : 'var(--color-border)' }}
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
