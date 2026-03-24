'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import {
  ArrowLeft,
  Share2,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  MessageCircle,
  Loader2,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { IMAGE_FALLBACK } from '@/lib/image-utils';

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${days[d.getDay()]}`;
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { event, loading, getById, join, leave } = useEvents(user?.id);
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getById(id);
  }, [id, getById]);

  const handleJoinLeave = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setActionLoading(true);
    if (event?.is_joined) {
      await leave(id);
    } else {
      await join(id);
    }
    await getById(id);
    setActionLoading(false);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ url: window.location.href, title: event?.title });
    } catch {
      /* cancelled */
    }
  };

  if (loading && !event) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3 px-4">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Etkinlik bulunamadı.</p>
        <button onClick={() => router.back()} className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
          Geri dön
        </button>
      </div>
    );
  }

  const visibleParticipants = (event.participants ?? []).slice(0, 5);
  const remainingCount = Math.max(0, event.participant_count - 5);

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header overlay on cover */}
      <div className="relative">
        {event.image_url ? (
          <div className="h-56 overflow-hidden">
            <img src={event.image_url} alt={event.title ?? 'Etkinlik görseli'} className="w-full h-full object-cover" loading="lazy" onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.includes('placehold.co')) t.src = IMAGE_FALLBACK; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : (
          <div className="h-40" style={{ background: 'var(--gradient-primary)' }} />
        )}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] h-14">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }} aria-label="Geri">
            <ArrowLeft size={20} style={{ color: '#fff' }} />
          </button>
          <button onClick={handleShare} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }} aria-label="Paylaş">
            <Share2 size={18} style={{ color: '#fff' }} />
          </button>
        </div>
      </div>

      {/* Event info */}
      <div className="flex-1 -mt-6 relative">
        <div
          className="rounded-t-3xl p-5 flex flex-col gap-5"
          style={{ background: 'var(--color-bg-card)' }}
        >
          {/* Title + category */}
          <div>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', color: 'var(--color-primary)' }}
            >
              {event.category}
            </span>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {event.title}
            </h1>
          </div>

          {/* Date, time, location */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}
              >
                <CalendarDays size={20} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {formatDateFull(event.date)}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <Clock size={10} className="inline mr-1" />
                  {event.time?.substring(0, 5) ?? event.time}
                </p>
              </div>
            </div>
            {event.location_name && (
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'color-mix(in srgb, var(--color-info) 8%, transparent)' }}
                >
                  <MapPin size={20} style={{ color: 'var(--color-info)' }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {event.location_name}
                  </p>
                  <button
                    onClick={() => {
                      if (event.latitude && event.longitude) {
                        window.open(`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`, '_blank');
                      } else if (event.location_name) {
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location_name)}`, '_blank');
                      } else {
                        toast('Konum bilgisi bulunamadı', 'info');
                      }
                    }}
                    className="text-xs"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Haritada gör
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Organizer */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
              style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
            >
              {event.organizer?.avatar_url ? (
                <img src={event.organizer.avatar_url} alt={event.organizer?.full_name ?? 'Organizatör'} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }} />
              ) : (
                (event.organizer?.full_name?.[0] ?? '?')
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {event.organizer?.full_name ?? 'Organizatör'}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Organizatör</p>
            </div>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'color-mix(in srgb, var(--color-success) 12%, transparent)', color: 'var(--color-success)' }}
            >
              Organizatör
            </span>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Hakkında
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {event.description}
              </p>
            </div>
          )}

          {/* Participants */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Katılımcılar ({event.participant_count})
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {visibleParticipants.map((p) => (
                  <div
                    key={p.id}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden ring-2 ring-white"
                    style={{ background: 'var(--gradient-dark)', color: 'var(--color-text-inverse)' }}
                  >
                    {p.user?.avatar_url ? (
                      <img src={p.user.avatar_url} alt={p.user?.full_name ?? 'Katılımcı'} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }} />
                    ) : (
                      (p.user?.full_name?.[0] ?? '?')
                    )}
                  </div>
                ))}
              </div>
              {remainingCount > 0 && (
                <span className="text-xs font-medium ml-1" style={{ color: 'var(--color-text-muted)' }}>
                  ve {remainingCount} kişi daha
                </span>
              )}
            </div>
          </div>

          {/* Event chat preview */}
          <div
            className="p-3 rounded-xl"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Etkinlik Sohbeti
              </h3>
              <button
                onClick={() => {
                  if (!user) {
                    router.push('/login');
                    return;
                  }
                  if (event?.is_joined && event?.organizer?.id) {
                    router.push(`/messages/new?to=${event.organizer.id}&subject=${encodeURIComponent(event.title ?? 'Etkinlik')}`);
                  } else {
                    toast('Sohbete katılmak için önce etkinliğe katılın', 'info');
                  }
                }}
                className="text-xs font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                Sohbete Katıl
              </button>
            </div>
            <div className="flex items-center gap-2 py-2">
              <MessageCircle size={16} style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Sohbete katılmak için etkinliğe katıl.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div
        className="sticky bottom-0 px-4 py-4 pb-[env(safe-area-inset-bottom)] glass-effect"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <button
          onClick={handleJoinLeave}
          disabled={actionLoading}
          className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98]"
          style={{
            background: event.is_joined ? 'var(--color-bg)' : 'var(--gradient-primary)',
            color: event.is_joined ? 'var(--color-error)' : 'var(--color-text-inverse)',
            border: event.is_joined ? '2px solid var(--color-error)' : 'none',
          }}
        >
          {actionLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : event.is_joined ? (
            <>
              <LogOut size={18} />
              Ayrıl
            </>
          ) : (
            <>
              <LogIn size={18} />
              Katıl
            </>
          )}
        </button>
      </div>
    </div>
  );
}
