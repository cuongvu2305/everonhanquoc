import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
const version = readFileSync(join(process.cwd(), "VERSION"), "utf8").trim();

function expectedReleaseTag(buildInfo) {
  const releaseInput = process.env.GIT_TAG || process.env.RELEASE_VERSION;
  return releaseInput && releaseInput !== "unknown"
    ? releaseInput.replace(/^v?/, "v")
    : `dev-${buildInfo.commit}`;
}

test("production build publishes static storefront API files", () => {
  const storefrontPath = join(process.cwd(), "dist", "api", "storefront");
  const healthPath = join(process.cwd(), "dist", "api", "health");

  expect(existsSync(storefrontPath)).toBe(true);
  expect(JSON.parse(readFileSync(storefrontPath, "utf8"))).toMatchObject({
    categories: expect.any(Array),
    products: expect.any(Array),
  });
  expect(JSON.parse(readFileSync(healthPath, "utf8"))).toMatchObject({ ok: true });
});

test("production build copies generated release metadata", () => {
  const sourceBuildInfoPath = join(process.cwd(), "public", "build-info.json");
  const distBuildInfoPath = join(process.cwd(), "dist", "build-info.json");
  const sourceBuildInfo = JSON.parse(readFileSync(sourceBuildInfoPath, "utf8"));
  const distBuildInfo = JSON.parse(readFileSync(distBuildInfoPath, "utf8"));

  expect(sourceBuildInfo).toMatchObject({
    version,
    releaseTag: expectedReleaseTag(sourceBuildInfo),
    tag: expectedReleaseTag(sourceBuildInfo),
  });
  expect(distBuildInfo).toEqual(sourceBuildInfo);
});

test("build generates release metadata before Vite copies public files", () => {
  expect(packageJson.scripts.build).toMatch(
    /^node scripts\/generate-build-info\.mjs && vite build/,
  );
});

test("build artifact test script creates its own production fixture", () => {
  expect(packageJson.scripts["test:build"]).toMatch(/^npm run build && vitest run tests\/build-artifact\.test\.js$/);
});
