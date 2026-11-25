import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";

vi.mock("../src/lib/runtime.js", async (importOriginal) => ({
  ...(await importOriginal()),
  navigateToTopPage: vi.fn(),
}));

const { navigateToTopPage } = await import("../src/lib/runtime.js");
const { SiteHeader } = await import("../src/components/layout/SiteHeader.jsx");
const { toTelHref } = await import("../src/components/layout/ShowroomList.jsx");

const dict = JSON.parse(readFileSync(join(process.cwd(), "src", "locales", "vi", "storefront.json"), "utf8"));
const storefront = JSON.parse(readFileSync(join(process.cwd(), "backend", "data", "storefront.json"), "utf8"));
const [showroom] = storefront.showrooms;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function Header(props) {
  return (
    <SiteHeader
      dict={dict}
      searchText=""
      setSearchText={() => {}}
      submitSearch={() => {}}
      onOpenMobileNav={() => {}}
      mapUrl={showroom.mapUrl}
      hotlineHref={toTelHref(showroom.phone)}
      {...props}
    />
  );
}

test("shows the Everon logo, which exists in public assets, and links home", () => {
  const { getByRole } = render(<Header />);
  const logo = getByRole("img", { name: "Everon" });

  expect(logo.getAttribute("src")).toBe("/assets/everon-logo.png");
  expect(existsSync(join(process.cwd(), "public", "assets", "everon-logo.png"))).toBe(true);

  fireEvent.click(getByRole("link", { name: "Everon" }));
  expect(navigateToTopPage).toHaveBeenCalledWith("home");
});

test("shows the tagline from the locale", () => {
  const { container } = render(<Header />);
  const lines = [...container.querySelectorAll(".site-header-tagline span")].map((node) => node.textContent);
  expect(lines).toEqual([dict.headerTaglineTop, dict.headerTaglineBottom]);
});

test("shows 234 Tôn Đức Thắng linking to the map, and the hotline as a tel: link", () => {
  const { container } = render(<Header />);
  const address = container.querySelector("a.site-header-address");
  const hotline = container.querySelector("a.site-header-hotline");

  expect(address.textContent).toContain("234 Tôn Đức Thắng");
  expect(address.getAttribute("href")).toBe(showroom.mapUrl);
  expect(address.getAttribute("target")).toBe("_blank");
  expect(hotline.getAttribute("href")).toBe("tel:0966452111");
});

test("without a map link the address is plain text and there is no hotline link", () => {
  const { container } = render(<Header mapUrl={undefined} hotlineHref={undefined} />);
  expect(container.querySelector("a.site-header-address")).toBeNull();
  expect(container.querySelector(".site-header-address").textContent).toContain("234 Tôn Đức Thắng");
  expect(container.querySelector(".site-header-hotline")).toBeNull();
});

test("the search icon button and Enter both submit the search", () => {
  const submitSearch = vi.fn();
  const { getByRole } = render(<Header searchText="đệm" submitSearch={submitSearch} />);

  const button = getByRole("button", { name: dict.searchButton });
  expect(button.textContent).toBe("");
  expect(button.querySelector("svg")).not.toBeNull();
  fireEvent.click(button);
  fireEvent.submit(getByRole("search"));

  expect(submitSearch).toHaveBeenCalledTimes(2);
});
