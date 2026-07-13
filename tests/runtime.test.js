import { beforeEach, describe, expect, test } from "vitest";
import {
  buildProductUrl,
  buildSearchUrl,
  formatPrice,
  getPageFromHash,
  getStoredCart,
  parsePrice,
  storeCart,
} from "../src/lib/runtime.js";

beforeEach(() => {
  const values = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
    },
  });
  localStorage.clear();
});

describe("runtime URL contracts", () => {
  test("builds the legacy product URL with slug and code", () => {
    expect(buildProductUrl({ name: "Đệm ABC-1234" })).toBe("/product/?slug=dem-abc-1234&code=ABC-1234");
  });

  test("keeps Vietnamese search text in the q parameter", () => {
    expect(buildSearchUrl("đệm bông ép")).toBe("/search?q=%C4%91%E1%BB%87m%20b%C3%B4ng%20%C3%A9p");
  });

  test("recognizes category hashes", () => {
    window.history.replaceState({}, "", "/#category-dem-bong-ep");
    expect(getPageFromHash()).toBe("category");
  });
});

describe("cart storage contracts", () => {
  test("drops malformed stored entries", () => {
    localStorage.setItem("everonhanquoc-cart", JSON.stringify([{ slug: "ok", quantity: 2 }, { slug: 3, quantity: 1 }, { slug: "bad", quantity: 0 }]));
    expect(getStoredCart()).toEqual([{ slug: "ok", quantity: 2 }]);
  });

  test("stores valid cart entries", () => {
    storeCart([{ slug: "dem-abc-1234", quantity: 1 }]);
    expect(getStoredCart()).toEqual([{ slug: "dem-abc-1234", quantity: 1 }]);
  });
});

test("parses and formats Vietnamese prices", () => {
  expect(parsePrice("4.257.000đ")).toBe(4257000);
  expect(formatPrice(4257000)).toBe("4.257.000đ");
});
