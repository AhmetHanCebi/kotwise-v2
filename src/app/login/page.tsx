'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const { toast } = useToast();

  const handleLogin = useCallback(async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('E-posta ve şifre gerekli');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn(email, password);
      if ('error' in result && result.error) {
        const msg = result.error.message;
        // Map common Supabase auth errors to Turkish
        if (msg === 'Invalid login credentials') {
          setError('E-posta veya şifre hatalı');
        } else if (msg === 'Email not confirmed') {
          setError('E-posta adresiniz henüz doğrulanmamış');
        } else if (msg.includes('rate limit') || msg.includes('too many')) {
          setError('Çok fazla deneme yaptınız, lütfen biraz bekleyin');
        } else {
          setError(msg || 'Giriş yapılamadı');
        }
      } else {
        router.push('/');
      }
    } catch {
      setError('Bağlantı hatası, lütfen tekrar deneyin');
    } finally {
      setLoading(false);
    }
  }, [email, password, signIn, router]);

  return (
    <div
      className="flex-1 flex flex-col min-h-dvh"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Home size={28} style={{ color: '#FFFFFF' }} />
        </div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Tekrar Hoş Geldin!
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Hesabına giriş yap
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium"
            style={{
              background: '#FEF2F2',
              color: 'var(--color-error)',
              border: '1px solid #FECACA',
            }}
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label
              className="text-sm font-semibold mb-1.5 block"
              style={{ color: 'var(--color-text-primary)' }}
            >
              E-posta
            </label>
            <div
              className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Mail size={18} style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Şifre
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                Şifremi Unuttum
              </Link>
            </div>
            <div
              className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Lock size={18} style={{ color: 'var(--color-text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifreniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--color-text-primary)' }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: 'var(--color-text-muted)' }}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex items-center justify-center gap-2 h-14 rounded-2xl text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60 mt-2"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Giriş Yap
                <ArrowRight size={20} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>veya</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>

          {/* Social buttons */}
          <button
            onClick={async () => {
              try {
                await signInWithGoogle();
              } catch {
                toast('Google ile giriş yapılamadı, lütfen tekrar deneyin', 'error');
              }
            }}
            className="flex items-center justify-center gap-3 h-13 rounded-xl text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google ile giriş yap
          </button>
          <button
            onClick={async () => {
              try {
                await signInWithApple();
              } catch {
                toast('Apple ile giriş yapılamadı, lütfen tekrar deneyin', 'error');
              }
            }}
            className="flex items-center justify-center gap-3 h-13 rounded-xl text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Apple ile giriş yap
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 pt-4">
        <p
          className="text-center text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Hesabın yok mu?{' '}
          <Link
            href="/register"
            className="font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
