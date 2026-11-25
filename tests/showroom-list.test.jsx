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

// Fictional branches, only used to exercise the multi-showroom layout.
const branches = [
  { name: "Chi nhánh A", address: "Địa chỉ A", phone: "0900 000 001", openingHours: "8:00 - 20:00", mapUrl: "https://www.google.com/maps/search/?api=1&query=A", isSample: true },
  { name: "Chi nhánh B", address: "Địa chỉ B", phone: "0900 000 002", mapUrl: "https://www.google.com/maps/search/?api=1&query=B" },
];

test("storefront data lists the real showroom at 234 Tôn Đức Thắng", () => {
  expect(storefront.showrooms).toHaveLength(1);
  const [showroom] = storefront.showrooms;
  expect(showroom).toMatchObject({
    name: expect.any(String),
    address: expect.stringContaining("234 Tôn Đức Thắng"),
    openingHours: expect.any(String),
    mapUrl: expect.stringMatching(/^https:\/\/www\.google\.com\/maps\/.*234/),
  });
  expect(showroom.isSample).toBeUndefined();
  // Same number as the floating hotline button.
  expect(toTelHref(showroom.phone)).toBe("tel:0966452111");
});

test("toTelHref strips formatting but keeps a leading plus", () => {
  expect(toTelHref("0900 000 001")).toBe("tel:0900000001");
  expect(toTelHref("024.3999.4555")).toBe("tel:02439994555");
  expect(toTelHref("+84 900-000-001")).toBe("tel:+84900000001");
  expect(toTelHref("")).toBeUndefined();
});

test("a single showroom gets a singular title, a full-width card and no sample tag", () => {
  const { container, getByRole } = render(<ShowroomList showrooms={storefront.showrooms} dict={dict} />);

  expect(getByRole("heading", { name: dict.showroomTitleSingle })).toBeTruthy();
  expect(container.querySelector(".home-showrooms.is-single")).not.toBeNull();
  expect(container.querySelector(".showroom-card").closest(".ant-col").className).toContain("ant-col-md-24");
  expect(container.textContent).not.toContain(dict.showroomSample);

  const [showroom] = storefront.showrooms;
  expect(getByRole("link", { name: `Gọi ${showroom.name}` }).getAttribute("href")).toBe("tel:0966452111");
  expect(getByRole("link", { name: `Chỉ đường tới ${showroom.name}` }).getAttribute("href")).toBe(showroom.mapUrl);
});

test("renders a card per showroom with call and directions buttons", () => {
  const { container, getByRole } = render(<ShowroomList showrooms={branches} dict={dict} />);

  expect(getByRole("heading", { name: dict.showroomTitle })).toBeTruthy();
  expect(container.querySelectorAll(".showroom-card")).toHaveLength(branches.length);
  expect(container.querySelector(".showroom-card").closest(".ant-col").className).toContain("ant-col-md-12");
  expect(container.querySelectorAll(".showroom-card .lucide-icon svg").length).toBeGreaterThan(0);

  for (const showroom of branches) {
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
  const { container } = render(<ShowroomList showrooms={branches} dict={dict} variant="compact" />);

  expect(container.querySelectorAll(".showroom-compact-item")).toHaveLength(branches.length);
  expect(container.querySelector(".showroom-card")).toBeNull();
  expect(container.querySelector(`a[href="${toTelHref(branches[0].phone)}"]`)).not.toBeNull();
});

test("renders nothing without showrooms", () => {
  const { container } = render(<ShowroomList showrooms={[]} dict={dict} />);
  expect(container.innerHTML).toBe("");
});
