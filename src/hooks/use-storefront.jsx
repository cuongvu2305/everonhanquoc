function useStorefront(lang) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    storefrontService
      .getStorefront()
      .then((data) => { if (active) setStore(data); })
      .catch(() => message.error(lang === "en" ? "Could not load storefront data" : "Không tải được API storefront"))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [lang]);

  return { store, loading };
}

function useLocale(lang) {
  const [localeDict, setLocaleDict] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    localStorage.setItem("everonhanquoc-lang", lang);
    document.documentElement.lang = lang;
    setLoading(true);
    storefrontService
      .getLocale(lang)
      .then((data) => { if (active) setLocaleDict(data); })
      .catch(() => message.error(lang === "en" ? "Could not load locale data" : "Không tải được dữ liệu ngôn ngữ"))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [lang]);

  return { localeDict, loading };
}
