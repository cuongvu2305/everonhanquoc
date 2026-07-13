# Vite Maintainability Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the storefront to Vite and establish maintainable, tested frontend and backend boundaries without changing public behavior.

**Architecture:** Vite becomes the only frontend compiler and development server. The Python/SQLite backend remains the local API provider, while a small Node build script emits static API files for Firebase Hosting. Runtime URL and cart utilities remain framework-independent and gain Vitest coverage before their modules are reorganized.

**Tech Stack:** Vite, React, ReactDOM, Ant Design, Lucide React, Vitest, Python standard-library `unittest`, Firebase Hosting, SQLite.

## Global Constraints

- Preserve `/#category-<slug>`, `/#sale`, `/#checkout`, `/search?q=`, `/product/?slug=`, and `/<policy>-pt` URLs.
- Preserve the `everonhanquoc-cart` localStorage key and `{ slug, quantity }` entry format.
- Preserve `/api/health` and `/api/storefront` response shapes.
- Keep Firebase Hosting static; do not add a server-side payment, authentication, or routing dependency.
- Keep the current visual design and responsive behavior during migration.
- Do not commit `.firebase/`, `dist/`, SQLite files, or generated build artifacts.

---

## File Structure

- `index.html`: Vite HTML entry document.
- `src/main.jsx`: React bootstrap and global style import.
- `src/app/globals.jsx`: Explicit imports of React and Ant Design primitives shared by existing JSX files.
- `src/lib/runtime.js`: URL, product slug, price, and cart utilities with no JSX dependency.
- `src/styles/`: Ordered stylesheets: tokens, base, layout, components, pages, responsive.
- `vite.config.js`: local host, API proxy, Vitest configuration, and build output.
- `scripts/dev.mjs`: starts Python at `4174` and Vite at `4173`, stopping both on exit.
- `scripts/generate-static-api.mjs`: writes Firebase-ready API responses into `dist/api` after Vite builds.
- `tests/runtime.test.js`: regression tests for public client utility contracts.
- `backend/test_app.py`: API and data-shape tests using an isolated temporary SQLite database.

### Task 1: Establish the Vite Toolchain and Static Artifact Contract

**Files:**
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `scripts/dev.mjs`
- Create: `scripts/generate-static-api.mjs`
- Modify: `package.json`
- Modify: `firebase.json`
- Modify: `.gitignore`
- Modify: `backend/app.py`
- Create: `backend/test_app.py`
- Delete: `build.mjs`
- Delete: `public/index.html`
- Delete: `public/search/index.html`
- Delete: `public/product/index.html`

**Interfaces:**
- Consumes: Python API at `http://127.0.0.1:4174/api/*` during local development.
- Produces: `npm run dev`, `npm run build`, and Firebase-ready `dist/api/health` plus `dist/api/storefront`.

- [ ] **Step 1: Add expected artifact and local-port assertions before implementing generation**

Create `tests/build-artifact.test.js`:

```js
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

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
```

Extend the existing `backend/test_app.py` while retaining `AppArgumentsTest` from Task 1. Add:

```python
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import app


class AppArgumentsTest(unittest.TestCase):
    def test_port_argument_overrides_default(self):
        self.assertEqual(app.parse_args(["--port", "4174"]).port, 4174)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Add Vite dependencies and scripts, then verify the artifact test fails because no artifact exists**

Run:

```bash
npm install react@18.3.1 react-dom@18.3.1 antd@5.22.7 lucide-react@0.468.0
npm install --save-dev vite @vitejs/plugin-react vitest jsdom @testing-library/react eslint @eslint/js globals
```

Add the `test` and `test:watch` scripts from Step 3 before running:

```bash
npm run test -- tests/build-artifact.test.js
```

Expected: the test runner starts and the assertion fails because `dist/api/storefront` does not exist.

Run:

```bash
python3 -m unittest backend.test_app
```

Expected: failure because `app.parse_args` does not exist.

- [ ] **Step 3: Replace the legacy CDN document and custom build with Vite configuration**

Create `vite.config.js`:

```js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:4174",
    },
  },
  build: { outDir: "dist", emptyOutDir: true },
  test: { environment: "jsdom", include: ["tests/**/*.test.{js,jsx}"] },
});
```

Create a root-level `index.html` that contains only metadata, `<div id="root"></div>`, and `<script type="module" src="/src/main.jsx"></script>`. Keep static assets in `public/` and delete the legacy `public/index.html`. The new entry must not contain React, ReactDOM, Babel, Ant Design, Lucide, or generated `app.jsx` script tags.

Create the temporary Vite entry `src/main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><div /></React.StrictMode>);
```

Task 2 replaces this temporary root with `App`; Task 4 adds the source-owned global stylesheet import.

Add this parser to `backend/app.py` and pass its result to `run`:

```python
import argparse


def parse_args(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=4173)
    return parser.parse_args(argv)


if __name__ == "__main__":
    args = parse_args()
    run(host=args.host, port=args.port)
```

Delete `public/search/index.html` and `public/product/index.html` with the other legacy runtime files. This ensures Firebase's existing SPA rewrite serves Vite's root entry for `/search` and `/product`.

Create `scripts/generate-static-api.mjs`:

```js
import { mkdir, readFile, writeFile } from "node:fs/promises";

const data = JSON.parse(await readFile(new URL("../backend/data/storefront.json", import.meta.url), "utf8"));
const apiDir = new URL("../dist/api/", import.meta.url);

await mkdir(apiDir, { recursive: true });
await writeFile(new URL("storefront", apiDir), `${JSON.stringify(data)}\n`);
await writeFile(new URL("health", apiDir), `${JSON.stringify({ ok: true, service: "everonhanquoc-static" })}\n`);
```

Create `scripts/dev.mjs` using `node:child_process.spawn` to run `python3 backend/app.py --port 4174` first and `vite` second, forwarding `SIGINT` and `SIGTERM` to both children.

Set package scripts to:

```json
{
  "dev": "node scripts/dev.mjs",
  "backend": "python3 backend/app.py",
  "build": "vite build && node scripts/generate-static-api.mjs",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "eslint ."
}
```

Set Firebase Hosting `public` to `dist`; retain its existing API headers and SPA rewrite. Add `dist/`, `.firebase/`, `backend/data/*.sqlite3`, and `coverage/` to `.gitignore`.

- [ ] **Step 4: Verify the artifact test now passes and inspect the generated files**

Run:

```bash
npm run build
npm run test -- tests/build-artifact.test.js
python3 -m unittest backend.test_app
```

Expected: all commands exit `0`; `dist/api/storefront` parses to a storefront object, `dist/api/health` has `ok: true`, and `--port 4174` parses as `4174`.

- [ ] **Step 5: Commit the self-contained toolchain change**

```bash
git add package.json package-lock.json vite.config.js index.html firebase.json .gitignore backend/app.py backend/test_app.py scripts/dev.mjs scripts/generate-static-api.mjs tests/build-artifact.test.js
git rm build.mjs public/index.html public/search/index.html public/product/index.html
git commit -m "build: migrate storefront toolchain to vite"
```

### Task 2: Convert Client Modules from Browser Globals to ES Imports

**Files:**
- Create: `src/main.jsx`
- Modify: `src/app/globals.jsx`
- Modify: `src/lib/runtime.jsx`
- Modify: `src/lib/antd-theme.jsx`
- Modify: `src/components/icons/Icon.jsx`
- Modify: every `src/components/**/*.jsx`, `src/hooks/**/*.jsx`, and `src/app/App.jsx` that references `React`, `antd`, or `window.lucide`
- Delete: `public/app.jsx`
- Delete: `postcss.config.mjs`

**Interfaces:**
- Consumes: dependencies installed in Task 1.
- Produces: ES-module components with no `window.lucide`, global `React`, or global `antd` access.

- [ ] **Step 1: Add a failing smoke test for the real module entry**

Create `tests/app-entry.test.jsx`:

```jsx
import { expect, test } from "vitest";
import App from "../src/app/App.jsx";

test("App is importable as a Vite module", () => {
  expect(App).toBeTypeOf("function");
});
```

- [ ] **Step 2: Run the test and verify it fails on the old global runtime dependency**

Run:

```bash
npm run test -- tests/app-entry.test.jsx
```

Expected: failure reporting that `src/app/App.jsx` does not provide a default export; this proves the test is exercising the current module boundary.

- [ ] **Step 3: Replace globals with explicit module imports**

Replace the temporary `src/main.jsx` with:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css";
import App from "./app/App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>,
);
```

Keep `<link rel="stylesheet" href="/styles.css">` in root `index.html` until Task 4 moves the legacy stylesheet into `src/styles/` and replaces that link with `import "./styles/index.css";` in `src/main.jsx`.

Replace `src/app/globals.jsx` with named exports imported from `antd` and React hooks imported from `react`; preserve the existing symbols so incremental component conversion does not change JSX behavior. Convert `Icon` to a lookup over named Lucide React components:

```jsx
import * as LucideIcons from "lucide-react";

export function Icon({ name, size = 18 }) {
  const LucideIcon = LucideIcons[name];
  return LucideIcon ? <LucideIcon aria-hidden="true" size={size} strokeWidth={2} /> : null;
}
```

Make `src/constants/navigation.jsx` export `topPages` and make `src/components/pages/PolicyPage.jsx` export `policyPages`; import both values into `App` and `runtime.jsx`. Give each component an explicit header following this map: product components import `Card`, `Image`, `Empty`, `Flex`, `Button`, `Pagination`, `Space`, plus their sibling components; layout components import `Header`, `Button`, `Image`, `Input`, `Drawer`, `Menu`, `Collapse`, `Skeleton`, and `Space`; page components import only their Ant Design elements, icons, runtime helpers, page headers, and product components they render. Export `App` as `export default function App()` so the test and `src/main.jsx` can import it. Remove the generated files after all imports resolve.

Delete `postcss.config.mjs`. It references `@tailwindcss/postcss`, but no Tailwind source or dependency exists in this project; retaining it prevents Vite from processing the Ant Design reset import.

- [ ] **Step 4: Verify the Vite module graph and smoke test**

Run:

```bash
npm run test -- tests/app-entry.test.jsx
npm run build
```

Expected: both commands exit `0`; `dist/index.html` references hashed Vite assets and no generated `app.jsx` exists.

- [ ] **Step 5: Commit the client module migration**

```bash
git add src package.json package-lock.json tests/app-entry.test.jsx index.html
git rm public/app.jsx postcss.config.mjs
git commit -m "refactor: load storefront through es modules"
```

### Task 3: Protect Navigation, Cart, and Price Behavior with Runtime Tests

**Files:**
- Create: `tests/runtime.test.js`
- Modify: `src/lib/runtime.jsx` to `src/lib/runtime.js`
- Modify: import sites that consume `src/lib/runtime.jsx`

**Interfaces:**
- Consumes: Vite/Vitest configuration from Task 1.
- Produces: named exports `slugifyCategory`, `buildProductUrl`, `getPageFromHash`, `buildSearchUrl`, `parsePrice`, `formatPrice`, `getStoredCart`, and `storeCart`.

- [ ] **Step 1: Write failing regression tests for public URL and cart contracts**

Create `tests/runtime.test.js`:

```js
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

beforeEach(() => localStorage.clear());

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
```

- [ ] **Step 2: Run the tests and verify their expected first failure**

Run:

```bash
npm run test -- tests/runtime.test.js
```

Expected: failure because the utilities are not yet exported from `src/lib/runtime.js`.

- [ ] **Step 3: Move the pure utility module without changing public behavior**

Rename `src/lib/runtime.jsx` to `src/lib/runtime.js`. Add `import { topPages } from "../constants/navigation.jsx";` and named exports to the existing functions; keep `CART_STORAGE_KEY` private. Update all imports from `runtime.jsx` to `runtime.js`. Ensure `buildProductUrl`, `buildSearchUrl`, cart helpers, and page lookup retain their exact existing implementations except for module statements.

- [ ] **Step 4: Verify the utility contracts and full frontend build**

Run:

```bash
npm run test -- tests/runtime.test.js
npm run build
```

Expected: all six assertions pass and build exits `0`.

- [ ] **Step 5: Commit runtime coverage and utility cleanup**

```bash
git add src/lib/runtime.js src tests/runtime.test.js
git rm src/lib/runtime.jsx
git commit -m "test: cover storefront runtime contracts"
```

### Task 4: Make CSS Ownership and Responsive Rules Deterministic

**Files:**
- Create: `src/styles/index.css`
- Create: `src/styles/tokens.css`
- Create: `src/styles/layout.css`
- Create: `src/styles/components.css`
- Create: `src/styles/pages.css`
- Create: `src/styles/responsive.css`
- Delete: `public/styles.css`
- Test: `tests/css-contract.test.js`

**Interfaces:**
- Consumes: current CSS selectors and `src/main.jsx` global stylesheet import.
- Produces: a fixed import order: tokens, layout, components, pages, responsive.

- [ ] **Step 1: Add a failing static contract test for stylesheet order and legacy-file removal**

Create `tests/css-contract.test.js`:

```js
import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("loads responsive overrides after base storefront styles", () => {
  const source = readFileSync("src/styles/index.css", "utf8");
  expect(source).toContain('@import "./tokens.css";');
  expect(source.trim().endsWith('@import "./responsive.css";')).toBe(true);
  expect(existsSync("public/styles.css")).toBe(false);
});
```

- [ ] **Step 2: Run the test and confirm the missing stylesheet directory failure**

Run:

```bash
npm run test -- tests/css-contract.test.js
```

Expected: failure because `src/styles/index.css` does not exist.

- [ ] **Step 3: Split by ownership without renaming active selectors**

Move CSS custom properties and root resets into `tokens.css`; shell, header, sidebar, content, footer, and floating actions into `layout.css`; buttons, cards, carousels, grids, pagination, and drawers into `components.css`; route-specific classes into `pages.css`; and all `@media` blocks into `responsive.css` ordered from desktop to `1200px`, `991px`, `767px`, then `576px`. Remove `<link rel="stylesheet" href="/styles.css">` from root `index.html` and add `import "./styles/index.css";` immediately after the Ant Design reset import in `src/main.jsx`.

Create `src/styles/index.css` exactly as:

```css
@import "./tokens.css";
@import "./layout.css";
@import "./components.css";
@import "./pages.css";
@import "./responsive.css";
```

Remove duplicate selectors by retaining the final currently effective declaration, preserve every existing class name used by JSX, and avoid adding `!important` except where Ant Design specificity requires it.

- [ ] **Step 4: Verify stylesheet contract, build, and mobile overflow manually**

Run:

```bash
npm run test -- tests/css-contract.test.js
npm run build
npm run dev
```

Expected: automated checks exit `0`. At `430px` viewport width, visit home, category, search, product, checkout, and policy routes; no page has horizontal overflow and messenger, cart, hotline, and Zalo buttons occupy distinct positions.

- [ ] **Step 5: Commit the style ownership refactor**

```bash
git add src/styles src/main.jsx tests/css-contract.test.js
git rm public/styles.css
git commit -m "refactor: organize storefront responsive styles"
```

### Task 5: Add Isolated Backend API Tests and Local Port Configuration

**Files:**
- Modify: `backend/test_app.py`
- Modify: `backend/app.py`
- Modify: `backend/db.py` only if it needs a database-path parameter for tests

**Interfaces:**
- Consumes: `StorefrontHandler`, `init_database`, and `load_storefront_data`.
- Produces: `python3 -m unittest backend.test_app` and `python3 backend/app.py --port 4174`.

- [ ] **Step 1: Write failing backend endpoint tests using a temporary database**

Create `backend/test_app.py`:

```python
import json
import tempfile
import threading
import unittest
from http.client import HTTPConnection
from pathlib import Path
from http.server import ThreadingHTTPServer

import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))

import app
import db


class StorefrontApiTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.original_db_path = db.DATABASE_PATH
        db.DATABASE_PATH = Path(self.temp_dir.name) / "storefront.sqlite3"
        db.init_database()
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), app.StorefrontHandler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.thread.join()
        db.DATABASE_PATH = self.original_db_path
        self.temp_dir.cleanup()

    def get_json(self, path):
        connection = HTTPConnection("127.0.0.1", self.server.server_port)
        connection.request("GET", path)
        response = connection.getresponse()
        payload = json.loads(response.read())
        connection.close()
        return response.status, payload

    def test_health_endpoint_returns_ok(self):
        status, payload = self.get_json("/api/health")
        self.assertEqual(status, 200)
        self.assertTrue(payload["ok"])

    def test_storefront_endpoint_returns_expected_collections(self):
        status, payload = self.get_json("/api/storefront")
        self.assertEqual(status, 200)
        self.assertEqual(set(payload), {"categories", "tiles", "products", "policies"})
        self.assertIsInstance(payload["products"], list)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the tests and verify they fail if the server cannot accept configurable local use**

Run:

```bash
python3 -m unittest backend.test_app
```

Expected: an import, path-isolation, or handler setup failure that identifies the missing test boundary.

- [ ] **Step 3: Make the smallest backend changes needed for testability and port selection**

Task 1 already added `argparse` in `backend/app.py`; keep that behavior unchanged. Rename `DB_FILE` to module-level `DATABASE_PATH` in `backend/db.py`, and have `get_connection` read it at call time; this lets the test temporarily replace it without changing production behavior.

- [ ] **Step 4: Verify backend tests and the local API**

Run:

```bash
python3 -m unittest backend.test_app
python3 backend/app.py --port 4174
```

Expected: unittest reports two passing tests. With the server running, `curl http://127.0.0.1:4174/api/health` returns JSON containing `"ok": true`.

- [ ] **Step 5: Commit backend validation support**

```bash
git add backend/app.py backend/db.py backend/test_app.py
git commit -m "test: cover storefront api endpoints"
```

### Task 6: Replace the Invalid ESLint Setup, Validate Releases, and Document the Workflow

**Files:**
- Modify: `eslint.config.mjs`
- Modify: `README.md`
- Modify: `VERSIONING.md`
- Modify: `public/build-info.json` only through `npm run build`

**Interfaces:**
- Consumes: Vite/Vitest scripts from Task 1 and final module graph from Tasks 2-4.
- Produces: clean `npm run lint`, `npm run test`, `npm run build`, and accurate release instructions.

- [ ] **Step 1: Add a failing lint invocation that exposes the stale Next.js configuration**

Run:

```bash
npm run lint
```

Expected: failure resolving `eslint-config-next` because this project is not a Next.js application.

- [ ] **Step 2: Replace the config with an ESLint flat config for React source and tests**

Replace `eslint.config.mjs` with:

```js
import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/**", ".firebase/**", "backend/data/*.sqlite3", "coverage/**"] },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}", "tests/**/*.{js,jsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ["scripts/**/*.mjs", "vite.config.js"],
    languageOptions: { globals: globals.node },
  },
];
```

Update README development instructions to use `npm run dev`, identify `http://127.0.0.1:4173` as the browser URL, and document `npm run lint`, `npm run test`, `python3 -m unittest backend.test_app`, `npm run build`, and `npm run deploy:firebase` in that order. Update VERSIONING.md so its build examples remain `RELEASE_VERSION=vX.Y.Z npm run build` and explain that `public/build-info.json` is a generated tracked release artifact.

- [ ] **Step 3: Run the final verification matrix**

Run:

```bash
npm run lint
npm run test
python3 -m unittest backend.test_app
RELEASE_VERSION=v1.0.5 npm run build
git diff --check
git status --short
```

Expected: lint, test, backend test, build, and whitespace checks exit `0`. Status contains only intentional source, dependency lockfile, documentation, and generated `public/build-info.json` changes; it must not include `.firebase/`, `dist/`, or SQLite files.

- [ ] **Step 4: Commit the maintenance workflow**

```bash
git add eslint.config.mjs README.md VERSIONING.md public/build-info.json
git commit -m "chore: document and verify storefront workflow"
```

## Task 6 Review Results

- Restored an explicit `scripts/generate-build-info.mjs` step before `vite build`; it regenerates `public/build-info.json` from `VERSION`, Git commit, `GIT_TAG`/`RELEASE_VERSION`, and the build timestamp.
- `RELEASE_VERSION=v1.0.5 npm run build` generated matching `public/build-info.json` and `dist/build-info.json` metadata with `releaseTag` and `tag` set to `v1.0.5`.
- `npm run lint` completed successfully; `npm run test` completed successfully with 4 test files and 12 tests passing.
- Vite completed successfully and emitted its existing chunk-size advisory for the minified JavaScript bundle.
