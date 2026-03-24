'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { MentorProfile, MentorProfileInsert, MentorProfileWithUser } from '@/lib/database.types';

export function useMentors() {
  const [mentors, setMentors] = useState<MentorProfileWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMentors = useCallback(async (cityId?: string) => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('mentor_profiles')
      .select('*, user:profiles!mentor_profiles_user_id_fkey(*), city:cities!mentor_profiles_city_id_fkey(*)')
      .eq('status', 'active');

    if (cityId) query = query.eq('city_id', cityId);

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setMentors((data ?? []) as unknown as MentorProfileWithUser[]);
    setLoading(false);
  }, []);

  const fetchByCity = useCallback(async (cityId: string) => {
    return fetchMentors(cityId);
  }, [fetchMentors]);

  const apply = useCallback(async (input: MentorProfileInsert) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('mentor_profiles')
      .insert(input)
      .select()
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return { error: err.message };
    }

    // Update profile is_mentor flag
    await supabase
      .from('profiles')
      .update({ is_mentor: true })
      .eq('id', input.user_id);

    setLoading(false);
    return { data: data as MentorProfile };
  }, []);

  const updateProfile = useCallback(async (id: string, updates: Partial<MentorProfile>) => {
    const { data, error: err } = await supabase
      .from('mentor_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (err) return { error: err.message };
    return { data: data as MentorProfile };
  }, []);

  return {
    mentors,
    loading,
    error,
    fetchMentors,
    fetchByCity,
    apply,
    updateProfile,
  };
}
