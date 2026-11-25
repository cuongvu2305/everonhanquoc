import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { getCollections, productsByCollection } from "../src/lib/collections.js";
import { HomePage } from "../src/components/pages/HomePage.jsx";
import { useI18n } from "../src/hooks/use-i18n.jsx";

const storefront = JSON.parse(readFileSync(join(process.cwd(), "backend", "data", "storefront.json"), "utf8"));
const localeDict = JSON.parse(readFileSync(join(process.cwd(), "src", "locales", "vi", "storefront.json"), "utf8"));

// jsdom has no matchMedia; Ant Design's responsive Row and Carousel subscribe to it on mount.
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

afterEach(cleanup);

const sample = [
  { name: "A", collection: "Bộ sưu tập 2025" },
  { name: "B" },
  { name: "C", collection: "Bộ sưu tập 2027" },
  { name: "D", collection: "  " },
  { name: "E", collection: "Bộ sưu tập 2025" },
];

test("getCollections lists distinct collections newest first and skips products without one", () => {
  expect(getCollections(sample)).toEqual(["Bộ sưu tập 2027", "Bộ sưu tập 2025"]);
  expect(getCollections([])).toEqual([]);
});

test("productsByCollection returns only that collection's products", () => {
  expect(productsByCollection(sample, "Bộ sưu tập 2025").map((p) => p.name)).toEqual(["A", "E"]);
  expect(productsByCollection(sample, "Bộ sưu tập 2030")).toEqual([]);
});

test("storefront data assigns collections to some, not all, products", () => {
  const withCollection = storefront.products.filter((product) => product.collection);
  expect(withCollection.length).toBeGreaterThan(0);
  expect(withCollection.length).toBeLessThan(storefront.products.length);
  for (const product of withCollection) {
    expect(product.collection).toMatch(/^Bộ sưu tập \d{4}$/);
  }
});

function HomeWithLocale({ store }) {
  return <HomePage store={store} langTools={useI18n("vi", localeDict)} />;
}

test("home page shows a carousel per collection above the category carousels", () => {
  const store = {
    ...storefront,
    banners: [],
    products: [
      { name: "Có bộ sưu tập", category: "Đệm Everon", categories: ["Đệm Everon"], collection: "Bộ sưu tập 2025", price: "1đ", image: "/a.png" },
      { name: "Không bộ sưu tập", category: "Đệm Everon", categories: ["Đệm Everon"], price: "1đ", image: "/b.png" },
    ],
  };
  const { container } = render(<HomeWithLocale store={store} />);

  const sections = [...container.querySelectorAll(".home-product-sections > .product-carousel-section")];
  const titles = sections.map((section) => section.querySelector(".product-carousel-title").textContent);
  expect(titles[0]).toBe("Bộ sưu tập 2025");
  expect(titles.slice(1)).toHaveLength(storefront.tiles.length);

  const collectionSection = sections[0];
  expect(collectionSection.querySelector(".product-carousel-title-button")).toBeNull();
  const names = [...collectionSection.querySelectorAll(".product-card h5")].map((node) => node.textContent);
  expect(names).toEqual(["Có bộ sưu tập"]);
});

test("home page renders no collection carousel when no product has a collection", () => {
  const store = { ...storefront, banners: [], products: storefront.products.map((product) => ({ ...product, collection: undefined })) };
  const { container } = render(<HomeWithLocale store={store} />);

  const sections = container.querySelectorAll(".home-product-sections > .product-carousel-section");
  expect(sections).toHaveLength(storefront.tiles.length);
});
