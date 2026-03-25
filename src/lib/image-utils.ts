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

/** Neutral fallback when an image fails to load — subtle camera icon, no text */
const makePlaceholderSvg = (w: number, h: number) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#f3f4f6"/><g transform="translate(${w / 2 - 16},${h / 2 - 16})"><path d="M6 6h4l2-3h8l2 3h4a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2z" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="16" r="5" fill="none" stroke="#9ca3af" stroke-width="1.5"/></g></svg>`)}`;
export const IMAGE_FALLBACK = makePlaceholderSvg(400, 300);
export const IMAGE_FALLBACK_LARGE = makePlaceholderSvg(800, 600);
export const IMAGE_FALLBACK_SMALL = makePlaceholderSvg(200, 200);

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
  images?: { url: string; is_cover: boolean; order?: number }[];
}

/** Extract the cover image for a listing, with stock photo fallback */
export function getCoverImage(listing: ListingLike): string {
  const imgs = listing.listing_images ?? listing.images;
  if (!imgs || imgs.length === 0) {
    return getRoomPlaceholder(listing.id);
  }
  const cover = imgs.find((i) => i.is_cover);
  return cover?.url || imgs[0]?.url || getRoomPlaceholder(listing.id);
}

/** Standard onError handler for listing images */
export function handleListingImageError(e: React.SyntheticEvent<HTMLImageElement>, listingId?: string) {
  const target = e.target as HTMLImageElement;
  // Prevent infinite loop: if already on SVG data URI fallback, stop
  if (target.src.startsWith('data:')) return;
  // If already tried an Unsplash placeholder, go to SVG fallback
  if (target.src.includes('images.unsplash.com')) {
    target.src = IMAGE_FALLBACK;
    return;
  }
  // First try a stock room photo from Unsplash
  target.src = getRoomPlaceholder(listingId);
}

/** Standard onError handler for avatar images */
export function handleAvatarError(e: React.SyntheticEvent<HTMLImageElement>, userId?: string, name?: string) {
  const target = e.target as HTMLImageElement;
  if (target.src.includes('ui-avatars.com')) return;
  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name?.[0] ?? 'K')}&background=F26522&color=fff&size=200`;
}
