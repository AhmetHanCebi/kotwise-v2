'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/currency-utils';

interface ListingPin {
  id: string;
  title: string;
  price_per_month: number;
  lat: number | null;
  lng: number | null;
  address?: string | null;
  university_name?: string | null;
  rating?: number;
}

interface ListingMapProps {
  listings: ListingPin[];
  center?: { lat: number; lng: number };
  zoom?: number;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  height?: string;
  singlePin?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as Record<string, unknown>).L) {
      resolve((window as unknown as Record<string, unknown>).L);
      return;
    }
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve((window as unknown as Record<string, unknown>).L);
    script.onerror = () => reject(new Error('Failed to load Leaflet'));
    document.head.appendChild(script);
  });
}

export default function ListingMap({ listings, center, zoom, selectedId, onSelect, height, singlePin }: ListingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mappable = listings.filter((l) => l.lat != null && l.lng != null);

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    const init = async () => {
      try {
        const L = await loadLeaflet();
        if (cancelled || !mapRef.current) return;

        if (mapInstanceRef.current) {
          (mapInstanceRef.current as { remove: () => void }).remove();
        }

        const fallbackCenter = { lat: 48.8566, lng: 2.3522 }; // Paris
        let mapCenter: [number, number];

        if (center) {
          // Explicit center provided (e.g. selected city) — respect it
          mapCenter = [center.lat, center.lng];
        } else if (mappable.length > 0) {
          const avgLat = mappable.reduce((s, l) => s + l.lat!, 0) / mappable.length;
          const avgLng = mappable.reduce((s, l) => s + l.lng!, 0) / mappable.length;
          mapCenter = [avgLat, avgLng];
        } else {
          mapCenter = [fallbackCenter.lat, fallbackCenter.lng];
        }

        const defaultZoom = zoom ?? (singlePin ? 15 : 13);
        const map = L.map(mapRef.current).setView(mapCenter, defaultZoom);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mappable.forEach((listing) => {
          const isSelected = selectedId === listing.id;
          const icon = L.divIcon({
            className: 'listing-map-pin',
            html: `<div style="
              padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 700;
              white-space: nowrap; cursor: pointer;
              background: ${isSelected ? '#1B2A4A' : '#FFFFFF'};
              color: ${isSelected ? '#FFFFFF' : '#1B2A4A'};
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              border: 1.5px solid ${isSelected ? '#1B2A4A' : '#E5E7EB'};
            ">${formatPrice(listing.price_per_month)} TL</div>`,
            iconSize: [80, 28],
            iconAnchor: [40, 14],
            popupAnchor: [0, -20],
          });

          const marker = L.marker([listing.lat!, listing.lng!], { icon }).addTo(map);

          marker.bindPopup(`
            <div style="min-width: 140px; font-family: system-ui, sans-serif;">
              <p style="font-weight: 600; font-size: 13px; margin: 0 0 4px;">${listing.title}</p>
              <p style="font-size: 12px; color: #F26522; font-weight: 700; margin: 0 0 6px;">
                ${formatPrice(listing.price_per_month)} TL/ay
              </p>
              <a href="/listing/${listing.id}" style="font-size: 12px; color: #F26522; text-decoration: none; font-weight: 500;">Detaylar &rarr;</a>
            </div>
          `);

          if (onSelect) {
            marker.on('click', () => onSelect(listing.id));
          }
        });

        if (!center && mappable.length > 1) {
          const bounds = L.latLngBounds(mappable.map((l) => [l.lat!, l.lng!]));
          map.fitBounds(bounds, { padding: [40, 40] });
        }

        setLoading(false);
      } catch {
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
  }, [listings, center, zoom, selectedId, mappable.length, singlePin, onSelect]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <MapPin size={32} style={{ color: 'var(--color-text-muted)' }} />
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: height ?? '100%' }}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      {!loading && mappable.length === 0 && (
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
          <MapPin size={16} style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Henüz konum bilgisi eklenmiş ilan bulunamadı.
          </p>
        </div>
      )}
    </div>
  );
}
