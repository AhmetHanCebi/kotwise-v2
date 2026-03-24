'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  RoommateProfile,
  RoommateProfileInsert,
  RoommateProfileUpdate,
  RoommateProfileWithUser,
} from '@/lib/database.types';

export function useRoommates(userId?: string) {
  const [profiles, setProfiles] = useState<RoommateProfileWithUser[]>([]);
  const [myProfile, setMyProfile] = useState<RoommateProfile | null>(null);
  const [matches, setMatches] = useState<RoommateProfileWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get profiles to swipe on (exclude already liked/skipped)
  const fetchProfiles = useCallback(async (city?: string) => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    // Get liked and skipped IDs
    const [{ data: liked }, { data: skipped }] = await Promise.all([
      supabase.from('roommate_likes').select('liked_user_id').eq('user_id', userId),
      supabase.from('roommate_skips').select('skipped_user_id').eq('user_id', userId),
    ]);

    const excludeIds = [
      userId,
      ...(liked ?? []).map(l => l.liked_user_id),
      ...(skipped ?? []).map(s => s.skipped_user_id),
    ];

    let query = supabase
      .from('roommate_profiles')
      .select('*, user:profiles!roommate_profiles_user_id_fkey(*)')
      .not('user_id', 'in', `(${excludeIds.join(',')})`);

    if (city) query = query.eq('exchange_city', city);

    const { data, error: err } = await query.limit(20);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setProfiles((data ?? []) as unknown as RoommateProfileWithUser[]);
    setLoading(false);
  }, [userId]);

  // Get own roommate profile
  const fetchMyProfile = useCallback(async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('roommate_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    setMyProfile(data as RoommateProfile | null);
    return data;
  }, [userId]);

  // Create/update roommate profile
  const upsertProfile = useCallback(async (input: RoommateProfileInsert | RoommateProfileUpdate) => {
    if (!userId) return { error: 'Not authenticated' };

    const { data, error: err } = await supabase
      .from('roommate_profiles')
      .upsert({ ...input, user_id: userId } as RoommateProfileInsert)
      .select()
      .single();

    if (err) return { error: err.message };

    setMyProfile(data as RoommateProfile);
    return { data };
  }, [userId]);

  // Like a profile
  const like = useCallback(async (likedUserId: string) => {
    if (!userId) return { error: 'Not authenticated', isMatch: false };

    const { error: err } = await supabase
      .from('roommate_likes')
      .insert({ user_id: userId, liked_user_id: likedUserId });

    if (err) return { error: err.message, isMatch: false };

    // Remove from display
    setProfiles(prev => prev.filter(p => p.user_id !== likedUserId));

    // Check for mutual match
    const { data: mutual } = await supabase
      .from('roommate_likes')
      .select('id')
      .eq('user_id', likedUserId)
      .eq('liked_user_id', userId)
      .single();

    const isMatch = !!mutual;
    return { isMatch };
  }, [userId]);

  // Skip a profile
  const skip = useCallback(async (skippedUserId: string) => {
    if (!userId) return { error: 'Not authenticated' };

    const { error: err } = await supabase
      .from('roommate_skips')
      .insert({ user_id: userId, skipped_user_id: skippedUserId });

    if (err) return { error: err.message };

    setProfiles(prev => prev.filter(p => p.user_id !== skippedUserId));
    return {};
  }, [userId]);

  // Get mutual matches
  const fetchMatches = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    // Users I liked
    const { data: myLikes } = await supabase
      .from('roommate_likes')
      .select('liked_user_id')
      .eq('user_id', userId);

    if (!myLikes?.length) {
      setMatches([]);
      setLoading(false);
      return;
    }

    const likedIds = myLikes.map(l => l.liked_user_id);

    // Among those, who also liked me back
    const { data: mutualLikes } = await supabase
      .from('roommate_likes')
      .select('user_id')
      .eq('liked_user_id', userId)
      .in('user_id', likedIds);

    if (!mutualLikes?.length) {
      setMatches([]);
      setLoading(false);
      return;
    }

    const matchIds = mutualLikes.map(l => l.user_id);

    const { data: matchProfiles } = await supabase
      .from('roommate_profiles')
      .select('*, user:profiles!roommate_profiles_user_id_fkey(*)')
      .in('user_id', matchIds);

    setMatches((matchProfiles ?? []) as unknown as RoommateProfileWithUser[]);
    setLoading(false);
  }, [userId]);

  return {
    profiles,
    myProfile,
    matches,
    loading,
    error,
    fetchProfiles,
    fetchMyProfile,
    upsertProfile,
    like,
    skip,
    fetchMatches,
  };
}
