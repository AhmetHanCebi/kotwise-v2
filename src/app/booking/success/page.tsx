'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle, Calendar, MapPin, User, Phone,
  MessageCircle, Home, Loader2, Share2, CalendarPlus,
} from 'lucide-react';
import { useBooking } from '@/hooks/useBooking';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/currency-utils';
import AuthGuard from '@/components/AuthGuard';
import type { BookingWithDetails } from '@/lib/database.types';

/* Simple confetti */
function useConfetti(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = ['#F26522', '#FF8A50', '#22C55E', '#3B82F6', '#F59E0B', '#EC4899'];
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < 50; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 8 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        top: -10px;
        left: ${Math.random() * 100}%;
        opacity: 1;
        pointer-events: none;
        animation: confettiFall ${1.5 + Math.random() * 2}s ease-out forwards;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      container.appendChild(p);
      particles.push(p);
    }

    // Add keyframes if not already added
    if (!document.getElementById('confetti-keyframes')) {
      const style = document.createElement('style');
      style.id = 'confetti-keyframes';
      style.textContent = `
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(400px) rotate(${360 + Math.random() * 360}deg) scale(0.3); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, [containerRef]);
}

export default function BookingSuccessPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="min-h-dvh flex items-center justify-center max-w-[430px] mx-auto"><Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} /></div>}>
        <BookingSuccess />
      </Suspense>
    </AuthGuard>
  );
}

function BookingSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId') || '';
  const { user } = useAuth();
  const { getById, loading } = useBooking(user?.id);
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  useConfetti(confettiRef);

  useEffect(() => {
    if (!bookingId) {
      router.replace('/booking');
      return;
    }
    getById(bookingId).then((data) => {
      if (data) setBooking(data);
    });
  }, [bookingId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!bookingId || (loading && !booking)) {
    return (
      <div className="min-h-dvh flex items-center justify-center max-w-[430px] mx-auto">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh flex flex-col max-w-[430px] mx-auto relative overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Confetti container */}
      <div ref={confettiRef} className="absolute inset-0 pointer-events-none z-10" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-0">
        {/* Success Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-fade-in-up"
          style={{
            background: 'rgba(34,197,94,0.12)',
          }}
        >
          <CheckCircle size={44} style={{ color: 'var(--color-success)' }} />
        </div>

        <h1
          className="text-2xl font-bold text-center mb-2 animate-fade-in-up"
          style={{ color: 'var(--color-text-primary)', animationDelay: '0.1s' }}
        >
          Rezervasyon Talebiniz Alındı!
        </h1>
        <p
          className="text-sm text-center mb-6 animate-fade-in-up"
          style={{ color: 'var(--color-text-secondary)', animationDelay: '0.2s' }}
        >
          Rezervasyonunuz başarıyla oluşturuldu. Ev sahibi en kısa sürede sizinle iletişime geçecektir.
        </p>

        {/* Booking Details Card */}
        {booking && (
          <div
            className="w-full rounded-2xl p-4 mb-6 animate-fade-in-up"
            style={{
              background: 'var(--color-bg-card)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--color-border)',
              animationDelay: '0.3s',
            }}
          >
            {booking.confirmation_number && (
              <div className="text-center pb-3 mb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  Onay Numarası
                </p>
                <p className="text-lg font-bold tracking-widest mt-0.5" style={{ color: 'var(--color-primary)' }}>
                  {booking.confirmation_number}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <DetailRow
                icon={<Home size={14} />}
                label="İlan"
                value={booking.listing?.title || 'İlan'}
              />
              <DetailRow
                icon={<MapPin size={14} />}
                label="Konum"
                value={booking.listing?.address || 'Konum bilgisi'}
              />
              <DetailRow
                icon={<Calendar size={14} />}
                label="Giriş"
                value={new Date(booking.check_in).toLocaleDateString('tr-TR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              />
              <DetailRow
                icon={<Calendar size={14} />}
                label="Çıkış"
                value={new Date(booking.check_out).toLocaleDateString('tr-TR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              />
              <DetailRow
                icon={<User size={14} />}
                label="Misafir"
                value={booking.guest_name || ''}
              />

              <div
                className="flex justify-between pt-3"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Toplam
                </span>
                <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>
                  {formatCurrency(booking.total_price, booking.listing?.currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Host Contact */}
        {booking?.host && (
          <div
            className="w-full rounded-2xl p-4 mb-6 animate-fade-in-up"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              animationDelay: '0.4s',
            }}
          >
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Ev Sahibi İletişim
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'var(--color-bg)', color: 'var(--color-primary)' }}
              >
                {booking.host.full_name?.charAt(0) || 'H'}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {booking.host.full_name || 'Ev Sahibi'}
                </p>
                {booking.host.phone && (
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {booking.host.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/messages"
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                style={{
                  background: 'var(--color-secondary)',
                  color: 'white',
                }}
              >
                <MessageCircle size={14} />
                Mesaj Gönder
              </Link>
              {booking.host.phone && (
                <a
                  href={`tel:${booking.host.phone}`}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                  style={{
                    background: 'var(--color-bg)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <Phone size={14} />
                  Ara
                </a>
              )}
            </div>
          </div>
        )}

        {/* Share & Calendar Buttons */}
        {booking && (
          <div className="w-full flex gap-3 mb-4 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
            <button
              onClick={async () => {
                const shareData = {
                  title: 'Kotwise Rezervasyon',
                  text: `${booking.listing?.title || 'Konaklama'} rezervasyonum onaylandı! ${new Date(booking.check_in).toLocaleDateString('tr-TR')} - ${new Date(booking.check_out).toLocaleDateString('tr-TR')}`,
                  url: window.location.href,
                };
                if (navigator.share) {
                  try { await navigator.share(shareData); } catch { /* cancelled */ }
                } else {
                  await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                  alert('Link kopyalandı!');
                }
              }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{
                background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                color: 'var(--color-primary)',
                border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
              }}
            >
              <Share2 size={16} />
              Paylaş
            </button>
            <button
              onClick={() => {
                const start = new Date(booking.check_in).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                const end = new Date(booking.check_out).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                const title = encodeURIComponent(booking.listing?.title || 'Konaklama Rezervasyonu');
                const details = encodeURIComponent(
                  `Kotwise Rezervasyon${booking.confirmation_number ? ` - Onay No: ${booking.confirmation_number}` : ''}\n${booking.listing?.address || ''}`
                );
                const location = encodeURIComponent(booking.listing?.address || '');
                const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
                window.open(calendarUrl, '_blank');
              }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{
                background: 'color-mix(in srgb, var(--color-info) 10%, transparent)',
                color: 'var(--color-info)',
                border: '1px solid color-mix(in srgb, var(--color-info) 25%, transparent)',
              }}
            >
              <CalendarPlus size={16} />
              Takvime Ekle
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <Link
            href="/profile/bookings"
            className="w-full py-3.5 rounded-xl text-sm font-bold text-center"
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
            }}
          >
            Rezervasyonlarım
          </Link>
          <Link
            href="/"
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-center"
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0" style={{ color: 'var(--color-text-muted)' }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </p>
        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
