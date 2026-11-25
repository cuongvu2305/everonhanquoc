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

// Gallery, specs and size/price variants for one product; loaded only on its detail page.
export function useProductDetails(detailId) {
  const [state, setState] = useState({ detailId: null, details: null, loading: false, error: false });

  useEffect(() => {
    if (!detailId) {
      setState({ detailId: null, details: null, loading: false, error: false });
      return undefined;
    }
    let active = true;
    setState({ detailId, details: null, loading: true, error: false });
    storefrontService
      .getProductDetails(detailId)
      .then((details) => { if (active) setState({ detailId, details, loading: false, error: false }); })
      .catch(() => { if (active) setState({ detailId, details: null, loading: false, error: true }); });
    return () => { active = false; };
  }, [detailId]);

  // Ignore a response that belongs to the previously viewed product.
  return state.detailId === detailId ? state : { detailId, details: null, loading: Boolean(detailId), error: false };
}
