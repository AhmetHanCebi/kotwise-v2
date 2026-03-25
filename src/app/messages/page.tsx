'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import PageHeader from '@/components/PageHeader';
import {
  Search,
  Plus,
  Users,
  MessageCircle,
  Home,
  Loader2,
} from 'lucide-react';

type FilterTab = 'all' | 'unread' | 'listing' | 'group';

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'unread', label: 'Okunmamış' },
  { key: 'listing', label: 'Ilan' },
  { key: 'group', label: 'Grup' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'şimdi';
  if (mins < 60) return `${mins}dk`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}sa`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}g`;
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default function MessagesPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="flex items-center justify-center min-h-dvh"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} /></div>}>
        <MessagesContent />
      </Suspense>
    </AuthGuard>
  );
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { conversations, loading, fetchConversations } = useMessages(user?.id);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  // Handle ?to=userId param — redirect to new message with that user
  useEffect(() => {
    const toUserId = searchParams.get('to');
    if (toUserId) {
      router.replace(`/messages/new?to=${toUserId}`);
    }
  }, [searchParams, router]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const { refreshing, handlers: pullHandlers } = usePullToRefresh({
    onRefresh: async () => {
      await fetchConversations();
    },
  });

  const filtered = useMemo(() => {
    let list = conversations;

    if (filter === 'unread') {
      list = list.filter((c) => c.has_unread);
    } else if (filter === 'listing') {
      list = list.filter((c) => c.listing_id != null);
    } else if (filter === 'group') {
      list = list.filter((c) => c.is_group);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const names = c.participants
          .filter((p) => p.id !== user?.id)
          .map((p) => p.full_name?.toLowerCase() ?? '');
        return (
          names.some((n) => n.includes(q)) ||
          c.group_name?.toLowerCase().includes(q) ||
          c.last_message_text?.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [conversations, filter, search, user?.id]);

  return (
    <div className="flex flex-col flex-1 pb-20" style={{ background: 'var(--color-bg)' }} {...pullHandlers}>
      {refreshing && (
        <div className="flex justify-center py-3">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      )}
      <PageHeader
        title="Mesajlar"
        rightContent={
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            {conversations.length}
          </span>
        }
      />

      <div className="px-4 pt-3 pb-2">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Sohbet ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
              style={{
                background:
                  filter === tab.key ? 'var(--color-primary)' : 'var(--color-bg-card)',
                color:
                  filter === tab.key
                    ? 'var(--color-text-inverse)'
                    : 'var(--color-text-secondary)',
                border:
                  filter === tab.key
                    ? 'none'
                    : '1px solid var(--color-border)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 px-4">
        {loading ? (
          <div className="flex flex-col gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-3 rounded-xl"
                style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="w-12 h-12 rounded-full animate-shimmer flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 w-28 rounded animate-shimmer" />
                    <div className="h-2.5 w-10 rounded animate-shimmer" />
                  </div>
                  <div className="h-3 w-3/4 rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}
            >
              <MessageCircle size={28} style={{ color: 'var(--color-primary)' }} />
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {search ? 'Sonuç bulunamadı' : 'Henüz mesajınız yok'}
            </p>
            <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
              {search ? 'Farklı bir arama deneyin' : 'Bir ilana mesaj göndererek sohbet başlatın'}
            </p>
            {!search && (
              <button
                onClick={() => router.push('/search')}
                className="px-5 py-2.5 rounded-full text-sm font-semibold mt-1"
                style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
              >
                İlanları Gör
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((conv) => {
              const otherParticipants = conv.participants.filter(
                (p) => p.id !== user?.id
              );
              const displayName = conv.is_group
                ? conv.group_name ?? 'Grup Sohbet'
                : otherParticipants[0]?.full_name ?? 'Kullanıcı';
              const avatarUrl = conv.is_group
                ? null
                : otherParticipants[0]?.avatar_url;

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-[0.98]"
                  style={{
                    background: 'var(--color-bg-card)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {conv.is_group ? (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--gradient-primary)' }}
                      >
                        <Users size={20} style={{ color: 'var(--color-text-inverse)' }} />
                      </div>
                    ) : avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-12 h-12 rounded-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }}
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg"
                        style={{
                          background: 'var(--gradient-dark)',
                          color: 'var(--color-text-inverse)',
                        }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Listing thumbnail */}
                  {conv.listing && (conv.listing as unknown as { cover_image_url?: string }).cover_image_url && (
                    <div
                      className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ border: '1px solid var(--color-border)' }}
                    >
                      <img
                        src={(conv.listing as unknown as { cover_image_url: string }).cover_image_url}
                        alt={conv.listing.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className="text-sm font-semibold truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {displayName}
                      </span>
                      <span
                        className="text-[11px] flex-shrink-0 ml-2"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {timeAgo(conv.last_message_at)}
                      </span>
                    </div>
                    {conv.listing && (
                      <div className="flex items-center gap-1 mb-0.5">
                        <Home
                          size={11}
                          style={{ color: 'var(--color-primary)', flexShrink: 0 }}
                        />
                        <span
                          className="text-[11px] truncate"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {conv.listing.title}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <p
                        className="text-xs truncate"
                        style={{
                          color: conv.has_unread
                            ? 'var(--color-text-primary)'
                            : 'var(--color-text-secondary)',
                          fontWeight: conv.has_unread ? 600 : 400,
                        }}
                      >
                        {conv.last_message_text ?? 'Sohbet başladı'}
                      </p>
                      {conv.has_unread && (
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 ml-auto"
                          style={{ background: 'var(--color-primary)' }}
                        />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* New Message FAB */}
      <button
        onClick={() => router.push('/messages/new')}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40 active:scale-95 transition-transform"
        style={{
          background: 'var(--gradient-primary)',
          maxWidth: '430px',
        }}
        aria-label="Yeni mesaj"
      >
        <Plus size={24} style={{ color: 'var(--color-text-inverse)' }} />
      </button>

      <BottomNav />
    </div>
  );
}
