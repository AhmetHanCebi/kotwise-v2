'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
  glass?: boolean;
  sticky?: boolean;
}

export default function PageHeader({
  title,
  showBack = false,
  onBack,
  rightContent,
  glass = false,
  sticky = false,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div
      className={`px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)] ${
        glass ? 'glass-effect' : ''
      } ${sticky ? 'sticky top-0 z-30' : ''}`}
      style={{
        background: glass ? undefined : 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-1.5 rounded-full active:opacity-70"
              style={{ color: 'var(--color-text-primary)' }}
              aria-label="Geri"
            >
              <ArrowLeft size={22} />
            </button>
          )}
          <h1
            className="text-lg font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {title}
          </h1>
        </div>
        {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
      </div>
    </div>
  );
}
