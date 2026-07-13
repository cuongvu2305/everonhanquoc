import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("loads responsive overrides after base storefront styles", () => {
  const source = readFileSync("src/styles/index.css", "utf8");
  expect(source).toContain('@import "./tokens.css";');
  expect(source.trim().endsWith('@import "./responsive.css";')).toBe(true);
  expect(existsSync("public/styles.css")).toBe(false);
});
