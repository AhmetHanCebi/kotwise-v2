import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--color-bg)' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
      >
        <Home size={28} style={{ color: 'var(--color-primary)' }} />
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Sayfa bulunamadı
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: 'var(--gradient-primary)' }}
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
