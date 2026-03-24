'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  { q: 'Kotwise nedir?', a: 'Kotwise, Erasmus ve değişim öğrencileri için konaklama, topluluk ve şehir rehberi sunan bir platformdur.' },
  { q: 'Nasıl ilan oluşturabilirim?', a: 'Ev sahibi olarak başvuru yapıp onaylandıktan sonra, Ev Sahibi Paneli üzerinden yeni ilan oluşturabilirsiniz.' },
  { q: 'Rezervasyon nasıl iptal edilir?', a: 'Profil > Rezervasyonlarım bölümünden aktif rezervasyonunuzu görüntüleyip iptal edebilirsiniz.' },
  { q: 'Ödeme güvenli mi?', a: 'Tüm ödemeler güvenli ödeme altyapısı üzerinden gerçekleştirilir. Kart bilgileriniz saklanmaz.' },
  { q: 'Mentor olmak için ne gerekiyor?', a: 'Mentor Bul sayfasından "Mentor Ol" butonuna tıklayarak başvuru formunu doldurabilirsiniz.' },
  { q: 'Hesabımı nasıl silebilirim?', a: 'Ayarlar > Tehlikeli Bölge > Hesabı Sil adımlarını izleyerek hesabınızı kalıcı olarak silebilirsiniz.' },
  { q: 'Destek ekibine nasıl ulaşırım?', a: 'destek@kotwise.com adresine e-posta göndererek destek ekibimize ulaşabilirsiniz.' },
];

export default function FaqPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      <div
        className="flex items-center gap-3 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]"
        style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}
      >
        <button onClick={() => router.back()} className="p-1.5 rounded-full active:opacity-70" style={{ color: 'var(--color-text-primary)' }} aria-label="Geri">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Sıkça Sorulan Sorular</h1>
      </div>

      <div className="flex-1 px-4 py-4">
        {FAQS.map((faq, i) => (
          <div key={i} className="mb-2 rounded-xl overflow-hidden" style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{faq.q}</span>
              {openIndex === i ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
            </button>
            {openIndex === i && (
              <div className="px-4 pb-3.5">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
