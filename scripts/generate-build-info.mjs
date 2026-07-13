import { execSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const versionUrl = new URL("../VERSION", import.meta.url);
const buildInfoUrl = new URL("../public/build-info.json", import.meta.url);

const version = (await readFile(versionUrl, "utf8")).trim();
let commit = "local";
try {
  commit = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
} catch {
  // Builds outside a Git checkout still produce traceable local metadata.
}

const releaseInput = process.env.GIT_TAG || process.env.RELEASE_VERSION || "";
const releaseTag = releaseInput && releaseInput !== "unknown"
  ? releaseInput.replace(/^v?/, "v")
  : `dev-${commit}`;

const buildInfo = {
  version,
  releaseTag,
  tag: releaseTag,
  builtAt: new Date().toISOString(),
  commit,
};

await writeFile(buildInfoUrl, `${JSON.stringify(buildInfo, null, 2)}\n`);
