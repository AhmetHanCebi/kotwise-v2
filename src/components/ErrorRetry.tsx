'use client';

import { AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface ErrorRetryProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorRetry({ message, onRetry }: ErrorRetryProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center py-12 px-6 text-center">
      <AlertTriangle size={32} style={{ color: 'var(--color-warning)' }} />
      <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
        {message || t.common.error}
      </p>
      <button
        onClick={onRetry}
        className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: 'var(--gradient-primary)' }}
      >
        {t.common.retry}
      </button>
    </div>
  );
}
