import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("loads responsive overrides after base storefront styles", () => {
  const source = readFileSync("src/styles/index.css", "utf8");
  expect(source).toContain('@import "./tokens.css";');
  expect(source.trim().endsWith('@import "./responsive.css";')).toBe(true);
  expect(existsSync("public/styles.css")).toBe(false);
});

test("removes the collapsed category sidebar from tablet layout sizing", () => {
  const source = readFileSync("src/styles/responsive.css", "utf8");

  expect(source).toMatch(
    /@media \(max-width: 991px\)[\s\S]*?\.main-layout > \.category-sider\.ant-layout-sider\s*\{[\s\S]*?display: none !important;/,
  );
});

test("overrides Ant Design's zero-width content rule when the tablet sidebar is hidden", () => {
  const source = readFileSync("src/styles/responsive.css", "utf8");

  expect(source).toMatch(
    /\.main-layout\.ant-layout-has-sider\s*>\s*\.content-area\s*\{[\s\S]*?width: 100% !important;/,
  );
});
