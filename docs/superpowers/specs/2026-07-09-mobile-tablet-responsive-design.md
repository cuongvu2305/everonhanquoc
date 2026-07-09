# Mobile And Tablet Responsive Design

## Scope

Improve the storefront UI for tablet and mobile without changing desktop behavior. The immediate goal is to stop layout breakage, make top navigation usable on small screens, and reduce visual crowding in header, drawer, content sections, checkout, and floating actions.

This design covers:

- Header behavior on tablet and mobile
- Navigation behavior on tablet and mobile
- Drawer content structure
- Responsive spacing and sizing adjustments
- High-risk screens that currently break on smaller viewports

This design does not cover:

- A desktop redesign
- New product or checkout features
- Changes to routing or data contracts
- A full component library migration

## Current Problems

The current layout is desktop-first and relies on the desktop horizontal menu compressing down to smaller widths. That causes overflow and unstable wrapping. Related issues:

- The top navigation becomes unusable on mobile.
- Header actions consume too much width.
- Search competes with logo and actions for horizontal space.
- Several cards and list layouts use desktop paddings on small screens.
- Floating actions can overlap content.
- Header and navigation logic remain concentrated in `App.jsx`, making responsive changes harder to reason about.

## Goals

- Preserve the current desktop layout.
- Replace the mobile/tablet top navigation with a hamburger-driven drawer.
- Keep search immediately accessible on mobile/tablet.
- Keep only cart in the mobile header action area.
- Move Facebook and YouTube links into the drawer.
- Collapse product categories inside the drawer instead of rendering the full list expanded.
- Reduce visual breakage across common tablet and phone widths.

## User-Approved Decisions

- Mobile/tablet navigation uses `hamburger + drawer`.
- Search stays in the header, on its own row beneath the top header row.
- Mobile/tablet header keeps only the cart action visible.
- Facebook and YouTube move into the drawer.
- Product categories in the drawer use `Collapse`.

## Approaches Considered

### Approach 1: CSS-only patch

Keep the existing structure and hide or resize desktop elements with breakpoint CSS only.

Pros:

- Fastest change
- Smallest code diff

Cons:

- Continues coupling desktop and mobile navigation
- Harder to make robust
- Increases risk of more breakpoint regressions

### Approach 2: Responsive layout split

Keep the current desktop layout but split mobile/tablet header and drawer behavior into dedicated components or dedicated sections within layout code.

Pros:

- Best balance of speed and maintainability
- Solves navigation problems directly
- Creates cleaner ownership boundaries for future changes

Cons:

- Slightly larger refactor than a CSS-only patch

### Approach 3: Separate mobile shell

Create a distinct mobile-first app shell for all small screens.

Pros:

- Cleanest long-term architecture

Cons:

- Too large for the current scope
- Higher regression risk

## Recommended Approach

Use Approach 2.

This keeps desktop stable while giving mobile/tablet a purpose-built interaction model. It also addresses the main architectural weakness in the current implementation: header and navigation logic are overloaded in `App.jsx`.

## Layout Design

### Breakpoints

- Desktop: `>= 992px`
- Tablet and mobile: `<= 991px`
- Phone-specific spacing reductions: `<= 576px`

These breakpoints align with the current CSS structure and Ant Design conventions already present in the project.

### Header

#### Desktop

Keep the current structure:

- Logo
- Search
- Social icons
- Cart

#### Tablet And Mobile

Use a two-row header:

Row 1:

- Hamburger button on the left
- Logo in the middle or aligned within the main row
- Cart action on the right

Row 2:

- Full-width search input

Rules:

- Facebook and YouTube are removed from the visible header.
- Action buttons use fixed width and height.
- Header row items must not wrap into a third row.
- Search always owns a dedicated row at small widths.

### Navigation

#### Desktop

Keep the current horizontal `Menu`.

#### Tablet And Mobile

Hide the horizontal `Menu` completely and replace it with:

- A hamburger trigger button
- A left-side `Drawer`

Drawer sections:

1. Main navigation links
2. Quick links for Facebook and YouTube
3. Product categories inside an Ant Design `Collapse`

Interaction rules:

- Selecting any menu item closes the drawer.
- Selecting any category closes the drawer.
- Drawer state resets on route change.

### Product Categories In Drawer

Product categories should not render as a long always-open list on mobile/tablet. They should live inside a `Collapse` panel labeled `Danh mục sản phẩm`.

Behavior:

- Closed by default
- Expand on demand
- Reuse the same category item data source as desktop

### Content And Section Spacing

Tablet and mobile need smaller, consistent spacing. Apply responsive tightening to:

- Section card paddings
- Hero content paddings
- Product list and carousel gaps
- Checkout summary paddings
- Footer card paddings

Guidelines:

- Tablet keeps moderate spacing
- Phone uses the smallest spacing set
- Text should wrap by words, never by single characters

### Floating Actions

Floating buttons remain available but must be repositioned to avoid overlaying key content.

Rules:

- Reduce button size on phones
- Maintain minimum bottom and side offsets
- Ensure hotline and Zalo do not visually collide
- Preserve enough bottom padding in footer/content zones so floating actions do not cover tappable content

## Component Boundaries

The implementation should improve structure while staying scoped.

Recommended boundaries:

- `App.jsx`: route orchestration and shared state only
- `Header` layout section: desktop/mobile branching
- `MobileDrawer` section or component: drawer content and close behavior
- Shared nav item generation remains centralized

This can be done either by extracting small components or by isolating JSX blocks in a way that keeps `App.jsx` readable. The priority is reducing the current concentration of responsive layout logic in one large block.

## State And Data Flow

New UI state:

- `mobileNavOpen`

State behavior:

- Open when hamburger is tapped
- Close on drawer close
- Close on top navigation selection
- Close on category selection
- Close on route change

No backend or API changes are required.

## Risks

- Desktop layout regressions if selectors are too broad
- Drawer content becoming too dense if sections are not visually separated
- Search row misalignment if grid rules are incomplete
- Floating actions still overlapping content on very short screens

## Verification Plan

Manual verification is required at minimum for:

- iPhone-width viewport
- Common Android-width viewport
- iPad-width viewport
- Small laptop width just above the mobile breakpoint
- Desktop width

Critical checks:

- Hamburger is visible only on tablet/mobile
- Desktop menu is hidden only on tablet/mobile
- Search stays accessible and full width on small screens
- Drawer opens, closes, and navigates correctly
- Categories expand and collapse correctly
- Header icons do not overflow
- Checkout, category, and footer layouts no longer break
- Floating buttons do not cover important content

## Implementation Notes

- Reuse Ant Design components already in the codebase: `Button`, `Drawer`, `Menu`, `Collapse`, `Space`, `Badge`, `Input`.
- Keep CSS changes scoped to responsive selectors and new mobile-specific classes.
- Do not change route semantics while fixing responsive UI.
- Build output regeneration is expected because the project bundles source into `public/app.jsx`.

## Success Criteria

The work is successful when:

- Mobile and tablet no longer show the desktop horizontal navigation
- Mobile header remains readable and stable across widths
- Navigation is usable through a hamburger drawer
- Search remains easy to access
- Small-screen layouts no longer visibly break in the key commerce flows
- Desktop appearance remains materially unchanged
