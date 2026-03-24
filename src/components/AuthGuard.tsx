'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-dvh">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: 'var(--color-primary)' }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
