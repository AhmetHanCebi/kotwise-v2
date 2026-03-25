'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Compass, Users, MessageCircle, User } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/explore', label: 'Keşfet', icon: Compass },
  { href: '/community', label: 'Topluluk', icon: Users },
  { href: '/messages', label: 'Mesajlar', icon: MessageCircle },
  { href: '/profile', label: 'Profil', icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="glass-effect fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] border-t px-2 pb-[env(safe-area-inset-bottom)] z-50"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors"
              style={{
                color: isActive
                  ? 'var(--color-primary)'
                  : 'var(--color-text-muted)',
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium leading-tight">
                {tab.label}
              </span>
              {isActive && (
                <span
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{ background: 'var(--color-primary)' }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
