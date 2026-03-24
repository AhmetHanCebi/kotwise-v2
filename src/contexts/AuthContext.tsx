'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, ProfileUpdate } from '@/lib/database.types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthError {
  message: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<{ data?: unknown; error?: AuthError }>;
  signIn: (email: string, password: string) => Promise<{ data?: unknown; error?: AuthError }>;
  signInWithGoogle: () => Promise<{ data?: unknown; error?: AuthError }>;
  signInWithApple: () => Promise<{ data?: unknown; error?: AuthError }>;
  signOut: () => Promise<{ error?: AuthError }>;
  resetPassword: (email: string, redirectTo?: string) => Promise<{ error?: AuthError }>;
  updateUser: (attributes: { email?: string; password?: string }) => Promise<{ data?: unknown; error?: AuthError }>;
  updateProfile: (updates: ProfileUpdate) => Promise<{ data?: unknown; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
    return data as Profile;
  }, []);

  // Single initialization + single auth state listener
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (s?.user) {
          const p = await fetchProfile(s.user.id);
          if (!mounted) return;
          setUser(s.user);
          setProfile(p);
          setSession(s);
        }
        setLoading(false);
      } catch {
        if (mounted) {
          setError('Failed to initialize auth');
          setLoading(false);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (!mounted) return;
        // Skip INITIAL_SESSION — already handled by initialize() above.
        // Processing it here causes a race where user=null, loading=false
        // triggers AuthGuard redirect before getSession resolves.
        if (_event === 'INITIAL_SESSION') return;

        if (s?.user) {
          const p = await fetchProfile(s.user.id);
          if (!mounted) return;
          setUser(s.user);
          setProfile(p);
          setSession(s);
        } else {
          setUser(null);
          setProfile(null);
          setSession(null);
        }
        setLoading(false);
        setError(null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (err) {
      setLoading(false);
      setError(err.message);
      return { error: err };
    }
    return { data };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setLoading(false);
      setError(err.message);
      return { error: err };
    }
    return { data };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      setLoading(false);
      setError(err.message);
      return { error: err };
    }
    return { data };
  }, []);

  const signInWithApple = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      setLoading(false);
      setError(err.message);
      return { error: err };
    }
    return { data };
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signOut();
    if (err) {
      setLoading(false);
      setError(err.message);
      return { error: err };
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
    return {};
  }, []);

  const resetPassword = useCallback(async (email: string, redirectTo?: string) => {
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? `${window.location.origin}/auth/reset`,
    });
    if (err) return { error: err };
    return {};
  }, []);

  const updateUser = useCallback(async (attributes: { email?: string; password?: string }) => {
    const { data, error: err } = await supabase.auth.updateUser(attributes);
    if (err) return { error: err };
    return { data };
  }, []);

  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error: err } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (err) return { error: err.message };

    setProfile(data as Profile);
    return { data };
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithApple,
        signOut,
        resetPassword,
        updateUser,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
