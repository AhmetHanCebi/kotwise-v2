'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Booking, BookingInsert, BookingStatus, BookingWithDetails } from '@/lib/database.types';

/**
 * Fetch listing_images and return new array with images attached (immutable).
 * Supabase may return frozen/sealed objects — direct property assignment silently fails.
 */
async function enrichWithListingImages(items: BookingWithDetails[]): Promise<BookingWithDetails[]> {
  const listingIds = items.map(b => b.listing?.id).filter(Boolean) as string[];
  if (listingIds.length === 0) return items;

  const { data: imgData } = await supabase
    .from('listing_images')
    .select('listing_id, url, is_cover, order')
    .in('listing_id', listingIds);

  const imgMap = new Map<string, typeof imgData extends (infer T)[] | null ? T[] : never>();
  if (imgData && imgData.length > 0) {
    for (const img of imgData) {
      const arr = imgMap.get(img.listing_id) ?? [];
      arr.push(img);
      imgMap.set(img.listing_id, arr);
    }
  }

  // Create new objects with listing_images attached
  return items.map(item => {
    if (!item.listing) return item;
    const existing = (item.listing as unknown as Record<string, unknown>).listing_images as unknown[] | undefined;
    if (existing && existing.length > 0) return item; // already has images from join
    return {
      ...item,
      listing: {
        ...item.listing,
        listing_images: imgMap.get(item.listing.id) ?? [],
      },
    } as BookingWithDetails;
  });
}

export function useBooking(userId?: string) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserBookings = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings!bookings_listing_id_fkey(*),
          host:profiles!bookings_host_id_fkey(*),
          user:profiles!bookings_user_id_fkey(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (err) {
        setError(err.message);
        return;
      }

      const items = (data ?? []) as unknown as BookingWithDetails[];
      const enriched = await enrichWithListingImages(items);
      setBookings(enriched);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchHostBookings = useCallback(async (hostId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings!bookings_listing_id_fkey(*),
          host:profiles!bookings_host_id_fkey(*),
          user:profiles!bookings_user_id_fkey(*)
        `)
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });

      if (err) {
        setError(err.message);
        return [];
      }

      const items = (data ?? []) as unknown as BookingWithDetails[];
      const enriched = await enrichWithListingImages(items);
      setBookings(enriched);
      return enriched;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings!bookings_listing_id_fkey(*),
          host:profiles!bookings_host_id_fkey(*),
          user:profiles!bookings_user_id_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (err) {
        setError(err.message);
        return null;
      }

      let result = data as unknown as BookingWithDetails;

      // Fetch images for this single listing (immutable update)
      if (result.listing?.id) {
        const { data: imgData } = await supabase
          .from('listing_images')
          .select('listing_id, url, is_cover, order')
          .eq('listing_id', result.listing.id);

        if (imgData) {
          result = {
            ...result,
            listing: {
              ...result.listing,
              listing_images: imgData,
            },
          } as BookingWithDetails;
        }
      }

      setBooking(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (input: BookingInsert) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .insert(input)
        .select()
        .single();

      if (err) {
        setError(err.message);
        return { error: err.message };
      }

      return { data: data as Booking };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: BookingStatus) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (err) {
        setError(err.message);
        return { error: err.message };
      }

      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      return { data: data as Booking };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
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
