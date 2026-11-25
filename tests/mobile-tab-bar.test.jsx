import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";

vi.mock("../src/lib/runtime.js", async (importOriginal) => ({
  ...(await importOriginal()),
  navigateToTopPage: vi.fn(),
  navigateToCategory: vi.fn(),
  navigateToProduct: vi.fn(),
}));

const { navigateToCategory, navigateToTopPage } = await import("../src/lib/runtime.js");
const { MobileTabBar, MobileTrustStrip } = await import("../src/components/layout/MobileTabBar.jsx");
const { ProductCard } = await import("../src/components/product/ProductCard.jsx");
const { getDiscountLabel, shouldShowOldPrice } = await import("../src/lib/product.js");

const dict = JSON.parse(readFileSync(join(process.cwd(), "src", "locales", "vi", "storefront.json"), "utf8"));
const storefront = JSON.parse(readFileSync(join(process.cwd(), "backend", "data", "storefront.json"), "utf8"));
const [showroom] = storefront.showrooms;
const contact = {
  phone: showroom.phone,
  telHref: "tel:0966452111",
  zaloHref: "https://zalo.me/0966452111",
  messengerHref: "https://www.messenger.com/t/1",
  mapUrl: showroom.mapUrl,
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function Bar(props) {
  return <MobileTabBar dict={dict} activePage="home" cartCount={3} categoryGroups={storefront.categoryGroups} contact={contact} {...props} />;
}

const tab = (label) => screen.getByRole("button", { name: new RegExp(label) });

test("shows the five tabs with the cart count; home is marked current", () => {
  render(<Bar />);
  const nav = screen.getByRole("navigation", { name: dict.tabBarLabel });
  const labels = [...nav.querySelectorAll(".mobile-tab-label")].map((node) => node.textContent);

  expect(labels).toEqual([dict.topPages.home, dict.tabCategories, dict.tabMenu, dict.tabContact, dict.cart]);
  expect(nav.querySelector(".ant-badge-count").textContent).toBe("3");
  expect(tab(dict.topPages.home).getAttribute("aria-current")).toBe("page");
});

test("Trang chủ and Giỏ hàng navigate directly", () => {
  render(<Bar />);
  fireEvent.click(tab(dict.topPages.home));
  fireEvent.click(tab(dict.cart));
  expect(navigateToTopPage.mock.calls).toEqual([["home"], ["checkout"]]);
});

test("Danh mục opens a sheet with every group and category; a chip opens that category", async () => {
  render(<Bar />);
  await act(async () => {
    fireEvent.click(tab(dict.tabCategories));
  });

  const sheet = document.querySelector(".mobile-sheet-categories .ant-drawer-body");
  const headings = [...sheet.querySelectorAll("h3")].map((node) => node.textContent);
  expect(headings).toEqual(storefront.categoryGroups.map((group) => group.name));
  expect(sheet.querySelectorAll(".mobile-chip")).toHaveLength(storefront.categories.length);

  fireEvent.click(within(sheet).getByRole("button", { name: "Bộ Everon 2025" }));
  expect(navigateToCategory).toHaveBeenCalledWith("Bộ Everon 2025");
});

test("Menu lists the pages that are not tabs", async () => {
  render(<Bar socialLinks={[{ brand: "facebook", label: "Facebook", href: "https://facebook.com/x" }]} />);
  await act(async () => {
    fireEvent.click(tab(dict.tabMenu));
  });
  const sheet = document.querySelector(".mobile-sheet-menu .ant-drawer-body");

  for (const key of ["news", "sale", "retail", "about", "contact"]) {
    expect(within(sheet).getByRole("button", { name: dict.topPages[key] })).toBeTruthy();
  }
  expect(within(sheet).getByRole("link", { name: /Facebook/ }).getAttribute("target")).toBe("_blank");

  fireEvent.click(within(sheet).getByRole("button", { name: dict.topPages.news }));
  expect(navigateToTopPage).toHaveBeenCalledWith("news");
});

test("Liên hệ gathers call, Zalo, Messenger, directions and the contact page", async () => {
  render(<Bar />);
  await act(async () => {
    fireEvent.click(tab(dict.tabContact));
  });
  const sheet = document.querySelector(".mobile-sheet-contact .ant-drawer-body");
  const hrefs = [...sheet.querySelectorAll("a")].map((link) => link.getAttribute("href"));

  expect(hrefs).toEqual([contact.telHref, contact.zaloHref, contact.messengerHref, contact.mapUrl]);
  expect(sheet.textContent).toContain(dict.contactCall.replace("{phone}", showroom.phone));

  fireEvent.click(within(sheet).getByRole("button", { name: dict.contactPage }));
  expect(navigateToTopPage).toHaveBeenCalledWith("contact");
});

test("trust strip shows 'Chính hãng', the short showroom address and a tel: link", () => {
  const { container } = render(<MobileTrustStrip dict={dict} showroom={showroom} />);
  const strip = container.querySelector(".mobile-trust-strip");

  expect(strip.textContent).toContain(dict.trustGenuine);
  expect(strip.textContent).toContain("234 Tôn Đức Thắng");
  expect(strip.textContent).not.toContain("Đống Đa");
  expect(strip.querySelector('a[href^="tel:"]').getAttribute("href")).toBe("tel:0966452111");
});

test("discount badge and old price only appear for a real discount", () => {
  expect(getDiscountLabel({ sale: "-30%" })).toBe("-30%");
  expect(getDiscountLabel({ sale: "-" })).toBeNull();
  expect(getDiscountLabel({ sale: "" })).toBeNull();
  expect(getDiscountLabel({ sale: "-0%" })).toBeNull();
  expect(shouldShowOldPrice({ price: "1.000.000đ", oldPrice: "1.200.000đ" })).toBe(true);
  expect(shouldShowOldPrice({ price: "1.699.000đ", oldPrice: "1.699.000đ" })).toBe(false);
  expect(shouldShowOldPrice({ price: "1.000.000đ" })).toBe(false);
});

test("a product without discount renders no ribbon and no struck price", () => {
  const product = { name: "SP", category: "Đệm Everon", sale: "-", price: "1.699.000đ", oldPrice: "1.699.000đ", image: "/a.png" };
  const { container } = render(<ProductCard product={product} labelProduct={(p) => p.name} dict={dict} />);

  expect(container.querySelector(".ant-ribbon")).toBeNull();
  expect(container.querySelector("del")).toBeNull();
});
