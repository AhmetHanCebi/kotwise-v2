'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Share2, Heart, Star, MapPin, ChevronLeft, ChevronRight,
  Wifi, Wind, Tv, Car, UtensilsCrossed, Waves, Sofa, Shield, Check,
  Clock, MessageCircle, ChevronDown, ChevronUp, GraduationCap, Users,
  Loader2, Home, Calendar,
} from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import dynamic from 'next/dynamic';
const ListingMap = dynamic(() => import('@/components/ListingMap'), {
  ssr: false,
  loading: () => <div className="h-[200px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />,
});
import type { ListingWithDetails, ReviewInsert } from '@/lib/database.types';
import { IMAGE_FALLBACK, IMAGE_FALLBACK_LARGE, getCoverImage, getRoomPlaceholder } from '@/lib/image-utils';
import { formatCurrency } from '@/lib/currency-utils';
import { ROOM_TYPE_LABELS } from '@/lib/constants';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi size={18} />,
  klima: <Wind size={18} />,
  tv: <Tv size={18} />,
  otopark: <Car size={18} />,
  mutfak: <UtensilsCrossed size={18} />,
  camasir: <Waves size={18} />,
  esyali: <Sofa size={18} />,
  guvenlik: <Shield size={18} />,
};

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'WiFi',
  klima: 'Klima',
  tv: 'TV',
  otopark: 'Otopark',
  mutfak: 'Mutfak',
  camasir: 'Çamaşır Makinesi',
  esyali: 'Eşyalı',
  guvenlik: 'Güvenlik',
};

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { getById, listings, search, loading, submitReview } = useListings();
  const { isFavorite, toggle: toggleFavorite } = useFavorites(user?.id);

  const [listing, setListing] = useState<ListingWithDetails | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      getById(id).then((data) => {
        if (data) {
          setListing(data);
          search({ city_id: data.city_id, limit: 7 }); // similar listings in same city
        }
      });
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => setScrolled(container.scrollTop > 200);
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImage((p) => (p < (listing?.images?.length ?? 1) - 1 ? p + 1 : 0));
  }, [listing?.images?.length]);

  const prevImage = useCallback(() => {
    setCurrentImage((p) => (p > 0 ? p - 1 : (listing?.images?.length ?? 1) - 1));
  }, [listing?.images?.length]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) nextImage(); // swipe left
    if (touchEnd - touchStart > 75) prevImage(); // swipe right
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: listing?.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      }
    } catch (err) {
      // User cancelled share or clipboard failed — silently ignore
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !listing) return;
    setSubmittingReview(true);
    const input: ReviewInsert = {
      listing_id: listing.id,
      user_id: user.id,
      rating: reviewRating,
      comment: reviewComment || null,
    };
    const result = await submitReview(input);
    if (!result.error) {
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      // Refresh listing
      const data = await getById(id);
      if (data) setListing(data);
    }
    setSubmittingReview(false);
  };

  if (loading && !listing) {
    return (
      <div className="min-h-dvh flex flex-col max-w-[430px] mx-auto animate-fade-in-up" style={{ background: 'var(--color-bg)' }}>
        {/* Image area skeleton */}
        <div className="aspect-[4/3] animate-shimmer" />
        <div className="px-4 pt-4 space-y-4">
          {/* Title */}
          <div className="h-6 w-3/4 animate-shimmer rounded" />
          {/* Location */}
          <div className="h-4 w-1/2 animate-shimmer rounded" />
          {/* Price */}
          <div className="h-10 w-1/3 animate-shimmer rounded-xl" />
          {/* Host card */}
          <div className="h-20 w-full animate-shimmer rounded-2xl" />
          {/* Features grid */}
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-16 animate-shimmer rounded-xl" />)}
          </div>
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full animate-shimmer rounded" />
            <div className="h-4 w-5/6 animate-shimmer rounded" />
            <div className="h-4 w-2/3 animate-shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 max-w-[430px] mx-auto px-4">
        <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          İlan bulunamadı
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-full text-sm font-semibold"
          style={{ background: 'var(--color-primary)', color: 'white' }}
        >
          Geri Dön
        </button>
      </div>
    );
  }

  const images = listing.images?.length
    ? listing.images.sort((a, b) => a.order - b.order)
    : [{ id: 'placeholder', listing_id: id, url: getRoomPlaceholder(id), order: 0, is_cover: true, created_at: '', updated_at: '' }];

  const description = listing.description || '';
  const isLongDesc = description.length > 200;
  const displayDesc = showFullDesc ? description : description.slice(0, 200);

  const similarListings = listings.filter((l) => l.id !== listing.id).slice(0, 6);

  return (
    <div
      ref={containerRef}
      className="min-h-dvh flex flex-col max-w-[430px] mx-auto relative overflow-y-auto page-enter"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Glass Header on scroll */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 flex items-center justify-between px-4 pt-[calc(8px+env(safe-area-inset-top))] pb-2 transition-all duration-300"
        style={{
          background: scrolled ? 'var(--color-bg-card-translucent, var(--color-bg-card))' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: scrolled ? 'var(--color-bg)' : 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
          }}
          aria-label="Geri"
        >
          <ArrowLeft size={18} color={scrolled ? 'var(--color-text-primary)' : 'white'} />
        </button>
        {scrolled && (
          <h2
            className="text-sm font-semibold truncate max-w-[200px]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {listing.title}
          </h2>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: scrolled ? 'var(--color-bg)' : 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Paylaş"
          >
            <Share2 size={16} color={scrolled ? 'var(--color-text-primary)' : 'white'} />
          </button>
          <button
            onClick={() => toggleFavorite(listing.id)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: scrolled ? 'var(--color-bg)' : 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Favorilere ekle"
          >
            <Heart
              size={16}
              fill={isFavorite(listing.id) ? '#EF4444' : 'transparent'}
              color={isFavorite(listing.id) ? '#EF4444' : scrolled ? 'var(--color-text-primary)' : 'white'}
            />
          </button>
        </div>
      </div>

      {/* Hero Image Carousel */}
      <div
        className="relative aspect-[4/3] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentImage]?.url}
          alt={listing.title}
          className="w-full h-full object-cover transition-opacity duration-300 ease-in-out"
          loading="lazy"
          onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1'; }}
          style={{ opacity: 0 }}
          onError={(e) => { const t = e.target as HTMLImageElement; t.style.opacity = '1'; if (!t.src.startsWith('data:')) t.src = IMAGE_FALLBACK_LARGE; }}
        />
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImage((p) => (p > 0 ? p - 1 : images.length - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.85)' }}
              aria-label="Önceki fotoğraf"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentImage((p) => (p < images.length - 1 ? p + 1 : 0))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.85)' }}
              aria-label="Sonraki fotoğraf"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
        {/* Counter */}
        <div
          className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
        >
          {currentImage + 1}/{images.length}
        </div>
        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className="rounded-full transition-all"
                aria-label={`Fotoğraf ${idx + 1}`}
                style={{
                  width: idx === currentImage ? 16 : 6,
                  height: 6,
                  background: idx === currentImage ? 'white' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-40">
        {/* Title + Rating */}
        <div className="flex items-start justify-between gap-3">
          <h1
            className="text-xl font-bold leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {listing.title}
          </h1>
          {listing.rating > 0 && (
            <div className="flex items-center gap-1 shrink-0 mt-1">
              <Star size={14} fill="var(--color-warning)" color="var(--color-warning)" />
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {listing.rating.toFixed(1)}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                ({listing.review_count})
              </span>
            </div>
          )}
        </div>

        {/* Location + University Distance */}
        <div className="flex items-center gap-1.5 mt-2">
          <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {listing.city?.name}{listing.neighborhood ? `, ${listing.neighborhood.name}` : ''}
          </span>
        </div>
        {listing.university_name && (
          <div className="flex items-center gap-1.5 mt-1">
            <GraduationCap size={14} style={{ color: 'var(--color-info)' }} />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {listing.university_name}
              {listing.university_distance_km != null && ` — ${listing.university_distance_km} km`}
            </span>
          </div>
        )}

        {/* Price */}
        <div
          className="mt-4 p-3 rounded-xl flex items-baseline gap-1"
          style={{ background: 'rgba(242,101,34,0.08)' }}
        >
          <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {formatCurrency(listing.price_per_month, listing.currency)}
          </span>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            /ay
          </span>
        </div>

        {/* Host Card */}
        <div
          className="mt-6 p-4 rounded-2xl flex items-center gap-3"
          style={{
            background: 'var(--color-bg-card)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full overflow-hidden shrink-0"
            style={{ background: 'var(--color-bg)' }}
          >
            {listing.host?.avatar_url ? (
              <img src={listing.host.avatar_url} alt={listing.host?.full_name ?? 'Ev sahibi'} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=K&background=F26522&color=fff&size=200'; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                {listing.host?.full_name?.charAt(0) || 'H'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {listing.host?.full_name || 'Ev Sahibi'}
              </span>
              {listing.host?.is_verified && (
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                  style={{ background: 'var(--color-primary)', color: 'white' }}
                >
                  Superhost
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={11} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Ev sahibi
              </span>
            </div>
          </div>
          <button
            onClick={() => router.push(`/messages/new?to=${listing.host_id}&listing=${listing.id}`)}
            className="px-3 py-2 rounded-xl text-xs font-semibold shrink-0"
            style={{
              background: 'var(--color-secondary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            <MessageCircle size={14} className="inline mr-1" />
            Mesaj
          </button>
        </div>

        {/* Features Grid */}
        <div className="mt-6">
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Özellikler
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <FeatureItem
              icon={<Home size={18} />}
              label={ROOM_TYPE_LABELS[listing.room_type] ?? listing.room_type}
            />
            <FeatureItem
              icon={<Users size={18} />}
              label={`Max ${listing.max_guests} kişi`}
            />
            <FeatureItem
              icon={<Sofa size={18} />}
              label={listing.is_furnished ? 'Eşyalı' : 'Eşyasız'}
            />
            {listing.amenities?.slice(0, 3).map((am) => (
              <FeatureItem
                key={am}
                icon={AMENITY_ICONS[am] || <Check size={18} />}
                label={AMENITY_LABELS[am] || am}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mt-6">
            <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Açıklama
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {displayDesc}
              {isLongDesc && !showFullDesc && '...'}
            </p>
            {isLongDesc && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="flex items-center gap-1 mt-2 text-sm font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                {showFullDesc ? 'Daha az göster' : 'Devamını oku'}
                {showFullDesc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        )}

        {/* Included Utilities */}
        {listing.included_utilities?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Fiyata Dahil
            </h2>
            <div className="flex flex-col gap-2">
              {listing.included_utilities.map((util) => (
                <div key={util} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(34,197,94,0.15)' }}
                  >
                    <Check size={12} style={{ color: 'var(--color-success)' }} />
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {util}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Mini Map */}
        <div className="mt-6">
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Konum
          </h2>
          <div
            className="w-full h-40 rounded-2xl overflow-hidden relative"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <ListingMap
              listings={[{
                id: listing.id,
                title: listing.title,
                price_per_month: listing.price_per_month,
                lat: listing.latitude,
                lng: listing.longitude,
                currency: listing.currency,
              }]}
              singlePin
              height="160px"
            />
          </div>
        </div>

        {/* Availability Calendar */}
        <div className="mt-6">
          <h2 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Calendar size={18} /> Müsaitlik
          </h2>
          <div className="space-y-2">
            {(() => {
              const now = new Date();
              const months = [];
              for (let i = 0; i < 3; i++) {
                const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
                months.push({
                  key: `${d.getFullYear()}-${d.getMonth()}`,
                  name: d.toLocaleDateString('tr-TR', { month: 'long' }),
                });
              }
              return months.map((month) => (
                <div key={month.key} className="flex items-center gap-3">
                  <span className="text-sm w-16 capitalize" style={{ color: 'var(--color-text-secondary)' }}>{month.name}</span>
                  <div className="flex-1 h-3 rounded-full" style={{ background: 'var(--color-success)', opacity: 0.7 }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Müsait</span>
                </div>
              ));
            })()}
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Kesin müsaitlik için ev sahibiyle iletişime geçin
          </p>
        </div>

        {/* Reviews */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Değerlendirmeler
              {listing.review_count > 0 && (
                <span className="ml-1 text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>
                  ({listing.review_count})
                </span>
              )}
            </h2>
            {user &&
              user.id !== listing.host_id &&
              !listing.reviews?.some((r) => r.user_id === user.id) && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: 'var(--color-bg)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
                }}
              >
                Yorum Yaz
              </button>
            )}
          </div>

          {/* Rating Summary */}
          {listing.reviews?.length > 0 && (() => {
            const reviews = listing.reviews;
            const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            return (
              <div className="flex items-center gap-4 mb-4 p-4 rounded-2xl"
                style={{ background: 'var(--color-bg)' }}>
                <div className="text-center">
                  <div className="text-3xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} fill={s <= Math.round(averageRating) ? '#F59E0B' : 'none'}
                        stroke="#F59E0B" />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {reviews.length} değerlendirme
                  </p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5,4,3,2,1].map(n => {
                    const count = reviews.filter(r => Math.round(r.rating) === n).length;
                    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={n} className="flex items-center gap-2">
                        <span className="text-xs w-3">{n}</span>
                        <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--color-border)' }}>
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Review Form */}
          {showReviewForm && (
            <div
              className="mb-4 p-4 rounded-xl animate-fade-in-up"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)} aria-label={`${s} yıldız`}>
                    <Star
                      size={24}
                      fill={s <= reviewRating ? 'var(--color-warning)' : 'transparent'}
                      color="var(--color-warning)"
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Deneyiminizi paylaşın..."
                rows={3}
                className="w-full p-3 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="mt-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: 'var(--color-primary)', color: 'white' }}
              >
                {submittingReview ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
              </button>
            </div>
          )}

          {/* Review List */}
          {listing.reviews?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {listing.reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-3 rounded-xl"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'var(--color-bg)', color: 'var(--color-primary)' }}
                    >
                      {review.user?.full_name?.charAt(0) || 'K'}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {review.user?.full_name || 'Kullanıcı'}
                      </p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            fill={i < review.rating ? 'var(--color-warning)' : 'transparent'}
                            color="var(--color-warning)"
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(review.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Henüz değerlendirme yok
            </p>
          )}
        </div>

        {/* Similar Listings */}
        {similarListings.length > 0 && (
          <div className="mt-6">
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Benzer İlanlar
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {similarListings.map((sl) => {
                const coverImg = getCoverImage(sl);
                return (
                  <Link
                    key={sl.id}
                    href={`/listing/${sl.id}`}
                    className="shrink-0 w-[200px] rounded-xl overflow-hidden"
                    style={{
                      background: 'var(--color-bg-card)',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    <div className="aspect-[3/2] overflow-hidden">
                      <img src={coverImg} alt={sl.title} className="w-full h-full object-cover" loading="lazy" onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.startsWith('data:')) t.src = IMAGE_FALLBACK; }} />
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {sl.title}
                      </p>
                      <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--color-primary)' }}>
                        {formatCurrency(sl.price_per_month, sl.currency)}/ay
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Share Toast */}
      {shareToast && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-medium animate-fade-in-up"
          style={{ background: 'var(--color-secondary)', color: 'var(--color-text-inverse)', boxShadow: 'var(--shadow-card)' }}
        >
          Link kopyalandı!
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] px-4 py-3 flex items-center justify-between"
        style={{
          background: 'var(--color-bg, #ffffff)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--color-border)',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          isolation: 'isolate',
        }}
      >
        <div>
          <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {formatCurrency(listing.price_per_month, listing.currency)}
          </span>
          <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
            /ay
          </span>
        </div>
        <Link
          href={`/booking?listingId=${listing.id}`}
          className="px-8 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
          style={{
            background: 'var(--gradient-primary)',
            color: 'var(--color-text-inverse)',
          }}
        >
          Rezervasyon Yap
        </Link>
      </div>
    </div>
  );
}

function FeatureItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
      <span className="text-[11px] font-medium leading-tight" style={{ color: 'var(--color-text-primary)' }}>
        {label}
      </span>
    </div>
  );
}
