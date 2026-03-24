'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      <div
        className="flex items-center gap-3 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]"
        style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}
      >
        <button onClick={() => router.back()} className="p-1.5 rounded-full active:opacity-70" style={{ color: 'var(--color-text-primary)' }} aria-label="Geri">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Gizlilik Politikası</h1>
      </div>

      <div className="flex-1 px-5 py-5">
        <div className="prose prose-sm max-w-none" style={{ color: 'var(--color-text-secondary)' }}>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>1. Toplanan Veriler</h2>
          <p className="text-sm leading-relaxed mb-4">
            Kotwise, hizmet sunmak amacıyla ad, e-posta, üniversite bilgileri ve konum tercihlerinizi toplar. Bu veriler yalnızca platform hizmetleri için kullanılır.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>2. Verilerin Kullanımı</h2>
          <p className="text-sm leading-relaxed mb-4">
            Kişisel verileriniz; hesap yönetimi, ilan eşleştirme, bildirim gönderimi ve platform iyileştirmeleri amacıyla kullanılır. Üçüncü taraflarla izniniz olmadan paylaşılmaz.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>3. KVKK / GDPR Hakları</h2>
          <p className="text-sm leading-relaxed mb-4">
            Kişisel verilerinize erişim, düzeltme ve silme haklarınız saklıdır. Ayarlar sayfasından hesabınızı ve tüm verilerinizi kalıcı olarak silebilirsiniz.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>4. Çerezler</h2>
          <p className="text-sm leading-relaxed mb-4">
            Platform, oturum yönetimi için gerekli çerezleri kullanır. Analiz çerezleri tercihinize bağlı olarak kullanılır.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>5. İletişim</h2>
          <p className="text-sm leading-relaxed">
            Gizlilik ile ilgili sorularınız için destek@kotwise.com adresine başvurabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
