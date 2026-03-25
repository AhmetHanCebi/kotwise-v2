'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  UserSearch,
  GraduationCap,
  MapPin,
  Calculator,
  Home,
  Users,
  Heart,
  ChevronRight,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';

const sections = [
  {
    title: 'Konaklama',
    items: [
      {
        href: '/search',
        icon: Search,
        label: 'İlanlar',
        description: 'Doğrulanmış konaklama ilanlarını keşfet',
        color: '#F26522',
        bg: 'rgba(242,101,34,0.08)',
        countKey: 'listings',
        countSuffix: 'ilan',
      },
      {
        href: '/favorites',
        icon: Heart,
        label: 'Favorilerim',
        description: 'Beğendiğin ilanları incele',
        color: 'var(--color-error)',
        bg: 'rgba(239,68,68,0.08)',
        countKey: null,
        countSuffix: '',
      },
    ],
  },
  {
    title: 'Topluluk & Sosyal',
    items: [
      {
        href: '/events',
        icon: Calendar,
        label: 'Etkinlikler',
        description: 'Yaklaşan buluşma ve etkinliklere katıl',
        color: '#8B5CF6',
        bg: 'rgba(139,92,246,0.08)',
        countKey: 'events',
        countSuffix: 'etkinlik',
      },
      {
        href: '/roommates',
        icon: UserSearch,
        label: 'Oda Arkadaşı',
        description: 'Uyumlu oda arkadaşlarını bul',
        color: '#6366F1',
        bg: 'rgba(99,102,241,0.08)',
        countKey: 'roommate_profiles',
        countSuffix: 'profil',
      },
      {
        href: '/mentors',
        icon: GraduationCap,
        label: 'Mentor Bul',
        description: 'Deneyimli öğrencilerden rehberlik al',
        color: '#0EA5E9',
        bg: 'rgba(14,165,233,0.08)',
        countKey: 'mentors',
        countSuffix: 'mentor',
      },
      {
        href: '/community',
        icon: Users,
        label: 'Topluluk',
        description: 'Paylaşımları oku, soru sor',
        color: '#22C55E',
        bg: 'rgba(34,197,94,0.08)',
        countKey: 'posts',
        countSuffix: 'paylaşım',
      },
    ],
  },
  {
    title: 'Araçlar & Rehber',
    items: [
      {
        href: '/city',
        icon: MapPin,
        label: 'Şehir Rehberi',
        description: 'Mahalleler, ulaşım, yaşam maliyeti',
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.08)',
        countKey: null,
        countSuffix: '',
      },
      {
        href: '/budget',
        icon: Calculator,
        label: 'Bütçe Hesaplayıcı',
        description: 'Erasmus harcamalarını planla',
        color: '#F26522',
        bg: 'rgba(242,101,34,0.08)',
        countKey: null,
        countSuffix: '',
      },
      {
        href: '/host',
        icon: Home,
        label: 'Ev Sahibi Ol',
        description: 'Odanı paylaş, gelir elde et',
        color: '#10B981',
        bg: 'rgba(16,185,129,0.08)',
        countKey: null,
        countSuffix: '',
      },
    ],
  },
];

export default function ExplorePage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [listings, events, posts, roommates, mentors] = await Promise.all([
          supabase.from('listings').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('events').select('id', { count: 'exact', head: true }),
          supabase.from('posts').select('id', { count: 'exact', head: true }),
          supabase.from('roommate_profiles').select('id', { count: 'exact', head: true }),
          supabase.from('mentors').select('id', { count: 'exact', head: true }),
        ]);
        setCounts({
          listings: listings.count ?? 0,
          events: events.count ?? 0,
          posts: posts.count ?? 0,
          roommate_profiles: roommates.count ?? 0,
          mentors: mentors.count ?? 0,
        });
      } catch {
        // Counts are optional — fail silently
      }
    };
    fetchCounts();
  }, []);

  return (
    <div
      className="flex-1 flex flex-col min-h-dvh pb-20"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-5 pt-[calc(16px+env(safe-area-inset-top))] pb-4"
        style={{
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Kesfet
        </h1>
        <p
          className="text-sm mt-0.5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Tum ozelliklere buradan ulasabilirsin
        </p>
      </div>

      {/* Search shortcut */}
      <div className="px-5 pt-4">
        <Link
          href="/search"
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
          <span
            className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Ilan, etkinlik veya yer ara...
          </span>
        </Link>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <section key={section.title} className="mt-5 px-5">
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {section.title}
          </h2>
          <div className="flex flex-col gap-2">
            {section.items.map((item) => {
              const Icon = item.icon;
              const count = item.countKey ? counts[item.countKey] : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98] hover:scale-[1.02] hover:shadow-lg overflow-hidden relative"
                  style={{
                    background: 'var(--color-bg-card)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  {/* Gradient accent strip on left side */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ background: item.color }}
                  />
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-1"
                    style={{ background: item.bg }}
                  >
                    <Icon size={22} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {item.label}
                      </p>
                      {count != null && count > 0 && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: item.bg,
                            color: item.color,
                          }}
                        >
                          {count} {item.countSuffix}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <BottomNav />
    </div>
  );
}
