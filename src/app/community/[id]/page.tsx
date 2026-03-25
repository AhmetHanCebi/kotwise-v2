'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import {
  ArrowLeft,
  Heart,
  Share2,
  Flag,
  MapPin,
  Send,
  Loader2,
  CornerDownRight,
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';


function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins}dk`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}sa`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}g`;
  return `${Math.floor(days / 7)}h`;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { post, loading, getById, toggleLike, addComment } = usePosts(user?.id);
  const { toast } = useToast();
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getById(id);
  }, [id, getById]);

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    await toggleLike(id);
  };

  const handleComment = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!commentText.trim()) return;
    setSending(true);
    await addComment({
      post_id: id,
      user_id: user.id,
      content: commentText.trim(),
    });
    setCommentText('');
    setSending(false);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = async () => {
    try {
      await navigator.share({ url: window.location.href });
    } catch {
      /* cancelled */
    }
  };

  if (loading && !post) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3 px-4">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Gönderi bulunamadı.
        </p>
        <button
          onClick={() => router.back()}
          className="text-sm font-medium"
          style={{ color: 'var(--color-primary)' }}
        >
          Geri dön
        </button>
      </div>
    );
  }

  // Group comments: top-level and replies
  const topComments = post.comments.filter((c) => !c.parent_id);
  const replies = post.comments.filter((c) => c.parent_id);

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="glass-effect sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <button onClick={() => router.back()} className="p-1" aria-label="Geri">
          <ArrowLeft size={22} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <h1 className="text-base font-semibold flex-1" style={{ color: 'var(--color-text-primary)' }}>
          Gönderi
        </h1>
        <button onClick={handleShare} className="p-1" aria-label="Paylaş">
          <Share2 size={20} style={{ color: 'var(--color-text-muted)' }} />
        </button>
        <button onClick={async () => {
          if (!user) { router.push('/login'); return; }
          if (!confirm('Bu gönderiyi bildirmek istediğinizden emin misiniz?')) return;
          // Check for duplicate report
          const { data: existing } = await supabase.from('reports').select('id').eq('reporter_id', user.id).eq('content_id', id).eq('content_type', 'post').maybeSingle();
          if (existing) {
            toast('Bu gönderiyi zaten bildirdiniz', 'info');
            return;
          }
          await supabase.from('reports').insert({ reporter_id: user.id, content_id: id, content_type: 'post' });
          toast('Bildirildi, incelemeye alınacak', 'success');
        }} className="p-1" aria-label="Bildir">
          <Flag size={20} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </header>

      {/* Post content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4" style={{ background: 'var(--color-bg-card)' }}>
          {/* Author */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
              style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
            >
              {post.user?.avatar_url ? (
                <img src={post.user.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }} />
              ) : (
                (post.user?.full_name?.[0] ?? '?')
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {post.user?.full_name ?? 'Anonim'}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {timeAgo(post.created_at)}
                {post.location_name && (
                  <span className="inline-flex items-center gap-0.5 ml-2">
                    <MapPin size={10} />
                    {post.location_name}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Content */}
          <p className="text-[15px] leading-relaxed mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {post.content}
          </p>

          {post.hashtags?.length > 0 && (
            <p className="text-sm mb-3" style={{ color: 'var(--color-primary)' }}>
              {post.hashtags.map((h) => `#${h}`).join(' ')}
            </p>
          )}

          {/* Images */}
          {post.images?.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              {post.images.map((img, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden">
                  <img src={img} alt="Gönderi görseli" className="w-full object-cover" loading="lazy" onError={(e) => { const t = e.target as HTMLImageElement; const container = t.closest('.rounded-xl'); if (container) (container as HTMLElement).style.display = 'none'; }} />
                </div>
              ))}
            </div>
          )}

          {/* Like button */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <button
              onClick={handleLike}
              className="flex items-center gap-2 transition-transform active:scale-90"
              aria-label="Beğen"
            >
              <Heart
                size={22}
                fill={post.is_liked ? 'var(--color-error)' : 'none'}
                style={{ color: post.is_liked ? 'var(--color-error)' : 'var(--color-text-muted)' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: post.is_liked ? 'var(--color-error)' : 'var(--color-text-muted)' }}
              >
                {post.like_count} beğeni
              </span>
            </button>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {post.comment_count} yorum
            </span>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-2">
          {topComments.length === 0 && (
            <p className="text-center text-sm py-8" style={{ color: 'var(--color-text-muted)' }}>
              Henüz yorum yok. İlk yorumu sen yap!
            </p>
          )}

          {topComments.map((comment) => {
            const commentReplies = replies.filter((r) => r.parent_id === comment.id);
            return (
              <div key={comment.id}>
                {/* Top-level comment */}
                <div
                  className="flex gap-3 px-4 py-3"
                  style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
                    style={{ background: 'var(--gradient-dark)', color: 'var(--color-text-inverse)' }}
                  >
                    {comment.user?.avatar_url ? (
                      <img
                        src={comment.user.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }}
                      />
                    ) : (
                      (comment.user?.full_name?.[0] ?? '?')
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {comment.user?.full_name ?? 'Anonim'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                      {comment.content}
                    </p>
                  </div>
                </div>

                {/* Replies */}
                {commentReplies.map((reply) => (
                  <div
                    key={reply.id}
                    className="flex gap-3 px-4 py-3 pl-14"
                    style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}
                  >
                    <CornerDownRight size={14} className="flex-shrink-0 mt-1" style={{ color: 'var(--color-text-muted)' }} />
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
                      style={{ background: 'var(--gradient-dark)', color: 'var(--color-text-inverse)' }}
                    >
                      {(reply.user?.full_name?.[0] ?? '?')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {reply.user?.full_name ?? 'Anonim'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {timeAgo(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                        {reply.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Comment input */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] glass-effect z-40"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2 px-4 py-3 pb-[env(safe-area-inset-bottom)]">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            placeholder="Yorum yaz..."
            className="flex-1 h-10 px-4 rounded-full text-sm outline-none"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            onClick={handleComment}
            disabled={!commentText.trim() || sending}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity disabled:opacity-40"
            style={{ background: 'var(--gradient-primary)' }}
            aria-label="Gönder"
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
