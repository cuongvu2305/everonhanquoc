import { Select } from "../../app/globals.jsx";
import { formatSize, groupVariants } from "../../lib/variants.js";

/**
 * "Chọn loại sản phẩm" (set type) then "Chọn kích thước" (size buttons).
 * Changing the type keeps the same size when that type offers it.
 */
export function VariantPicker({ variants = [], value, onChange, dict = {}, disabled = false }) {
  const groups = groupVariants(variants);
  if (!groups.length || !value) return null;
  const group = groups.find((item) => item.name === value.name) ?? groups[0];

  const chooseType = (name) => {
    const next = groups.find((item) => item.name === name);
    if (!next) return;
    onChange(next.variants.find((variant) => variant.size === value.size) ?? next.variants[0]);
  };

  return (
    <div className="variant-picker">
      {groups.length > 1 ? (
        <label className="variant-picker-field">
          <span className="variant-picker-label">{dict.variantType}</span>
          <Select
            className="variant-type-select"
            value={group.name}
            onChange={chooseType}
            disabled={disabled}
            popupMatchSelectWidth
            options={groups.map((item) => ({ value: item.name, label: item.name }))}
          />
        </label>
      ) : (
        <p className="variant-picker-single">{group.name}</p>
      )}
      <div className="variant-picker-field">
        <span className="variant-picker-label" id="variant-size-label">{dict.variantSize}</span>
        <div className="variant-size-options" role="radiogroup" aria-labelledby="variant-size-label">
          {group.variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={variant.id === value.id}
              className={`variant-size${variant.id === value.id ? " is-selected" : ""}`}
              disabled={disabled}
              onClick={() => onChange(variant)}
            >
              {formatSize(variant.size)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
