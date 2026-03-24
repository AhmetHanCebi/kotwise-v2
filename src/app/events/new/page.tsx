'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useCities } from '@/hooks/useCities';
import { useStorage } from '@/hooks/useStorage';
import AuthGuard from '@/components/AuthGuard';
import type { EventCategory } from '@/lib/database.types';
import {
  ArrowLeft,
  Image as ImageIcon,
  MapPin,
  CalendarDays,
  Clock,
  Users,
  X,
  Loader2,
  Type,
  AlignLeft,
  ChevronDown,
} from 'lucide-react';
import { IMAGE_FALLBACK } from '@/lib/image-utils';

const CATEGORIES: { key: EventCategory; label: string }[] = [
  { key: 'coffee', label: 'Kahve Buluşması' },
  { key: 'sports', label: 'Spor' },
  { key: 'language', label: 'Dil Değişimi' },
  { key: 'city_tour', label: 'Şehir Turu' },
  { key: 'party', label: 'Parti' },
  { key: 'study', label: 'Çalışma Grubu' },
  { key: 'food', label: 'Yemek' },
  { key: 'other', label: 'Diğer' },
];

function CreateEventContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { create } = useEvents(user?.id);
  const { cities, selectedCityId, fetchCities } = useCities();
  const { upload, uploading } = useStorage();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('coffee');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [maxParticipants, setMaxParticipants] = useState('');
  const [cityId, setCityId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (selectedCityId) setCityId(selectedCityId);
    else if (cities.length > 0) setCityId(cities[0].id);
  }, [selectedCityId, cities]);

  const handleCoverPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);

    const result = await upload(file, 'posts', user.id);
    if (result.data) setCoverUrl(result.data.url);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !date || !time || !cityId || !user) return;

    const today = new Date().toISOString().split('T')[0];
    if (date < today) return;

    if (maxParticipants && parseInt(maxParticipants) < 2) return;

    setSubmitting(true);

    const result = await create({
      organizer_id: user.id,
      city_id: cityId,
      title: title.trim(),
      category,
      date,
      time,
      location_name: location || null,
      description: description || null,
      image_url: coverUrl,
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
    });

    setSubmitting(false);

    if (!result.error) {
      router.replace('/events');
    }
  };

  const isValid = title.trim() && date && time && cityId;

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
          Etkinlik Oluştur
        </h1>
      </header>

      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* Cover photo */}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPick} />
        {coverPreview ? (
          <div className="relative h-40 rounded-2xl overflow-hidden">
            <img src={coverPreview} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.includes('placehold.co')) t.src = IMAGE_FALLBACK; }} />
            <button
              onClick={() => { setCoverPreview(null); setCoverUrl(null); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <X size={14} style={{ color: '#fff' }} />
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin" style={{ color: '#fff' }} />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="h-32 rounded-2xl flex flex-col items-center justify-center gap-2"
            style={{
              background: 'var(--color-bg-card)',
              border: '2px dashed var(--color-border)',
            }}
          >
            <ImageIcon size={28} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Kapak fotoğrafı ekle
            </span>
          </button>
        )}

        {/* Title */}
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <Type size={18} style={{ color: 'var(--color-primary)' }} />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Etkinlik adı"
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* Category */}
        <div className="flex items-center gap-3 p-3 rounded-xl relative" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <ChevronDown size={18} style={{ color: 'var(--color-primary)' }} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EventCategory)}
            className="flex-1 text-sm outline-none bg-transparent appearance-none"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="flex items-center gap-3 p-3 rounded-xl relative" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <MapPin size={18} style={{ color: 'var(--color-info)' }} />
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent appearance-none"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <CalendarDays size={18} style={{ color: 'var(--color-primary)' }} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <Clock size={18} style={{ color: 'var(--color-primary)' }} />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <MapPin size={18} style={{ color: 'var(--color-success)' }} />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Konum (opsiyonel)"
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* Description */}
        <div className="p-3 rounded-xl" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlignLeft size={18} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Açıklama</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Etkinlik hakkında bilgi ver..."
            rows={4}
            className="w-full text-sm leading-relaxed resize-none outline-none bg-transparent"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* Max participants */}
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <Users size={18} style={{ color: 'var(--color-warning)' }} />
          <input
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            placeholder="Maks katılımcı (opsiyonel)"
            min="2"
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40 mt-2"
          style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
        >
          {submitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            'Etkinlik Oluştur'
          )}
        </button>

        <div className="h-8" />
      </div>
    </div>
  );
}

export default function NewEventPage() {
  return (
    <AuthGuard>
      <CreateEventContent />
    </AuthGuard>
  );
}
