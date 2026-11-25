import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ShowroomList, toTelHref } from "../src/components/layout/ShowroomList.jsx";

const storefront = JSON.parse(readFileSync(join(process.cwd(), "backend", "data", "storefront.json"), "utf8"));
const dict = JSON.parse(readFileSync(join(process.cwd(), "src", "locales", "vi", "storefront.json"), "utf8"));

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

test("storefront data ships clearly labelled sample showrooms", () => {
  expect(storefront.showrooms).toHaveLength(2);
  for (const showroom of storefront.showrooms) {
    expect(showroom).toMatchObject({
      name: expect.any(String),
      address: expect.any(String),
      phone: expect.any(String),
      openingHours: expect.any(String),
      mapUrl: expect.stringMatching(/^https:\/\/www\.google\.com\/maps\//),
      isSample: true,
    });
    expect(showroom.name).toMatch(/dữ liệu mẫu/i);
  }
});

test("toTelHref strips formatting but keeps a leading plus", () => {
  expect(toTelHref("0900 000 001")).toBe("tel:0900000001");
  expect(toTelHref("024.3999.4555")).toBe("tel:02439994555");
  expect(toTelHref("+84 900-000-001")).toBe("tel:+84900000001");
  expect(toTelHref("")).toBeUndefined();
});

test("renders a card per showroom with call and directions buttons", () => {
  const { container, getByRole } = render(<ShowroomList showrooms={storefront.showrooms} dict={dict} />);

  expect(getByRole("heading", { name: dict.showroomTitle })).toBeTruthy();
  expect(container.querySelectorAll(".showroom-card")).toHaveLength(storefront.showrooms.length);
  expect(container.querySelectorAll(".showroom-card .lucide-icon svg").length).toBeGreaterThan(0);

  for (const showroom of storefront.showrooms) {
    const call = getByRole("link", { name: `Gọi ${showroom.name}` });
    expect(call.getAttribute("href")).toBe(toTelHref(showroom.phone));
    expect(call.textContent).toContain(dict.showroomCall);

    const directions = getByRole("link", { name: `Chỉ đường tới ${showroom.name}` });
    expect(directions.getAttribute("href")).toBe(showroom.mapUrl);
    expect(directions.getAttribute("target")).toBe("_blank");
    expect(directions.getAttribute("rel")).toContain("noopener");
  }
  expect(container.textContent).toContain(dict.showroomSample);
});

test("compact variant lists showrooms without action buttons", () => {
  const { container } = render(<ShowroomList showrooms={storefront.showrooms} dict={dict} variant="compact" />);

  expect(container.querySelectorAll(".showroom-compact-item")).toHaveLength(storefront.showrooms.length);
  expect(container.querySelector(".showroom-card")).toBeNull();
  expect(container.querySelector(`a[href="${toTelHref(storefront.showrooms[0].phone)}"]`)).not.toBeNull();
});

test("renders nothing without showrooms", () => {
  const { container } = render(<ShowroomList showrooms={[]} dict={dict} />);
  expect(container.innerHTML).toBe("");
});
