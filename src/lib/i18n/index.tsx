'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { tr, type Translations } from './tr';
import { en } from './en';

export type Locale = 'tr' | 'en';

const translations: Record<Locale, Translations> = { tr, en };

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'tr',
  t: tr,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kotwise_locale') as Locale | null;
      if (stored && (stored === 'tr' || stored === 'en')) return stored;
      // Also check legacy kotwise_language key
      const legacy = localStorage.getItem('kotwise_language');
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          if (parsed === 'tr' || parsed === 'en') return parsed;
        } catch { /* ignore */ }
      }
    }
    return 'tr';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('kotwise_locale', newLocale);
    // Also keep legacy key in sync for settings page
    localStorage.setItem('kotwise_language', JSON.stringify(newLocale));
  }, []);

  return (
    <I18nContext value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </I18nContext>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export type { Translations };
