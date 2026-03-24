'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { useCities } from '@/hooks/useCities';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Plus,
  TrendingUp,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { IMAGE_FALLBACK } from '@/lib/image-utils';

const TRENDING_HASHTAGS = [
  '#ErasmusHayatı', '#BarcelonaGünleri', '#ÖğrenciYaşam',
  '#YurtDışıEğitim', '#ŞehirKeşfi', '#Bürsİpuçları',
  '#YemekTarifleri', '#Erasmus2026', '#KültürŞoku',
];

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

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { posts, loading, fetchFeed, toggleLike } = usePosts(user?.id);
  const { cities, selectedCityId, fetchCities } = useCities();
  const [activeCityId, setActiveCityId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (selectedCityId && !activeCityId) {
      setActiveCityId(selectedCityId);
    } else if (cities.length > 0 && !activeCityId) {
      setActiveCityId(cities[0].id);
    }
  }, [selectedCityId, cities, activeCityId]);

  useEffect(() => {
    if (activeCityId) {
      setPage(1);
      fetchFeed(activeCityId, 1);
    }
  }, [activeCityId, fetchFeed]);

  const loadMore = useCallback(() => {
    if (activeCityId && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(activeCityId, nextPage);
    }
  }, [activeCityId, page, loading, fetchFeed]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && posts.length > 0) loadMore();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, posts.length]);

  const handleLike = async (postId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    await toggleLike(postId);
  };

  const handleShare = async (postId: string) => {
    try {
      await navigator.share({ url: `${window.location.origin}/community/${postId}` });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="glass-effect sticky top-0 z-40 px-4 pt-[env(safe-area-inset-top)] pb-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between h-14">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Topluluk
          </h1>
          <TrendingUp size={22} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        </div>

        {/* City filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => setActiveCityId(city.id)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: activeCityId === city.id ? 'var(--color-primary)' : 'var(--color-bg-card)',
                color: activeCityId === city.id ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                border: `1px solid ${activeCityId === city.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              {city.name}
            </button>
          ))}
        </div>
      </header>

      {/* Trending hashtags */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {TRENDING_HASHTAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => router.push(`/community?hashtag=${encodeURIComponent(tag.replace('#', ''))}`)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium cursor-pointer"
            style={{
              background: 'var(--color-primary)' + '14',
              color: 'var(--color-primary)',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Posts feed */}
      <div className="flex-1 flex flex-col gap-3 px-4 pb-24">
        {posts.map((post, i) => (
          <Link
            key={post.id}
            href={`/community/${post.id}`}
            className="rounded-2xl overflow-hidden animate-fade-in-up block"
            style={{
              background: 'var(--color-bg-card)',
              boxShadow: 'var(--shadow-card)',
              animationDelay: `${i * 50}ms`,
            }}
            aria-label={`Gönderi: ${post.content?.slice(0, 50)}`}
          >
            {/* Post header */}
            <div className="flex items-center gap-3 p-4 pb-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
                style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
              >
                {post.user?.avatar_url ? (
                  <img
                    src={post.user.avatar_url}
                    alt={post.user?.full_name ?? 'Kullanıcı'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }}
                  />
                ) : (
                  (post.user?.full_name?.[0] ?? '?')
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
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
            <div
              className="block w-full text-left px-4 pb-2"
            >
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                {post.content}
              </p>
              {post.hashtags?.length > 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-primary)' }}>
                  {post.hashtags.map((h) => `#${h}`).join(' ')}
                </p>
              )}
            </div>

            {/* Images */}
            {post.images?.length > 0 && (
              <div
                className="w-full"
              >
                <div
                  className={`grid gap-0.5 ${
                    post.images.length === 1
                      ? 'grid-cols-1'
                      : post.images.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-2'
                  }`}
                >
                  {post.images.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square bg-gray-100 overflow-hidden"
                      style={post.images.length === 1 ? { aspectRatio: '16/9' } : undefined}
                    >
                      <img
                        src={img}
                        alt="Gönderi görseli"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.includes('placehold.co')) t.src = IMAGE_FALLBACK; }}
                      />
                      {idx === 3 && post.images.length > 4 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            +{post.images.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLike(post.id); }}
                className="flex items-center gap-1.5 transition-transform active:scale-90"
                aria-label="Beğen"
              >
                <Heart
                  size={20}
                  fill={post.is_liked ? 'var(--color-error)' : 'none'}
                  style={{ color: post.is_liked ? 'var(--color-error)' : 'var(--color-text-muted)' }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: post.is_liked ? 'var(--color-error)' : 'var(--color-text-muted)' }}
                >
                  {post.like_count || ''}
                </span>
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/community/${post.id}`); }}
                className="flex items-center gap-1.5"
                aria-label="Yorum yap"
              >
                <MessageCircle size={20} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {post.comment_count || ''}
                </span>
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(post.id); }}
                className="flex items-center gap-1.5"
                aria-label="Paylaş"
              >
                <Share2 size={20} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
          </Link>
        ))}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ImageIcon size={48} style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Henüz gönderi yok. İlk gönderiyi sen paylaş!
            </p>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={observerRef} className="h-4" />
      </div>

      {/* New Post FAB */}
      <button
        onClick={() => router.push('/community/new')}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40 transition-transform active:scale-90"
        style={{
          background: 'var(--gradient-primary)',
          maxWidth: '430px',
        }}
        aria-label="Yeni gönderi"
      >
        <Plus size={28} style={{ color: 'var(--color-text-inverse)' }} />
      </button>

      <BottomNav />
    </div>
  );
}
