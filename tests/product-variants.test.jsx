import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";

vi.mock("../src/services/api/storefront.service.jsx", () => ({
  storefrontService: { getProductDetails: vi.fn() },
}));

const { storefrontService } = await import("../src/services/api/storefront.service.jsx");
const { ProductDetailPage } = await import("../src/components/pages/ProductDetailPage.jsx");
const { useI18n } = await import("../src/hooks/use-i18n.jsx");
const { cartKey, formatSize, groupVariants, pickDefaultVariant, variantLabel } = await import("../src/lib/variants.js");
const { getStoredCart } = await import("../src/lib/runtime.js");

const localeDict = JSON.parse(readFileSync(join(process.cwd(), "src", "locales", "vi", "storefront.json"), "utf8"));
const storefront = JSON.parse(readFileSync(join(process.cwd(), "backend", "data", "storefront.json"), "utf8"));
const allDetails = JSON.parse(readFileSync(join(process.cwd(), "backend", "data", "product-details.json"), "utf8"));

window.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => false,
});

// jsdom only provides localStorage for pages with a URL; use a small in-memory stand-in.
if (!globalThis.localStorage) {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

const product = storefront.products[0]; // Bộ chăn ga Everon EPC - 23044, 3.430.000đ
const details = allDetails[product.detailId];

beforeEach(() => {
  storefrontService.getProductDetails.mockResolvedValue(details);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});

function Detail({ onAddToCart = () => {}, onBuyNow = () => {}, item = product }) {
  return <ProductDetailPage product={item} relatedProducts={[]} langTools={useI18n("vi", localeDict)} onAddToCart={onAddToCart} onBuyNow={onBuyNow} />;
}

async function renderDetail(props) {
  let result;
  await act(async () => {
    result = render(<Detail {...props} />);
  });
  return result;
}

test("every product has details with images; variants are grouped by type in source order", () => {
  for (const item of storefront.products) {
    expect(allDetails[item.detailId]?.images.length).toBeGreaterThan(0);
  }
  const groups = groupVariants(details.variants);
  expect(groups[0].name).toBe(details.variants[0].name);
  expect(groups.reduce((sum, group) => sum + group.variants.length, 0)).toBe(details.variants.length);
});

test("the default variant is the one priced closest to the listing price", () => {
  const variant = pickDefaultVariant(details.variants, product);
  expect(variant.price).toBe("3.429.300đ");
  expect(variant.size).toBe("160x200");
  expect(pickDefaultVariant([], product)).toBeNull();
});

test("helpers format sizes, labels and cart keys", () => {
  expect(formatSize("160x200")).toBe("160 x 200 cm");
  expect(variantLabel({ name: "Ga chun", size: "160x200" })).toBe("Ga chun · 160 x 200 cm");
  expect(cartKey("bo-a", "15904")).toBe("bo-a#15904");
  expect(cartKey("bo-a")).toBe("bo-a");
});

test("the gallery shows every source image with thumbnails and arrows", async () => {
  const { container } = await renderDetail();
  expect(storefrontService.getProductDetails).toHaveBeenCalledWith(product.detailId);

  const thumbs = container.querySelectorAll(".product-gallery-thumb");
  expect(thumbs).toHaveLength(details.images.length);
  const main = () => container.querySelector(".product-gallery-main > img").getAttribute("src");
  expect(main()).toBe(details.images[0]);

  fireEvent.click(screen.getByRole("button", { name: localeDict.galleryNext }));
  expect(main()).toBe(details.images[1]);
  fireEvent.click(thumbs[3]);
  expect(main()).toBe(details.images[3]);
  expect(thumbs[3].getAttribute("aria-current")).toBe("true");
});

test("choosing a size updates the price and is passed to the cart", async () => {
  const onAddToCart = vi.fn();
  const { container } = await renderDetail({ onAddToCart });
  const price = () => container.querySelector(".product-detail-price").textContent;
  expect(price()).toBe("3.429.300đ");

  const sizes = within(screen.getByRole("radiogroup", { name: localeDict.variantSize }));
  fireEvent.click(sizes.getByRole("radio", { name: "200 x 220 cm" }));

  const chosen = details.variants.find((variant) => variant.name.startsWith("Bộ ga chun chần") && variant.size === "200x220");
  expect(price()).toBe(chosen.price);
  expect(sizes.getByRole("radio", { name: "200 x 220 cm" }).getAttribute("aria-checked")).toBe("true");

  fireEvent.click(screen.getByRole("button", { name: new RegExp(localeDict.addToCart) }));
  expect(onAddToCart).toHaveBeenCalledWith(product, chosen);
});

test("the spec table includes the source rows (brand, warranty, color...) without duplicating material", async () => {
  const { container } = await renderDetail();
  const labels = [...container.querySelectorAll(".product-specs-table .ant-descriptions-item-label")].map((node) => node.textContent);

  for (const [label] of details.specs) expect(labels).toContain(label);
  expect(labels.filter((label) => label === "Chất liệu")).toHaveLength(1);
});

test("stored cart lines keep their variant and drop malformed ones", () => {
  localStorage.setItem("everonhanquoc-cart", JSON.stringify([
    { slug: "a", quantity: 2 },
    { slug: "b", quantity: 1, variantId: "15904", variantName: "Ga chun", size: "160x200", price: "1.000.000đ", oldPrice: "1.200.000đ", extra: "x" },
    { slug: "c", quantity: 1, variantId: "1" },
    { slug: "d", quantity: 0 },
  ]));

  expect(getStoredCart()).toEqual([
    { slug: "a", quantity: 2 },
    { slug: "b", quantity: 1, variantId: "15904", variantName: "Ga chun", size: "160x200", price: "1.000.000đ", oldPrice: "1.200.000đ" },
  ]);
});
