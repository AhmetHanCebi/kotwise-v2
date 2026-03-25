'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import type { Profile } from '@/lib/database.types';
import {
  ArrowLeft,
  Search,
  Loader2,
  MessageCircle,
  UserPlus,
} from 'lucide-react';

export default function NewMessagePage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="flex items-center justify-center min-h-dvh"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} /></div>}>
        <NewMessageContent />
      </Suspense>
    </AuthGuard>
  );
}

function NewMessageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { createConversation, searchProfiles, fetchRecentContacts } = useMessages(user?.id);

  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [recentContacts, setRecentContacts] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toHandledRef = useRef(false);

  // Handle ?to=userId — auto-start conversation with that user
  useEffect(() => {
    const toUserId = searchParams.get('to');
    const listingId = searchParams.get('listing');
    if (!toUserId || !user || toHandledRef.current) return;
    toHandledRef.current = true;

    const startConversation = async () => {
      setCreating(toUserId);
      const result = await createConversation(
        [toUserId],
        listingId ? { listing_id: listingId } : undefined
      );
      if ('data' in result && result.data) {
        router.replace(`/messages/${result.data.id}`);
      } else {
        setCreating(null);
      }
    };
    startConversation();
  }, [searchParams, user, createConversation, router]);

  // Fetch recent contacts (users from existing conversations)
  useEffect(() => {
    if (!user) return;
    fetchRecentContacts().then((profiles) => {
      if (profiles.length > 0) setRecentContacts(profiles);
    });
  }, [user, fetchRecentContacts]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearch(query);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!query.trim()) {
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        const profiles = await searchProfiles(query);
        setResults(profiles);
        setLoading(false);
      }, 400);
    },
    [searchProfiles]
  );

  const handleSelect = async (profile: Profile) => {
    if (creating) return;
    setCreating(profile.id);

    const result = await createConversation([profile.id]);
    if ('error' in result && result.error) {
      setCreating(null);
      return;
    }
    if ('data' in result && result.data) {
      router.replace(`/messages/${result.data.id}`);
    }
  };

  const displayList = search.trim() ? results : recentContacts;
  const listTitle = search.trim() ? 'Sonuçlar' : 'Son Kişiler';

  return (
    <div
      className="flex flex-col h-dvh"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div
        className="px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3"
        style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
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
            Yeni Mesaj
          </h1>
        </div>

        {/* Search Input */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="İsim veya üniversite ile ara..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
          {loading && (
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: 'var(--color-primary)' }}
            />
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-border)' }}
            >
              {search.trim() ? (
                <Search size={28} style={{ color: 'var(--color-text-muted)' }} />
              ) : (
                <UserPlus size={28} style={{ color: 'var(--color-text-muted)' }} />
              )}
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {search.trim()
                ? 'Kullanıcı bulunamadı'
                : 'Henüz sohbet geçmişiniz yok'}
            </p>
            <p className="text-xs px-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
              Mesaj göndermek istediğiniz kişiyi arayarak bulabilirsiniz
            </p>
          </div>
        ) : (
          <div className="px-4 pt-3">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {listTitle}
            </p>
            <div className="flex flex-col gap-1">
              {displayList.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleSelect(profile)}
                  disabled={creating === profile.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-left transition-all active:scale-[0.98]"
                  style={{
                    background: 'var(--color-bg-card)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {/* Avatar */}
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name ?? ''}
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-semibold flex-shrink-0"
                      style={{
                        background: 'var(--gradient-dark)',
                        color: 'var(--color-text-inverse)',
                      }}
                    >
                      {(profile.full_name ?? 'K').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {profile.full_name ?? 'Kullanıcı'}
                    </p>
                    {profile.university && (
                      <p
                        className="text-xs truncate"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {profile.university}
                      </p>
                    )}
                  </div>

                  {creating === profile.id ? (
                    <Loader2
                      size={18}
                      className="animate-spin flex-shrink-0"
                      style={{ color: 'var(--color-primary)' }}
                    />
                  ) : (
                    <MessageCircle
                      size={18}
                      className="flex-shrink-0"
                      style={{ color: 'var(--color-primary)' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
