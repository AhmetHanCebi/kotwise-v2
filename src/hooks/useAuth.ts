'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, ProfileUpdate } from '@/lib/database.types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  }, []);

  // Initialize session and listen for auth changes
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (!mounted) return;
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          });
        } else {
          setState({ user: null, profile: null, session: null, loading: false, error: null });
        }
      } catch {
        if (mounted) {
          setState(s => ({ ...s, loading: false, error: 'Failed to initialize auth' }));
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (!mounted) return;
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          });
        } else {
          setState({ user: null, profile: null, session: null, loading: false, error: null });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, string>) => {
    setState(s => ({ ...s, loading: true, error: null }));
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) {
      setState(s => ({ ...s, loading: false, error: error.message }));
      return { error };
    }
    return { data };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState(s => ({ ...s, loading: false, error: error.message }));
      return { error };
    }
    return { data };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setState(s => ({ ...s, loading: false, error: error.message }));
      return { error };
    }
    return { data };
  }, []);

  const signOut = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    const { error } = await supabase.auth.signOut();
    if (error) {
      setState(s => ({ ...s, loading: false, error: error.message }));
      return { error };
    }
    setState({ user: null, profile: null, session: null, loading: false, error: null });
    return {};
  }, []);

  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    if (!state.user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', state.user.id)
      .select()
      .single();

    if (error) return { error: error.message };

    setState(s => ({ ...s, profile: data as Profile }));
    return { data };
  }, [state.user]);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    setState(s => ({ ...s, profile }));
  }, [state.user, fetchProfile]);

  return {
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
    error: state.error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile,
  };
}
