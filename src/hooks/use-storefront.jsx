import { message, useEffect, useState } from "../app/globals.jsx";
import { storefrontService } from "../services/api/storefront.service.jsx";

export function useStorefront() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    storefrontService
      .getStorefront()
      .then((data) => { if (active) setStore(data); })
      .catch(() => message.error("Không tải được API storefront"))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { store, loading };
}

export function useLocale(lang) {
  const [localeDict, setLocaleDict] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    document.documentElement.lang = lang;
    setLoading(true);
    storefrontService
      .getLocale(lang)
      .then((data) => { if (active) setLocaleDict(data); })
      .catch(() => message.error("Không tải được dữ liệu ngôn ngữ"))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [lang]);

  return { localeDict, loading };
}
