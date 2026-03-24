'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { City } from '@/lib/database.types';

export function useBudget() {
  const [cities, setCities] = useState<City[]>([]);
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
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cities,
    loading,
    error,
    fetchCities,
  };
}
