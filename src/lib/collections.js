// Product collections ("Bộ sưu tập 2025", ...) taken from the optional product.collection field.

const collator = new Intl.Collator("vi", { numeric: true, sensitivity: "base" });

function collectionOf(product) {
  return typeof product?.collection === "string" ? product.collection.trim() : "";
}

// Distinct collection names, newest first ("Bộ sưu tập 2027" before "Bộ sưu tập 2025").
// Products without a collection are ignored.
export function getCollections(products = []) {
  const names = new Set(products.map(collectionOf).filter(Boolean));
  return [...names].sort((a, b) => collator.compare(b, a));
}

export function productsByCollection(products = [], collection) {
  return products.filter((product) => collectionOf(product) === collection);
}
