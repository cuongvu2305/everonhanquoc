import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Menu } from "../src/app/globals.jsx";
import { topPages } from "../src/constants/navigation.jsx";
import { buildMainNavItems, categoryKey, FOOTER_PAGE_KEYS, groupKey, mainNavSelectedKeys, parseNavKey } from "../src/lib/navigation.js";

const storefront = JSON.parse(readFileSync(join(process.cwd(), "backend", "data", "storefront.json"), "utf8"));
const localeDict = JSON.parse(readFileSync(join(process.cwd(), "src", "locales", "vi", "storefront.json"), "utf8"));
const pageItem = (page) => ({ key: page.key, label: localeDict.topPages[page.key] });

// jsdom lacks ResizeObserver/matchMedia used by the horizontal Menu's overflow handling.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
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

test("every category belongs to exactly one menu group and groups point at real categories", () => {
  const { categories, categoryGroups } = storefront;
  const covered = categoryGroups.flatMap((group) => (group.children.length ? group.children : [group.category]));

  expect(new Set(covered).size).toBe(covered.length);
  expect([...covered].sort()).toEqual([...categories].sort());
  for (const group of categoryGroups) {
    expect(categories).toContain(group.category);
    if (group.children.length) expect(group.children[0]).toBe(group.category);
  }
});

test("main nav lists only the category groups, in data order", () => {
  const items = buildMainNavItems({ groups: storefront.categoryGroups, pages: topPages, pageItem });

  expect(items.map((item) => item.label)).toEqual([
    "Đệm Everon",
    "Everon Giảm Giá",
    "Bộ Chăn Ga Everon",
    "Ruột Chăn Everon",
    "Ruột Gối Everon",
    "Bộ Cao Cấp Artemis",
    "Sản Phẩm Bán Lẻ",
  ]);
  const pageKeys = new Set(topPages.map((page) => page.key));
  expect(items.some((item) => pageKeys.has(item.key))).toBe(false);
});

test("every page except checkout (reached through the cart) is linked from the footer", () => {
  const expected = topPages.map((page) => page.key).filter((key) => key !== "checkout");
  expect([...FOOTER_PAGE_KEYS].sort()).toEqual([...expected].sort());
});

test("groups with children become dropdowns; childless groups link straight to their category", () => {
  const groups = [
    { name: "Đệm", category: "Đệm Everon", children: ["Đệm Everon", "Đệm cao su Everon"] },
    { name: "Artemis", category: "Bộ sản phẩm cao cấp Artemis", children: [] },
  ];
  const [dem, artemis] = buildMainNavItems({ groups, pages: topPages, pageItem, labelCategory: (category) => `~${category}` });

  expect(dem.key).toBe(groupKey("Đệm"));
  expect(dem.children).toEqual([
    { key: categoryKey("Đệm Everon"), label: "~Đệm Everon" },
    { key: categoryKey("Đệm cao su Everon"), label: "~Đệm cao su Everon" },
  ]);
  expect(artemis).toEqual({ key: categoryKey("Bộ sản phẩm cao cấp Artemis"), label: "Artemis" });
});

test("without groups the caller keeps the page-only menu", () => {
  expect(buildMainNavItems({ groups: [], pages: topPages, pageItem })).toBeNull();
  expect(buildMainNavItems({ groups: undefined, pages: topPages, pageItem })).toBeNull();
});

test("menu keys round-trip to navigation targets", () => {
  expect(parseNavKey(categoryKey("Bộ Everon 2025"))).toEqual({ type: "category", value: "Bộ Everon 2025" });
  expect(parseNavKey(groupKey("Đệm"))).toEqual({ type: "group", value: "Đệm" });
  expect(parseNavKey("news")).toEqual({ type: "page", value: "news" });
});

test("the active category is selected on category pages, the page key elsewhere", () => {
  expect(mainNavSelectedKeys({ activePage: "category", activeCategory: "Đệm Everon" })).toEqual([categoryKey("Đệm Everon")]);
  expect(mainNavSelectedKeys({ activePage: "news", activeCategory: "Đệm Everon" })).toEqual(["news"]);
});

test("the horizontal menu renders group titles as submenus", () => {
  const items = buildMainNavItems({ groups: storefront.categoryGroups, pages: topPages, pageItem });
  const { container } = render(<Menu className="nav-bar" mode="horizontal" items={items} selectedKeys={["home"]} />);

  const submenuTitles = [...container.querySelectorAll(".ant-menu-submenu-title")].map((node) => node.textContent);
  const withChildren = storefront.categoryGroups.filter((group) => group.children.length).map((group) => group.name);
  for (const name of withChildren) expect(submenuTitles).toContain(name);
});
