// Product search shared by the header suggestions and the search results page.

// Lowercase, strip Vietnamese diacritics (incl. đ) and collapse spaces: "Đệm  Bông ép" -> "dem bong ep".
export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function haystack(product, labelProduct) {
  return normalizeSearchText([product.name, labelProduct?.(product), product.category, product.collection].filter(Boolean).join(" "));
}

/**
 * Every word of the query must appear (with or without accents) in the product name, label,
 * category or collection. Results are ranked: whole phrase at the start of the name, then whole
 * phrase anywhere, then word matches; ties keep catalogue order.
 */
export function searchProducts(products = [], query = "", labelProduct) {
  const phrase = normalizeSearchText(query);
  if (!phrase) return [];
  const words = phrase.split(" ");
  return products
    .map((product, index) => {
      const text = haystack(product, labelProduct);
      if (!words.every((word) => text.includes(word))) return null;
      const name = normalizeSearchText(labelProduct?.(product) ?? product.name);
      const rank = name.startsWith(phrase) ? 0 : name.includes(phrase) ? 1 : text.includes(phrase) ? 2 : 3;
      return { product, index, rank };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ product }) => product);
}

export const MIN_SUGGEST_LENGTH = 2;
export const MAX_SUGGESTIONS = 6;
