'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  HostApplication,
  HostApplicationInsert,
  Earning,
  EarningWithBooking,
  Booking,
  Listing,
} from '@/lib/database.types';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  pendingBookings: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  totalReviews: number;
}

interface CalendarBooking {
  id: string;
  listing_title: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
}

export function useHostPanel(hostId?: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [application, setApplication] = useState<HostApplication | null>(null);
  const [earnings, setEarnings] = useState<EarningWithBooking[]>([]);
  const [calendarBookings, setCalendarBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard stats
  const fetchStats = useCallback(async () => {
    if (!hostId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const [listingsRes, bookingsRes, earningsRes] = await Promise.all([
        supabase.from('listings').select('id, is_active, rating, review_count').eq('host_id', hostId),
        supabase.from('bookings').select('id, status, total_price').eq('host_id', hostId),
        supabase.from('earnings').select('amount, net_amount, period').eq('host_id', hostId),
      ]);

      const listings = (listingsRes.data ?? []) as Pick<Listing, 'id' | 'is_active' | 'rating' | 'review_count'>[];
      const bookings = (bookingsRes.data ?? []) as Pick<Booking, 'id' | 'status' | 'total_price'>[];
      const earningsData = (earningsRes.data ?? []) as Pick<Earning, 'amount' | 'net_amount' | 'period'>[];

      const now = new Date();
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const totalReviews = listings.reduce((sum, l) => sum + (l.review_count ?? 0), 0);
      const ratedListings = listings.filter(l => (l.rating ?? 0) > 0);
      const avgRating = ratedListings.length > 0
        ? listings.reduce((sum, l) => sum + (l.rating ?? 0), 0) / ratedListings.length
        : 0;

      setStats({
        totalListings: listings.length,
        activeListings: listings.filter(l => l.is_active).length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        totalEarnings: earningsData.reduce((sum, e) => sum + Number(e.net_amount), 0),
        monthlyEarnings: earningsData
          .filter(e => e.period === currentPeriod)
          .reduce((sum, e) => sum + Number(e.net_amount), 0),
        averageRating: isNaN(avgRating) ? 0 : Number(avgRating.toFixed(2)),
        totalReviews,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İstatistikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [hostId]);

  // Host application
  const fetchApplication = useCallback(async () => {
    if (!hostId) return;

    const { data } = await supabase
      .from('host_applications')
      .select('*')
      .eq('user_id', hostId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    setApplication(data as HostApplication | null);
    return data;
  }, [hostId]);

  const submitApplication = useCallback(async (input: HostApplicationInsert) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('host_applications')
      .insert(input)
      .select()
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return { error: err.message };
    }

    setApplication(data as HostApplication);
    setLoading(false);
    return { data };
  }, []);

  // Earnings
  const fetchEarnings = useCallback(async (period?: string) => {
    if (!hostId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      let query = supabase
        .from('earnings')
        .select('*, booking:bookings!earnings_booking_id_fkey(*)')
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });

      if (period) query = query.eq('period', period);

      const { data, error: err } = await query;

      if (err) {
        setError(err.message);
        return;
      }

      setEarnings((data ?? []) as unknown as EarningWithBooking[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kazançlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [hostId]);

  // Calendar view of bookings
  const fetchCalendar = useCallback(async (month?: string) => {
    if (!hostId) return;
    setLoading(true);

    let query = supabase
      .from('bookings')
      .select('id, check_in, check_out, status, guest_name, listing:listings!bookings_listing_id_fkey(title)')
      .eq('host_id', hostId)
      .in('status', ['confirmed', 'pending']);

    if (month) {
      const [year, m] = month.split('-');
      const startDate = `${year}-${m}-01`;
      const endDate = new Date(Number(year), Number(m), 0).toISOString().split('T')[0];
      query = query.gte('check_in', startDate).lte('check_in', endDate);
    }

    const { data, error: err } = await query.order('check_in', { ascending: true });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const items: CalendarBooking[] = (data ?? []).map((b: Record<string, unknown>) => ({
      id: b.id as string,
      listing_title: (b.listing as { title: string })?.title ?? '',
      guest_name: (b.guest_name as string) ?? '',
      check_in: b.check_in as string,
      check_out: b.check_out as string,
      status: b.status as string,
    }));

    setCalendarBookings(items);
    setLoading(false);
  }, [hostId]);

  return {
    stats,
    application,
    earnings,
    calendarBookings,
    loading,
    error,
    fetchStats,
    fetchApplication,
    submitApplication,
    fetchEarnings,
    fetchCalendar,
  };
}
