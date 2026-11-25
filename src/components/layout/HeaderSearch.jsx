import { useEffect, useMemo, useRef, useState } from "../../app/globals.jsx";
import { Icon } from "../icons/Icon.jsx";
import { MAX_SUGGESTIONS, MIN_SUGGEST_LENGTH, normalizeSearchText, searchProducts } from "../../lib/search.js";
import { navigateToProduct } from "../../lib/runtime.js";

function fill(text, params) {
  return String(text ?? "").replace(/\{(\w+)\}/g, (_, key) => params[key] ?? "");
}

/**
 * Pill-shaped search box with the "Tìm" button inside it and live product suggestions
 * (combobox/listbox pattern: arrows move, Enter opens the highlighted product or searches, Esc closes).
 */
export function HeaderSearch({ dict, value, onChange, onSubmit, products = [], labelProduct = (product) => product.name }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const listId = "header-search-suggestions";

  const matches = useMemo(
    () => (normalizeSearchText(value).length >= MIN_SUGGEST_LENGTH ? searchProducts(products, value, labelProduct) : []),
    [products, value, labelProduct],
  );
  const suggestions = matches.slice(0, MAX_SUGGESTIONS);
  const showPanel = open && normalizeSearchText(value).length >= MIN_SUGGEST_LENGTH;

  useEffect(() => {
    setActiveIndex(-1);
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const submit = () => {
    setOpen(false);
    onSubmit();
  };

  const openProduct = (product) => {
    setOpen(false);
    navigateToProduct(product);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown" && suggestions.length) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && suggestions.length) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Enter" && showPanel && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      openProduct(suggestions[activeIndex]);
    }
  };

  return (
    <div className="header-search" ref={rootRef}>
      <form
        className="header-search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          className="header-search-input"
          type="search"
          maxLength={255}
          autoComplete="off"
          placeholder={dict.searchPlaceholder}
          aria-label={dict.searchPlaceholder}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={showPanel && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          value={value}
          onChange={(event) => {
            onChange(event.target.value.slice(0, 255));
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <button className="header-search-button" type="submit" aria-label={dict.searchButton} title={dict.searchButton}>
          <Icon name="Search" size={20} />
        </button>
      </form>

      {showPanel ? (
        <div className="header-search-panel">
          {suggestions.length ? (
            <>
              <p className="header-search-panel-title">{fill(dict.searchSuggestTitle, { query: value.trim() })}</p>
              <ul className="header-search-list" id={listId} role="listbox" aria-label={dict.searchPlaceholder}>
                {suggestions.map((product, index) => (
                  <li
                    key={product.sourceUrl || product.name}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`header-search-option${index === activeIndex ? " is-active" : ""}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openProduct(product)}
                  >
                    <img src={product.image} alt="" loading="lazy" />
                    <span className="header-search-option-text">
                      <span className="header-search-option-name">{labelProduct(product)}</span>
                      <span className="header-search-option-price">
                        {product.price}
                        {product.oldPrice ? <del>{product.oldPrice}</del> : null}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {matches.length > suggestions.length ? (
                <button type="button" className="header-search-all" onMouseDown={(event) => event.preventDefault()} onClick={submit}>
                  {fill(dict.searchSeeAll, { count: matches.length })}
                  <Icon name="ArrowRight" size={14} />
                </button>
              ) : null}
            </>
          ) : (
            <p className="header-search-empty">{dict.emptySearchResults}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
