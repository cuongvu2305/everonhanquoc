# Task 1 Report: Tighten The Mobile Shell And Floating Actions

## Status

DONE

## Scope Delivered

- Kept the footer floating actions in `App` while relying on responsive CSS to make Messenger and Zalo desktop-only on phone widths.
- Refined `SiteHeader` into a two-row mobile shell structure with a dedicated `site-header-bar` row and a separate visible search row.
- Kept the mobile header actions compact so the cart is the only visible action in the header.
- Tightened `MobileNavDrawer` to the compact phone-oriented structure from the brief, including collapsed category sections by default.
- Updated the shell CSS so the mobile header, search, drawer visibility, main layout, and floating hotline positioning match the brief values.
- Regenerated `public/app.jsx` and `public/build-info.json` through the build.

## Files Included

- `/Users/phuongnhi/Documents/Codex/2026-07-02/everonhanquoc/src/app/App.jsx`
- `/Users/phuongnhi/Documents/Codex/2026-07-02/everonhanquoc/src/components/layout/SiteHeader.jsx`
- `/Users/phuongnhi/Documents/Codex/2026-07-02/everonhanquoc/src/components/layout/MobileNavDrawer.jsx`
- `/Users/phuongnhi/Documents/Codex/2026-07-02/everonhanquoc/public/styles.css`
- `/Users/phuongnhi/Documents/Codex/2026-07-02/everonhanquoc/public/app.jsx`
- `/Users/phuongnhi/Documents/Codex/2026-07-02/everonhanquoc/public/build-info.json`

## Verification

- Command: `npm run build`
- Result: PASS
- Evidence: `Built static Sites artifact in dist/`

## Commit

- `eee2f9d` `refactor: tighten mobile commerce shell`

## Self-Review

- Confirmed the committed header now renders as a bar row plus a separate search row, matching the brief’s requested structure.
- Confirmed the drawer keeps top navigation, quick links, and collapsed categories with `defaultActiveKey={[]}`.
- Confirmed the `@media (max-width: 991px)` rules hide `.nav-bar.ant-menu`, `.category-sider`, `.floating-messenger`, and `.floating-zalo`, leaving the hotline action visible on phones.
- Confirmed the `@media (max-width: 576px)` hotline dimensions and offsets match the brief: `right: 16px`, `bottom: 16px`, `height: 44px`, `padding-inline: 14px`, `font-size: 15px`.
- Confirmed generated bundle outputs were refreshed by the passing build rather than edited manually.

## Concerns

- `public/build-info.json` reflects the build metadata generated before the commit was created, because the required workflow was build first and commit second.
- The repository still has unrelated local modifications in `build.mjs`, `src/app/globals.jsx`, and `src/components/layout/PageHeader.jsx`, plus untracked planning artifacts. They were left untouched.

---

## Fix Pass: Restore Desktop Header Layout

### Status

DONE

### Scope Delivered

- Restored the desktop header shell at `>= 992px` by making the base `.site-header` layout a single-row grid again.
- Kept the current `SiteHeader` markup intact and used `.site-header-bar { display: contents; }` on desktop so the brand, search box, and cart action participate directly in the desktop grid.
- Scoped the dedicated two-row mobile shell back under `@media (max-width: 991px)` so the phone layout still uses the bar row plus search row behavior from the original task.
- Left the build metadata workflow unchanged, per review guidance; only the generated `public/build-info.json` output changed as a normal side effect of the verification build.

### Files Updated

- `/Users/phuongnhi/Documents/Codex/2026-07-02/everonhanquoc/public/styles.css`
- `/Users/phuongnhi/Documents/Codex/2026-07-02/everonhanquoc/public/build-info.json`

### Root Cause

- The previous task moved the mobile two-row shell styles into the base `.site-header` rules, which made the compact phone layout apply to desktop widths as well.
- Because the desktop one-row grid was no longer the default, widths `>= 992px` could not recover the original header behavior.

### Verification

- Command: `npm run build`
- Result: PASS
- Evidence: `Built static Sites artifact in dist/`

### Concerns

- `public/build-info.json` still points at the previously committed SHA (`eee2f9d`) because the required verification build runs before the follow-up fix commit is created.
