// Hook shape used by the structured frontend source.
// The CDN runtime currently inlines this logic in src/app/App.jsx to avoid a bundler dependency.
export function useStorefront() {
  const [store, setStore] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch("/api/storefront")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load storefront data");
        return response.json();
      })
      .then(setStore)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { store, loading, error };
}
