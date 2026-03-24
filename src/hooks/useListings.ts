'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Listing, ListingInsert, ListingUpdate, ListingWithDetails, RoomType } from '@/lib/database.types';

export interface ListingFilters {
  city_id?: string;
  neighborhood_id?: string;
  min_price?: number;
  max_price?: number;
  room_type?: RoomType;
  is_furnished?: boolean;
  amenities?: string[];
  university_name?: string;
  search?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'match_score';
  page?: number;
  limit?: number;
}

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [listing, setListing] = useState<ListingWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const search = useCallback(async (filters: ListingFilters = {}) => {
    setLoading(true);
    setError(null);

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('listings')
      .select('*, listing_images!listing_images_listing_id_fkey(url, is_cover, order)', { count: 'exact' })
      .eq('is_active', true);

    if (filters.city_id) query = query.eq('city_id', filters.city_id);
    if (filters.neighborhood_id) query = query.eq('neighborhood_id', filters.neighborhood_id);
    if (filters.min_price) query = query.gte('price_per_month', filters.min_price);
    if (filters.max_price) query = query.lte('price_per_month', filters.max_price);
    if (filters.room_type) query = query.eq('room_type', filters.room_type);
    if (filters.is_furnished !== undefined) query = query.eq('is_furnished', filters.is_furnished);
    if (filters.university_name) query = query.ilike('university_name', `%${filters.university_name}%`);
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.amenities?.length) {
      query = query.contains('amenities', filters.amenities);
    }

    switch (filters.sort_by) {
      case 'price_asc': query = query.order('price_per_month', { ascending: true }); break;
      case 'price_desc': query = query.order('price_per_month', { ascending: false }); break;
      case 'rating': query = query.order('rating', { ascending: false }); break;
      case 'match_score': query = query.order('match_score', { ascending: false }); break;
      case 'newest': default: query = query.order('created_at', { ascending: false }); break;
    }

    query = query.range(from, to);

    const { data, error: err, count } = await query;

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setListings((data ?? []) as unknown as Listing[]);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('listings')
      .select(`
        *,
        host:profiles!listings_host_id_fkey(*),
        city:cities!listings_city_id_fkey(*),
        neighborhood:neighborhoods!listings_neighborhood_id_fkey(*),
        images:listing_images!listing_images_listing_id_fkey(*),
        reviews:reviews!reviews_listing_id_fkey(*, user:profiles!reviews_user_id_fkey(*))
      `)
      .eq('id', id)
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }

    const result = data as unknown as ListingWithDetails;
    setListing(result);
    setLoading(false);
    return result;
  }, []);

  const create = useCallback(async (input: ListingInsert) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('listings')
      .insert(input)
      .select()
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return { error: err.message };
    }

    setLoading(false);
    return { data: data as Listing };
  }, []);

  const update = useCallback(async (id: string, updates: ListingUpdate) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return { error: err.message };
    }

    setLoading(false);
    return { data: data as Listing };
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    const { error: err } = await supabase
      .from('listings')
      .update({ is_active: false })
      .eq('id', id);

    if (err) {
      setError(err.message);
      setLoading(false);
      return { error: err.message };
    }

    setListings(prev => prev.filter(l => l.id !== id));
    setLoading(false);
    return {};
  }, []);

  return {
    listings,
    listing,
    loading,
    error,
    totalCount,
    search,
    getById,
    create,
    update,
    remove,
  };
}
