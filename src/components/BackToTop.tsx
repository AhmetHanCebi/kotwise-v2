'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all tap-feedback"
      style={{
        bottom: 'calc(90px + env(safe-area-inset-bottom))',
        right: '16px',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--color-text-primary)',
      }}
      aria-label="Yukarı dön"
    >
      <ChevronUp size={20} />
    </button>
  );
}
