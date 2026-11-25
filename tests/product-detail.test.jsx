import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { ProductDetailPage } from "../src/components/pages/ProductDetailPage.jsx";
import { ProductCard } from "../src/components/product/ProductCard.jsx";
import { useI18n } from "../src/hooks/use-i18n.jsx";
import { DEFAULT_RATING, getProductRating, isOutOfStock } from "../src/lib/product.js";

const localeDict = JSON.parse(readFileSync(join(process.cwd(), "src", "locales", "vi", "storefront.json"), "utf8"));

// jsdom has no matchMedia; Ant Design's responsive Row subscribes to it on mount.
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

const base = { name: "Bộ chăn ga Everon EPC - 23044", category: "Đệm Everon", categories: ["Đệm Everon"], sale: "-30%", price: "3.430.000đ", oldPrice: "4.900.000đ", image: "/a.png" };

function Detail({ product, onAddToCart = () => {} }) {
  return <ProductDetailPage product={product} relatedProducts={[]} langTools={useI18n("vi", localeDict)} onAddToCart={onAddToCart} />;
}

function Card({ product }) {
  const { dict, labelProduct } = useI18n("vi", localeDict);
  return <ProductCard product={product} labelProduct={labelProduct} dict={dict} />;
}

const filledStars = (container) => container.querySelectorAll(".ant-rate-star-full").length;

test("getProductRating defaults to 5 for missing or invalid values", () => {
  expect(getProductRating({})).toBe(DEFAULT_RATING);
  expect(getProductRating({ rating: null })).toBe(DEFAULT_RATING);
  expect(getProductRating({ rating: "" })).toBe(DEFAULT_RATING);
  expect(getProductRating({ rating: 9 })).toBe(DEFAULT_RATING);
  expect(getProductRating({ rating: 4.5 })).toBe(4.5);
  expect(getProductRating({ rating: 0 })).toBe(0);
  expect(isOutOfStock({ outOfStock: true })).toBe(true);
  expect(isOutOfStock({ outOfStock: "true" })).toBe(false);
});

test("in-stock product shows 'Còn hàng', material, rating and an enabled add-to-cart", () => {
  const onAddToCart = vi.fn();
  const product = { ...base, material: "Cotton Modal", rating: 4 };
  const { container, getByRole, getByText } = render(<Detail product={product} onAddToCart={onAddToCart} />);

  expect(container.querySelector(".product-detail-status").textContent).toBe(localeDict.inStock);
  expect(getByText(localeDict.productMaterial)).toBeTruthy();
  expect(getByText("Cotton Modal")).toBeTruthy();
  expect(container.querySelector(".product-detail-rating").getAttribute("aria-label")).toBe("Đánh giá 4/5");
  expect(filledStars(container.querySelector(".product-detail-rating"))).toBe(4);
  expect(container.querySelector(".product-detail-stock-badge")).toBeNull();

  const addButton = getByRole("button", { name: new RegExp(localeDict.addToCart) });
  expect(addButton.disabled).toBe(false);
  fireEvent.click(addButton);
  expect(onAddToCart).toHaveBeenCalledWith(product);
});

test("out-of-stock product shows 'Hết hàng', a notice, and cannot be added to the cart", () => {
  const onAddToCart = vi.fn();
  const { container, getByRole } = render(<Detail product={{ ...base, outOfStock: true }} onAddToCart={onAddToCart} />);

  expect(container.querySelector(".product-detail-status").textContent).toBe(localeDict.outOfStock);
  expect(container.querySelector(".product-detail-page.is-out-of-stock")).not.toBeNull();
  expect(container.querySelector(".product-detail-stock-badge").textContent).toBe(localeDict.outOfStock);
  expect(container.textContent).toContain(localeDict.outOfStockNotice);

  const addButton = getByRole("button", { name: new RegExp(localeDict.addToCart) });
  expect(addButton.disabled).toBe(true);
  fireEvent.click(addButton);
  expect(onAddToCart).not.toHaveBeenCalled();
});

test("product without material or rating hides the material row and shows 5 stars", () => {
  const { container, queryByText } = render(<Detail product={base} />);

  expect(queryByText(localeDict.productMaterial)).toBeNull();
  expect(filledStars(container.querySelector(".product-detail-rating"))).toBe(5);
});

test("card and detail page agree on rating and stock status", () => {
  const product = { ...base, rating: 3, outOfStock: true };
  const card = render(<Card product={product} />);
  const cardStars = filledStars(card.container.querySelector(".product-card-rating"));
  const cardOut = card.container.querySelector(".product-card.is-out-of-stock") !== null;
  cleanup();

  const detail = render(<Detail product={product} />);
  expect(filledStars(detail.container.querySelector(".product-detail-rating"))).toBe(cardStars);
  expect(detail.container.querySelector(".product-detail-page.is-out-of-stock") !== null).toBe(cardOut);
});

test("getDisplayProductCode reads model codes, skips brand words and returns null without one", async () => {
  const { getDisplayProductCode } = await import("../src/lib/product.js");
  const code = (name) => getDisplayProductCode({ name });

  expect(code("Bộ chăn ga Everon EPC - 23044")).toBe("EPC-23044");
  expect(code("Bộ chăn ga Everon EPM-22061")).toBe("EPM-22061");
  expect(code("Bộ chăn ga gối Everon ESC 20003")).toBe("ESC-20003");
  expect(code("Bộ chăn ga gối Everon EP1837 - TREE")).toBe("EP1837-TREE");
  expect(code("Bộ chăn ga Everon Basic BPC-701")).toBe("BPC-701");
  expect(code("Bộ chăn ga gối EVERON EST - 21031")).toBe("EST-21031");
  expect(code("Đệm bông ép Everon")).toBeNull();
  expect(code("Topper Everon AVIV")).toBeNull();
});

test("display codes never leak brand names across the real catalogue", async () => {
  const { getDisplayProductCode } = await import("../src/lib/product.js");
  const storefront = JSON.parse(readFileSync(join(process.cwd(), "backend", "data", "storefront.json"), "utf8"));
  const codes = storefront.products.map(getDisplayProductCode).filter(Boolean);

  expect(codes.length).toBeGreaterThan(300);
  expect(codes.some((value) => /EVERON|ARTEMIS/.test(value))).toBe(false);
});

test("product links keep the existing code format", async () => {
  const { buildProductUrl } = await import("../src/lib/runtime.js");
  expect(buildProductUrl({ name: "Bộ chăn ga Everon EPM-22061" })).toBe("/product/?slug=bo-chan-ga-everon-epm-22061&code=EPM-22061");
});

test("breadcrumb shows Trang chủ › category › product", () => {
  const { container } = render(<Detail product={base} />);
  const crumbs = [...container.querySelectorAll(".page-breadcrumb .ant-breadcrumb-link, .page-breadcrumb li > span:not(.ant-breadcrumb-separator)")]
    .map((node) => node.textContent)
    .filter(Boolean);

  expect(crumbs).toEqual([localeDict.topPages.home, base.category, base.name]);
  expect(container.querySelector('.page-breadcrumb [aria-current="page"]').textContent).toBe(base.name);
});

test("spec table lists code, category, collection, material and status from the data only", () => {
  const product = { ...base, collection: "Bộ sưu tập 2025", material: "Cotton Modal" };
  const { container } = render(<Detail product={product} />);
  const rows = [...container.querySelectorAll(".product-specs-table tr")].map((row) => [
    row.querySelector(".ant-descriptions-item-label").textContent,
    row.querySelector(".ant-descriptions-item-content").textContent,
  ]);

  expect(rows).toEqual([
    [localeDict.productCode, "EPC-23044"],
    [localeDict.productCategory, base.category],
    [localeDict.productCollection, "Bộ sưu tập 2025"],
    [localeDict.productMaterial, "Cotton Modal"],
    [localeDict.productStatus, localeDict.inStock],
  ]);
});

test("spec table hides the code row when the name has no model code", () => {
  const { container } = render(<Detail product={{ ...base, name: "Đệm bông ép Everon" }} />);
  const labels = [...container.querySelectorAll(".product-specs-table .ant-descriptions-item-label")].map((node) => node.textContent);
  expect(labels).not.toContain(localeDict.productCode);
});

function DetailWithBuyNow({ product, onBuyNow }) {
  return <ProductDetailPage product={product} relatedProducts={[]} langTools={useI18n("vi", localeDict)} onAddToCart={() => {}} onBuyNow={onBuyNow} />;
}

test("'Mua ngay' hands the product to onBuyNow and is disabled when out of stock", () => {
  const onBuyNow = vi.fn();
  const inStock = render(<DetailWithBuyNow product={base} onBuyNow={onBuyNow} />);
  fireEvent.click(inStock.getByRole("button", { name: new RegExp(localeDict.buyNow) }));
  expect(onBuyNow).toHaveBeenCalledWith(base);
  cleanup();

  onBuyNow.mockClear();
  const soldOut = render(<DetailWithBuyNow product={{ ...base, outOfStock: true }} onBuyNow={onBuyNow} />);
  const button = soldOut.getByRole("button", { name: new RegExp(localeDict.buyNow) });
  expect(button.disabled).toBe(true);
  fireEvent.click(button);
  expect(onBuyNow).not.toHaveBeenCalled();
});
