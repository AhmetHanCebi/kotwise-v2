'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/useBooking';
import type { BookingWithDetails } from '@/lib/database.types';
import {
  ArrowLeft,
  Check,
  X,
  Calendar,
  GraduationCap,
  Loader2,
  Clock,
} from 'lucide-react';

export default function HostBookingsPage() {
  return (
    <AuthGuard>
      <HostBookingsContent />
    </AuthGuard>
  );
}

function HostBookingsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { loading, updateStatus } = useBooking(user?.id);

  const [hostBookings, setHostBookings] = useState<BookingWithDetails[]>([]);
  const [fetching, setFetching] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetch = async () => {
      setFetching(true);
      const { useBooking: _ } = await import('@/hooks/useBooking');
      // Direct fetch using supabase
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings!bookings_listing_id_fkey(*, images:listing_images!listing_images_listing_id_fkey(*)),
          host:profiles!bookings_host_id_fkey(*),
          user:profiles!bookings_user_id_fkey(*)
        `)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      setHostBookings((data ?? []) as unknown as BookingWithDetails[]);
      setFetching(false);
    };
    fetch();
  }, [user?.id]);

  const pendingBookings = useMemo(
    () => hostBookings.filter((b) => b.status === 'pending'),
    [hostBookings]
  );

  const handleAction = async (id: string, action: 'confirmed' | 'cancelled') => {
    setActionLoading(id);
    await updateStatus(id, action);
    setHostBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: action } : b))
    );
    setActionLoading(null);
  };

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]"
        style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}
      >
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full active:opacity-70"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="Geri"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Gelen Talepler
        </h1>
        {pendingBookings.length > 0 && (
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'var(--color-warning)', color: 'white' }}
          >
            {pendingBookings.length}
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-3">
        {fetching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        ) : pendingBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-border)' }}
            >
              <Clock size={28} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Bekleyen talep yok
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Yeni rezervasyon talepleri burada görünecektir
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
              >
                {/* Guest Info */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {booking.user?.avatar_url ? (
                    <img
                      src={booking.user.avatar_url}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg flex-shrink-0"
                      style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
                    >
                      {(booking.user?.full_name ?? 'M').charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {booking.user?.full_name ?? 'Misafir'}
                    </p>
                    {booking.user?.university && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <GraduationCap size={12} style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                          {booking.user.university}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Details */}
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(booking.check_in).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      {' - '}
                      {new Date(booking.check_out).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                    {booking.total_price} {booking.listing?.currency ?? 'EUR'}
                  </span>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <button
                    onClick={() => handleAction(booking.id, 'confirmed')}
                    disabled={actionLoading === booking.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
                    style={{ background: 'var(--color-success)', color: 'white' }}
                  >
                    {actionLoading === booking.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    Onayla
                  </button>
                  <button
                    onClick={() => handleAction(booking.id, 'cancelled')}
                    disabled={actionLoading === booking.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
                    style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}
                  >
                    <X size={16} />
                    Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
