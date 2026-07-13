# Vite and Maintainability Refactor Design

## Goal

Replace the browser-side Babel/CDN runtime and generated `public/app.jsx` bundle with a Vite-managed React application. Preserve the current customer-facing behavior, public URLs, storefront API contract, Firebase Hosting deployment, and local SQLite-backed development API.

## Scope

This refactor covers the frontend build/runtime boundary, CSS organization, shared client utilities, local development workflow, static deployment artifact generation, and automated checks for core client and backend behavior.

It does not add payment processing, user authentication, a new routing library, or a visual redesign.

## Architecture

### Frontend runtime

- Vite owns the application entry point and production build.
- `src/main.jsx` renders `App` and imports global styles.
- React, ReactDOM, Ant Design, and Lucide are installed dependencies and imported as ES modules.
- `public/index.html` becomes a minimal Vite HTML entry point. It no longer loads React, Babel, Ant Design, or Lucide from CDNs.
- `public/app.jsx`, `public/search/index.html`, and `public/product/index.html` are removed because Vite resolves SPA routes through the root entry point.

### Client boundaries

- `src/app/App.jsx` remains the page composition and application-state coordinator.
- `src/lib/runtime.jsx` remains the source of URL parsing, URL construction, cart persistence, and price formatting. It is covered by unit tests before behavior is moved or changed.
- `src/services/api/storefront.service.jsx` remains the only browser API boundary.
- Product, layout, and page components remain split by responsibility under `src/components`.
- `src/styles/` separates tokens, base/layout, shared components, pages, and responsive overrides. Each responsive selector has one authoritative mobile rule rather than accumulated patch rules.

### Backend and deployment

- Python continues to expose `GET /api/health` and `GET /api/storefront` using the SQLite data layer.
- Vite development server runs on port `4173` and proxies `/api` to the Python backend on port `4174`.
- The production build writes static API fixtures to `dist/api/health` and `dist/api/storefront`, sourced from `backend/data/storefront.json`.
- Firebase Hosting deploys `dist` and keeps the existing SPA rewrite and API paths. Its rewrite must exclude existing static API files so `/api/*` is served as JSON instead of falling back to `index.html`.

## Compatibility Requirements

- Keep `/#category-<slug>`, `/#sale`, `/#checkout`, `/search?q=`, `/product/?slug=`, and `/<policy>-pt` working.
- Keep the cart key `everonhanquoc-cart` and its `{ slug, quantity }` shape.
- Keep storefront payload fields: `categories`, `tiles`, `products`, and `policies`.
- Keep the existing responsive layout and floating contact actions functionally unchanged during the migration.
- Preserve release metadata in `public/build-info.json` and show the release tag in the footer.

## Error Handling

- API requests reject non-2xx responses with a useful message.
- Storefront and locale hooks keep their loading and error states isolated; a failure in one must not leave the app permanently loading.
- Invalid localStorage cart values are ignored safely and do not block rendering.
- Unknown SPA paths continue to render the application shell, with page selection falling back to the home page.

## Validation

- Add Vitest tests for runtime URL generation/parsing, cart persistence validation, and price conversion.
- Add Python unittest coverage for the two API endpoints and the storefront payload shape.
- Add `npm run lint`, `npm run test`, and `npm run build` scripts.
- Verify a production artifact contains the Vite entry assets, release metadata, and static API JSON endpoints.
- Manually check desktop and mobile routes after the migration, concentrating on layout overflow and floating-action placement.

## Delivery Sequence

1. Establish Vite, dependencies, dev proxy, and production artifact generation while preserving the existing frontend behavior.
2. Remove the generated browser bundle and CDN runtime only after the Vite build and routes are verified.
3. Organize client styles and shared utilities with regression tests protecting current navigation and cart behavior.
4. Add backend API tests and finish with lint, test, build, and local responsive verification.
