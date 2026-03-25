'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { useCities } from '@/hooks/useCities';
import {
  ArrowLeft,
  Send,
  Users,
  Loader2,
  MapPin,
} from 'lucide-react';

export default function CityChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <CityChatContent cityId={id} />
    </AuthGuard>
  );
}

function CityChatContent({ cityId }: { cityId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { getById: getCityById, city } = useCities();
  const { messages, loading, fetchMessages, send, createConversation } = useMessages(user?.id);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch city info
  useEffect(() => {
    if (cityId) getCityById(cityId);
  }, [cityId, getCityById]);

  // Find or create city group conversation
  useEffect(() => {
    if (!user || !cityId || !city?.name) return;

    const initChat = async () => {
      try {
        const result = await createConversation([], {
          city_id: cityId,
          is_group: true,
          group_name: city?.name ? `${city.name} Sohbet` : 'Şehir Sohbet',
        });

        if ('data' in result && result.data) {
          setConversationId(result.data.id);
          await fetchMessages(result.data.id);
        }
      } catch {
        // Conversation may already exist — handled by createConversation
      } finally {
        setInitializing(false);
      }
    };

    initChat();
  }, [user, cityId, city?.name, createConversation, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !conversationId || sending) return;
    setSending(true);

    await send({
      conversation_id: conversationId,
      content: inputText.trim(),
      type: 'text',
      metadata: {},
    });

    setInputText('');
    setSending(false);
  }, [inputText, conversationId, sending, send]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const cityName = city?.name ?? 'Şehir';

  return (
    <div className="flex flex-col h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]"
        style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full active:opacity-70"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="Geri"
        >
          <ArrowLeft size={22} />
        </button>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Users size={18} style={{ color: 'var(--color-text-inverse)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-base font-bold truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {cityName} Sohbet
          </h1>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
            <MapPin size={10} />
            Şehir grup sohbeti
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {initializing || loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={28}
              className="animate-spin"
              style={{ color: 'var(--color-primary)' }}
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-border)' }}
            >
              <Users size={28} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Henüz mesaj yok
            </p>
            <p className="text-xs text-center px-8" style={{ color: 'var(--color-text-muted)' }}>
              {cityName} şehrindeki diğer öğrencilerle sohbet etmeye başlayın!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[75%] px-3 py-2 rounded-2xl"
                    style={{
                      background: isOwn ? 'var(--color-primary)' : 'var(--color-bg-card)',
                      color: isOwn ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                      borderBottomRightRadius: isOwn ? '4px' : undefined,
                      borderBottomLeftRadius: !isOwn ? '4px' : undefined,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {!isOwn && (
                      <p className="text-[10px] font-semibold mb-0.5" style={{ color: 'var(--color-primary)' }}>
                        {(msg as unknown as Record<string, any>).sender?.full_name || msg.sender_id?.slice(0, 8) || 'Kullanıcı'}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p
                      className="text-[10px] mt-1 text-right"
                      style={{ opacity: 0.6 }}
                    >
                      {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]"
        style={{
          background: 'var(--color-bg-card)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-end gap-2">
          <div
            className="flex-1 px-3 py-2.5 rounded-2xl"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <input
              type="text"
              placeholder="Mesaj yazın..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{
              background: inputText.trim() ? 'var(--gradient-primary)' : 'var(--color-border)',
            }}
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-text-inverse)' }} />
            ) : (
              <Send size={18} style={{ color: 'var(--color-text-inverse)' }} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
