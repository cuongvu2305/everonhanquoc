export const SUPPORTED_LANGUAGES = ["vi", "en"];
export const DEFAULT_LANGUAGE = "vi";
export const LANGUAGE_STORAGE_KEY = "everonhanquoc-lang";

export function getStoredLanguage() {
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : DEFAULT_LANGUAGE;
}

export function persistLanguage(language) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  document.documentElement.lang = language;
}
