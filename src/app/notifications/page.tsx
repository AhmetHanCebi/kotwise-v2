'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationType } from '@/lib/database.types';
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  Home,
  DollarSign,
  Star,
  PartyPopper,
  Megaphone,
  Bell,
  CheckCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const notifIconMap: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  message: { icon: MessageCircle, color: '#3B82F6', bg: '#EFF6FF' },
  match: { icon: Heart, color: '#EF4444', bg: '#FEF2F2' },
  booking: { icon: Home, color: '#8B5CF6', bg: '#F5F3FF' },
  price: { icon: DollarSign, color: '#F59E0B', bg: '#FFFBEB' },
  review: { icon: Star, color: '#F59E0B', bg: '#FFFBEB' },
  event: { icon: PartyPopper, color: '#22C55E', bg: '#F0FDF4' },
  community: { icon: Megaphone, color: '#6366F1', bg: '#EEF2FF' },
  system: { icon: Bell, color: '#6B7280', bg: '#F9FAFB' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'şimdi';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationsContent />
    </AuthGuard>
  );
}

function NotificationsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, unreadCount, loading, error, fetchNotifications, markRead, markAllRead } =
    useNotifications(user?.id);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAll, setMarkingAll] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Safety timeout: if loading takes more than 8 seconds, show error state
  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.is_read);
    return notifications;
  }, [notifications, filter]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await markAllRead();
    setMarkingAll(false);
  };

  const getNotifHref = (notif: { type: NotificationType; related_id: string | null; related_type: string | null }): string | null => {
    if (!notif.related_id) return null;
    switch (notif.type) {
      case 'message': return `/messages/${notif.related_id}`;
      case 'booking': return '/profile/bookings';
      case 'event': return `/events/${notif.related_id}`;
      case 'community': return `/community/${notif.related_id}`;
      case 'review': return notif.related_id ? `/listing/${notif.related_id}` : null;
      case 'match': return `/roommates/${notif.related_id}`;
      case 'price': return notif.related_id ? `/listing/${notif.related_id}` : null;
      default: return null;
    }
  };

  const handleNotifClick = async (notif: { id: string; is_read: boolean; type: NotificationType; related_id: string | null; related_type: string | null }) => {
    if (!notif.is_read) {
      await markRead(notif.id);
    }
    const href = getNotifHref(notif);
    if (href) {
      router.push(href);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3"
        style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-full active:opacity-70"
              style={{ color: 'var(--color-text-primary)' }}
              aria-label="Geri"
            >
              <ArrowLeft size={22} />
            </button>
            <h1
              className="text-lg font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Bildirimler
            </h1>
            {unreadCount > 0 && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--color-error)',
                  color: 'var(--color-text-inverse)',
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full active:opacity-70"
              style={{
                color: 'var(--color-primary)',
                background: 'rgba(242,101,34,0.08)',
              }}
            >
              {markingAll ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCheck size={14} />
              )}
              Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background:
                  filter === f ? 'var(--color-primary)' : 'var(--color-bg)',
                color:
                  filter === f
                    ? 'var(--color-text-inverse)'
                    : 'var(--color-text-secondary)',
                border:
                  filter === f ? 'none' : '1px solid var(--color-border)',
              }}
            >
              {f === 'all' ? 'Tümü' : 'Okunmamış'}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 px-4 py-3 pb-24">
        {(error || timedOut) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.08)' }}
            >
              <AlertCircle size={28} style={{ color: 'var(--color-error)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Bildirimler yüklenemedi
            </p>
            <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
              {error || 'Bağlantı zaman aşımına uğradı'}
            </p>
            <button
              onClick={() => { setTimedOut(false); fetchNotifications(); }}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              <RefreshCw size={14} />
              Tekrar Dene
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2
              size={28}
              className="animate-spin"
              style={{ color: 'var(--color-primary)' }}
            />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Yükleniyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-border)' }}
            >
              <Bell size={28} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Henüz bildiriminiz yok'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((notif) => {
              const config = notifIconMap[notif.type] ?? notifIconMap.system;
              const Icon = config.icon;

              return (
                <button
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className="flex items-start gap-3 px-3 py-3 rounded-xl w-full text-left transition-all active:scale-[0.98]"
                  style={{
                    background: 'var(--color-bg-card)',
                    boxShadow: 'var(--shadow-sm)',
                    borderLeft: !notif.is_read
                      ? '3px solid var(--color-primary)'
                      : '3px solid transparent',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: config.bg }}
                  >
                    <Icon size={18} style={{ color: config.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${!notif.is_read ? 'font-semibold' : 'font-medium'}`}
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {notif.title}
                    </p>
                    {notif.description && (
                      <p
                        className="text-xs mt-0.5 line-clamp-2"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {notif.description}
                      </p>
                    )}
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.is_read && (
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                      style={{ background: 'var(--color-primary)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
