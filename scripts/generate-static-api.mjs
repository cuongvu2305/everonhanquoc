import { mkdir, readFile, writeFile } from "node:fs/promises";

const data = JSON.parse(
  await readFile(new URL("../backend/data/storefront.json", import.meta.url), "utf8"),
);
const apiDir = new URL("../dist/api/", import.meta.url);

await mkdir(apiDir, { recursive: true });
await writeFile(new URL("storefront", apiDir), `${JSON.stringify(data)}\n`);
await writeFile(
  new URL("health", apiDir),
  `${JSON.stringify({ ok: true, service: "everonhanquoc-static" })}\n`,
);
