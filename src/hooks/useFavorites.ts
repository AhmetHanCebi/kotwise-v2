'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Favorite, Listing } from '@/lib/database.types';

export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<(Favorite & { listing: Listing })[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('favorites')
      .select('*, listing:listings!favorites_listing_id_fkey(*, listing_images!listing_images_listing_id_fkey(url, is_cover))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const items = (data ?? []) as unknown as (Favorite & { listing: Listing })[];
    setFavorites(items);
    setFavoriteIds(new Set(items.map(f => f.listing_id)));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((listingId: string) => {
    return favoriteIds.has(listingId);
  }, [favoriteIds]);

  const toggle = useCallback(async (listingId: string) => {
    if (!userId) return { error: 'Not authenticated' };

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
