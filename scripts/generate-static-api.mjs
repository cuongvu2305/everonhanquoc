import { mkdir, readFile, writeFile } from "node:fs/promises";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

const data = await readJson("../backend/data/storefront.json");
const details = await readJson("../backend/data/product-details.json");
const apiDir = new URL("../dist/api/", import.meta.url);
const productsDir = new URL("products/", apiDir);
const DETAIL_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

await mkdir(productsDir, { recursive: true });
await writeFile(new URL("storefront", apiDir), `${JSON.stringify(data)}\n`);
await writeFile(
  new URL("health", apiDir),
  `${JSON.stringify({ ok: true, service: "everonhanquoc-static" })}\n`,
);

// One file per product, mirroring the backend's /api/products/<detailId>.
let written = 0;
for (const [detailId, value] of Object.entries(details)) {
  if (!DETAIL_ID.test(detailId)) throw new Error(`Invalid detailId in product-details.json: ${detailId}`);
  await writeFile(new URL(detailId, productsDir), `${JSON.stringify(value)}\n`);
  written += 1;
}
console.log(`static API: storefront + ${written} product detail files`);
