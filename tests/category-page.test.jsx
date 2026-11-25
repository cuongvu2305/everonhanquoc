import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";

vi.mock("../src/lib/runtime.js", async (importOriginal) => ({
  ...(await importOriginal()),
  navigateToTopPage: vi.fn(),
  navigateToCategory: vi.fn(),
  navigateToProduct: vi.fn(),
}));

const { navigateToTopPage } = await import("../src/lib/runtime.js");
const { parsePrice, sortProducts } = await import("../src/lib/product.js");
const { CategoryPage } = await import("../src/components/pages/CategoryPage.jsx");
const { useI18n } = await import("../src/hooks/use-i18n.jsx");

const localeDict = JSON.parse(readFileSync(join(process.cwd(), "src", "locales", "vi", "storefront.json"), "utf8"));
const storefront = JSON.parse(readFileSync(join(process.cwd(), "backend", "data", "storefront.json"), "utf8"));

// jsdom has no matchMedia; Ant Design's responsive Row/Pagination subscribe to it on mount.
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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const CATEGORY = "Đệm Everon";
const makeProducts = (prices) =>
  prices.map((price, index) => ({ name: `SP ${index + 1}`, category: CATEGORY, categories: [CATEGORY], sale: "-10%", price, oldPrice: "", image: `/p${index}.png` }));

function Page({ products }) {
  return <CategoryPage category={CATEGORY} products={products} siblingCategories={[CATEGORY, "Ruột gối everon"]} langTools={useI18n("vi", localeDict)} />;
}

// The grid pads short pages with hidden placeholder cards; skip those.
const visibleNames = (container) =>
  [...container.querySelectorAll(".product-grid .product-card h5")]
    .filter((node) => !node.closest(".product-grid-placeholder"))
    .map((node) => node.textContent);

async function chooseSort(container, label) {
  const select = container.querySelector(".category-sort-select .ant-select-selector");
  await act(async () => {
    fireEvent.mouseDown(select);
  });
  const option = [...document.querySelectorAll(".ant-select-item-option")].find((node) => node.textContent === label);
  await act(async () => {
    fireEvent.click(option);
  });
}

test("parsePrice reads Vietnamese price strings", () => {
  expect(parsePrice("3.430.000đ")).toBe(3430000);
  expect(parsePrice("1.709.100 đ")).toBe(1709100);
  expect(parsePrice(250000)).toBe(250000);
  expect(parsePrice("Liên hệ")).toBeNull();
  expect(parsePrice(undefined)).toBeNull();
});

test("every product in the data has a sortable price", () => {
  expect(storefront.products.every((product) => parsePrice(product.price) !== null)).toBe(true);
});

test("sortProducts orders by price, keeps ties stable, puts unpriced last and does not mutate", () => {
  const products = makeProducts(["2.000.000đ", "Liên hệ", "1.000.000đ", "2.000.000đ", "3.000.000đ"]);
  const snapshot = products.map((product) => product.name);

  expect(sortProducts(products, "priceAsc").map((p) => p.name)).toEqual(["SP 3", "SP 1", "SP 4", "SP 5", "SP 2"]);
  expect(sortProducts(products, "priceDesc").map((p) => p.name)).toEqual(["SP 5", "SP 1", "SP 4", "SP 3", "SP 2"]);
  expect(sortProducts(products, "default")).toBe(products);
  expect(products.map((product) => product.name)).toEqual(snapshot);
});

test("breadcrumb shows Trang chủ › category and links home", () => {
  const { container } = render(<Page products={makeProducts(["1.000.000đ"])} />);
  const nav = container.querySelector("nav.page-breadcrumb");

  expect(nav.getAttribute("aria-label")).toBe(localeDict.breadcrumbLabel);
  const home = within(nav).getByRole("link", { name: localeDict.topPages.home });
  expect(within(nav).getByText(CATEGORY).getAttribute("aria-current")).toBe("page");

  fireEvent.click(home);
  expect(navigateToTopPage).toHaveBeenCalledWith("home");
});

test("sorting by price reorders the grid", async () => {
  const { container } = render(<Page products={makeProducts(["2.000.000đ", "1.000.000đ", "3.000.000đ"])} />);
  expect(visibleNames(container)).toEqual(["SP 1", "SP 2", "SP 3"]);

  await chooseSort(container, localeDict.sortPriceAsc);
  expect(visibleNames(container)).toEqual(["SP 2", "SP 1", "SP 3"]);

  await chooseSort(container, localeDict.sortPriceDesc);
  expect(visibleNames(container)).toEqual(["SP 3", "SP 1", "SP 2"]);

  await chooseSort(container, localeDict.sortDefault);
  expect(visibleNames(container)).toEqual(["SP 1", "SP 2", "SP 3"]);
});

test("pagination is numbered and changing the sort returns to page 1", async () => {
  // 20 products -> 3 pages of 9.
  const prices = Array.from({ length: 20 }, (_, index) => `${(index + 1) * 100}.000đ`);
  const { container } = render(<Page products={makeProducts(prices)} />);
  const pager = container.querySelector(".product-pagination .ant-pagination");

  expect(pager.classList.contains("ant-pagination-simple")).toBe(false);
  expect(container.querySelectorAll(".product-pagination .ant-pagination-item")).toHaveLength(3);

  await act(async () => {
    fireEvent.click(container.querySelector(".ant-pagination-item-2"));
  });
  expect(visibleNames(container)[0]).toBe("SP 10");
  expect(container.querySelector(".ant-pagination-item-active").textContent).toBe("2");

  await chooseSort(container, localeDict.sortPriceDesc);
  expect(container.querySelector(".ant-pagination-item-active").textContent).toBe("1");
  expect(visibleNames(container)[0]).toBe("SP 20");
});

test("sort control is hidden when there is nothing to sort", () => {
  const { container } = render(<Page products={makeProducts(["1.000.000đ"])} />);
  expect(container.querySelector(".category-sort-select")).toBeNull();
});
