import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";

vi.mock("../src/lib/runtime.js", async (importOriginal) => ({
  ...(await importOriginal()),
  navigateToProduct: vi.fn(),
}));

const { navigateToProduct } = await import("../src/lib/runtime.js");
const { normalizeSearchText, searchProducts, MAX_SUGGESTIONS } = await import("../src/lib/search.js");
const { HeaderSearch } = await import("../src/components/layout/HeaderSearch.jsx");

const dict = JSON.parse(readFileSync(join(process.cwd(), "src", "locales", "vi", "storefront.json"), "utf8"));
const storefront = JSON.parse(readFileSync(join(process.cwd(), "backend", "data", "storefront.json"), "utf8"));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const product = (name, extra = {}) => ({ name, category: "Đệm Everon", price: "1.000.000đ", image: "/a.png", ...extra });

test("normalizeSearchText strips accents, đ and punctuation", () => {
  expect(normalizeSearchText("  Đệm  Bông-ép ")).toBe("dem bong ep");
  expect(normalizeSearchText("EPC - 23044")).toBe("epc 23044");
});

test("searchProducts matches every word without accents and ranks name prefixes first", () => {
  const products = [
    product("Vỏ bọc đệm bông ép chất liệu gấm"),
    product("Đệm bông ép Everon"),
    product("Ruột gối Everon"),
    product("Bộ chăn ga", { category: "Đệm bông ép" }),
  ];

  expect(searchProducts(products, "dem bong ep").map((p) => p.name)).toEqual([
    "Đệm bông ép Everon",
    "Vỏ bọc đệm bông ép chất liệu gấm",
    "Bộ chăn ga",
  ]);
  expect(searchProducts(products, "gối everon").map((p) => p.name)).toEqual(["Ruột gối Everon"]);
  expect(searchProducts(products, "   ")).toEqual([]);
});

test("unaccented queries find real catalogue products", () => {
  expect(searchProducts(storefront.products, "dem bong ep").length).toBeGreaterThan(0);
  expect(searchProducts(storefront.products, "epc 23044").map((p) => p.name)).toContain("Bộ chăn ga Everon EPC - 23044");
});

function Search({ value, onSubmit = () => {}, products = storefront.products }) {
  return <HeaderSearch dict={dict} value={value} onChange={() => {}} onSubmit={onSubmit} products={products} />;
}

test("typing shows up to 6 suggestions with image, name and price, plus a see-all link", () => {
  const { getByRole, getAllByRole, getByText } = render(<Search value="dem" />);
  fireEvent.focus(getByRole("combobox"));

  const options = getAllByRole("option");
  expect(options).toHaveLength(MAX_SUGGESTIONS);
  expect(options[0].querySelector("img")).not.toBeNull();
  expect(options[0].querySelector(".header-search-option-price").textContent).toMatch(/đ/);

  const total = searchProducts(storefront.products, "dem").length;
  expect(getByText(dict.searchSeeAll.replace("{count}", total))).toBeTruthy();
});

test("no panel for a single character; an empty-results message when nothing matches", () => {
  const short = render(<Search value="d" />);
  fireEvent.focus(short.getByRole("combobox"));
  expect(short.queryByRole("listbox")).toBeNull();
  cleanup();

  const none = render(<Search value="zzzz qqqq" />);
  fireEvent.focus(none.getByRole("combobox"));
  expect(none.getByText(dict.emptySearchResults)).toBeTruthy();
});

test("arrow keys highlight a suggestion and Enter opens that product", () => {
  const products = [product("Đệm A"), product("Đệm B")];
  const onSubmit = vi.fn();
  const { getByRole, getAllByRole } = render(<Search value="dem" products={products} onSubmit={onSubmit} />);
  const input = getByRole("combobox");
  fireEvent.focus(input);

  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(getAllByRole("option")[1].getAttribute("aria-selected")).toBe("true");
  expect(input.getAttribute("aria-activedescendant")).toBe(getAllByRole("option")[1].id);

  fireEvent.keyDown(input, { key: "Enter" });
  expect(navigateToProduct).toHaveBeenCalledWith(products[1]);
  expect(onSubmit).not.toHaveBeenCalled();
});

test("clicking a suggestion opens it; Escape closes the panel", () => {
  const products = [product("Đệm A")];
  const { getByRole, queryByRole } = render(<Search value="dem" products={products} />);
  const input = getByRole("combobox");
  fireEvent.focus(input);

  fireEvent.click(getByRole("option"));
  expect(navigateToProduct).toHaveBeenCalledWith(products[0]);

  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: "Escape" });
  expect(queryByRole("listbox")).toBeNull();
});
