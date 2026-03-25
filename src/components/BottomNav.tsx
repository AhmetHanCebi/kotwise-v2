'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Compass, Users, MessageCircle, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

const tabDefs = [
  { href: '/', labelKey: 'home' as const, icon: Home },
  { href: '/explore', labelKey: 'explore' as const, icon: Compass },
  { href: '/community', labelKey: 'community' as const, icon: Users },
  { href: '/messages', labelKey: 'messages' as const, icon: MessageCircle },
  { href: '/profile', labelKey: 'profile' as const, icon: User },
];

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <div className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center"
      style={{ background: 'var(--color-error)' }}
    >
      <span className="text-[9px] font-bold text-white leading-none">
        {count > 99 ? '99+' : count}
      </span>
    </div>
  );
}

function BadgeDot() {
  return (
    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
      style={{ background: 'var(--color-error)', border: '2px solid var(--color-bg)' }}
    />
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Unread messages count
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', user.id);

      // Unread notifications count
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setUnreadMessages(msgCount || 0);
      setUnreadNotifications(notifCount || 0);
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav
      className="glass-effect fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] border-t px-2 pb-[env(safe-area-inset-bottom)] z-50"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-around h-16">
        {tabDefs.map((tab) => {
          const isActive =
            tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 active:scale-90"
              style={{
                color: isActive
                  ? 'var(--color-primary)'
                  : 'var(--color-text-muted)',
              }}
            >
              <span className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {tab.href === '/messages' && <Badge count={unreadMessages} />}
                {tab.href === '/profile' && unreadNotifications > 0 && <BadgeDot />}
              </span>
              <span className="text-[10px] font-medium leading-tight">
                {t.nav[tab.labelKey]}
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
