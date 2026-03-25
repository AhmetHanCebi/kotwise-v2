'use client';

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
      },
      {
        href: '/favorites',
        icon: Heart,
        label: 'Favorilerim',
        description: 'Beğendiğin ilanları incele',
        color: '#EF4444',
        bg: 'rgba(239,68,68,0.08)',
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
      },
      {
        href: '/roommates',
        icon: UserSearch,
        label: 'Oda Arkadaşı',
        description: 'Uyumlu oda arkadaşlarını bul',
        color: '#6366F1',
        bg: 'rgba(99,102,241,0.08)',
      },
      {
        href: '/mentors',
        icon: GraduationCap,
        label: 'Mentor Bul',
        description: 'Deneyimli öğrencilerden rehberlik al',
        color: '#0EA5E9',
        bg: 'rgba(14,165,233,0.08)',
      },
      {
        href: '/community',
        icon: Users,
        label: 'Topluluk',
        description: 'Paylaşımları oku, soru sor',
        color: '#22C55E',
        bg: 'rgba(34,197,94,0.08)',
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
      },
      {
        href: '/budget',
        icon: Calculator,
        label: 'Bütçe Hesaplayıcı',
        description: 'Erasmus harcamalarını planla',
        color: '#F26522',
        bg: 'rgba(242,101,34,0.08)',
      },
      {
        href: '/host',
        icon: Home,
        label: 'Ev Sahibi Ol',
        description: 'Odanı paylaş, gelir elde et',
        color: '#10B981',
        bg: 'rgba(16,185,129,0.08)',
      },
    ],
  },
];

export default function ExplorePage() {
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl transition-transform active:scale-[0.98]"
                  style={{
                    background: 'var(--color-bg-card)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.bg }}
                  >
                    <Icon size={22} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {item.label}
                    </p>
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
