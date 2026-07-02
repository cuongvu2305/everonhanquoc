async function requestJson(url, fallbackMessage) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(fallbackMessage);
  }
  return response.json();
}

const storefrontService = {
  getStorefront() {
    return requestJson("/api/storefront", "Unable to load storefront data");
  },
  getLocale(lang) {
    return requestJson(`/locales/${lang}.json?v=locale-1`, "Unable to load locale data");
  },
};
