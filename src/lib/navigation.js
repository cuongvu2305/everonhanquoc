// Main navigation built from store.categoryGroups: the desktop bar lists product category groups only.

const CATEGORY_PREFIX = "category:";
const GROUP_PREFIX = "group:";

export const categoryKey = (category) => `${CATEGORY_PREFIX}${category}`;
export const groupKey = (name) => `${GROUP_PREFIX}${name}`;

// Pages placed on the bar around the category groups. Empty: every page link lives in the footer
// (and the mobile drawer); the logo leads home and the cart button opens checkout.
export const MAIN_NAV_PAGES_BEFORE = [];
export const MAIN_NAV_PAGES_AFTER = [];

// Page links shown in the footer when the bar is taken by category groups.
export const FOOTER_PAGE_KEYS = ["home", "news", "sale", "retail", "about", "contact"];

// Turns a menu key back into a navigation target.
export function parseNavKey(key) {
  if (key.startsWith(CATEGORY_PREFIX)) return { type: "category", value: key.slice(CATEGORY_PREFIX.length) };
  if (key.startsWith(GROUP_PREFIX)) return { type: "group", value: key.slice(GROUP_PREFIX.length) };
  return { type: "page", value: key };
}

// Group titles only open their popup (so touch screens can open it too); the group's main
// category is listed first among its children in the data.
function groupItem(group, labelCategory) {
  const children = (group.children ?? []).map((category) => ({ key: categoryKey(category), label: labelCategory(category) }));
  if (children.length === 0) {
    // A group without children is a direct link to its category.
    return { key: group.category ? categoryKey(group.category) : groupKey(group.name), label: group.name };
  }
  return { key: groupKey(group.name), label: group.name, popupClassName: "nav-bar-popup", children };
}

/**
 * @param {object} options
 * @param {Array} options.groups store.categoryGroups
 * @param {Array} options.pages topPages entries ({ key, icon })
 * @param {(page) => object} options.pageItem builds a menu item for a page
 * @param {(category: string) => string} options.labelCategory
 * Returns null when there are no groups so the caller can keep the page-only menu.
 */
export function buildMainNavItems({ groups, pages, pageItem, labelCategory = (category) => category }) {
  if (!groups?.length) return null;
  const byKey = new Map(pages.map((page) => [page.key, page]));
  const pick = (keys) => keys.map((key) => byKey.get(key)).filter(Boolean).map(pageItem);
  return [...pick(MAIN_NAV_PAGES_BEFORE), ...groups.map((group) => groupItem(group, labelCategory)), ...pick(MAIN_NAV_PAGES_AFTER)];
}

// Selected key for the main menu: the active category when on a category page, else the page key.
export function mainNavSelectedKeys({ activePage, activeCategory }) {
  if (activePage === "category" && activeCategory) return [categoryKey(activeCategory)];
  return [activePage];
}
