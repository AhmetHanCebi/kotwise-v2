'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/lib/database.types';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (limit = 50) => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (err) {
        setError(err.message);
        return;
      }

      const items = (data ?? []) as Notification[];
      setNotifications(items);
      setUnreadCount(items.filter(n => !n.is_read).length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markRead = useCallback(async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (err) return { error: err.message };

      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const { error: err } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (err) return { error: err.message };

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markRead,
    markAllRead,
  };
}
