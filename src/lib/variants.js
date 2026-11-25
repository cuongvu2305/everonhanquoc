// Size/price variants of a product (from /api/products/<detailId>): { id, name, size, price, oldPrice? }.
import { parsePrice } from "./product.js";

// Group variants by product type ("Set ga chun mỏng ...", "Bộ ga phủ ...") in source order.
export function groupVariants(variants = []) {
  const groups = new Map();
  for (const variant of variants) {
    if (!groups.has(variant.name)) groups.set(variant.name, []);
    groups.get(variant.name).push(variant);
  }
  return [...groups].map(([name, items]) => ({ name, variants: items }));
}

// Pre-select the variant whose price is closest to the price shown on the listing,
// so opening the page does not make the displayed price jump.
export function pickDefaultVariant(variants = [], product = {}) {
  if (!variants.length) return null;
  const listed = parsePrice(product.price);
  if (listed === null) return variants[0];
  let best = variants[0];
  let bestGap = Infinity;
  for (const variant of variants) {
    const gap = Math.abs((parsePrice(variant.price) ?? Infinity) - listed);
    if (gap < bestGap) {
      best = variant;
      bestGap = gap;
    }
  }
  return best;
}

// "160x200" -> "160 x 200 cm"
export function formatSize(size) {
  const match = /^(\d+)x(\d+)$/.exec(String(size ?? ""));
  return match ? `${match[1]} x ${match[2]} cm` : String(size ?? "");
}

export function variantLabel(variant) {
  return variant ? `${variant.name} · ${formatSize(variant.size)}` : "";
}

// Cart line key: the same product in two sizes is two lines.
export function cartKey(slug, variantId) {
  return variantId ? `${slug}#${variantId}` : slug;
}
