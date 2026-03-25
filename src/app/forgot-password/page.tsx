'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = useCallback(async () => {
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Geçerli bir e-posta adresi girin');
      return;
    }
    setLoading(true);
    const { error: err } = await resetPassword(email);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  }, [email, resetPassword]);

  return (
    <div
      className="flex-1 flex flex-col min-h-dvh"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <Link
          href="/login"
          className="p-2 rounded-full hover:opacity-70 transition-colors"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="Geri"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1
          className="text-lg font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Şifremi Unuttum
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center animate-fade-in-up">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--color-success) 10%, transparent)' }}
            >
              <CheckCircle size={40} style={{ color: 'var(--color-success)' }} />
            </div>
            <h2
              className="text-xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              E-posta Gönderildi!
            </h2>
            <p
              className="text-sm leading-relaxed max-w-[280px]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi. Lütfen gelen kutunuzu kontrol edin.
            </p>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl text-base font-bold text-white mt-4 transition-transform active:scale-[0.98]"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Giriş Sayfasına Dön
            </Link>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-5 animate-fade-in-up">
            <div className="flex flex-col items-center gap-2 text-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
              >
                <Mail size={28} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h2
                className="text-xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Şifrenizi Sıfırlayın
              </h2>
              <p
                className="text-sm max-w-[260px]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Kayıtlı e-posta adresinizi girin, size sıfırlama bağlantısı göndereceğiz.
              </p>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
                  color: 'var(--color-error)',
                  border: '1px solid color-mix(in srgb, var(--color-error) 25%, transparent)',
                }}
              >
                {error}
              </div>
            )}

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
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center justify-center gap-2 h-14 rounded-2xl text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Bağlantı Gönder
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
