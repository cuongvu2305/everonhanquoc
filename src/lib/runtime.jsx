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

function isSearchPath() {
  const path = window.location.pathname.replace(/\/$/, "");
  return path === "/search";
}

function getSearchQueryFromLocation() {
  const searchParams = new URLSearchParams(window.location.search);
  return (searchParams.get("q") ?? "").trim();
}

function getPageFromHash() {
  if (isSearchPath()) return "search";
  const key = getHashKey();
  if (key.startsWith("category-")) return "category";
  return topPages.some((page) => page.key === key) ? key : "home";
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

function getStoredLang() {
  return localStorage.getItem("everonhanquoc-lang") === "en" ? "en" : "vi";
}

