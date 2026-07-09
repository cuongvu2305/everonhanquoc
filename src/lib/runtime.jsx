function slugifyCategory(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getHashKey() {
  return window.location.hash.replace("#", "");
}

function getCleanPath() {
  return window.location.pathname.replace(/\/$/, "");
}

function isSearchPath() {
  return getCleanPath() === "/search";
}

function isProductPath() {
  return getCleanPath() === "/product";
}

function getPolicySlugFromLocation() {
  const path = getCleanPath().replace(/^\//, "");
  if (!path) return "";
  return path.endsWith("-pt") ? path : "";
}

function getSearchQueryFromLocation() {
  const searchParams = new URLSearchParams(window.location.search);
  return (searchParams.get("q") ?? "").trim();
}

function getProductSlugFromLocation() {
  const searchParams = new URLSearchParams(window.location.search);
  return (searchParams.get("slug") ?? "").trim();
}

function extractProductCode(product) {
  const match = product.name.match(/[A-Z]{2,}-\d{4,}/);
  return match ? match[0] : slugifyCategory(product.name).slice(0, 32);
}

function slugifyProduct(product) {
  return slugifyCategory(product.name);
}

function buildProductUrl(product) {
  const slug = slugifyProduct(product);
  const code = extractProductCode(product);
  return `/product/?slug=${encodeURIComponent(slug)}&code=${encodeURIComponent(code)}`;
}

function navigateToUrl(url) {
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function navigateToProduct(product) {
  navigateToUrl(buildProductUrl(product));
}

function navigateToCategory(category) {
  navigateToUrl(`/#category-${slugifyCategory(category)}`);
}

function navigateToTopPage(key) {
  navigateToUrl(key === "home" ? "/" : `/#${key}`);
}

function navigateToPolicy(slug) {
  navigateToUrl(`/${slug}`);
}

function getPageFromHash() {
  const key = getHashKey();
  if (key.startsWith("category-")) return "category";
  if (topPages.some((page) => page.key === key)) return key;
  if (isSearchPath()) return "search";
  if (isProductPath()) return "product";
  if (getPolicySlugFromLocation()) return "policy";
  return "home";
}

function getCategorySlugFromHash() {
  const key = getHashKey();
  return key.startsWith("category-") ? key.replace("category-", "") : "";
}

function buildSearchUrl(query) {
  return `/search?q=${encodeURIComponent(query.trim())}`;
}

function parsePrice(value) {
  return Number(String(value).replace(/[^0-9]/g, "")) || 0;
}

function formatPrice(value) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

const CART_STORAGE_KEY = "everonhanquoc-cart";

function getStoredCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((item) => typeof item?.slug === "string" && Number(item?.quantity) > 0);
  } catch {
    return [];
  }
}

function storeCart(cartItems) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}
