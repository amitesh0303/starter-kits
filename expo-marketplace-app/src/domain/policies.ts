import { Listing, Review } from "./entities";

export const MIN_PRICE = 0.01;
export const MAX_PRICE = 999999.99;
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 5000;

export function isValidListing(listing: Partial<Listing>): { valid: boolean; reason?: string } {
  if (!listing.title || listing.title.trim().length === 0) return { valid: false, reason: "Title required" };
  if (listing.title && listing.title.length > MAX_TITLE_LENGTH) return { valid: false, reason: "Title too long" };
  if (listing.price !== undefined && (listing.price < MIN_PRICE || listing.price > MAX_PRICE)) return { valid: false, reason: "Invalid price" };
  return { valid: true };
}

export function canPurchase(listing: Listing, buyerId: string): boolean {
  if (listing.status !== "active") return false;
  if (listing.sellerId === buyerId) return false;
  return true;
}

export function calculateSellerRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function isValidRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}
