export async function fetchStorefront() {
  const response = await fetch("/api/storefront");
  if (!response.ok) {
    throw new Error("Unable to load storefront data");
  }
  return response.json();
}
