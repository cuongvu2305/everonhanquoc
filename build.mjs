import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

const appRuntime = new URL("./public/app.jsx", import.meta.url);
const storefrontDataUrl = new URL("./backend/data/storefront.json", import.meta.url);
const buildInfoUrl = new URL("./public/build-info.json", import.meta.url);
const frontendParts = [
  "src/app/globals.jsx",
  "src/lib/antd-theme.jsx",
  "src/constants/navigation.jsx",
  "src/lib/runtime.jsx",
  "src/services/api/storefront.service.jsx",
  "src/components/icons/Icon.jsx",
  "src/hooks/use-i18n.jsx",
  "src/hooks/use-storefront.jsx",
  "src/components/product/ProductCard.jsx",
  "src/components/layout/PageHeader.jsx",
  "src/components/layout/SiteHeader.jsx",
  "src/components/layout/MobileNavDrawer.jsx",
  "src/components/product/ProductGrid.jsx",
  "src/components/product/ProductCarousel.jsx",
  "src/components/product/PolicyGrid.jsx",
  "src/components/pages/HomePage.jsx",
  "src/components/pages/NewsPage.jsx",
  "src/components/pages/SalePage.jsx",
  "src/components/pages/RetailPage.jsx",
  "src/components/pages/CategoryPage.jsx",
  "src/components/pages/SearchPage.jsx",
  "src/components/pages/ProductDetailPage.jsx",
  "src/components/pages/PolicyPage.jsx",
  "src/components/pages/CheckoutPage.jsx",
  "src/components/pages/ContactPage.jsx",
  "src/components/pages/AboutPage.jsx",
  "src/app/App.jsx",
];

const bundledFrontend = [];
for (const part of frontendParts) {
  const partUrl = new URL(`./${part}`, import.meta.url);
  if (!existsSync(partUrl)) {
    throw new Error(`Missing frontend source part: ${part}`);
  }
  const source = await readFile(partUrl, "utf8");
  bundledFrontend.push(source.trim().replace(/\n{3,}/g, "\n\n"));
}
await writeFile(appRuntime, `${bundledFrontend.join("\n\n")}\n`);
await mkdir(new URL("./public/search/", import.meta.url), { recursive: true });
await cp(new URL("./public/index.html", import.meta.url), new URL("./public/search/index.html", import.meta.url));
await mkdir(new URL("./public/product/", import.meta.url), { recursive: true });
await cp(new URL("./public/index.html", import.meta.url), new URL("./public/product/index.html", import.meta.url));

const storefrontData = JSON.parse(await readFile(storefrontDataUrl, "utf8"));
const storefrontJson = JSON.stringify(storefrontData);
const builtAt = new Date();
let commit = "local";
try {
  commit = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
} catch {
  commit = "local";
}
const buildInfo = {
  tag: `build-${builtAt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}-${commit}`,
  builtAt: builtAt.toISOString(),
  commit,
};
await writeFile(buildInfoUrl, `${JSON.stringify(buildInfo, null, 2)}\n`);

const localeFiles = ["vi"];
await rm(new URL("./public/locales/", import.meta.url), { recursive: true, force: true });
await mkdir(new URL("./public/locales/", import.meta.url), { recursive: true });
for (const locale of localeFiles) {
  await cp(
    new URL(`./src/locales/${locale}/storefront.json`, import.meta.url),
    new URL(`./public/locales/${locale}.json`, import.meta.url),
  );
}

const dist = new URL("./dist/", import.meta.url);
const client = new URL("./dist/client/", import.meta.url);
const server = new URL("./dist/server/", import.meta.url);

await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });
await cp(new URL("./public/", import.meta.url), client, { recursive: true });

const staticApi = new URL("./dist/client/api/", import.meta.url);
await mkdir(staticApi, { recursive: true });
await writeFile(new URL("./dist/client/api/storefront", import.meta.url), storefrontJson);
await writeFile(
  new URL("./dist/client/api/health", import.meta.url),
  JSON.stringify({ ok: true, service: "everonhanquoc-static-upload" }),
);

if (existsSync(new URL("./.openai/hosting.json", import.meta.url))) {
  await mkdir(new URL("./dist/.openai/", import.meta.url), { recursive: true });
  await cp(
    new URL("./.openai/hosting.json", import.meta.url),
    new URL("./dist/.openai/hosting.json", import.meta.url),
  );
}

await writeFile(
  new URL("./dist/server/index.js", import.meta.url),
  `const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const STOREFRONT_DATA = ${storefrontJson};

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      return jsonResponse({ ok: true, service: "everonhanquoc-sites-worker" });
    }
    if (url.pathname === "/api/storefront") {
      return jsonResponse(STOREFRONT_DATA);
    }

    let path = url.pathname === "/" ? "/index.html" : url.pathname;
    const asset = await env.ASSETS.fetch(new URL(path, url.origin));
    if (asset.status !== 404) {
      const ext = path.slice(path.lastIndexOf("."));
      const headers = new Headers(asset.headers);
      if (MIME_TYPES[ext]) headers.set("content-type", MIME_TYPES[ext]);
      return new Response(asset.body, { status: asset.status, headers });
    }
    return env.ASSETS.fetch(new URL("/index.html", url.origin));
  },
};
`,
);

console.log("Built static Sites artifact in dist/");
