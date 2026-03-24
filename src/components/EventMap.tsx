'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface EventPin {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string;
  participant_count: number;
}

interface EventMapProps {
  events: EventPin[];
  center?: { lat: number; lng: number };
}

const CATEGORY_COLORS: Record<string, string> = {
  coffee: '#92400E',
  sports: '#16A34A',
  language: '#2563EB',
  city_tour: '#7C3AED',
  party: '#DC2626',
  study: '#EA580C',
  food: '#CA8A04',
  other: '#6B7280',
};

// Load Leaflet from CDN dynamically
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as Record<string, unknown>).L) {
      resolve((window as unknown as Record<string, unknown>).L);
      return;
    }

    // Load CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      resolve((window as unknown as Record<string, unknown>).L);
    };
    script.onerror = () => reject(new Error('Failed to load Leaflet'));
    document.head.appendChild(script);
  });
}

export default function EventMap({ events, center }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter events that have coordinates
  const mappableEvents = events.filter((e) => e.latitude != null && e.longitude != null);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    const init = async () => {
      try {
        const L = await loadLeaflet();
        if (cancelled || !mapRef.current) return;

        // Clean up previous map
        if (mapInstanceRef.current) {
          (mapInstanceRef.current as { remove: () => void }).remove();
        }

        const defaultCenter = center ?? { lat: 48.8566, lng: 2.3522 }; // Paris default

        // Compute center from events if available
        let mapCenter: [number, number] = [defaultCenter.lat, defaultCenter.lng];
        if (mappableEvents.length > 0) {
          const avgLat = mappableEvents.reduce((s, e) => s + e.latitude!, 0) / mappableEvents.length;
          const avgLng = mappableEvents.reduce((s, e) => s + e.longitude!, 0) / mappableEvents.length;
          mapCenter = [avgLat, avgLng];
        }

        const map = L.map(mapRef.current).setView(mapCenter, 13);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add markers for events
        mappableEvents.forEach((ev) => {
          const color = CATEGORY_COLORS[ev.category] ?? CATEGORY_COLORS.other;

          const icon = L.divIcon({
            className: 'custom-event-pin',
            html: `<div style="
              width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
              background: ${color}; transform: rotate(-45deg);
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white;
            "><span style="transform: rotate(45deg); color: white; font-size: 12px; font-weight: bold;">${ev.participant_count}</span></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          });

          const marker = L.marker([ev.latitude!, ev.longitude!], { icon }).addTo(map);

          const time = ev.time?.substring(0, 5) ?? '';
          marker.bindPopup(`
            <div style="min-width: 160px; font-family: system-ui, sans-serif;">
              <p style="font-weight: 600; font-size: 13px; margin: 0 0 4px;">${ev.title}</p>
              <p style="font-size: 11px; color: #6B7280; margin: 0 0 2px;">${ev.date} ${time}</p>
              ${ev.location_name ? `<p style="font-size: 11px; color: #6B7280; margin: 0 0 6px;">📍 ${ev.location_name}</p>` : ''}
              <a href="/events/${ev.id}" style="font-size: 12px; color: #F26522; text-decoration: none; font-weight: 500;">Detaylar &rarr;</a>
            </div>
          `);
        });

        // Fit bounds if multiple events
        if (mappableEvents.length > 1) {
          const bounds = L.latLngBounds(mappableEvents.map((e) => [e.latitude!, e.longitude!]));
          map.fitBounds(bounds, { padding: [40, 40] });
        }

        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError('Harita yüklenemedi');
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events, center, mappableEvents.length]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 px-4">
        <MapPin size={48} style={{ color: 'var(--color-text-muted)' }} />
        <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: 'calc(100dvh - 220px)' }}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
      {!loading && mappableEvents.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3" style={{ background: 'var(--color-bg)' }}>
          <MapPin size={48} style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
            Haritada gösterilecek konum bilgisi olan etkinlik bulunamadı.
          </p>
        </div>
      )}
    </div>
  );
}
