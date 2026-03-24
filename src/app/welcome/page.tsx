'use client';

import Link from 'next/link';
import { Home, Users, MapPin, ArrowRight, LogIn } from 'lucide-react';

const stats = [
  { value: '2.500+', label: 'İlan' },
  { value: '45+', label: 'Şehir' },
  { value: '12.000+', label: 'Kullanıcı' },
];

export default function WelcomePage() {
  return (
    <div
      className="flex-1 flex flex-col min-h-dvh relative overflow-hidden"
      style={{ background: 'var(--gradient-primary)' }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
        style={{ background: 'rgba(255,255,255,0.3)' }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15"
        style={{ background: 'rgba(255,255,255,0.25)' }}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between px-6 py-12 relative z-10">
        {/* Top — Logo section */}
        <div className="flex flex-col items-center pt-16">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Home size={36} style={{ color: '#FFFFFF' }} />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Kotwise
          </h1>
          <p className="text-white/80 text-base font-medium mt-2 text-center max-w-[260px] leading-relaxed">
            Erasmus yolculuğunda güvenilir evin ve topluluğun
          </p>
        </div>

        {/* Feature icons */}
        <div className="flex items-center justify-center gap-6 py-8">
          {[
            { icon: Home, label: 'Konaklama' },
            { icon: Users, label: 'Topluluk' },
            { icon: MapPin, label: 'Şehir Rehberi' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <Icon size={24} style={{ color: '#FFFFFF' }} />
                </div>
                <span className="text-xs text-white/70 font-medium">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div
          className="rounded-2xl p-5 mb-8"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-around">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-xs text-white/70 font-medium mt-0.5">
                  {stat.label}
                </span>
                {i < stats.length - 1 && (
                  <div className="hidden" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pb-4">
          <Link
            href="/onboarding"
            className="flex items-center justify-center gap-2 h-14 rounded-2xl text-base font-bold transition-transform active:scale-[0.98]"
            style={{
              background: '#FFFFFF',
              color: 'var(--color-primary)',
            }}
          >
            Başla
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 h-14 rounded-2xl text-base font-semibold transition-transform active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <LogIn size={18} />
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
