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

    try {
      // Step 1: Fetch bookings with listing (without nested listing_images)
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

      // Step 2: Fetch listing_images via listings join (direct query may fail due to RLS)
      const listingIds = items.map(b => b.listing?.id).filter(Boolean) as string[];
      if (listingIds.length > 0) {
        const { data: listingsWithImgs } = await supabase
          .from('listings')
          .select('id, listing_images:listing_images!listing_images_listing_id_fkey(listing_id, url, is_cover, order)')
          .in('id', listingIds);

        if (listingsWithImgs && listingsWithImgs.length > 0) {
          const imgMap = new Map<string, { listing_id: string; url: string; is_cover: boolean; order: number }[]>();
          for (const l of listingsWithImgs) {
            const imgs = (l as unknown as { id: string; listing_images: { listing_id: string; url: string; is_cover: boolean; order: number }[] }).listing_images;
            if (imgs && imgs.length > 0) {
              imgMap.set(l.id, imgs);
            }
          }
          for (const item of items) {
            if (item.listing) {
              (item.listing as unknown as Record<string, unknown>).listing_images = imgMap.get(item.listing.id) ?? [];
            }
          }
        }
      }

      setBookings(items);
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

      // Fetch listing_images via listings join (direct query may fail due to RLS)
      const listingIds = items.map(b => b.listing?.id).filter(Boolean) as string[];
      if (listingIds.length > 0) {
        const { data: listingsWithImgs } = await supabase
          .from('listings')
          .select('id, listing_images:listing_images!listing_images_listing_id_fkey(listing_id, url, is_cover, order)')
          .in('id', listingIds);

        if (listingsWithImgs && listingsWithImgs.length > 0) {
          const imgMap = new Map<string, { listing_id: string; url: string; is_cover: boolean; order: number }[]>();
          for (const l of listingsWithImgs) {
            const imgs = (l as unknown as { id: string; listing_images: { listing_id: string; url: string; is_cover: boolean; order: number }[] }).listing_images;
            if (imgs && imgs.length > 0) {
              imgMap.set(l.id, imgs);
            }
          }
          for (const item of items) {
            if (item.listing) {
              (item.listing as unknown as Record<string, unknown>).listing_images = imgMap.get(item.listing.id) ?? [];
            }
          }
        }
      }

      setBookings(items);
      return items;
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

      const result = data as unknown as BookingWithDetails;

      // Fetch listing_images via listings join (direct query may fail due to RLS)
      if (result.listing?.id) {
        const { data: listingsWithImgs } = await supabase
          .from('listings')
          .select('id, listing_images:listing_images!listing_images_listing_id_fkey(listing_id, url, is_cover, order)')
          .eq('id', result.listing.id)
          .single();

        if (listingsWithImgs) {
          const imgs = (listingsWithImgs as unknown as { id: string; listing_images: { listing_id: string; url: string; is_cover: boolean; order: number }[] }).listing_images;
          (result.listing as unknown as Record<string, unknown>).listing_images = imgs ?? [];
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
