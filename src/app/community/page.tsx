'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { useCities } from '@/hooks/useCities';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import BackToTop from '@/components/BackToTop';
import Link from 'next/link';
import ErrorRetry from '@/components/ErrorRetry';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Plus,
  TrendingUp,
  Loader2,
  Image as ImageIcon,
  X,
} from 'lucide-react';


const FALLBACK_HASHTAGS = [
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

export default function CommunityPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-dvh"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} /></div>}>
      <CommunityPage />
    </Suspense>
  );
}

function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hashtagParam = searchParams.get('hashtag');
  const { user } = useAuth();
  const { posts, loading, error, fetchFeed, toggleLike } = usePosts(user?.id);
  const { cities, selectedCityId, fetchCities } = useCities();
  const [activeCityId, setActiveCityId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>(FALLBACK_HASHTAGS);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [animatingLike, setAnimatingLike] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Fetch trending hashtags from RPC
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data, error } = await supabase.rpc('get_trending_hashtags', {
          days_back: 7,
          limit_count: 10,
        });
        if (!error && data && Array.isArray(data) && data.length > 0) {
          setTrendingHashtags(data.map((item: { hashtag: string; count?: number }) => `#${item.hashtag}`));
        }
      } catch {
        // Keep fallback hashtags
      }
    };
    fetchTrending();
  }, []);

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
      setHasMore(true);
      fetchFeed(activeCityId, 1, 20, undefined, hashtagParam ?? undefined);
    }
  }, [activeCityId, fetchFeed, hashtagParam]);

  const loadMore = useCallback(() => {
    if (activeCityId && !loading && hasMore) {
      const prevCount = posts.length;
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(activeCityId, nextPage, 20, undefined, hashtagParam ?? undefined);
      // If current page returned fewer than 20 posts, we've reached the end
      if (prevCount > 0 && prevCount % 20 !== 0) {
        setHasMore(false);
      }
    }
  }, [activeCityId, page, loading, fetchFeed, hasMore, posts.length, hashtagParam]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && posts.length > 0 && hasMore) loadMore();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, posts.length, hasMore]);

  const { refreshing, handlers: pullHandlers } = usePullToRefresh({
    onRefresh: async () => {
      if (!activeCityId) return;
      setPage(1);
      setHasMore(true);
      await fetchFeed(activeCityId, 1, 20, undefined, hashtagParam ?? undefined);
    },
  });

  const handleLike = async (postId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setAnimatingLike(postId);
    await toggleLike(postId);
    setTimeout(() => setAnimatingLike(null), 600);
  };

  const handleShare = async (postId: string) => {
    try {
      await navigator.share({ url: `${window.location.origin}/community/${postId}` });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="flex flex-col min-h-dvh page-enter" style={{ background: 'var(--color-bg)' }} {...pullHandlers}>
      {refreshing && (
        <div className="flex justify-center py-3">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      )}
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
        {trendingHashtags.map((tag) => (
          <button
            key={tag}
            onClick={() => router.push(`/community?hashtag=${encodeURIComponent(tag.replace('#', ''))}`)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium cursor-pointer"
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
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
            className="rounded-2xl overflow-hidden animate-fade-in-up block tap-feedback"
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
            {post.images?.filter((img) => img && img.trim()).length > 0 && (
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
                      className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                      style={post.images.length === 1 ? { aspectRatio: '16/9' } : undefined}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFullscreenImage(img); }}
                    >
                      <img
                        src={img}
                        alt="Gönderi görseli"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { const t = e.target as HTMLImageElement; const container = t.closest('.relative'); if (container) (container as HTMLElement).style.display = 'none'; }}
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
                className="flex items-center gap-1.5 transition-transform active:scale-90 relative"
                aria-label="Beğen"
              >
                <Heart
                  size={20}
                  fill={post.is_liked ? 'var(--color-error)' : 'none'}
                  className={animatingLike === post.id ? 'animate-heart-beat' : ''}
                  style={{ color: post.is_liked ? 'var(--color-error)' : 'var(--color-text-muted)' }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: post.is_liked ? 'var(--color-error)' : 'var(--color-text-muted)' }}
                >
                  {post.like_count || ''}
                </span>
                {animatingLike === post.id && post.is_liked && (
                  <span
                    className="absolute -top-3 left-1 text-xs font-bold animate-float-up pointer-events-none"
                    style={{ color: 'var(--color-error)' }}
                  >
                    +1
                  </span>
                )}
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

        {loading && posts.length === 0 && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-center gap-3 p-4 pb-2">
                  <div className="w-10 h-10 rounded-full animate-shimmer" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-3 w-24 rounded animate-shimmer" />
                    <div className="h-2.5 w-16 rounded animate-shimmer" />
                  </div>
                </div>
                <div className="px-4 pb-3 flex flex-col gap-2">
                  <div className="h-3 w-full rounded animate-shimmer" />
                  <div className="h-3 w-3/4 rounded animate-shimmer" />
                </div>
                <div className="h-40 animate-shimmer" />
                <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="h-5 w-10 rounded animate-shimmer" />
                  <div className="h-5 w-10 rounded animate-shimmer" />
                  <div className="h-5 w-10 rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && posts.length > 0 && (
          <div className="flex justify-center py-8">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        )}

        {!loading && error && (
          <ErrorRetry
            message={error}
            onRetry={() => activeCityId && fetchFeed(activeCityId, 1, 20, undefined, hashtagParam ?? undefined)}
          />
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}
            >
              <MessageCircle size={28} style={{ color: 'var(--color-primary)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Henüz gönderi yok
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              İlk gönderiyi sen paylaş!
            </p>
            <button
              onClick={() => router.push('/community/new')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mt-1"
              style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
            >
              <Plus size={16} />
              Gönderi Paylaş
            </button>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={observerRef} className="h-4" />
      </div>

      {/* Fullscreen image lightbox */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2"
            onClick={() => setFullscreenImage(null)}
            aria-label="Kapat"
          >
            <X size={28} />
          </button>
          <img
            src={fullscreenImage}
            alt=""
            className="max-w-full max-h-[85vh] object-contain"
          />
        </div>
      )}

      <BackToTop />

      {/* New Post FAB */}
      <button
        onClick={() => router.push('/community/new')}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40 transition-transform active:scale-90 tap-feedback"
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
