'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useCities } from '@/hooks/useCities';
import BottomNav from '@/components/BottomNav';
import type { EventCategory } from '@/lib/database.types';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Plus,
  CalendarDays,
  MapPin,
  Users,
  List,
  Map,
  Calendar,
  Loader2,
  Coffee,
  Dumbbell,
  Languages,
  Landmark,
  PartyPopper,
  BookOpen,
  UtensilsCrossed,
  MoreHorizontal,
} from 'lucide-react';
import { IMAGE_FALLBACK } from '@/lib/image-utils';

const CATEGORIES: { key: EventCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'Tümü', icon: List },
  { key: 'coffee', label: 'Kahve', icon: Coffee },
  { key: 'sports', label: 'Spor', icon: Dumbbell },
  { key: 'language', label: 'Dil', icon: Languages },
  { key: 'city_tour', label: 'Tur', icon: Landmark },
  { key: 'party', label: 'Parti', icon: PartyPopper },
  { key: 'study', label: 'Çalışma', icon: BookOpen },
  { key: 'food', label: 'Yemek', icon: UtensilsCrossed },
  { key: 'other', label: 'Diğer', icon: MoreHorizontal },
];

const EventMap = dynamic(() => import('@/components/EventMap'), { ssr: false });

type ViewMode = 'list' | 'map' | 'calendar';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[d.getDay()];
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isPast(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < now;
}

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { events, loading, fetchEvents } = useEvents(user?.id);
  const { cities, selectedCityId, fetchCities } = useCities();
  const [activeCityId, setActiveCityId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (selectedCityId && !activeCityId) setActiveCityId(selectedCityId);
    else if (cities.length > 0 && !activeCityId) setActiveCityId(cities[0].id);
  }, [selectedCityId, cities, activeCityId]);

  useEffect(() => {
    if (activeCityId) {
      fetchEvents(activeCityId, {
        category: activeCategory === 'all' ? undefined : activeCategory,
      });
    }
  }, [activeCityId, activeCategory, fetchEvents]);

  // Group events by date for calendar view
  const groupedByDate = events.reduce<Record<string, typeof events>>((acc, ev) => {
    const key = ev.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-dvh page-enter" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="glass-effect sticky top-0 z-40 px-4 pt-[env(safe-area-inset-top)]"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between h-14">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Etkinlikler
          </h1>
          {/* View toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: 'var(--color-bg)' }}>
            {[
              { mode: 'list' as ViewMode, icon: List, label: 'Liste görünümü' },
              { mode: 'map' as ViewMode, icon: Map, label: 'Harita görünümü' },
              { mode: 'calendar' as ViewMode, icon: Calendar, label: 'Takvim görünümü' },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="p-1.5 rounded-md transition-all"
                aria-label={label}
                style={{
                  background: viewMode === mode ? 'var(--color-bg-card)' : 'transparent',
                  color: viewMode === mode ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: viewMode === mode ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* City filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
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

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: isActive ? 'var(--color-primary)' : 'var(--color-bg-card)',
                  color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                  border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                <Icon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 pb-32">
        {loading && (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="h-36 animate-shimmer" />
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl animate-shimmer flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-4 w-3/4 rounded animate-shimmer" />
                      <div className="h-3 w-1/2 rounded animate-shimmer" />
                      <div className="h-3 w-1/3 rounded animate-shimmer" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div className="h-6 w-24 rounded animate-shimmer" />
                    <div className="h-4 w-20 rounded animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 px-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}
            >
              <CalendarDays size={28} style={{ color: 'var(--color-primary)' }} />
            </div>
            <p className="text-sm font-medium text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Bu kategoride etkinlik bulunamadı
            </p>
            <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
              İlk etkinliği sen oluştur!
            </p>
            <button
              onClick={() => router.push('/events/new')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mt-1"
              style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
            >
              <Plus size={16} />
              Etkinlik Oluştur
            </button>
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-3 p-4">
            {events.map((ev, i) => (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="rounded-2xl overflow-hidden text-left animate-fade-in-up block transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                style={{
                  background: 'var(--color-bg-card)',
                  boxShadow: 'var(--shadow-card)',
                  animationDelay: `${i * 60}ms`,
                  opacity: isPast(ev.date) ? 0.55 : 1,
                  filter: isPast(ev.date) ? 'grayscale(0.4)' : 'none',
                }}
              >
                {/* Cover */}
                {ev.image_url && (
                  <div className="h-36 overflow-hidden">
                    <img src={ev.image_url} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.startsWith('data:')) t.src = IMAGE_FALLBACK; }} />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Date badge */}
                    <div
                      className="flex flex-col items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}
                    >
                      <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--color-primary)' }}>
                        {formatDate(ev.date).split(' ')[1]}
                      </span>
                      <span className="text-lg font-bold leading-tight" style={{ color: 'var(--color-primary)' }}>
                        {formatDate(ev.date).split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-sm font-semibold truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {ev.title}
                        </h3>
                        {isToday(ev.date) && (
                          <span
                            className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--color-primary)', color: 'var(--color-text-inverse)' }}
                          >
                            Bug&#252;n
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                        <CalendarDays size={12} />
                        {formatDay(ev.date)}, {ev.time?.substring(0, 5) ?? ev.time}
                      </p>
                      {ev.location_name && (
                        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                          <MapPin size={12} />
                          {ev.location_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden"
                        style={{ background: 'var(--gradient-primary)', color: 'var(--color-text-inverse)' }}
                      >
                        {ev.organizer?.avatar_url ? (
                          <img src={ev.organizer.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ev.organizer?.full_name ?? 'Organizatör')}&background=F26522&color=fff&size=200`; }} />
                        ) : (
                          (ev.organizer?.full_name?.[0] ?? '?')
                        )}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {ev.organizer?.full_name ?? 'Organizatör'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {ev.participant_count}
                        {ev.max_participants ? `/${ev.max_participants}` : ''} katılımcı
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Calendar view */}
        {viewMode === 'calendar' && (
          <div className="flex flex-col gap-4 p-4">
            {Object.entries(groupedByDate).map(([date, dayEvents]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                    {formatDate(date)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {formatDay(date)}
                  </span>
                  {isToday(date) && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--color-primary)', color: 'var(--color-text-inverse)' }}
                    >
                      Bug&#252;n
                    </span>
                  )}
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                </div>
                <div className="flex flex-col gap-2">
                  {dayEvents.map((ev) => (
                    <Link
                      key={ev.id}
                      href={`/events/${ev.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl text-left block transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
                      style={{
                        background: 'var(--color-bg-card)',
                        boxShadow: 'var(--shadow-sm)',
                        opacity: isPast(ev.date) ? 0.55 : 1,
                        filter: isPast(ev.date) ? 'grayscale(0.4)' : 'none',
                      }}
                    >
                      <div
                        className="w-1 h-10 rounded-full"
                        style={{ background: 'var(--color-primary)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {ev.title}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {ev.time?.substring(0, 5) ?? ev.time} {ev.location_name ? `- ${ev.location_name}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)', color: 'var(--color-primary)' }}>
                        {ev.participant_count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Map view */}
        {viewMode === 'map' && (
          <div className="p-4">
            <EventMap
              events={events.map((ev) => ({
                id: ev.id,
                title: ev.title,
                date: ev.date,
                time: ev.time,
                location_name: ev.location_name,
                latitude: ev.latitude ?? null,
                longitude: ev.longitude ?? null,
                category: ev.category,
                participant_count: ev.participant_count,
              }))}
            />
          </div>
        )}
      </div>

      {/* Create event FAB */}
      <button
        onClick={() => router.push('/events/new')}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40 transition-transform active:scale-90"
        style={{ background: 'var(--gradient-primary)' }}
        aria-label="Yeni etkinlik"
      >
        <Plus size={28} style={{ color: 'var(--color-text-inverse)' }} />
      </button>

      <BottomNav />
    </div>
  );
}
