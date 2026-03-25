'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useHostPanel } from '@/hooks/useHostPanel';
import { useStorage } from '@/hooks/useStorage';
import {
  ArrowLeft,
  Upload,
  Home,
  ShieldCheck,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';

const steps = [
  { key: 'identity', title: 'Kimlik Doğrulama', icon: FileCheck },
  { key: 'home', title: 'Ev Bilgileri', icon: Home },
  { key: 'standards', title: 'Standartlar', icon: ShieldCheck },
  { key: 'review', title: 'Onay & Gönder', icon: CheckCircle },
];

export default function HostApplyPage() {
  return (
    <AuthGuard>
      <HostApplyContent />
    </AuthGuard>
  );
}

function HostApplyContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { submitApplication, loading } = useHostPanel(user?.id);
  const { upload, uploading } = useStorage();
  const { toast } = useToast();
  const [existingApplication, setExistingApplication] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(true);

  // Check for existing application on load
  useEffect(() => {
    if (!user?.id) return;
    const checkExisting = async () => {
      try {
        const { data } = await supabase
          .from('host_applications')
          .select('id, status')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          setExistingApplication(true);
        }
      } catch {
        // Continue with application flow
      }
      setCheckingDuplicate(false);
    };
    checkExisting();
  }, [user?.id]);

  const [step, setStep] = useState(0);
  const [idDocUrl, setIdDocUrl] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [rooms, setRooms] = useState('1');
  const [notes, setNotes] = useState('');
  const [cleanlinessAccepted, setCleanlinessAccepted] = useState(false);
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const [fileSizeError, setFileSizeError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setFileSizeError(null);

    if (file.size > 5 * 1024 * 1024) {
      setFileSizeError('Dosya boyutu 5MB\'dan büyük olamaz');
      e.target.value = '';
      return;
    }

    const result = await upload(file, 'documents', user.id);
    if (result.data) {
      setIdDocUrl(result.data.url);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!idDocUrl;
      case 1: return address.trim().length > 0 && Number(rooms) > 0;
      case 2: return cleanlinessAccepted && safetyAccepted;
      case 3: return rulesAccepted;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const result = await submitApplication({
        user_id: user.id,
        id_document_url: idDocUrl,
        address,
        rooms: Number(rooms),
        notes: notes || null,
      });
      if (result && 'error' in result && result.error) {
        toast('Başvuru gönderilemedi, lütfen tekrar deneyin', 'error');
      } else {
        setSubmitted(true);
      }
    } catch {
      toast('Başvuru sırasında bir hata oluştu', 'error');
    }
  };

  if (checkingDuplicate) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: 'var(--color-bg)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (existingApplication) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 gap-4" style={{ background: 'var(--color-bg)' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.1)' }}
        >
          <CheckCircle size={40} style={{ color: 'var(--color-warning)' }} />
        </div>
        <h2 className="text-xl font-bold text-center" style={{ color: 'var(--color-text-primary)' }}>
          Başvurunuz Zaten Mevcut
        </h2>
        <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
          Daha önce ev sahibi başvurusu yapmışsınız. Başvurunuz incelenmektedir.
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="px-6 py-3 rounded-full text-sm font-semibold mt-4"
          style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
        >
          Profile Dön
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 gap-4" style={{ background: 'var(--color-bg)' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.1)' }}
        >
          <CheckCircle size={40} style={{ color: 'var(--color-success)' }} />
        </div>
        <h2 className="text-xl font-bold text-center" style={{ color: 'var(--color-text-primary)' }}>
          Başvurunuz Alındı!
        </h2>
        <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
          Başvurunuz incelenmektedir. Onaylandığında size bildirim gönderilecektir.
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="px-6 py-3 rounded-full text-sm font-semibold mt-4"
          style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
        >
          Profile Dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]"
        style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}
      >
        <button
          onClick={() => step > 0 ? setStep(step - 1) : router.back()}
          className="p-1.5 rounded-full active:opacity-70"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="Geri"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold flex-1" style={{ color: 'var(--color-text-primary)' }}>
          Ev Sahibi Başvurusu
        </h1>
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {step + 1}/4
        </span>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pt-3">
        <div className="flex gap-1.5">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className="flex-1 h-1 rounded-full transition-all"
              style={{
                background: i <= step ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 mb-1">
          {(() => {
            const StepIcon = steps[step].icon;
            return <StepIcon size={18} style={{ color: 'var(--color-primary)' }} />;
          })()}
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {steps[step].title}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-4 py-4">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Kimliğinizi doğrulamak için geçerli bir kimlik belgesi yükleyin (pasaport, ehliyet veya nüfus cüzdanı).
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center gap-3 py-8 rounded-xl border-2 border-dashed active:opacity-70"
              style={{ borderColor: idDocUrl ? 'var(--color-success)' : 'var(--color-border)' }}
            >
              {uploading ? (
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              ) : idDocUrl ? (
                <>
                  <CheckCircle size={32} style={{ color: 'var(--color-success)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                    Belge Yüklendi
                  </span>
                </>
              ) : (
                <>
                  <Upload size={32} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Belge Yükle
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    PDF, JPG veya PNG (maks. 5MB)
                  </span>
                </>
              )}
            </button>
            {fileSizeError && (
              <p className="text-xs font-medium" style={{ color: 'var(--color-error)' }}>
                {fileSizeError}
              </p>
            )}
            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Misafirlerinizi ağırlayacağınız ev hakkında bilgi verin.
            </p>
            <div>
              <label className="block text-xs font-semibold mb-1.5 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                Adres
              </label>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
              >
                <MapPin size={16} style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Evinizin adresi"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                Oda Sayısı
              </label>
              <select
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} Oda</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                Ek Notlar (opsiyonel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Eviniz hakkında eklemek istediğiniz bilgiler..."
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Kotwise ev sahiplerinin uydukları standartları kabul edin.
            </p>
            <CheckboxItem
              checked={cleanlinessAccepted}
              onChange={setCleanlinessAccepted}
              title="Temizlik Taahhüdü"
              desc="Misafirlerim için temiz ve hijyenik bir ortam sağlayacağımı taahhüt ediyorum."
            />
            <CheckboxItem
              checked={safetyAccepted}
              onChange={setSafetyAccepted}
              title="Güvenlik Taahhüdü"
              desc="Evimin güvenli olduğunu ve gerekli güvenlik önlemlerinin alındığını onaylıyorum."
            />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Başvurunuzu göndermeden önce kuralları okuyup kabul edin.
            </p>

            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
            >
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Özet
              </h3>
              <div className="flex flex-col gap-2">
                <SummaryRow label="Kimlik Belgesi" value={idDocUrl ? 'Yüklendi' : 'Eksik'} ok={!!idDocUrl} />
                <SummaryRow label="Adres" value={address || 'Girilmedi'} ok={!!address} />
                <SummaryRow label="Oda Sayısı" value={`${rooms} Oda`} ok={true} />
                <SummaryRow label="Temizlik" value={cleanlinessAccepted ? 'Kabul Edildi' : 'Bekleniyor'} ok={cleanlinessAccepted} />
                <SummaryRow label="Güvenlik" value={safetyAccepted ? 'Kabul Edildi' : 'Bekleniyor'} ok={safetyAccepted} />
              </div>
            </div>

            <CheckboxItem
              checked={rulesAccepted}
              onChange={setRulesAccepted}
              title="Kotwise Kuralları"
              desc="Kotwise platform kurallarını, topluluk yönergelerini ve kullanım koşullarını okudum ve kabul ediyorum."
            />
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div
        className="px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]"
        style={{ background: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <ChevronLeft size={16} />
              Geri
            </button>
          )}
          <button
            onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
            disabled={!canProceed() || loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: canProceed() ? 'var(--gradient-primary)' : 'var(--color-border)',
              color: canProceed() ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : step === 3 ? (
              'Başvuruyu Gönder'
            ) : (
              <>
                Devam
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckboxItem({
  checked,
  onChange,
  title,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3 p-4 rounded-xl w-full text-left"
      style={{
        background: 'var(--color-bg-card)',
        border: checked ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
      }}
    >
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: checked ? 'var(--color-primary)' : 'transparent',
          border: checked ? 'none' : '2px solid var(--color-border)',
        }}
      >
        {checked && <CheckCircle size={14} style={{ color: 'var(--color-text-inverse)' }} />}
      </div>
      <div>
        <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {desc}
        </p>
      </div>
    </button>
  );
}

function SummaryRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <span
        className="text-xs font-semibold"
        style={{ color: ok ? 'var(--color-success)' : 'var(--color-warning)' }}
      >
        {value}
      </span>
    </div>
  );
}
