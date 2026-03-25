'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ChevronRight, MapPin, Home, DollarSign,
  Camera, Eye, X, GripVertical, Check, Plus, Loader2,
  Wifi, Wind, Tv, Car, UtensilsCrossed, Waves, Sofa, Shield,
  Users, GraduationCap, ImageIcon,
} from 'lucide-react';
import { IMAGE_FALLBACK } from '@/lib/image-utils';
import { useListings } from '@/hooks/useListings';
import { useStorage } from '@/hooks/useStorage';
import { useAuth } from '@/hooks/useAuth';
import { useCities } from '@/hooks/useCities';
import AuthGuard from '@/components/AuthGuard';
import AutocompleteField from '@/components/AutocompleteField';
import { UNIVERSITIES } from '@/lib/universities';
import type { RoomType, ListingInsert, Neighborhood } from '@/lib/database.types';

const STEPS = [
  { num: 1, title: 'Temel Bilgiler', icon: <MapPin size={18} /> },
  { num: 2, title: 'Detaylar', icon: <Home size={18} /> },
  { num: 3, title: 'Fotoğraflar', icon: <Camera size={18} /> },
  { num: 4, title: 'Önizleme', icon: <Eye size={18} /> },
];

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'studio', label: 'Stüdyo' },
  { value: 'single', label: 'Tek Kişilik' },
  { value: 'shared', label: 'Paylaşımlı' },
  { value: 'apartment', label: 'Daire' },
];

const AMENITIES_LIST = [
  { key: 'wifi', label: 'WiFi', icon: <Wifi size={16} /> },
  { key: 'klima', label: 'Klima', icon: <Wind size={16} /> },
  { key: 'tv', label: 'TV', icon: <Tv size={16} /> },
  { key: 'otopark', label: 'Otopark', icon: <Car size={16} /> },
  { key: 'mutfak', label: 'Mutfak', icon: <UtensilsCrossed size={16} /> },
  { key: 'camasir', label: 'Çamaşır Makinesi', icon: <Waves size={16} /> },
  { key: 'esyali', label: 'Eşyalı', icon: <Sofa size={16} /> },
  { key: 'guvenlik', label: 'Güvenlik', icon: <Shield size={16} /> },
];

const INCLUDED_OPTIONS = [
  'Elektrik', 'Su', 'Doğalgaz', 'İnternet', 'Apartman aidatı', 'Temizlik',
];

interface FormData {
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  address: string;
  universityName: string;
  universityDistance: string;
  roomType: RoomType;
  price: string;
  isFurnished: boolean;
  amenities: string[];
  includedUtilities: string[];
  maxGuests: string;
}

interface UploadedImage {
  file?: File;
  url: string;
  path?: string;
  preview: string;
}

export default function NewListingPage() {
  return (
    <AuthGuard>
      <NewListingForm />
    </AuthGuard>
  );
}

function NewListingForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { create, insertImages } = useListings();
  const { upload } = useStorage();
  const { cities, fetchCities, getNeighborhoods } = useCities();
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleCityChange = async (cityId: string) => {
    updateForm('city', cityId);
    updateForm('neighborhood', '');
    if (cityId) {
      const result = await getNeighborhoods(cityId);
      setNeighborhoods(result.data ?? []);
    } else {
      setNeighborhoods([]);
    }
  };

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    city: '',
    neighborhood: '',
    address: '',
    universityName: '',
    universityDistance: '',
    roomType: 'single',
    price: '',
    isFurnished: false,
    amenities: [],
    includedUtilities: [],
    maxGuests: '1',
  });

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const updateForm = (key: keyof FormData, value: unknown) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: '' }));
  };

  const toggleArrayItem = (key: 'amenities' | 'includedUtilities', item: string) => {
    setForm((p) => {
      const arr = p[key];
      return {
        ...p,
        [key]: arr.includes(item) ? arr.filter((a) => a !== item) : [...arr, item],
      };
    });
  };

  /* Validation */
  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (!form.title.trim()) errs.title = 'Başlık gerekli';
      if (!form.city.trim()) errs.city = 'Şehir gerekli';
    }
    if (s === 2) {
      if (!form.price || Number(form.price) <= 0) errs.price = 'Geçerli bir fiyat girin';
    }
    if (s === 3) {
      if (images.length === 0) errs.images = 'En az 1 fotoğraf ekleyin';
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

  /* Image handling */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - images.length;
    const toAdd = files.slice(0, remaining);

    const newImages: UploadedImage[] = toAdd.map((file) => ({
      file,
      url: '',
      preview: URL.createObjectURL(file),
    }));

    setImages((p) => [...p, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setImages((p) => p.filter((_, i) => i !== idx));
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  /* Submit */
  const handlePublish = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      // 1. Upload images
      const uploadedUrls: string[] = [];
      for (const img of images) {
        if (img.file) {
          const result = await upload(img.file, 'listings', user.id);
          if (result.data) {
            uploadedUrls.push(result.data.url);
          }
        } else if (img.url) {
          uploadedUrls.push(img.url);
        }
      }

      // 2. Create listing
      const input: ListingInsert = {
        host_id: user.id,
        city_id: form.city, // In production, this would be selected from a dropdown of cities
        title: form.title,
        description: form.description || null,
        address: form.address || null,
        price_per_month: Number(form.price),
        currency: 'TL',
        room_type: form.roomType,
        max_guests: Number(form.maxGuests) || 1,
        is_furnished: form.isFurnished,
        amenities: form.amenities,
        included_utilities: form.includedUtilities,
        university_name: form.universityName || null,
        university_distance_km: form.universityDistance ? Number(form.universityDistance) : null,
      };

      const result = await create(input);

      if (result.data) {
        // 3. Insert images
        if (uploadedUrls.length > 0) {
          await insertImages(result.data.id, uploadedUrls);
        }

        router.push(`/listing/${result.data.id}`);
      }
    } catch {
      setErrors({ submit: 'Bir hata oluştu. Tekrar deneyin.' });
    } finally {
      setSubmitting(false);
    }
  };

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
            İlan Oluştur
          </h1>
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {step}/4
          </span>
        </div>

        {/* Progress bar */}
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

        {/* Step labels */}
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
              <span className="hidden min-[380px]:inline">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 pb-28">
        {step === 1 && (
          <Step1
            form={form}
            errors={errors}
            updateForm={updateForm}
            cities={cities}
            neighborhoods={neighborhoods}
            onCityChange={handleCityChange}
          />
        )}
        {step === 2 && (
          <Step2
            form={form}
            errors={errors}
            updateForm={updateForm}
            toggleArrayItem={toggleArrayItem}
          />
        )}
        {step === 3 && (
          <Step3
            images={images}
            errors={errors}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
            onRemove={removeImage}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          />
        )}
        {step === 4 && (
          <Step4 form={form} images={images} />
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
        {errors.submit && (
          <p className="text-xs text-center mb-2" style={{ color: 'var(--color-error)' }}>
            {errors.submit}
          </p>
        )}
        {step < 4 ? (
          <button
            onClick={nextStep}
            className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
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
            onClick={handlePublish}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'var(--gradient-primary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Yayınlanıyor...
              </>
            ) : (
              <>
                <Check size={16} />
                İlanı Yayınla
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────── Step Components ──────────── */

function Step1({
  form,
  errors,
  updateForm,
  cities,
  neighborhoods,
  onCityChange,
}: {
  form: FormData;
  errors: Record<string, string>;
  updateForm: (key: keyof FormData, value: unknown) => void;
  cities: import('@/lib/database.types').City[];
  neighborhoods: Neighborhood[];
  onCityChange: (cityId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5 animate-fade-in-up">
      <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Temel Bilgiler
      </h2>
      <InputField
        label="Başlık *"
        placeholder="Örn: Merkezi konumda ferah stüdyo daire"
        value={form.title}
        onChange={(v) => updateForm('title', v)}
        error={errors.title}
      />
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          Açıklama
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateForm('description', e.target.value)}
          placeholder="İlanınızı detaylı anlatın..."
          rows={4}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
          style={{
            background: 'var(--color-bg)',
            border: `1px solid ${errors.description ? 'var(--color-error)' : 'var(--color-border)'}`,
            color: 'var(--color-text-primary)',
          }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          Şehir *
        </label>
        <select
          value={form.city}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--color-bg)',
            border: `1px solid ${errors.city ? 'var(--color-error)' : 'var(--color-border)'}`,
            color: form.city ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          }}
        >
          <option value="">Şehir seçin</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}, {c.country}</option>
          ))}
        </select>
        {errors.city && (
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-error)' }}>{errors.city}</p>
        )}
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          Mahalle
        </label>
        <select
          value={form.neighborhood}
          onChange={(e) => updateForm('neighborhood', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: form.neighborhood ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          }}
          disabled={!form.city}
        >
          <option value="">{form.city ? 'Mahalle seçin' : 'Önce şehir seçin'}</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>{n.name}</option>
          ))}
        </select>
      </div>
      <InputField
        label="Adres"
        placeholder="Tam adres"
        value={form.address}
        onChange={(v) => updateForm('address', v)}
      />
      <AutocompleteField
        label="Yakın Üniversite"
        placeholder="Üniversite seçin veya yazın"
        value={form.universityName}
        onChange={(v) => updateForm('universityName', v)}
        options={UNIVERSITIES}
        icon={<GraduationCap size={16} />}
        allowCustom
      />
      <InputField
        label="Üniversiteye Uzaklık (km)"
        placeholder="Örn: 2.5"
        value={form.universityDistance}
        onChange={(v) => updateForm('universityDistance', v)}
        type="number"
      />
    </div>
  );
}

function Step2({
  form,
  errors,
  updateForm,
  toggleArrayItem,
}: {
  form: FormData;
  errors: Record<string, string>;
  updateForm: (key: keyof FormData, value: unknown) => void;
  toggleArrayItem: (key: 'amenities' | 'includedUtilities', item: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5 animate-fade-in-up">
      <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
        İlan Detayları
      </h2>

      {/* Room Type */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Oda Tipi
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ROOM_TYPES.map((rt) => (
            <button
              key={rt.value}
              onClick={() => updateForm('roomType', rt.value)}
              className="px-3 py-3 rounded-xl text-sm font-medium transition-colors text-center"
              style={{
                background: form.roomType === rt.value ? 'var(--color-primary)' : 'var(--color-bg)',
                color: form.roomType === rt.value ? 'white' : 'var(--color-text-primary)',
                border: `1px solid ${form.roomType === rt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              {rt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <InputField
        label="Aylık Kira (TL) *"
        placeholder="Örn: 8500"
        value={form.price}
        onChange={(v) => updateForm('price', v)}
        error={errors.price}
        type="number"
        icon={<DollarSign size={16} />}
      />

      {/* Max Guests */}
      <InputField
        label="Maksimum Misafir"
        placeholder="1"
        value={form.maxGuests}
        onChange={(v) => updateForm('maxGuests', v)}
        type="number"
        icon={<Users size={16} />}
      />

      {/* Furnished Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Eşyalı mı?
        </label>
        <button
          onClick={() => updateForm('isFurnished', !form.isFurnished)}
          className="w-12 h-7 rounded-full relative transition-colors"
          style={{
            background: form.isFurnished ? 'var(--color-primary)' : 'var(--color-border)',
          }}
        >
          <div
            className="w-5 h-5 rounded-full absolute top-1 transition-all"
            style={{
              background: 'white',
              left: form.isFurnished ? 26 : 4,
              boxShadow: 'var(--shadow-sm)',
            }}
          />
        </button>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Özellikler
        </label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES_LIST.map((am) => {
            const selected = form.amenities.includes(am.key);
            return (
              <button
                key={am.key}
                onClick={() => toggleArrayItem('amenities', am.key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors"
                style={{
                  background: selected ? 'var(--color-secondary)' : 'var(--color-bg)',
                  color: selected ? 'white' : 'var(--color-text-primary)',
                  border: `1px solid ${selected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                }}
              >
                {am.icon}
                {am.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Included Utilities */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Fiyata Dahil Olanlar
        </label>
        <div className="flex flex-wrap gap-2">
          {INCLUDED_OPTIONS.map((opt) => {
            const selected = form.includedUtilities.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggleArrayItem('includedUtilities', opt)}
                className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-colors"
                style={{
                  background: selected ? 'rgba(34,197,94,0.15)' : 'var(--color-bg)',
                  color: selected ? 'var(--color-success)' : 'var(--color-text-primary)',
                  border: `1px solid ${selected ? 'var(--color-success)' : 'var(--color-border)'}`,
                }}
              >
                {selected && <Check size={12} />}
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step3({
  images,
  errors,
  fileInputRef,
  onFileSelect,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
}: {
  images: UploadedImage[];
  errors: Record<string, string>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (idx: number) => void;
  onDragStart: (idx: number) => void;
  onDragOver: (e: React.DragEvent, idx: number) => void;
  onDragEnd: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 animate-fade-in-up">
      <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Fotoğraflar
      </h2>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        En fazla 10 fotoğraf ekleyebilirsiniz. İlk fotoğraf kapak fotoğrafı olarak kullanılır. Sıralamayı sürükleyerek değiştirebilirsiniz.
      </p>

      {errors.images && (
        <p className="text-xs" style={{ color: 'var(--color-error)' }}>{errors.images}</p>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={(e) => onDragOver(e, idx)}
            onDragEnd={onDragEnd}
            className="relative aspect-square rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <img src={img.preview || img.url} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.startsWith('data:')) t.src = IMAGE_FALLBACK; }} />
            {idx === 0 && (
              <span
                className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                style={{ background: 'var(--color-primary)', color: 'white' }}
              >
                Kapak
              </span>
            )}
            <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onRemove(idx)}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)' }}
                aria-label="Fotoğrafı kaldır"
              >
                <X size={12} color="white" />
              </button>
            </div>
            <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-60 transition-opacity">
              <GripVertical size={14} color="white" />
            </div>
          </div>
        ))}

        {/* Add Button */}
        {images.length < 10 && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1"
            style={{
              background: 'var(--color-bg)',
              border: '2px dashed var(--color-border)',
            }}
          >
            <Plus size={20} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Ekle
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={onFileSelect}
      />

      {images.length === 0 && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-12 rounded-2xl flex flex-col items-center gap-3"
          style={{
            background: 'var(--color-bg)',
            border: '2px dashed var(--color-border)',
          }}
        >
          <ImageIcon size={40} style={{ color: 'var(--color-text-muted)' }} />
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Fotoğraf Yükle
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              JPG, PNG veya WebP - Max 5MB
            </p>
          </div>
        </button>
      )}
    </div>
  );
}

function Step4({ form, images }: { form: FormData; images: UploadedImage[] }) {
  return (
    <div className="flex flex-col gap-5 animate-fade-in-up">
      <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Önizleme
      </h2>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        İlanınızı kontrol edin ve yayınlayın.
      </p>

      {/* Preview Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--color-bg-card)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Image */}
        {images.length > 0 ? (
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={images[0].preview || images[0].url}
              alt="preview"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.startsWith('data:')) t.src = IMAGE_FALLBACK; }}
            />
          </div>
        ) : (
          <div
            className="aspect-[4/3] flex items-center justify-center"
            style={{ background: 'var(--color-bg)' }}
          >
            <ImageIcon size={48} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        )}

        <div className="p-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {form.title || 'İlan Başlığı'}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={12} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {form.city || 'Şehir'}{form.neighborhood ? `, ${form.neighborhood}` : ''}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {form.price ? Number(form.price).toLocaleString('tr-TR') : '0'} TL
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>/ay</span>
          </div>

          {/* Details */}
          <div
            className="mt-3 pt-3 flex flex-wrap gap-2"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <span
              className="px-2 py-1 rounded-md text-[11px] font-medium"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
            >
              {ROOM_TYPES.find((r) => r.value === form.roomType)?.label}
            </span>
            <span
              className="px-2 py-1 rounded-md text-[11px] font-medium"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
            >
              {form.isFurnished ? 'Eşyalı' : 'Eşyasız'}
            </span>
            <span
              className="px-2 py-1 rounded-md text-[11px] font-medium"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
            >
              Max {form.maxGuests} kişi
            </span>
          </div>

          {form.amenities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {form.amenities.map((am) => (
                <span
                  key={am}
                  className="px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    background: 'rgba(27,42,74,0.08)',
                    color: 'var(--color-secondary)',
                  }}
                >
                  {AMENITIES_LIST.find((a) => a.key === am)?.label || am}
                </span>
              ))}
            </div>
          )}

          {form.includedUtilities.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Fiyata dahil:
              </p>
              <div className="flex flex-wrap gap-1">
                {form.includedUtilities.map((u) => (
                  <span
                    key={u}
                    className="flex items-center gap-0.5 text-[10px]"
                    style={{ color: 'var(--color-success)' }}
                  >
                    <Check size={10} /> {u}
                  </span>
                ))}
              </div>
            </div>
          )}

          {form.description && (
            <p
              className="mt-3 text-xs leading-relaxed line-clamp-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {form.description}
            </p>
          )}
        </div>
      </div>

      {/* Image count */}
      <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
        {images.length} fotoğraf eklendi
      </p>
    </div>
  );
}

/* ──────────── Shared ──────────── */

function InputField({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = 'text',
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--color-bg)',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
            color: 'var(--color-text-primary)',
            paddingLeft: icon ? 36 : 14,
          }}
        />
      </div>
      {error && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-error)' }}>{error}</p>
      )}
    </div>
  );
}
