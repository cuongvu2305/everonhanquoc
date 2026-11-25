import { Button, Header } from "../../app/globals.jsx";
import { Icon } from "../icons/Icon.jsx";
import { HeaderSearch } from "./HeaderSearch.jsx";
import { navigateToTopPage } from "../../lib/runtime.js";

/**
 * Logo | "Chăn - Ga - Gối - Đệm / Everon chính hãng" | address, hotline and search.
 * Address/hotline links come from the store's showroom data (mapUrl, phone) when available.
 */
export function SiteHeader({
  dict,
  searchText,
  setSearchText,
  submitSearch,
  onOpenMobileNav,
  mapUrl,
  hotlineHref,
  products,
  labelProduct,
}) {
  const addressLabel = String(dict.headerAddressLabel ?? "").replace("{address}", dict.address ?? "");

  return (
    <Header className="site-header">
      <div className="site-header-bar">
        <Button
          className="mobile-nav-trigger"
          type="text"
          aria-label="Mở menu điều hướng"
          icon={<Icon name="Menu" size={20} />}
          onClick={onOpenMobileNav}
        />
        <a
          className="brand"
          href="/"
          aria-label="Everon"
          onClick={(event) => {
            event.preventDefault();
            navigateToTopPage("home");
          }}
        >
          <img src="/assets/everon-logo.png" alt="Everon" width="300" height="162" />
        </a>
        <p className="site-header-tagline">
          <span>{dict.headerTaglineTop}</span>
          <span>{dict.headerTaglineBottom}</span>
        </p>
      </div>
      <div className="site-header-side">
        <div className="site-header-contact">
          {mapUrl ? (
            <a className="site-header-address" href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label={addressLabel || undefined}>
              <Icon name="MapPin" size={15} />
              {dict.address}
            </a>
          ) : (
            <span className="site-header-address">
              <Icon name="MapPin" size={15} />
              {dict.address}
            </span>
          )}
          {hotlineHref ? (
            <a className="site-header-hotline" href={hotlineHref}>
              <Icon name="PhoneCall" size={15} />
              {dict.hotline}
            </a>
          ) : null}
        </div>
        <HeaderSearch
          dict={dict}
          value={searchText}
          onChange={setSearchText}
          onSubmit={submitSearch}
          products={products}
          labelProduct={labelProduct}
        />
      </div>
    </Header>
  );
}
