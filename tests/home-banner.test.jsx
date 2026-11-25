import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";

vi.mock("../src/lib/runtime.js", async (importOriginal) => ({
  ...(await importOriginal()),
  navigateToCategory: vi.fn(),
}));

const { navigateToCategory } = await import("../src/lib/runtime.js");
const { BANNER_AUTOPLAY_MS, HomeBannerCarousel } = await import("../src/components/home/HomeBannerCarousel.jsx");

const storefront = JSON.parse(readFileSync(join(process.cwd(), "backend", "data", "storefront.json"), "utf8"));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("storefront data defines banners that point at real categories and bundled images", () => {
  expect(storefront.banners.length).toBeGreaterThan(0);
  for (const banner of storefront.banners) {
    expect(banner).toEqual({ title: expect.any(String), image: expect.any(String), category: expect.any(String) });
    expect(storefront.categories).toContain(banner.category);
    if (banner.image.startsWith("/")) {
      expect(existsSync(join(process.cwd(), "public", banner.image))).toBe(true);
    }
  }
});

test("autoplays every 5 seconds", () => {
  expect(BANNER_AUTOPLAY_MS).toBe(5000);
});

test("renders a slide per banner with navigation dots", () => {
  const { container } = render(<HomeBannerCarousel banners={storefront.banners} ctaText="Xem ưu đãi" />);

  // react-slick clones slides for infinite scrolling and aria-hides inactive ones,
  // so count the real slides in the DOM instead of querying accessible roles.
  const slides = [...container.querySelectorAll(".slick-slide:not(.slick-cloned) .home-banner-slide")];
  expect(slides.map((slide) => slide.querySelector(".home-banner-title").textContent)).toEqual(
    storefront.banners.map((banner) => banner.title),
  );
  expect(slides[0].querySelector(".home-banner-cta").textContent).toBe("Xem ưu đãi");
  expect(container.querySelectorAll(".home-banner-dots li")).toHaveLength(storefront.banners.length);
});

test("clicking a banner opens its linked category", () => {
  const [banner] = storefront.banners;
  const { getAllByRole } = render(<HomeBannerCarousel banners={[banner]} />);

  fireEvent.click(getAllByRole("button", { name: new RegExp(banner.title) })[0]);

  expect(navigateToCategory).toHaveBeenCalledWith(banner.category);
});
