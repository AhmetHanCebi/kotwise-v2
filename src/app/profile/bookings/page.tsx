'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/useBooking';
import type { BookingStatus } from '@/lib/database.types';
import PageHeader from '@/components/PageHeader';
import {
  MapPin,
  Calendar,
  MessageCircle,
  XCircle,
  Loader2,
  CalendarCheck,
} from 'lucide-react';
import { IMAGE_FALLBACK_SMALL, getCoverImage, handleListingImageError } from '@/lib/image-utils';
import { formatCurrency } from '@/lib/currency-utils';
import { useToast } from '@/components/Toast';

type FilterTab = 'active' | 'past' | 'cancelled';

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'active', label: 'Aktif' },
  { key: 'past', label: 'Geçmiş' },
  { key: 'cancelled', label: 'İptal' },
];

const statusColors: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', label: 'Beklemede' },
  confirmed: { bg: 'rgba(34,197,94,0.1)', text: '#22C55E', label: 'Onaylandı' },
  cancelled: { bg: 'rgba(239,68,68,0.1)', text: 'var(--color-error)', label: 'İptal Edildi' },
  completed: { bg: 'rgba(99,102,241,0.1)', text: '#6366F1', label: 'Tamamlandı' },
};

export default function BookingsPage() {
  return (
    <AuthGuard>
      <BookingsContent />
    </AuthGuard>
  );
}

function BookingsContent() {
  const { user } = useAuth();
  const { bookings, loading, fetchUserBookings, cancel } = useBooking(user?.id);
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterTab>('active');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState<string | null>(null);

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'active':
        return bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
      case 'past':
        return bookings.filter((b) => b.status === 'completed');
      case 'cancelled':
        return bookings.filter((b) => b.status === 'cancelled');
    }
  }, [bookings, filter]);

  const handleCancel = async (id: string) => {
    if (confirmingCancel !== id) {
      setConfirmingCancel(id);
      return;
    }
    setCancelling(id);
    setConfirmingCancel(null);
    try {
      await cancel(id);
      toast('Rezervasyon iptal edildi', 'success');
    } catch {
      toast('İptal işlemi sırasında bir hata oluştu', 'error');
    }
    setCancelling(null);
    fetchUserBookings();
  };

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <PageHeader title="Rezervasyonlarım" showBack />

      {/* Filter Tabs */}
      <div
        className="px-4 pb-3"
        style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-1"
              style={{
                background: filter === tab.key ? 'var(--color-primary)' : 'var(--color-bg)',
                color: filter === tab.key ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                border: filter === tab.key ? 'none' : '1px solid var(--color-border)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex-1 px-4 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-border)' }}
            >
              <CalendarCheck size={28} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Rezervasyon bulunamadı
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((booking) => {
              const coverImage = booking.listing
                ? getCoverImage(booking.listing)
                : undefined;
              const status = statusColors[booking.status];

              return (
                <div
                  key={booking.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: 'var(--color-bg-card)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  {/* Listing Image + Title */}
                  <div className="flex gap-3 p-3">
                    <img
                      src={coverImage || IMAGE_FALLBACK_SMALL}
                      alt={booking.listing?.title ?? ''}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                      loading="lazy"
                      onError={(e) => handleListingImageError(e, booking.listing_id)}
                    />

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate mb-1"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {booking.listing?.title ?? 'Ilan'}
                      </p>
                      {booking.listing?.address && (
                        <div className="flex items-center gap-1 mb-1.5">
                          <MapPin size={12} style={{ color: 'var(--color-text-muted)' }} />
                          <span className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                            {booking.listing.address}
                          </span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block"
                        style={{ background: status.bg, color: status.text }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Dates + Price */}
                  <div
                    className="flex items-center justify-between px-3 py-2.5"
                    style={{ borderTop: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(booking.check_in).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        {' - '}
                        {new Date(booking.check_out).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                      {formatCurrency(Number(booking.total_price), booking.listing?.currency)}
                    </span>
                  </div>

                  {/* Actions */}
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <div
                      className="flex items-center gap-2 px-3 py-2.5"
                      style={{ borderTop: '1px solid var(--color-border)' }}
                    >
                      <Link
                        href={`/messages/new?to=${booking.host_id ?? ''}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
                        style={{
                          background: 'var(--color-bg)',
                          color: 'var(--color-primary)',
                          border: '1px solid var(--color-primary)',
                        }}
                      >
                        <MessageCircle size={14} />
                        Mesaj Gönder
                      </Link>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        onBlur={() => { if (confirmingCancel === booking.id) setConfirmingCancel(null); }}
                        disabled={cancelling === booking.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
                        style={{
                          background: confirmingCancel === booking.id ? 'var(--color-error)' : 'rgba(239,68,68,0.08)',
                          color: confirmingCancel === booking.id ? 'white' : 'var(--color-error)',
                        }}
                      >
                        {cancelling === booking.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <XCircle size={14} />
                        )}
                        {confirmingCancel === booking.id ? 'Emin misiniz?' : 'İptal Et'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
