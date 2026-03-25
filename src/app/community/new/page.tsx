'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { useCities } from '@/hooks/useCities';
import { useStorage } from '@/hooks/useStorage';
import AuthGuard from '@/components/AuthGuard';
import {
  ArrowLeft,
  Image as ImageIcon,
  MapPin,
  Hash,
  X,
  Loader2,
} from 'lucide-react';
import { IMAGE_FALLBACK } from '@/lib/image-utils';
import { useEffect } from 'react';

const SUGGESTED_HASHTAGS = [
  'ErasmusHayati', 'OgrenciYasam', 'SehirKesfi',
  'YurtDisiEgitim', 'BursIpuclari', 'YemekTarifleri',
  'KulturSoku', 'Erasmus2026',
];

function NewPostContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { create } = usePosts(user?.id);
  const { cities, selectedCityId, fetchCities } = useCities();
  const { uploadMultiple, uploading } = useStorage();

  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [location, setLocation] = useState('');
  const [cityId, setCityId] = useState<string>('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (selectedCityId) setCityId(selectedCityId);
    else if (cities.length > 0) setCityId(cities[0].id);
  }, [selectedCityId, cities]);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (imageFiles.length + files.length > 5) return;

    const newFiles = files.slice(0, 5 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleHashtag = (tag: string) => {
    setHashtags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!content.trim() || !cityId || !user) return;
    setSubmitting(true);

    let uploadedUrls: string[] = [];
    if (imageFiles.length > 0) {
      const result = await uploadMultiple(imageFiles, 'posts', user.id);
      if (result.data) {
        uploadedUrls = result.data.map((r) => r.url);
      }
    }

    const result = await create({
      user_id: user.id,
      city_id: cityId,
      content: content.trim(),
      images: uploadedUrls,
      location_name: location || null,
      hashtags,
      type: uploadedUrls.length > 0 ? 'photo' : 'text',
    });

    setSubmitting(false);

    if (!result.error) {
      router.replace('/community');
    }
  };

  const isValid = content.trim().length > 0 && cityId;

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
          Yeni Gönderi
        </h1>
        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting || uploading}
          className="px-5 py-2 rounded-full text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
        >
          {submitting || uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            'Paylaş'
          )}
        </button>
      </header>

      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
          >
            {user?.user_metadata?.full_name?.[0] ?? '?'}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {user?.user_metadata?.full_name ?? 'Sen'}
            </p>
            {/* City selector */}
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="text-xs rounded px-1 py-0.5 outline-none"
              style={{
                background: 'var(--color-bg)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ne düşünüyorsun?"
          rows={5}
          className="w-full text-[15px] leading-relaxed resize-none outline-none p-3 rounded-xl"
          style={{
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          }}
          autoFocus
        />

        {/* Image preview */}
        {images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.startsWith('data:')) t.src = IMAGE_FALLBACK; }} />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.6)' }}
                >
                  <X size={12} style={{ color: '#fff' }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div
          className="flex items-center gap-1 p-3 rounded-xl"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImagePick}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={imageFiles.length >= 5}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
            style={{ color: 'var(--color-success)' }}
          >
            <ImageIcon size={20} />
            Foto
          </button>
          <div className="flex-1 flex items-center gap-2">
            <MapPin size={18} style={{ color: 'var(--color-primary)' }} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Konum ekle, ör: Kreuzberg, Berlin"
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Hash size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Hashtagler
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_HASHTAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleHashtag(tag)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: hashtags.includes(tag) ? 'var(--color-primary)' : 'var(--color-bg-card)',
                  color: hashtags.includes(tag) ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                  border: `1px solid ${hashtags.includes(tag) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <AuthGuard>
      <NewPostContent />
    </AuthGuard>
  );
}
