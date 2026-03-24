'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, User, CreditCard, CheckCircle,
  ChevronRight, MapPin, Star, Loader2, AlertCircle,
  Clock, XCircle, CheckCircle2, Search,
} from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useBooking } from '@/hooks/useBooking';
import { useAuth } from '@/hooks/useAuth';
import { getRoomPlaceholder } from '@/lib/image-utils';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import type { ListingWithDetails, BookingInsert, BookingStatus } from '@/lib/database.types';
import { IMAGE_FALLBACK } from '@/lib/image-utils';

const CURRENCY_LABELS: Record<string, string> = {
  TRY: '₺',
  EUR: '₺',
  USD: '$',
  GBP: '£',
};
const displayCurrency = (code: string | null | undefined) => {
  if (!code) return '₺';
  return CURRENCY_LABELS[code] ?? code;
};

const STEPS = [
  { num: 1, title: 'Tarih', icon: <Calendar size={16} /> },
  { num: 2, title: 'Bilgiler', icon: <User size={16} /> },
  { num: 3, title: 'Ödeme', icon: <CreditCard size={16} /> },
  { num: 4, title: 'Onay', icon: <CheckCircle size={16} /> },
];

const SERVICE_FEE_RATE = 0.03;

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Onay Bekliyor', color: 'var(--color-warning)', icon: Clock },
  confirmed: { label: 'Onaylandı', color: 'var(--color-success)', icon: CheckCircle2 },
  cancelled: { label: 'İptal Edildi', color: 'var(--color-error)', icon: XCircle },
  completed: { label: 'Tamamlandı', color: 'var(--color-info)', icon: CheckCircle },
};

export default function BookingPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="min-h-dvh flex items-center justify-center max-w-[430px] mx-auto"><Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} /></div>}>
        <BookingContent />
      </Suspense>
    </AuthGuard>
  );
}

function BookingContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId') || '';

  if (listingId) {
    return <BookingForm />;
  }

  return <MyBookings />;
}

function MyBookings() {
  const router = useRouter();
  const { user } = useAuth();
  const { bookings, loading, fetchUserBookings } = useBooking(user?.id);

  useEffect(() => {
    if (user?.id) fetchUserBookings();
  }, [user?.id, fetchUserBookings]);

  return (
    <div
      className="min-h-dvh flex flex-col max-w-[430px] mx-auto pb-24"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-3"
        style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Rezervasyonlarım
        </h1>
      </div>

      <div className="flex-1 px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(242,101,34,0.1)' }}
            >
              <Calendar size={28} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Henüz rezervasyonunuz yok
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                İlanları keşfedip ilk rezervasyonunuzu oluşturun
              </p>
            </div>
            <button
              onClick={() => router.push('/search')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              <Search size={16} />
              İlanları Keşfet
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => {
              const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              const coverImg = b.listing?.images?.find((i: { is_cover?: boolean }) => i.is_cover)?.url
                || b.listing?.images?.[0]?.url
                || getRoomPlaceholder(b.listing_id);

              return (
                <Link
                  key={b.id}
                  href={`/booking/success?bookingId=${b.id}`}
                  className="flex gap-3 p-3 rounded-xl transition-transform active:scale-[0.98]"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={coverImg}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.includes('placehold.co')) t.src = IMAGE_FALLBACK; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {b.listing?.title || 'İlan'}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(b.check_in).toLocaleDateString('tr-TR')} - {new Date(b.check_out).toLocaleDateString('tr-TR')}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <StatusIcon size={13} style={{ color: status.color }} />
                      <span className="text-xs font-medium" style={{ color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
                      {b.total_price?.toLocaleString('tr-TR')} {displayCurrency(b.listing?.currency)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const listingId = searchParams.get('listingId') || '';
  const { user, profile } = useAuth();
  const { getById, loading: listingLoading } = useListings();
  const { create, loading: bookingLoading } = useBooking(user?.id);

  const [listing, setListing] = useState<ListingWithDetails | null>(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestName, setGuestName] = useState(profile?.full_name || '');
  const [guestEmail, setGuestEmail] = useState(profile?.email || user?.email || '');
  const [guestPhone, setGuestPhone] = useState(profile?.phone || '');
  const [guestUniversity, setGuestUniversity] = useState(profile?.university || '');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (listingId) {
      getById(listingId).then((data) => {
        if (data) setListing(data);
      });
    }
  }, [listingId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (profile) {
      if (!guestName && profile.full_name) setGuestName(profile.full_name);
      if (!guestEmail && profile.email) setGuestEmail(profile.email);
      if (!guestPhone && profile.phone) setGuestPhone(profile.phone);
      if (!guestUniversity && profile.university) setGuestUniversity(profile.university);
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Price calculation */
  const priceCalc = useMemo(() => {
    if (!listing || !checkIn || !checkOut) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.max(Math.ceil(diffDays / 30), 1);
    const rent = listing.price_per_month * months;
    const serviceFee = Math.round(rent * SERVICE_FEE_RATE);
    const total = rent + serviceFee;
    return { months, rent, serviceFee, total };
  }, [listing, checkIn, checkOut]);

  /* Validation */
  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (!checkIn) errs.checkIn = 'Giriş tarihi seçin';
      if (!checkOut) errs.checkOut = 'Çıkış tarihi seçin';
      if (checkIn && checkOut && new Date(checkIn) >= new Date(checkOut)) {
        errs.checkOut = 'Çıkış tarihi giriş tarihinden sonra olmalı';
      }
    }
    if (s === 2) {
      if (!guestName.trim()) errs.guestName = 'Ad soyad gerekli';
      if (!guestEmail.trim()) errs.guestEmail = 'E-posta gerekli';
      if (!guestPhone.trim()) errs.guestPhone = 'Telefon gerekli';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const handleConfirm = async () => {
    if (!user || !listing || !priceCalc) return;

    if (!paymentConfirmed) {
      // Show payment confirmation step
      setPaymentConfirmed(true);
      return;
    }

    const input: BookingInsert = {
      user_id: user.id,
      listing_id: listing.id,
      host_id: listing.host_id,
      check_in: checkIn,
      check_out: checkOut,
      total_price: priceCalc.total,
      service_fee: priceCalc.serviceFee,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      guest_university: guestUniversity || null,
      special_requests: specialRequests || null,
      status: 'pending',
    };

    const result = await create(input);
    if (result.data) {
      router.push(`/booking/success?bookingId=${result.data.id}`);
    } else {
      setErrors({ submit: result.error || 'Bir hata oluştu' });
      setPaymentConfirmed(false);
    }
  };

  if (listingLoading && !listing) {
    return (
      <div className="min-h-dvh flex items-center justify-center max-w-[430px] mx-auto">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 max-w-[430px] mx-auto px-4">
        <AlertCircle size={40} style={{ color: 'var(--color-error)' }} />
        <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          İlan bulunamadı
        </p>
        <button
          onClick={() => router.push('/search')}
          className="px-6 py-2.5 rounded-full text-sm font-semibold"
          style={{ background: 'var(--color-primary)', color: 'white' }}
        >
          İlanlara Dön
        </button>
      </div>
    );
  }

  const coverImg = listing.images?.find((i) => i.is_cover)?.url
    || listing.images?.[0]?.url
    || getRoomPlaceholder(listing.id);

  return (
    <div
      className="min-h-dvh flex flex-col max-w-[430px] mx-auto"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-3"
        style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => (step === 1 ? router.back() : prevStep())}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-bg)' }}
            aria-label="Geri"
          >
            <ArrowLeft size={18} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <h1 className="flex-1 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Rezervasyon
          </h1>
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {step}/4
          </span>
        </div>

        {/* Progress */}
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{
                background: s.num <= step ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className="flex items-center gap-1 text-[10px] font-medium"
              style={{
                color: s.num === step ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              {s.icon}
              {s.title}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 pb-28">
        {/* Listing Summary Card (shown in step 1) */}
        {step === 1 && (
          <div
            className="flex gap-3 p-3 rounded-xl mb-5"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <img src={coverImg} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.includes('placehold.co')) t.src = IMAGE_FALLBACK; }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                {listing.title}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-[11px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {listing.city?.name}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                  {listing.price_per_month.toLocaleString('tr-TR')} {displayCurrency(listing.currency)}/ay
                </span>
                {listing.rating > 0 && (
                  <div className="flex items-center gap-0.5">
                    <Star size={10} fill="var(--color-warning)" color="var(--color-warning)" />
                    <span className="text-[10px] font-semibold">{listing.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Tarih Seçimi
            </h2>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Giriş Tarihi *
              </label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => { setCheckIn(e.target.value); setErrors((p) => ({ ...p, checkIn: '' })); }}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--color-bg)',
                  border: `1px solid ${errors.checkIn ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
              />
              {errors.checkIn && <p className="text-[11px] mt-1" style={{ color: 'var(--color-error)' }}>{errors.checkIn}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Çıkış Tarihi *
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split('T')[0]}
                onChange={(e) => { setCheckOut(e.target.value); setErrors((p) => ({ ...p, checkOut: '' })); }}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--color-bg)',
                  border: `1px solid ${errors.checkOut ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
              />
              {errors.checkOut && <p className="text-[11px] mt-1" style={{ color: 'var(--color-error)' }}>{errors.checkOut}</p>}
            </div>

            {priceCalc && (
              <div
                className="p-3 rounded-xl"
                style={{ background: 'rgba(242,101,34,0.06)', border: '1px solid rgba(242,101,34,0.15)' }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Tahmini: {priceCalc.months} ay x {listing.price_per_month.toLocaleString('tr-TR')} {displayCurrency(listing.currency)}
                </p>
                <p className="text-lg font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
                  Toplam: {priceCalc.total.toLocaleString('tr-TR')} {displayCurrency(listing.currency)}
                </p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Kişisel Bilgiler
            </h2>
            <BookingInput
              label="Ad Soyad *"
              value={guestName}
              onChange={setGuestName}
              error={errors.guestName}
              placeholder="Adınız ve soyadınız"
            />
            <BookingInput
              label="E-posta *"
              value={guestEmail}
              onChange={setGuestEmail}
              error={errors.guestEmail}
              placeholder="ornek@email.com"
              type="email"
            />
            <BookingInput
              label="Telefon *"
              value={guestPhone}
              onChange={setGuestPhone}
              error={errors.guestPhone}
              placeholder="+90 5XX XXX XX XX"
              type="tel"
            />
            <BookingInput
              label="Üniversite"
              value={guestUniversity}
              onChange={setGuestUniversity}
              placeholder="Üniversite adı (opsiyonel)"
            />
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Özel İstekler
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Varsa özel isteklerinizi yazın..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>
        )}

        {step === 3 && priceCalc && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Ödeme Özeti
            </h2>

            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              {/* Listing mini */}
              <div className="flex items-center gap-3 pb-3 mb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                  <img src={coverImg} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.includes('placehold.co')) t.src = IMAGE_FALLBACK; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {listing.title}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(checkIn).toLocaleDateString('tr-TR')} - {new Date(checkOut).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Kira ({priceCalc.months} ay x {listing.price_per_month.toLocaleString('tr-TR')} {displayCurrency(listing.currency)})
                  </span>
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {priceCalc.rent.toLocaleString('tr-TR')} {displayCurrency(listing.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Hizmet bedeli (%3)
                  </span>
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {priceCalc.serviceFee.toLocaleString('tr-TR')} {displayCurrency(listing.currency)}
                  </span>
                </div>
                <div
                  className="flex justify-between text-base font-bold pt-2.5"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <span style={{ color: 'var(--color-text-primary)' }}>Toplam</span>
                  <span style={{ color: 'var(--color-primary)' }}>
                    {priceCalc.total.toLocaleString('tr-TR')} {displayCurrency(listing.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="flex items-start gap-2 p-3 rounded-xl"
              style={{ background: 'rgba(59,130,246,0.08)' }}
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--color-info)' }} />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Ödeme, ev sahibinin onayından sonra gerçekleştirilecektir. Onay sonrası detaylı ödeme bilgileri tarafınıza iletilecektir.
              </p>
            </div>
          </div>
        )}

        {step === 4 && priceCalc && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Rezervasyon Onayı
            </h2>

            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <SummaryRow label="İlan" value={listing.title} />
              <SummaryRow label="Konum" value={listing.city?.name || ''} />
              <SummaryRow
                label="Tarih"
                value={`${new Date(checkIn).toLocaleDateString('tr-TR')} - ${new Date(checkOut).toLocaleDateString('tr-TR')}`}
              />
              <SummaryRow label="Misafir" value={guestName} />
              <SummaryRow label="E-posta" value={guestEmail} />
              <SummaryRow label="Telefon" value={guestPhone} />
              {guestUniversity && <SummaryRow label="Üniversite" value={guestUniversity} />}
              <div
                className="flex justify-between pt-3 mt-1"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Toplam Tutar
                </span>
                <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>
                  {priceCalc.total.toLocaleString('tr-TR')} {displayCurrency(listing.currency)}
                </span>
              </div>
            </div>

            {errors.submit && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.08)' }}
              >
                <AlertCircle size={16} style={{ color: 'var(--color-error)' }} />
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>{errors.submit}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 px-4 py-3"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--color-border)',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        {step < 4 ? (
          <button
            onClick={nextStep}
            className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{
              background: 'var(--gradient-primary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            Devam Et
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={bookingLoading}
            className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              background: 'var(--gradient-primary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            {bookingLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Rezervasyonu Onayla
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function BookingInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
        style={{
          background: 'var(--color-bg)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          color: 'var(--color-text-primary)',
        }}
      />
      {error && <p className="text-[11px] mt-1" style={{ color: 'var(--color-error)' }}>{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-xs font-medium text-right max-w-[60%] truncate" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </span>
    </div>
  );
}
