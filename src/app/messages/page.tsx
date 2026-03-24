'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import {
  Search,
  Plus,
  Users,
  MessageCircle,
  Mail,
  MailOpen,
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
      <MessagesContent />
    </AuthGuard>
  );
}

function MessagesContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, loading, fetchConversations } = useMessages(user?.id);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const filtered = useMemo(() => {
    let list = conversations;

    if (filter === 'unread') {
      list = list.filter((c) => {
        // Check if last message is unread (simplified: check last_message_at)
        return c.last_message_text != null;
      });
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
    <div className="flex flex-col flex-1 pb-20" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-4 pt-[env(safe-area-inset-top)] pb-2">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Mesajlar
          </h1>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
              }}
            >
              {conversations.length}
            </span>
          </div>
        </div>

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
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={28}
              className="animate-spin"
              style={{ color: 'var(--color-primary)' }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-border)' }}
            >
              <MessageCircle size={28} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {search ? 'Sonuç bulunamadı' : 'Henüz mesajınız yok'}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Yeni bir sohbet başlatmak için + butonuna basın
            </p>
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
                    {/* Online dot */}
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                      style={{
                        background: 'var(--color-success)',
                        borderColor: 'var(--color-bg-card)',
                      }}
                    />
                  </div>

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
                    <div className="flex items-center gap-1">
                      {conv.listing_id && (
                        <Home
                          size={12}
                          style={{ color: 'var(--color-primary)', flexShrink: 0 }}
                        />
                      )}
                      <p
                        className="text-xs truncate"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {conv.last_message_text ?? 'Sohbet başladı'}
                      </p>
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
