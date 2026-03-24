'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Booking, BookingInsert, BookingStatus, BookingWithDetails } from '@/lib/database.types';

export function useBooking(userId?: string) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserBookings = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings!bookings_listing_id_fkey(*, images:listing_images!listing_images_listing_id_fkey(*)),
        host:profiles!bookings_host_id_fkey(*),
        user:profiles!bookings_user_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setBookings((data ?? []) as unknown as BookingWithDetails[]);
    setLoading(false);
  }, [userId]);

  const fetchHostBookings = useCallback(async (hostId: string) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings!bookings_listing_id_fkey(*, images:listing_images!listing_images_listing_id_fkey(*)),
        host:profiles!bookings_host_id_fkey(*),
        user:profiles!bookings_user_id_fkey(*)
      `)
      .eq('host_id', hostId)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }

    const items = (data ?? []) as unknown as BookingWithDetails[];
    setLoading(false);
    return items;
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings!bookings_listing_id_fkey(*, images:listing_images!listing_images_listing_id_fkey(*)),
        host:profiles!bookings_host_id_fkey(*),
        user:profiles!bookings_user_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }

    const result = data as unknown as BookingWithDetails;
    setBooking(result);
    setLoading(false);
    return result;
  }, []);

  const create = useCallback(async (input: BookingInsert) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('bookings')
      .insert(input)
      .select()
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return { error: err.message };
    }

    setLoading(false);
    return { data: data as Booking };
  }, []);

  const updateStatus = useCallback(async (id: string, status: BookingStatus) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return { error: err.message };
    }

    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    setLoading(false);
    return { data: data as Booking };
  }, []);

  const cancel = useCallback(async (id: string) => {
    return updateStatus(id, 'cancelled');
  }, [updateStatus]);

  return {
    bookings,
    booking,
    loading,
    error,
    fetchUserBookings,
    fetchHostBookings,
    getById,
    create,
    updateStatus,
    cancel,
  };
}
