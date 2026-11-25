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

// "3.430.000đ" -> 3430000. Returns null when there is no price to compare (e.g. "Liên hệ").
export function parsePrice(price) {
  if (typeof price === "number") return Number.isFinite(price) ? price : null;
  const digits = String(price ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

export const PRODUCT_SORTS = ["default", "priceAsc", "priceDesc"];

// Stable sort by price; products without a parsable price always go last. Never mutates the input.
export function sortProducts(products = [], sort = "default") {
  if (sort !== "priceAsc" && sort !== "priceDesc") return products;
  const direction = sort === "priceAsc" ? 1 : -1;
  return products
    .map((product, index) => ({ product, index, price: parsePrice(product.price) }))
    .sort((a, b) => {
      if (a.price === null || b.price === null) return (a.price === null) - (b.price === null) || a.index - b.index;
      return (a.price - b.price) * direction || a.index - b.index;
    })
    .map(({ product }) => product);
}

// Display-only model code from the product name: "EPC - 23044" -> "EPC-23044", "ESC 20003" -> "ESC-20003",
// "EP1837 - TREE" -> "EP1837-TREE". Returns null when the name carries no code (e.g. most mattresses).
// Not used for URLs: runtime.extractProductCode builds product links and must stay unchanged.
const BRAND_WORDS = /(^|[^\p{L}\d])(?:EVERON|ARTEMIS)(?=$|[^\p{L}\d])/gu;
const MODEL_CODE = /(?<![\p{L}\d])([A-Z]{2,}\d*)(?:\s*-\s*|\s+)([A-Z]*\d[A-Z0-9]*|[A-Z]{3,})(?![\p{L}\d])/u;

export function getDisplayProductCode(product) {
  const name = String(product?.name ?? "").replace(BRAND_WORDS, "$1 ");
  const match = name.match(MODEL_CODE);
  return match ? `${match[1]}-${match[2]}` : null;
}
