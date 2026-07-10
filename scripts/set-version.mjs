import { readFile, writeFile } from "node:fs/promises";

const nextVersion = process.argv[2]?.replace(/^v/, "");

if (!nextVersion || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(nextVersion)) {
  console.error("Usage: npm run version:set v1.0.2");
  process.exit(1);
}

const packageUrl = new URL("../package.json", import.meta.url);
const lockUrl = new URL("../package-lock.json", import.meta.url);
const versionUrl = new URL("../VERSION", import.meta.url);

const packageJson = JSON.parse(await readFile(packageUrl, "utf8"));
packageJson.version = nextVersion;
await writeFile(packageUrl, `${JSON.stringify(packageJson, null, 2)}\n`);

const packageLock = JSON.parse(await readFile(lockUrl, "utf8"));
packageLock.version = nextVersion;
if (packageLock.packages?.[""]) {
  packageLock.packages[""].version = nextVersion;
}
await writeFile(lockUrl, `${JSON.stringify(packageLock, null, 2)}\n`);

await writeFile(versionUrl, `${nextVersion}\n`);

console.log(`Version set to v${nextVersion}`);
