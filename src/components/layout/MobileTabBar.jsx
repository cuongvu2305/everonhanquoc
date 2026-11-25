import { Badge, Drawer, useState } from "../../app/globals.jsx";
import { BrandIcon, Icon } from "../icons/Icon.jsx";
import { navigateToCategory, navigateToTopPage } from "../../lib/runtime.js";

function fill(text, params) {
  return String(text ?? "").replace(/\{(\w+)\}/g, (_, key) => params[key] ?? "");
}

// Pages listed in the "Menu" sheet (home and checkout have their own tabs).
const MENU_PAGES = [
  { key: "news", icon: "Newspaper" },
  { key: "sale", icon: "BadgePercent" },
  { key: "retail", icon: "PackageOpen" },
  { key: "about", icon: "Store" },
  { key: "contact", icon: "PhoneCall" },
];

function Sheet({ open, onClose, title, className, children }) {
  return (
    <Drawer
      // rootClassName (not className) so the wrapper that controls height is styled too.
      rootClassName={`mobile-sheet ${className ?? ""}`}
      placement="bottom"
      open={open}
      onClose={onClose}
      title={title}
      height="auto"
      destroyOnClose
    >
      {children}
    </Drawer>
  );
}

/**
 * Phone-only bottom tab bar (Trang chủ, Danh mục, Menu, Liên hệ, Giỏ hàng) with bottom sheets,
 * replacing the hamburger drawer and the floating chat/hotline buttons on small screens.
 */
export function MobileTabBar({ dict, activePage, cartCount = 0, categoryGroups = [], labelCategory = (c) => c, contact = {}, socialLinks = [] }) {
  const [sheet, setSheet] = useState(null);
  const close = () => setSheet(null);
  const go = (action) => {
    close();
    action();
  };

  const tabs = [
    { key: "home", icon: "Home", label: dict.topPages?.home, active: activePage === "home", onClick: () => go(() => navigateToTopPage("home")) },
    { key: "categories", icon: "LayoutGrid", label: dict.tabCategories, active: sheet === "categories" || activePage === "category", onClick: () => setSheet("categories") },
    { key: "menu", icon: "Menu", label: dict.tabMenu, active: sheet === "menu", onClick: () => setSheet("menu") },
    { key: "contact", icon: "MessageCircle", label: dict.tabContact, active: sheet === "contact" || activePage === "contact", onClick: () => setSheet("contact") },
    { key: "cart", icon: "ShoppingCart", label: dict.cart, active: activePage === "checkout", badge: cartCount, onClick: () => go(() => navigateToTopPage("checkout")) },
  ];

  return (
    <>
      <nav className="mobile-tab-bar" aria-label={dict.tabBarLabel || undefined}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`mobile-tab${tab.active ? " is-active" : ""}`}
            aria-current={tab.active && (tab.key === "home" || tab.key === "cart") ? "page" : undefined}
            aria-haspopup={["categories", "menu", "contact"].includes(tab.key) ? "dialog" : undefined}
            onClick={tab.onClick}
          >
            <Badge count={tab.badge ?? 0} size="small" offset={[2, 0]}>
              <Icon name={tab.icon} size={22} />
            </Badge>
            <span className="mobile-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <Sheet open={sheet === "categories"} onClose={close} title={dict.productCategories} className="mobile-sheet-categories">
        <div className="mobile-sheet-groups">
          {categoryGroups.map((group) => {
            const children = group.children?.length ? group.children : [group.category];
            return (
              <section key={group.name} className="mobile-sheet-group">
                <h3>{group.name}</h3>
                <div className="mobile-sheet-chips">
                  {children.map((category) => (
                    <button key={category} type="button" className="mobile-chip" onClick={() => go(() => navigateToCategory(category))}>
                      {labelCategory(category)}
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Sheet>

      <Sheet open={sheet === "menu"} onClose={close} title={dict.tabMenu} className="mobile-sheet-menu">
        <ul className="mobile-sheet-list">
          {MENU_PAGES.map((page) => (
            <li key={page.key}>
              <button type="button" className={activePage === page.key ? "is-active" : ""} onClick={() => go(() => navigateToTopPage(page.key))}>
                <Icon name={page.icon} size={18} />
                {dict.topPages?.[page.key]}
              </button>
            </li>
          ))}
          {socialLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                <BrandIcon name={link.brand} />
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet open={sheet === "contact"} onClose={close} title={dict.tabContact} className="mobile-sheet-contact">
        <div className="mobile-contact-actions">
          {contact.telHref ? (
            <a className="mobile-contact-action is-primary" href={contact.telHref}>
              <Icon name="PhoneCall" size={20} />
              {fill(dict.contactCall, { phone: contact.phone })}
            </a>
          ) : null}
          {contact.zaloHref ? (
            <a className="mobile-contact-action" href={contact.zaloHref} target="_blank" rel="noopener noreferrer">
              <img src="/assets/zalo-logo.png" alt="" />
              {dict.contactZalo}
            </a>
          ) : null}
          {contact.messengerHref ? (
            <a className="mobile-contact-action" href={contact.messengerHref} target="_blank" rel="noopener noreferrer">
              <img src="/assets/messenger-logo.png" alt="" />
              {dict.contactMessenger}
            </a>
          ) : null}
          {contact.mapUrl ? (
            <a className="mobile-contact-action" href={contact.mapUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="Navigation" size={20} />
              {dict.contactDirections}
            </a>
          ) : null}
          <button type="button" className="mobile-contact-action" onClick={() => go(() => navigateToTopPage("contact"))}>
            <Icon name="Store" size={20} />
            {dict.contactPage}
          </button>
        </div>
      </Sheet>
    </>
  );
}

/** Small "Chính hãng · showroom · hotline" line shown under the category bar on phones. */
export function MobileTrustStrip({ dict, showroom }) {
  if (!showroom) return null;
  const shortAddress = String(showroom.address ?? "").split(",")[0];
  const telHref = `tel:${String(showroom.phone ?? "").replace(/[^\d+]/g, "")}`;
  return (
    <div className="mobile-trust-strip">
      <span><Icon name="BadgeCheck" size={14} />{dict.trustGenuine}</span>
      {showroom.mapUrl ? (
        <a href={showroom.mapUrl} target="_blank" rel="noopener noreferrer"><Icon name="MapPin" size={14} />{shortAddress}</a>
      ) : (
        <span><Icon name="MapPin" size={14} />{shortAddress}</span>
      )}
      {showroom.phone ? <a href={telHref}><Icon name="Phone" size={14} />{showroom.phone}</a> : null}
    </div>
  );
}
