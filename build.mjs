import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const dist = new URL("./dist/", import.meta.url);
const client = new URL("./dist/client/", import.meta.url);
const server = new URL("./dist/server/", import.meta.url);

await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });
await cp(new URL("./public/", import.meta.url), client, { recursive: true });

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
