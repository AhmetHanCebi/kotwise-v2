'use client';

import { use, useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import {
  ArrowLeft,
  Phone,
  Video,
  Send,
  Paperclip,
  Camera,
  Smile,
  Mic,
  Languages,
  Check,
  CheckCheck,
  MapPin,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { useStorage } from '@/hooks/useStorage';
import type { Message } from '@/lib/database.types';
import { useToast } from '@/components/Toast';

const EMOJI_LIST = ['😀','😂','❤️','👍','🎉','🔥','😊','🤔','👋','💪','🙏','✨','😍','🥳','👏','💯'];

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateSeparator(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Bugün';
  if (date.toDateString() === yesterday.toDateString()) return 'Dün';
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = '';

  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toDateString();
    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({ date: msg.created_at, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  return groups;
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <ChatContent conversationId={id} />
    </AuthGuard>
  );
}

function ChatContent({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { messages, loading, fetchMessages, send, conversations, fetchConversations } =
    useMessages(user?.id);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { toast } = useToast();
  const { upload } = useStorage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages(conversationId);
    fetchConversations();
  }, [conversationId, fetchMessages, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const conversation = useMemo(
    () => conversations.find((c) => c.id === conversationId),
    [conversations, conversationId]
  );

  const otherParticipant = useMemo(() => {
    if (!conversation || !user) return null;
    return conversation.participants.find((p) => p.id !== user.id) ?? null;
  }, [conversation, user]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await send({
      conversation_id: conversationId,
      content: text.trim(),
      type: 'text',
    });
    setText('');
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setSending(true);
    const result = await upload(file, 'messages', user.id);
    if (result.data) {
      await send({
        conversation_id: conversationId,
        content: result.data.url,
        type: 'image',
      });
    } else {
      toast('Dosya yüklenemedi', 'error');
    }
    setSending(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const messageGroups = useMemo(() => groupMessagesByDate(messages), [messages]);

  const displayName = conversation?.is_group
    ? conversation.group_name ?? 'Grup Sohbet'
    : otherParticipant?.full_name ?? 'Kullanıcı';

  const avatarUrl = conversation?.is_group ? null : otherParticipant?.avatar_url;

  return (
    <div
      className="flex flex-col h-dvh"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-3 py-3 pt-[calc(env(safe-area-inset-top)+12px)]"
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

        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-9 h-9 rounded-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm"
            style={{
              background: 'var(--gradient-dark)',
              color: 'var(--color-text-inverse)',
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {displayName}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--color-success)' }}>
            Çevrimiçi
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="p-2 rounded-full active:opacity-70"
            style={{
              color: showTranslation
                ? 'var(--color-primary)'
                : 'var(--color-text-muted)',
            }}
            aria-label="Çeviri"
          >
            <Languages size={20} />
          </button>
          <button
            onClick={() => toast('Sesli arama yakında aktif olacak', 'info')}
            className="p-2 rounded-full active:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Sesli arama"
          >
            <Phone size={20} />
          </button>
          <button
            onClick={() => toast('Görüntülü arama yakında aktif olacak', 'info')}
            className="p-2 rounded-full active:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Görüntülü arama"
          >
            <Video size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={28}
              className="animate-spin"
              style={{ color: 'var(--color-primary)' }}
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Henüz mesaj yok
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Merhaba diyerek sohbeti başlatın!
            </p>
          </div>
        ) : (
          messageGroups.map((group, gi) => (
            <div key={gi}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <span
                  className="text-[11px] font-medium px-3 py-1 rounded-full"
                  style={{
                    background: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {formatDateSeparator(group.date)}
                </span>
              </div>

              {group.messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[75%] px-3.5 py-2.5 relative"
                      style={{
                        background: isMine
                          ? 'var(--gradient-primary)'
                          : 'var(--color-bg-card)',
                        color: isMine
                          ? 'var(--color-text-inverse)'
                          : 'var(--color-text-primary)',
                        borderRadius: isMine
                          ? '16px 16px 4px 16px'
                          : '16px 16px 16px 4px',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {/* Message content by type */}
                      {msg.type === 'image' ? (
                        <div className="flex flex-col gap-1.5">
                          <div
                            className="w-48 h-32 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.1)' }}
                          >
                            <ImageIcon
                              size={24}
                              style={{
                                color: isMine
                                  ? 'rgba(255,255,255,0.7)'
                                  : 'var(--color-text-muted)',
                              }}
                            />
                          </div>
                          {msg.content && (
                            <p className="text-sm">{msg.content}</p>
                          )}
                        </div>
                      ) : msg.type === 'location' ? (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}

                      {/* Time + read receipt */}
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          isMine ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span
                          className="text-[10px]"
                          style={{
                            color: isMine
                              ? 'rgba(255,255,255,0.7)'
                              : 'var(--color-text-muted)',
                          }}
                        >
                          {formatTime(msg.created_at)}
                        </span>
                        {isMine && (
                          msg.is_read ? (
                            <CheckCheck
                              size={14}
                              style={{ color: 'rgba(255,255,255,0.9)' }}
                            />
                          ) : (
                            <Check
                              size={14}
                              style={{ color: 'rgba(255,255,255,0.6)' }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]"
        style={{
          background: 'var(--color-bg-card)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full active:opacity-70"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Dosya ekle"
            >
              <Paperclip size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                  fileInputRef.current.removeAttribute('capture');
                }
              }}
              className="p-2 rounded-full active:opacity-70"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Fotoğraf çek"
            >
              <Camera size={20} />
            </button>
          </div>

          <div
            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-2xl"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Mesaj yaz..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--color-text-primary)' }}
            />
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 active:opacity-70"
                style={{ color: showEmojiPicker ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                aria-label="Emoji ekle"
              >
                <Smile size={20} />
              </button>
              {showEmojiPicker && (
                <div
                  className="absolute bottom-10 right-0 p-2 rounded-xl grid grid-cols-8 gap-1 z-30 animate-fade-in-up"
                  style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}
                >
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => { setText(prev => prev + emoji); setShowEmojiPicker(false); inputRef.current?.focus(); }}
                      className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {text.trim() ? (
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
              style={{ background: 'var(--gradient-primary)' }}
              aria-label="Gönder"
            >
              {sending ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                  style={{ color: 'var(--color-text-inverse)' }}
                />
              ) : (
                <Send size={18} style={{ color: 'var(--color-text-inverse)' }} />
              )}
            </button>
          ) : (
            <button
              onClick={() => toast('Sesli mesaj yakında aktif olacak', 'info')}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95"
              style={{
                background: 'var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
              aria-label="Sesli mesaj"
            >
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
