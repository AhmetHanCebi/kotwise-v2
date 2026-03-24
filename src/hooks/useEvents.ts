'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Event, EventInsert, EventUpdate, EventCategory, EventWithDetails } from '@/lib/database.types';

export function useEvents(userId?: string) {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (
    cityId: string,
    options?: { category?: EventCategory; upcoming?: boolean; limit?: number }
  ) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:profiles!events_organizer_id_fkey(*),
          city:cities!events_city_id_fkey(*),
          participants:event_participants!event_participants_event_id_fkey(*, user:profiles!event_participants_user_id_fkey(*))
        `)
        .eq('city_id', cityId);

      if (options?.category) query = query.eq('category', options.category);
      if (options?.upcoming !== false) query = query.gte('date', new Date().toISOString().split('T')[0]);
      query = query.order('date', { ascending: true }).limit(options?.limit ?? 20);

      const { data, error: err } = await query;

      if (err) {
        setError(err.message);
        return;
      }

      const enriched = (data ?? []).map(e => ({
        ...e,
        participant_count: (e.participants ?? []).length,
        is_joined: userId
          ? (e.participants ?? []).some((p: { user_id: string }) => p.user_id === userId)
          : false,
      })) as unknown as EventWithDetails[];

      setEvents(enriched);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles!events_organizer_id_fkey(*),
          city:cities!events_city_id_fkey(*),
          participants:event_participants!event_participants_event_id_fkey(*, user:profiles!event_participants_user_id_fkey(*))
        `)
        .eq('id', id)
        .single();

      if (err) {
        setError(err.message);
        return null;
      }

      const result = {
        ...data,
        participant_count: (data.participants ?? []).length,
        is_joined: userId
          ? (data.participants ?? []).some((p: { user_id: string }) => p.user_id === userId)
          : false,
      } as unknown as EventWithDetails;

      setEvent(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const create = useCallback(async (input: EventInsert) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('events')
        .insert(input)
        .select()
        .single();

      if (err) {
        setError(err.message);
        return { error: err.message };
      }

      return { data: data as Event };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, updates: EventUpdate) => {
    try {
      const { data, error: err } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) return { error: err.message };
      return { data: data as Event };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    }
  }, []);

  const join = useCallback(async (eventId: string) => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const { error: err } = await supabase
        .from('event_participants')
        .insert({ event_id: eventId, user_id: userId });

      if (err) return { error: err.message };

      setEvents(prev => prev.map(e =>
        e.id === eventId
          ? { ...e, participant_count: e.participant_count + 1, is_joined: true }
          : e
      ));
      if (event?.id === eventId) {
        setEvent(prev => prev ? { ...prev, participant_count: prev.participant_count + 1, is_joined: true } : null);
      }

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    }
  }, [userId, event]);

  const leave = useCallback(async (eventId: string) => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const { error: err } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (err) return { error: err.message };

      setEvents(prev => prev.map(e =>
        e.id === eventId
          ? { ...e, participant_count: Math.max(0, e.participant_count - 1), is_joined: false }
          : e
      ));
      if (event?.id === eventId) {
        setEvent(prev => prev ? { ...prev, participant_count: Math.max(0, prev.participant_count - 1), is_joined: false } : null);
      }

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    }
  }, [userId, event]);

  const fetchByCategory = useCallback(async (cityId: string, category: EventCategory) => {
    return fetchEvents(cityId, { category });
  }, [fetchEvents]);

  return {
    events,
    event,
    loading,
    error,
    fetchEvents,
    getById,
    create,
    update,
    join,
    leave,
    fetchByCategory,
  };
}
