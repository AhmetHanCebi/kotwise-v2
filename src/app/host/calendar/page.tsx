'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useHostPanel } from '@/hooks/useHostPanel';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar as CalendarIcon,
} from 'lucide-react';

const dayNames = ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'];
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday-based
}

export default function HostCalendarPage() {
  return (
    <AuthGuard>
      <CalendarContent />
    </AuthGuard>
  );
}

function CalendarContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { calendarBookings, loading, fetchCalendar } = useHostPanel(user?.id);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  useEffect(() => {
    fetchCalendar(monthKey);
  }, [fetchCalendar, monthKey]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  // Build a map of date -> booking status
  const dateStatusMap = useMemo(() => {
    const map: Record<string, 'confirmed' | 'pending'> = {};
    calendarBookings.forEach((b) => {
      const start = new Date(b.check_in);
      const end = new Date(b.check_out);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0];
        if (b.status === 'confirmed') {
          map[key] = 'confirmed';
        } else if (!map[key]) {
          map[key] = 'pending';
        }
      }
    });
    return map;
  }, [calendarBookings]);

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  // Bookings on selected date
  const selectedBookings = useMemo(() => {
    if (!selectedDate) return [];
    return calendarBookings.filter((b) => {
      return selectedDate >= b.check_in && selectedDate <= b.check_out;
    });
  }, [selectedDate, calendarBookings]);

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]"
        style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}
      >
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full active:opacity-70"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="Geri"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Takvim
        </h1>
      </div>

      <div className="flex-1 px-4 py-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-full active:opacity-70" style={{ color: 'var(--color-text-primary)' }}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {monthNames[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-full active:opacity-70" style={{ color: 'var(--color-text-primary)' }}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--color-success)' }} />
            <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>Müsait</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--color-error)' }} />
            <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>Dolu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--color-warning)' }} />
            <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>Beklemede</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div
          className="rounded-xl p-3"
          style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
        >
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold py-1" style={{ color: 'var(--color-text-muted)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const status = dateStatusMap[dateStr];
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === now.toISOString().split('T')[0];

                let bgColor = 'transparent';
                let textColor = 'var(--color-text-primary)';
                const isPast = dateStr < now.toISOString().split('T')[0];

                if (status === 'confirmed') {
                  bgColor = 'rgba(239,68,68,0.15)';
                  textColor = 'var(--color-error)';
                } else if (status === 'pending') {
                  bgColor = 'rgba(245,158,11,0.15)';
                  textColor = 'var(--color-warning)';
                } else if (!isPast) {
                  // Only show green (available) for future dates without bookings
                  bgColor = 'rgba(34,197,94,0.08)';
                } else {
                  // Past dates without bookings get no color
                  textColor = 'var(--color-text-muted)';
                }

                if (isSelected) {
                  bgColor = 'var(--color-primary)';
                  textColor = 'white';
                }

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className="aspect-square rounded-lg flex items-center justify-center text-sm font-medium relative transition-all active:scale-95"
                    style={{ background: bgColor, color: textColor }}
                  >
                    {day}
                    {isToday && !isSelected && (
                      <span
                        className="absolute bottom-0.5 w-1 h-1 rounded-full"
                        style={{ background: 'var(--color-primary)' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--color-text-muted)' }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            {selectedBookings.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-6 rounded-xl"
                style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
              >
                <CalendarIcon size={20} style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Bu tarihte rezervasyon yok
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between px-3 py-3 rounded-xl"
                    style={{ background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-sm)' }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {b.listing_title || 'Ilan'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {b.guest_name || 'Misafir'} | {b.check_in} - {b.check_out}
                      </p>
                    </div>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: b.status === 'confirmed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        color: b.status === 'confirmed' ? 'var(--color-error)' : 'var(--color-warning)',
                      }}
                    >
                      {b.status === 'confirmed' ? 'Dolu' : 'Beklemede'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
