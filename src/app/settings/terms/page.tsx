'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Kullanım Koşulları</h1>
      </div>

      <div className="flex-1 px-5 py-5">
        <div className="prose prose-sm max-w-none" style={{ color: 'var(--color-text-secondary)' }}>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>1. Genel Koşullar</h2>
          <p className="text-sm leading-relaxed mb-4">
            Kotwise platformunu kullanarak bu kullanım koşullarını kabul etmiş olursunuz. Platform, Erasmus ve değişim öğrencilerine konaklama ve topluluk hizmetleri sunar.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>2. Hesap Sorumluluğu</h2>
          <p className="text-sm leading-relaxed mb-4">
            Hesap bilgilerinizin güvenliğinden siz sorumlusunuz. Hesabınız üzerinden gerçekleştirilen tüm işlemlerden siz sorumlu tutulursunuz.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>3. İlan Kuralları</h2>
          <p className="text-sm leading-relaxed mb-4">
            Yayınlanan ilanların doğru ve güncel bilgiler içermesi gerekir. Yanıltıcı ilanlar tespit edildiğinde kaldırılabilir.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>4. Ödeme ve İptal</h2>
          <p className="text-sm leading-relaxed mb-4">
            Rezervasyon ödemeleri platform üzerinden güvenli şekilde gerçekleştirilir. İptal koşulları ilan sahibi tarafından belirlenir.
          </p>

          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>5. İletişim</h2>
          <p className="text-sm leading-relaxed">
            Sorularınız için destek@kotwise.com adresine e-posta gönderebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
