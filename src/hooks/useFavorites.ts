'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Favorite, ListingWithImages } from '@/lib/database.types';

export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<(Favorite & { listing: ListingWithImages })[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Step 1: Fetch favorites with listing data (skip listing_images in nested join — 3-level depth is unreliable)
      const { data, error: err } = await supabase
        .from('favorites')
        .select('*, listing:listings!favorites_listing_id_fkey(*, city:cities!listings_city_id_fkey(id, name))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      const items = (data ?? []) as unknown as (Favorite & { listing: ListingWithImages })[];

      // Step 2: Always fetch listing_images separately (reliable 2-level join, same as search page)
      const listingIds = items.map(f => f.listing?.id).filter(Boolean) as string[];
      if (listingIds.length > 0) {
        const { data: imgData } = await supabase
          .from('listing_images')
          .select('listing_id, url, is_cover, order')
          .in('listing_id', listingIds);

        if (imgData && imgData.length > 0) {
          const imgMap = new Map<string, typeof imgData>();
          for (const img of imgData) {
            const arr = imgMap.get(img.listing_id) ?? [];
            arr.push(img);
            imgMap.set(img.listing_id, arr);
          }
          for (const item of items) {
            if (item.listing) {
              item.listing.listing_images = imgMap.get(item.listing.id) ?? [];
            }
          }
        }
      }

      setFavorites(items);
      setFavoriteIds(new Set(items.map(f => f.listing_id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Favoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((listingId: string) => {
    return favoriteIds.has(listingId);
  }, [favoriteIds]);

  const toggle = useCallback(async (listingId: string) => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      if (favoriteIds.has(listingId)) {
        // Remove
        const { error: err } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('listing_id', listingId);

        if (err) return { error: err.message };

        setFavorites(prev => prev.filter(f => f.listing_id !== listingId));
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      } else {
        // Add
        const { data, error: err } = await supabase
          .from('favorites')
          .insert({ user_id: userId, listing_id: listingId })
          .select()
          .single();

        if (err) return { error: err.message };

        setFavoriteIds(prev => new Set(prev).add(listingId));
        // Refetch to get listing data
        fetchFavorites();
        return { data };
      }

      return {};
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Favori işlemi başarısız' };
    }
  }, [userId, favoriteIds, fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    isFavorite,
    toggle,
    refresh: fetchFavorites,
  };
}
