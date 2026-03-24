'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { City, Neighborhood, CityFaq } from '@/lib/database.types';

interface CityWithDetails extends City {
  neighborhoods: Neighborhood[];
  faqs: CityFaq[];
}

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [city, setCity] = useState<CityWithDetails | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('cities')
        .select('*')
        .order('name', { ascending: true });

      if (search) {
        query = query.or(`name.ilike.%${search}%,country.ilike.%${search}%`);
      }

      const { data, error: err } = await query;

      if (err) {
        setError(err.message);
        return;
      }

      setCities((data ?? []) as City[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return;
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const [cityRes, neighborhoodsRes, faqsRes] = await Promise.all([
        supabase.from('cities').select('*').eq('id', id).single(),
        supabase.from('neighborhoods').select('*').eq('city_id', id).order('name'),
        supabase.from('city_faqs').select('*').eq('city_id', id).order('order'),
      ]);

      if (cityRes.error) {
        setError(cityRes.error.message);
        return null;
      }

      const result: CityWithDetails = {
        ...(cityRes.data as City),
        neighborhoods: (neighborhoodsRes.data ?? []) as Neighborhood[],
        faqs: (faqsRes.data ?? []) as CityFaq[],
      };

      setCity(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Persists user's selected city preference
  const selectCity = useCallback(async (cityId: string, userId?: string) => {
    try {
      setSelectedCityId(cityId);

      if (userId) {
        await supabase
          .from('profiles')
          .update({ exchange_city_id: cityId })
          .eq('id', userId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
    }
  }, []);

  const getNeighborhoods = useCallback(async (cityId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('neighborhoods')
        .select('*')
        .eq('city_id', cityId)
        .order('name');

      if (err) return { error: err.message, data: [] };
      return { data: (data ?? []) as Neighborhood[] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message, data: [] };
    }
  }, []);

  return {
    cities,
    city,
    selectedCityId,
    loading,
    error,
    fetchCities,
    getById,
    selectCity,
    getNeighborhoods,
  };
}
