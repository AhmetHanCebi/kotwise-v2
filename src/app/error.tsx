'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--color-bg)' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'color-mix(in srgb, var(--color-error) 10%, transparent)' }}
      >
        <AlertTriangle size={28} style={{ color: 'var(--color-error)' }} />
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Bir hata oluştu
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        {error.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'}
      </p>
      <button
        onClick={() => unstable_retry()}
        className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: 'var(--gradient-primary)' }}
      >
        Tekrar Dene
      </button>
    </div>
  );
}
