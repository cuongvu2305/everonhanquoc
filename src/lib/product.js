// Shared readers for optional product fields, so cards and the detail page agree.

export const DEFAULT_RATING = 5;

// product.rating is optional; missing or invalid values (incl. null, "", out of 0-5) fall back to 5 stars.
export function getProductRating(product) {
  const value = product?.rating;
  if (value === null || value === undefined || value === "") return DEFAULT_RATING;
  const rating = Number(value);
  return Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating : DEFAULT_RATING;
}

export function isOutOfStock(product) {
  return product?.outOfStock === true;
}

export function formatRatingLabel(template, rating) {
  return String(template ?? "").replace("{rating}", rating);
}
