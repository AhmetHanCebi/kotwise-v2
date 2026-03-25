'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Users, MapPin, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Home,
    title: 'Güvenilir Konaklama',
    description:
      'Doğrulanmış ev sahipleri ve detaylı ilanlarla güvenle konakla. Fiyat, konum ve olanakları karşılaştır.',
    color: '#F26522',
    bg: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
  },
  {
    icon: Users,
    title: 'Topluluk & Etkinlikler',
    description:
      'Aynı şehirdeki Erasmus öğrencileriyle tanış, etkinliklere katıl ve deneyimlerini paylaş.',
    color: '#3B82F6',
    bg: 'color-mix(in srgb, var(--color-info) 10%, transparent)',
  },
  {
    icon: MapPin,
    title: 'Şehir Rehberi',
    description:
      'Mahalleler, ulaşım, yaşam maliyeti ve acil bilgiler dahil kapsamlı şehir rehberine eriş.',
    color: '#22C55E',
    bg: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === steps.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      router.push('/register');
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLast, router]);

  return (
    <div
      className="flex-1 flex flex-col min-h-dvh px-6 py-12"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Skip button */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push('/login')}
          className="text-sm font-semibold px-4 py-2 rounded-full transition-colors hover:opacity-70"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Atla
        </button>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="w-32 h-32 rounded-[32px] flex items-center justify-center mb-10 transition-all duration-500"
          style={{ background: step.bg }}
        >
          <Icon size={56} style={{ color: step.color }} />
        </div>

        <h1
          className="text-2xl font-bold text-center mb-4 transition-all duration-500"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {step.title}
        </h1>
        <p
          className="text-base text-center leading-relaxed max-w-[300px] transition-all duration-500"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {step.description}
        </p>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col items-center gap-6 pb-4">
        {/* Dot indicators */}
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className="rounded-full transition-all duration-300"
              aria-label={`Adım ${i + 1}`}
              style={{
                width: i === currentStep ? 24 : 8,
                height: 8,
                background:
                  i === currentStep
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
              }}
            />
          ))}
        </div>

        {/* Next / Start button */}
        <button
          onClick={handleNext}
          className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl text-base font-bold text-white transition-transform active:scale-[0.98]"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {isLast ? 'Başla' : 'Devam Et'}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
