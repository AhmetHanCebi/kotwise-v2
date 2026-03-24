/**
 * Shared image utility functions for consistent fallback handling.
 */

/** Stock room photos from Unsplash — used when a listing has no images at all */
const ROOM_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop',
];

/** Neutral fallback when an image fails to load */
export const IMAGE_FALLBACK = 'https://placehold.co/400x300/f3f4f6/9ca3af?text=Foto%C4%9Fraf+Yok';
export const IMAGE_FALLBACK_LARGE = 'https://placehold.co/800x600/f3f4f6/9ca3af?text=Foto%C4%9Fraf+Yok';
export const IMAGE_FALLBACK_SMALL = 'https://placehold.co/200x200/f3f4f6/9ca3af?text=Foto%C4%9Fraf+Yok';

/** Stock avatar photos for roommate profiles */
const AVATAR_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
];

/** Get a deterministic room placeholder based on listing id */
export function getRoomPlaceholder(id?: string): string {
  if (!id) return ROOM_PLACEHOLDERS[0];
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ROOM_PLACEHOLDERS[hash % ROOM_PLACEHOLDERS.length];
}

/** Get a deterministic avatar placeholder based on user id */
export function getAvatarPlaceholder(id?: string): string {
  if (!id) return AVATAR_PLACEHOLDERS[0];
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PLACEHOLDERS[hash % AVATAR_PLACEHOLDERS.length];
}

interface ListingLike {
  id?: string;
  listing_images?: { url: string; is_cover: boolean; order?: number }[];
}

/** Extract the cover image for a listing, with stock photo fallback */
export function getCoverImage(listing: ListingLike): string {
  const imgs = listing.listing_images;
  if (!imgs || imgs.length === 0) {
    return getRoomPlaceholder(listing.id);
  }
  const cover = imgs.find((i) => i.is_cover);
  return cover?.url || imgs[0]?.url || getRoomPlaceholder(listing.id);
}

/** Standard onError handler for listing images */
export function handleListingImageError(e: React.SyntheticEvent<HTMLImageElement>, listingId?: string) {
  const target = e.target as HTMLImageElement;
  // Prevent infinite loop: if already on final fallback, stop
  if (target.src.includes('placehold.co')) return;
  // Broken unsplash URL → go straight to placeholder
  if (target.src.includes('unsplash.com')) {
    target.src = IMAGE_FALLBACK;
    return;
  }
  target.src = getRoomPlaceholder(listingId);
}

/** Standard onError handler for avatar images */
export function handleAvatarError(e: React.SyntheticEvent<HTMLImageElement>, userId?: string, name?: string) {
  const target = e.target as HTMLImageElement;
  if (target.src.includes('ui-avatars.com')) return;
  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name?.[0] ?? 'K')}&background=F26522&color=fff&size=200`;
}
